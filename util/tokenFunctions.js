import jwt from "jsonwebtoken";
import "dotenv/config";

// token secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// token function

// generate tokens
export function generateRefreshToken(payload) {
  jwt.set(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

export function generateAccessToken(payload) {
  jwt.set(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

// verify tokens
export function verifyRefreshToken(token) {
  jwt.verify(token, REFRESH_TOKEN_SECRET);
}

export function verifyAccessToken(token) {
  jwt.verify(token, ACCESS_TOKEN_SECRET);
}
