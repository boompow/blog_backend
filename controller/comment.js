import Comment from "../model/comment.js";
import User from "../model/user.js";
import { joiCommentValidation } from "../util/schemaValidator.js";

// create comment
const writeComment = async (req, res) => {
  try {
    const { comment, author, blog, replies } = req.body;
    const { error } = joiCommentValidation(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });
    }

    const user = await User.findOne({ id: author });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const new_comment = await Comment.create({
      comment,
      author,
      blog,
      replies,
    });

    // make sure to work on handling the reply, because we are not sending replies
    return res.status(200).json({
      error: false,
      comment: {
        id: new_comment._id,
        comment,
        author_id: author,
        author_name: user.name,
        author_avatar: user.avatar,
        blog,
      },
      message: "Comment created successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Can not save comment" });
  }
};

// read comment

// edit comment

// delete comment
