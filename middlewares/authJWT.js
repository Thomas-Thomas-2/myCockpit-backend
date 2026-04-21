const jwt = require("jsonwebtoken");

function authJWT(req, res, next) {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ result: false, error: "Not authorized" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ result: false, error: "Not authorized" });
  }
}

module.exports = { authJWT };
