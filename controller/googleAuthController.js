import { OAuth2Client } from "google-auth-library";
import "dotenv/config";
import User from "../model/user.js";
import UserToken from "../model/userToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../util/tokenFunctions.js";
import userData from "./UserRead.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function googleAuthController(req, res) {
  const { token } = req.body;

  try {
    // getting the payload from the google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    // find or create the user account
    let user = await User.findOne({ email: email });
    if (!user) {
      // following the user schema
      const userObject = {
        googleID: sub,
        name: name,
        email: email,
        avatar: picture,
      };

      user = await User.create(userObject);
    }

    // generate tokens
    // the mongoDB objectID must be converted to String to be JSON safe and be converted back to objectID to fetch from mongoDB
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    });

    // add the refresh token to the DB
    await UserToken.findOneAndDelete({ userId: user._id });
    await UserToken.create({
      userId: user._id,
      token: refreshToken,
    });

    // add the refresh token onto an httpOnly cookie
    res.cookie("BLG", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      maxAge: 7 * 86400 * 1000, //7 days
    });

    const { data, error } = await userData(user._id);
    if (error) {
      return res.status(500).json(error);
    }

    // send the access token and the user data
    res.status(200).json({
      success: true,
      message: "successful",
      accessToken,
      user: data,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: true, message: `invalid Google token ${error}` });
  }
}

// logout user
export async function logout(req, res) {
  try {
    const user = await User.findOne({ _id: req.auth.id });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    await UserToken.deleteOne({ userId: user._id });

    return res
      .clearCookie("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      })
      .status(200)
      .json({ error: false, message: "Logged out successfuly!" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Unable to log out" });
  }
}
