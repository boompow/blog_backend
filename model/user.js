import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import slugify from "slugify";
import validator from "validator";

const userSchema = new Schema(
  {
    // Profile
    googleID: {
      unique: true,
      type: String,
      required: true,
    },

    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 30,
      minlength: 1,
    },

    slug: {
      unique: true,
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
    },

    avatar: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "please enter valid URL",
      },
    },

    bio: {
      type: String,
      minlength: 1,
      maxlength: 300,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Blogs
    usersBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    savedBlogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],

    //   Status
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

// slugify the username
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    this.slug = `${baseSlug}-${nanoid(8)}`; //this needs to be sanitized and check for duplicate slug
  }
  next();
});

const User = model("User", userSchema);

export default User;
