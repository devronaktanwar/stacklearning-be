const { google } = require("googleapis");
const User = require("../../models/user");
const {BASE_URL,GOOGLE_OAUTH_CLIENT_SECRET,CLIENT_ID}=process.env
const redirectUrl = `${BASE_URL}/api/google/callback`;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  redirectUrl
);

module.exports = {
  async loginUser({ emailAddress, passWord }) {
    try {
      const existingUser = await User.findOne({ emailAddress });
      if (!existingUser) {
        return {
          isSuccess: false,
          message: "Invaild Email, Please Sign Up",
        };
      }
      const isPasswordValid = await bcrypt.compare(
        passWord,
        existingUser.passWord
      );

      if (!isPasswordValid) {
        return {
          isSuccess: false,
          message: "Invalid password",
        };
      }
      const token = jwt.sign({ id: existingUser._id }, "your_jwt_secret", {
        expiresIn: "1h",
      });
      return {
        isSuccess: true,
        message: "Login successful",
        token: token,
        user: {
          id: existingUser._id,
          emailAddress: existingUser.emailAddress,
          fullName: existingUser.fullName,
        },
      };
    } catch (err) {
      console.log("Error:", err);
      return{
        isSuccess:false
      }
    }
  },
  async signUpUser({ fullName, emailAddress, passWord }) {
    try {
      const existingUser = await User.findOne({ emailAddress });
      if (existingUser) {
        return {
          isSuccess: false,
          message: "User already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(passWord, 10);

      const newUser = new User({
        fullName,
        emailAddress,
        passWord: hashedPassword,
      });

      await newUser.save();
      const user = await User.findOne({ emailAddress });
      const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
        expiresIn: "1h",
      });
      return {
        isSuccess: true,
        message: "User created successfully",
        user: newUser,
        token: token,
      };
    } catch (error) {
      return { isSuccess: false, message: error };
    }
  },
  async googleLoginHandler({ prevUrl }) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
      state: encodeURIComponent(prevUrl),
      prompt: "select_account",
    });
    return authUrl;
  },
  async verifyGoogleAuth({ state, code }) {
    let prevUrl = state ? decodeURIComponent(state) : BASE_URL;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
      });

      const { data: userInfo } = await oauth2.userinfo.get();
      console.log({ userInfo });
      if(userInfo.verified_email && userInfo.email){
        const userAlreadyExists = module.exports.checkIfEmailExists(userInfo.email);
        console.log(userAlreadyExists)
      }
      return { prevUrl };
    } catch (error) {
      prevUrl += "&err=GA01";
      console.error("Error during Google OAuth callback:", error);
      return { prevUrl };
    }
  },
  async checkIfEmailExists(emailId) {
    try {
      const user = await User.findOne({ emailAddress: emailId });
      if (user) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking if email exists:", error);
    }
  },
};
