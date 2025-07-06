import User from "../model/user.js";
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
  try {
    const user = await User.findOne({ _id: req.body._id });
    if (user) {
      await User.deleteOne({ _id: req.body._id });
      await UserToken.deleteOne({ userID: user._id });
    } else {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res
      .clearCookie("BLOG")
      .status(200)
      .json({ error: false, message: "Profile deleted successfuly!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Unable to delete profile" });
  }
}
