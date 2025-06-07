import jwt from "jsonwebtoken";
import "dotenv/config";
import UserToken from "../model/userToken.js";
import { generateAccessToken } from "../util/tokenFunctions.js";
import mongoose from "mongoose";

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

    // to safeguard for a valid objectID, we'll use the following conditional
    if (!mongoose.Types.ObjectId.isValid(userPayload.id)) {
      return res
        .status(400)
        .json({ error: true, message: "invalid Refresh Token" });
    }
    // lets convert the String version of the user ID to mongoDB objectID to fetch userToken with userID
    const objectID = new mongoose.Types.ObjectId(userPayload.id);
    console.log(objectID);

    const user = await UserToken.findOne({ userId: objectID });
    if (!user) {
      return res.status(403).json({ error: true, message: "User not found" });
    }
    console.log(`user token ${user.token}`);
    console.log(`cookie ${refreshCookie}`);

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
  } catch (error) {
    return res
      .status(401)
      .json({ error: true, message: "Invalid Refresh Token" });
  }
}
