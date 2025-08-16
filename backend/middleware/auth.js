const { verifyToken } = require("../jwt");

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) return res.status(401).json({ msg: "Unauthorized" });

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ msg: "Invalid token" });

  req.user = user;
  next();
}

module.exports = authMiddleware;
