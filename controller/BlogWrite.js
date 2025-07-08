import Blog from "../model/blog.js";
import User from "../model/user.js";
import { joiBlogValidation } from "../util/schemaValidator.js";

export async function blogWrite(req, res) {
  const { error } = joiBlogValidation(req.body);
  if (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: true, message: `${error.detail[0].message}` });
  }
  try {
    const { title, content, tags, author, coverImage, published } = req.body;
    console.log(req.body.title);
    const checkBlog = await Blog.findOne({ author, title, content });
    if (checkBlog) {
      return res
        .status(409)
        .json({ error: true, message: "Blog already created" });
    }
    const blog = await Blog.create({
      title,
      content,
      coverImage,
      tags,
      author,
      published,
    });

    await User.updateOne(
      { _id: author },
      {
        $push: {
          usersBlogs: blog._id,
        },
      }
    );

    res.status(200).json({
      error: false,
      message: "blog created successfully",
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
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
