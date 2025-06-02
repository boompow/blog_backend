import Joi from "joi";

// joi schemas
const joiBlogSchema = Joi.object({
  title: Joi.string().required().label("Title"),
  coverImage: Joi.string().uri().label("Cover Image Link"),
  content: Joi.string().required().label("body content"),
  tags: Joi.array()
    .items(
      Joi.object({
        tag: Joi.string().lowercase().trim().min(1).max(30),
      })
    )
    .required()
    .label("tags"),
  author: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) //ObjectID pattern
    .required()
    .label("Author ObjectID")
    .message({
      "string pattern": "ObjectID must be 24-character hexadecimal string",
    }),

  published: Joi.boolean(),
  publishedAt: Joi.date(),
});

const joiCommentSchema = Joi.object({
  id: Joi.string().label("comment ID"),
  comment: Joi.string().required.min(1).max(300).label("Comment"),
  author: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) //ObjectID pattern
    .required()
    .label("Author ObjectID")
    .message({
      "string pattern": "ObjectID must be 24-character hexadecimal string",
    }),
  blog: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .label("Blog ObjectID")
    .message({
      "string pattern": "ObjectID must be 24-character hexadecimal string",
    }),
  replies: Joi.array()
    .items(
      Joi.object({
        commentID: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .label("Comment reply UserID"),
      })
    )
    .label("Comment Replies"),
});

const joiUserSchema = Joi.object({
  id: Joi.string().required().label("User ID"),
  name: Joi.string().trim().required().min(1).max(30).label("Name"),
  email: Joi.string().email().required().lowercase().label("email"),
  avatar: Joi.string().uri(),
  bio: Joi.string().min(0).max(300).label("Bio"),
  slug: Joi.string().required().label("slug"),
});

// the joi schema validator function
const validateJoi = (schema, body) => {
  const { error, value } = schema.validate(body);
  if (error) {
    throw new Error(error.details[0].message);
  } else {
    return value;
  }
};

// joi schema validators
export function joiBlogValidation(body) {
  return validateJoi(joiBlogSchema, body);
}

export function joiCommentValidation(body) {
  return validateJoi(joiCommentSchema, body);
}

export function joiUserValidation(body) {
  return validateJoi(joiUserSchema, body);
}
