import jwt from "jsonwebtoken";
import "dotenv/config";
import UserToken from "../model/userToken.js";
import User from "../model/user.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../util/tokenFunctions.js";
import mongoose from "mongoose";
import userData from "../controller/UserRead.js";

// token secrets
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function verifyRefreshToken(req, res) {
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
      res.clearCookie("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });
      return res
        .status(400)
        .json({ error: true, message: "invalid Refresh Token" });
    }
    // lets convert the String version of the user ID to mongoDB objectID to fetch userToken with userID
    const objectID = new mongoose.Types.ObjectId(userPayload.id);

    const userToken = await UserToken.findOne({ userId: userPayload.id });
    // the user data will also be sent and since there is no condition where the userToken could exist without the user, I'll not set a condition
    // const user = await User.findOne({ _id: objectID });
    if (!userToken) {
      // if no usertoken, then it means the token expired and was automatically removed
      //since the user is going to login, the old refresh token stored has to be removed
      res.clearCookie("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      });
      return res.status(403).json({
        error: true,
        message: "Refresh token expired or invalid. Please log in again.",
      });
    }

    // now lets check if the refreshcookie matches that from the DB
    const checkToken = await UserToken.findOne({
      userId: objectID,
      token: refreshCookie,
    });

    if (checkToken) {
      const { id, email } = userPayload || {};
      const newAccessToken = generateAccessToken({ id, email });
      const { data, error } = await userData(id);
      if (error) {
        return res.status(500).json(error);
      }

      // rotate refersh token
      const newRefreshToken = generateRefreshToken({ id, email });
      await UserToken.findOneAndUpdate(
        { userId: objectID },
        { $set: { token: newRefreshToken } }
      );
      res.cookie("BLG", newRefreshToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
        maxAge: 7 * 86400 * 1000, //7 days
      });

      res.status(200).json({
        error: false,
        newAccessToken,
        user: data,
        message: "new access token created successfully",
      });
    } else {
      //since the user is going to login, the old refresh token stored has to be removed
      res.clearCookie("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
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
