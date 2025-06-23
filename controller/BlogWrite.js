import Blog from "../model/blog.js";
import { joiBlogValidation } from "../util/schemaValidator.js";

export default async function publishBlog(req, res) {
  try {
    console.log(req.body);
    const { error } = joiBlogValidation(req.body);
    if (error) {
      console.log(error);
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
