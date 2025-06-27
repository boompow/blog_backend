import Blog from "../model/blog.js";

export async function blogRead(req, res) {
  const page = 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    const result = await Blog.aggregate([
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            // this is how referencing works in MongoDB
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "authorInfo",
              },
            },
            {
              $unwind: "$authorInfo",
            },
            {
              $project: {
                _id: 1,
                title: 1,
                slug: 1,
                content: 1,
                tags: 1,
                authorName: "$authorInfo.name",
                authorAvatar: "$authorInfo.avatar",
                authorEmail: "$authorInfo.email",
                published: 1,
                publishedAt: 1,
                likes: 1,
                comments: 1,
              },
            },
          ],
        },
      },
    ]);

    const blog = result[0].data;
    const count = result[0]?.metadata || 0;

    return res.status(200).json({
      error: false,
      data: {
        blog: blog,
        count: count,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "cannot fetch blog" });
  }
}
