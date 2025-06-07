import jwt from "jsonwebtoken";
import "dotenv/config";
import UserToken from "../model/userToken.js";
import { generateAccessToken } from "../util/tokenFunctions.js";

// token secrets
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function verifyRefreshToken(req, res, next) {
  const refreshCookie = req.cookies.BLOG;

  if (!refreshCookie) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid Refresh Token" });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(refreshCookie, REFRESH_TOKEN_SECRET);
    console.log(userPayload);
  } catch (error) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid Refresh Token" });
  }

  const user = await UserToken.findOne({ userID: userPayload.id });
  if (!user) {
    return res.status(403).json({ error: true, message: "User not found" });
  }

  //vulnerable to timing attack
  if (refreshCookie === user.token) {
    const newAccessToken = generateAccessToken(userPayload);
    res.status(200).json({
      error: false,
      newAccessToken,
      message: "new access token created successfully",
    });
  } else {
    return res
      .status(403)
      .json({ error: true, message: "Refresh Token doesn't match" });
  }
}
