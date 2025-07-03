import Blog from "../model/blog.js";
import Comment from "../model/comment.js";
import User from "../model/user.js";
import {
  joiBlogValidation,
  joiCommentValidation,
} from "../util/schemaValidator.js";

export async function blogWrite(req, res) {
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
    return res.status(500).json({ error: true, message: error });
  }
}
