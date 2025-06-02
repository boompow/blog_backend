import User from "../model/user.js";
import { joiUserValidation } from "../util/schemaValidator.js";

// For updating user profile
const updateProfile = async (req, res) => {
  const { error } = joiUserValidation(req.body);

  try {
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      await User.updateOne(
        { email: req.body.email },
        { $set: { name: req.body.name, bio: req.body.bio } }
      );
    } else {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res
      .status(200)
      .json({ error: false, message: "Profile updated successfuly!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "can not update profile" });
  }
};

// For deleting user profile
const deleteProfile = async (req, res) => {
  try {
    const { error } = joiUserValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      await User.deleteOne({ email: req.body.email });
    } else {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res
      .status(200)
      .json({ error: false, message: "Profile deleted successfuly!" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "can not delete profile" });
  }
};

export default { updateProfile, deleteProfile };
