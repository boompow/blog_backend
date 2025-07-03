import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 300,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },

    // limiting the amount of replies to 5
    repliedComment: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      validate: {
        validator: function (value) {
          return value.length <= 5;
        },
        message: (prop) => `${prop.path} can not exceed 5 replies`,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Comment = model("Comment", commentSchema);

export default Comment;
