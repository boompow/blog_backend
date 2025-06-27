import jwt from "jsonwebtoken";
import "dotenv/config";

// token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export function verifyAccessToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Invalid Token" });
  }

  const token = authorization.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: true, message: "No Token Provided" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "TokenExpiredError" ? "Token Expired" : "Invalid Token";
      return res.status(401).json({ error: true, message: message });
    }
    req.auth = payload;
    next();
  });
}
