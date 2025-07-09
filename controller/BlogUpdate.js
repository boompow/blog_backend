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
  } catch {
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
  } catch {
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
  } catch {
    return res.status(500).json({
      error: true,
      message: "Failed to delete blog",
    });
  }
}

// the only update it will perform for now is going to be to publish drafted blogs
export async function publishDraft(req, res) {
  try {
    const { blogID } = req.body;
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

    if (userId.toString() !== blog.author.toString()) {
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
      blogSlug: blog.slug,
    });
  } catch {
    return res.status(500).json({
      error: true,
      message: "Failed to publish the draft",
    });
  }
}

// blog update
export async function updateBlog(req, res) {
  try {
    const { blogID, title, coverImage, content, tags, published } = req.body;
    // using the user id from the payload we get from the access token
    const userId = req.auth.id;

    const blog = await Blog.findById(blogID);
    if (!blog) {
      return res.status(404).json({ error: true, message: "Blog not found" });
    }

    if (userId.toString() !== blog.author.toString()) {
      return res.status(401).json({ error: true, message: "Unauthorized" });
    }

    await Blog.updateOne(
      {
        _id: blogID,
      },
      {
        $set: {
          title,
          coverImage,
          content,
          tags,
          published,
        },
      }
    );
    const updatedBlog = await Blog.findById(blogID);
    return res.status(200).json({
      error: false,
      message: "Blog updated successfully",
      blogSlug: updatedBlog.slug,
    });
  } catch {
    return res.status(500).json({
      error: true,
      message: "Failed to update the blog",
    });
  }
}
