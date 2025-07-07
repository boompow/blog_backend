import User from "../model/user.js";
import Blog from "../model/blog.js";
import Comment from "../model/comment.js";
import { ObjectId } from "mongodb";

export async function blogBookmark(req, res) {
  try {
    await User.updateOne(
      {
        _id: req.auth.id,
      },
      { $push: { savedBlogs: req.body.blogID } }
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
        _id: req.auth.id,
      },
      { $pull: { savedBlogs: new ObjectId(req.body.blogID) } }
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

export async function blogDelete(req, res) {
  try {
    const { blogID, authorID } = req.body;
    // using the user id from the payload we get from the access token
    const userId = req.auth.id;

    const blog = await Blog.findById(blogID);
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }

    if (userId !== authorID) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    await Blog.deleteOne({ _id: blogID });
    await User.updateOne({ _id: userId }, { $pull: { usersBlogs: blogID } });
    await Comment.deleteMany({ blog: blogID });
    return res.status(200).json({
      error: false,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Failed to delete blog",
    });
  }
}

// the only update it will perform for now is going to be to publish drafted blogs
export async function blogUpdate(req, res) {
  try {
    const { blogID, authorID } = req.body;
    // using the user id from the payload we get from the access token
    const userId = req.auth.id;

    const blog = await Blog.findById(blogID);
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }

    if (blog.published) {
      return res
        .status(400)
        .json({ error: true, message: "Draft is already published" });
    }

    if (userId !== authorID) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    await Blog.updateOne(
      {
        _id: blogID,
      },
      { $set: { published: true } }
    );
    return res.status(200).json({
      error: false,
      message: "Draft published successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Failed to publish the draft",
    });
  }
}

// comment delete

export async function commentDelete(req, res) {
  const { commentID, authorID, blogID, parentCommentID } = req.body;
  const userId = req.auth.id;

  try {
    const comment = await Comment.findById(commentID);
    if (!comment) {
      return res
        .status(404)
        .json({ error: true, message: "Comment not found" });
    }

    if (userId !== authorID) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const reply = comment.repliedComment || [];
    if (reply.length > 0) {
      await Comment.deleteMany({ _id: { $in: reply } });
    }

    await Comment.deleteOne({ _id: commentID });
    if (parentCommentID) {
      await Comment.updateOne(
        { _id: parentCommentID },
        { $pull: { repliedComment: commentID } }
      );
    } else {
      await Blog.updateOne({ _id: blogID }, { $pull: { comments: commentID } });
    }
    return res.status(200).json({
      error: false,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Failed to delete comment",
    });
  }
}
