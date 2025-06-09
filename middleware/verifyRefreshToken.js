import jwt from "jsonwebtoken";
import "dotenv/config";
import UserToken from "../model/userToken.js";
import { generateAccessToken } from "../util/tokenFunctions.js";
import mongoose from "mongoose";

// token secrets
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function verifyRefreshToken(req, res, next) {
  const refreshCookie = req.cookies.BLG;

  if (!refreshCookie) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid Refresh Token" });
  }

  let userPayload;
  try {
    userPayload = jwt.verify(refreshCookie, REFRESH_TOKEN_SECRET);

    // to safeguard for a valid objectID, we'll use the following conditional
    if (!mongoose.Types.ObjectId.isValid(userPayload.id)) {
      return res
        .status(400)
        .json({ error: true, message: "invalid Refresh Token" });
    }
    // lets convert the String version of the user ID to mongoDB objectID to fetch userToken with userID
    const objectID = new mongoose.Types.ObjectId(userPayload.id);

    const user = await UserToken.findOne({ userId: objectID });
    if (!user) {
      // if no usertoken, then it means the token expired and was automatically removed
      //since the user is going to login, the old refresh token stored has to be removed
      res.clearCookies("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });
      return res.status(403).json({ error: true, message: "User not found" });
    }

    //vulnerable to timing attack
    if (refreshCookie === user.token) {
      const { id, email } = userPayload || {};
      const newAccessToken = generateAccessToken({ id, email });
      res.status(200).json({
        error: false,
        newAccessToken,
        message: "new access token created successfully",
      });
    } else {
      //since the user is going to login, the old refresh token stored has to be removed
      res.clearCookies("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      });

      await UserToken.deleteOne({ userId: objectID }); // this clears the user's token and we'll force the user to log in again with the error message
      return res.status(403).json({
        error: true,
        message: "Refresh Token doesn't match, Please Login again",
      });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ error: true, message: ` the error is ${error}` });
  }
}
