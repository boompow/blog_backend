import Blog from "../model/blog.js";
import { joiBlogValidation } from "../util/schemaValidator.js";

export default async function publishBlog(req, res) {
  const { error } = joiBlogValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ error: true, message: "Incomplete/ Invalid Blog" });
  }

  try {
    const { title, content, tags, author, published } = req.body;
    const blog = await Blog.create({ title, content, tags, author, published });

    console.log(blog);

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
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "unable to create the blog" });
  }
}
