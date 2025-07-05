import User from "../model/user.js";
import { ObjectId } from "mongodb";

export async function blogBookmark(req, res) {
  try {
    await User.updateOne(
      {
        _id: req.body.userId,
      },
      { $push: { savedBlogs: req.body.blogId } }
    );
    return res.status(200).json({
      error: false,
      message: "blog saved successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Unable to save the Blog to for the User",
    });
  }
}

export async function blogUnbookmark(req, res) {
  try {
    await User.updateOne(
      {
        _id: req.body.userId,
      },
      { $pull: { savedBlogs: new ObjectId(req.body.blogId) } }
    );
    return res.status(200).json({
      error: false,
      message: "blog unsaved successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Unable to save the Blog to for the User",
    });
  }
}
