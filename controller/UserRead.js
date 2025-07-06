import User from "../model/user.js";
import { ObjectId } from "mongodb";

export default async function userData(userId) {
  try {
    const result = await User.aggregate([
      { $match: { _id: new ObjectId(userId) } },

      // Lookup and populate created blogs
      {
        $lookup: {
          from: "blogs",
          let: { blogIds: "$usersBlogs" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$blogIds"] } } },
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
              },
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                slug: 1,
                coverImage: 1,
                tags: 1,
                title: 1,
                published: 1,
                publishedAt: 1,
                likes: 1,
                comments: 1,
                author: {
                  _id: "$author._id",
                  name: "$author.name",
                  email: "$author.email",
                  avatar: "$author.avatar",
                  slug: "$author.slug",
                },
              },
            },
          ],
          as: "usersBlogs",
        },
      },

      // Lookup and populate saved blogs
      {
        $lookup: {
          from: "blogs",
          let: { blogIds: "$savedBlogs" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$blogIds"] } } },
            {
              $lookup: {
                from: "users",
                localField: "author",
                foreignField: "_id",
                as: "author",
              },
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                slug: 1,
                coverImage: 1,
                tags: 1,
                title: 1,
                published: 1,
                publishedAt: 1,
                likes: 1,
                comments: 1,
                author: {
                  _id: "$author._id",
                  name: "$author.name",
                  email: "$author.email",
                  avatar: "$author.avatar",
                  slug: "$author.slug",
                },
              },
            },
          ],
          as: "savedBlogs",
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          slug: 1,
          bio: 1,
          usersBlogs: 1,
          savedBlogs: 1,
        },
      },
    ]);

    const data = result[0] || null;
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: "Cannot fetch user data",
    };
  }
}
