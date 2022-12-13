const jwt = require("jsonwebtoken");
const User = require("../model/user");
const config = process.env;

const verifyToken = async(req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);

    const user = await User.findOne({ _id: decoded._id, 'tokens.token':token })

    req.token = token
    req.user = user
      
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed to do that!");
    }
  });
};

module.exports = verifyToken,verifyTokenAndAuthorization;