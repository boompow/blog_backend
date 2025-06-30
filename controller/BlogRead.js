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
            // paginating the blog
            { $skip: skip },
            { $limit: limit },

            // this is how referencing works in MongoDB
            // look up and unwind the author ObjectID
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

            // lookup and unwind the comment objectIDs
            {
              $lookup: {
                from: "comments",
                localField: "comments",
                foreignField: "_id",
                as: "commentDocs",
              },
            },
            {
              $unwind: {
                path: "$commentDocs",
                preserveNullAndEmptyArrays: true,
              },
            },

            // lookup and unwind the comment author objectID
            {
              $lookup: {
                from: "users",
                let: { commentAuthorIds: "$commentDocs.author" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$commentAuthorIds"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      avatar: 1,
                      email: 1,
                    },
                  },
                ],
                as: "commentDocsAuthor",
              },
            },

            // lookup the replies
            {
              $lookup: {
                from: "comments",
                let: { repliedComments: "$commentDocs.repliedComment" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $in: ["$_id", "$$repliedComments"] },
                    },
                  },
                  // now lookup and unwind the reply author
                  {
                    $lookup: {
                      from: "users",
                      localField: "author",
                      foreignField: "_id",
                      as: "replyAuthorInfo",
                    },
                  },
                  {
                    $unwind: {
                      path: "$replyAuthorInfo",
                      preserveNullAndEmptyArrays: true,
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      comment: 1,
                      timestamps: 1,
                      author: {
                        _id: "$replyAuthorInfo._id",
                        name: "$replyAuthorInfo.name",
                        avatar: "$replyAuthorInfo.avatar",
                        email: "$replyAuthorInfo.email",
                      },
                    },
                  },
                ],
                as: "commentDocsReplies",
              },
            },

            {
              $group: {
                _id: "$_id",
                title: { $first: "$title" },
                slug: { $first: "$slug" },
                content: { $first: "$content" },
                tags: { $first: "$tags" },
                author: {
                  $first: {
                    _id: "$authorInfo._id",
                    name: "$authorInfo.name",
                    avatar: "$authorInfo.avatar",
                    email: "$authorInfo.email",
                  },
                },
                published: { $first: "$published" },
                publishedAt: { $first: "$publishedAt" },
                likes: { $first: "$likes" },
                comments: {
                  $map: {
                    input: "$commentDocs",
                    as: "comment",
                    in: {
                      _id: "$$comment._id",
                      comment: "$$comment.comment",
                      publishedAt: "$$comment.timestamps",
                      author: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$commentDocsAuthor",
                              as: "author",
                              cond: {
                                $eq: ["$$author._id", "$$comment.author"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                      replies: {
                        $filter: {
                          input: "$commentDocsReplies",
                          as: "reply",
                          cond: {
                            $in: ["$$reply._id", "$$comment.repliedComment"],
                          },
                        },
                      },
                    },
                  },
                },
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
