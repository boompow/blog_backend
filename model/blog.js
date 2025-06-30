import { model, Schema } from "mongoose";
import { nanoid } from "nanoid";
import slugify from "slugify";
import validator from "validator";

const blogSchema = new Schema(
  {
    // blog body
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    coverImage: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "please enter valid URL",
      },
    },

    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    tags: {
      type: [
        {
          type: String,
          lowercase: true,
          trim: true,
          maxlength: 30,
          minlength: 1,
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "Please select at least one tag"],
    },

    // blog author
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Publish status
    published: {
      type: Boolean,
      default: false, // to allow draft
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },

    // Blog status
    likes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// slugify the title
blogSchema.pre("validate", function (next) {
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${nanoid(8)}`;
  }
  next();
});

const Blog = model("Blog", blogSchema);

export default Blog;
