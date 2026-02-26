const jwt = require("jsonwebtoken");

function authTokenJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ result: false, error: "Not authorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ result: false, error: "Invalid token" });
  }
}

module.exports = { authTokenJWT };
