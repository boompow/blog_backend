import User from "../model/user.js";
import Blog from "../model/blog.js";
import Comment from "../model/comment.js";
import UserToken from "../model/userToken.js";
import { joiUserValidation } from "../util/schemaValidator.js";
import userData from "./UserRead.js";

// For getting user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.body.slug });
    const { data, error } = await userData(user._id);
    if (error) {
      return res.status(500).json(error);
    }
    res.status(200).json({
      error: false,
      user: data,
      message: "User Found!",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

// For updating user profile
export async function updateProfile(req, res) {
  try {
    const { name, bio } = req.body;
    await User.updateOne({ _id: req.body._id }, { $set: { name, bio } });
    return res
      .status(200)
      .json({ error: false, message: "User profile updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Unable to update user profile" });
  }
}

// For deleting user profile
export async function deleteProfile(req, res) {
  const { profileID } = req.body;
  const userID = req.auth.id;
  try {
    if (userID !== profileID) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    const user = await User.findOne({ _id: userID });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    await User.deleteOne({ _id: userID });
    await Blog.deleteMany({ author: user._id });
    await Comment.deleteMany({ author: user._id });
    await UserToken.deleteOne({ userID: user._id });

    return res
      .clearCookie("BLG", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
      })
      .status(200)
      .json({ error: false, message: "Profile deleted successfuly!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Unable to delete profile" });
  }
}
