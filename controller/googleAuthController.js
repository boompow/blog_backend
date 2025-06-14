import { OAuth2Client } from "google-auth-library";
import "dotenv/config";
import User from "../model/user.js";
import UserToken from "../model/userToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../util/tokenFunctions.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuthController = async (req, res) => {
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

    // send the access token and the user data
    res.status(200).json({
      success: true,
      message: "successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        slug: user.slug,
      },
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: true, message: `invalid Google token ${error}` });
  }
};

export default googleAuthController;
