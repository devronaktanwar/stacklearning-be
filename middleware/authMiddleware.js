module.exports = function (req, res, next) {
    const authKey = req.headers['authkey'];
    const requiredAuthKey = '8e92ab9c92b24b5fb5b6afaf92b7ef12'; 
  
    if (authKey === requiredAuthKey) {
      next(); 
    } else {
      res.status(403).json({ message: 'Unauthorized: Invalid auth key' });
    }
  };