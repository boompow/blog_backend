import { joiCommentValidation } from "../util/schemaValidator.js";
import Comment from "../model/comment.js";
import Blog from "../model/blog.js";

export async function commentWrite(req, res) {
  const { comment, author, blog } = req.body;
  const { error } = joiCommentValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Comment Format" });
  }

  try {
    const newComment = await Comment.create({
      comment,
      author,
      blog,
    });

    // adding the comment into the blog
    await Blog.updateOne(
      { _id: blog },
      { $push: { comments: newComment._id } }
    );

    res
      .status(200)
      .json({ error: false, message: "comment created successfuly" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error });
  }
}

// comment reply write
export async function replyWrite(req, res) {
  const { parentID, author, blog, comment } = req.body;
  const { error } = joiCommentValidation({ author, blog, comment });
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Comment Reply Format" });
  }

  try {
    const newComment = await Comment.create({
      comment,
      author,
      blog,
    });

    // adding the comment into the blog
    await Comment.updateOne(
      { _id: parentID },
      { $push: { repliedComment: newComment._id } }
    );

    res
      .status(200)
      .json({ error: false, message: "reply created successfuly" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error });
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
