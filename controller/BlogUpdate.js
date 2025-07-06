import User from "../model/user.js";
import Blog from "../model/blog.js";
import Comment from "../model/comment.js";
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

export async function blogDelete(req, res) {
  try {
    const { blogId, authorId } = req.body;
    // using the user id from the payload we get from the access token
    const userId = req.auth.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }

    if (userId !== authorId) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }
    await Blog.deleteOne({ _id: blogId });
    await User.updateOne({ _id: userId }, { $pull: { usersBlogs: blogId } });
    await Comment.deleteMany({ blog: blogId });
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
    const { blogId, authorId } = req.body;
    // using the user id from the payload we get from the access token
    const userId = req.auth.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }

    if (blog.published) {
      return res
        .status(400)
        .json({ error: true, message: "Draft is already published" });
    }

    if (userId !== authorId) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    await Blog.updateOne(
      {
        _id: blogId,
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
  const { commentId, authorId, blogId, parentCommentId } = req.body;
  const userId = req.auth.id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ error: true, message: "Comment not found" });
    }

    if (userId !== authorId) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    const reply = comment.repliedComment || [];
    if (reply.length > 0) {
      await Comment.deleteMany({ _id: { $in: reply } });
    }

    await Comment.deleteOne({ _id: commentId });
    if (parentCommentId) {
      await Comment.updateOne(
        { _id: parentCommentId },
        { $pull: { repliedComment: commentId } }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { $pull: { comments: commentId } });
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
