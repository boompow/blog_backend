import Blog from "../model/blog.js";
import Comment from "../model/comment.js";
import User from "../model/user.js";
import {
  joiBlogValidation,
  joiCommentValidation,
} from "../util/schemaValidator.js";

export async function publishBlog(req, res) {
  try {
    const { error } = joiBlogValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: `${error.detail[0].message}` });
    }

    const { title, content, tags, author, published } = req.body;
    const blog = await Blog.create({ title, content, tags, author, published });

    res.status(200).json({
      error: false,
      message: "blog created successfully",
      blog: {
        id: blog._id,
        title: blog.title,
        content: blog.content,
        author: blog.author,
        published: blog.published,
        timestamp: blog.publishedAt,
        tags: blog.tags,
        likes: blog.likes,
        comments: blog.comments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "unable to create the blog",
    });
  }
}

export async function commentWrite(req, res) {
  const { error } = joiCommentValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Comment Format" });
  }

  const { comment, authorID, blogID } = req.body;
  try {
    const newComment = await Comment.create({
      comment: comment,
      author: authorID,
      blog: blogID,
    });

    // adding the comment into the blog
    await Blog.updateOne(
      { _id: blogID },
      { $push: { comments: newComment._id } }
    );

    res
      .status(200)
      .json({ error: false, message: "comment created successfuly" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error });
  }
}

export async function replyWrite(req, res) {
  const { error } = joiCommentValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid Comment Reply Format" });
  }

  const { commentID, authorID, blogID, reply } = req.body;
  try {
    const newComment = await Comment.create({
      comment: reply,
      author: authorID,
      blog: blogID,
    });

    // adding the comment into the blog
    await Comment.updateOne(
      { _id: commentID },
      { $push: { reply: newComment._id } }
    );

    res
      .status(200)
      .json({ error: false, message: "reply created successfuly" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error });
  }
}
