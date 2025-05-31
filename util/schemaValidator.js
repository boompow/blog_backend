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
});

const joiUserSchema = Joi.object({
  id: Joi.string().required().label("User ID"),
  name: Joi.string().trim().required().min(1).max(30).label("Name"),
  email: Joi.string().email().required().lowercase().label("email"),
  avatar: Joi.string().uri(),
  bio: Joi.string().min(0).max(300).label("Bio"),
});

const validateJoiSchema = (schema, body) => {
  const { error, value } = schema.validate(body);
  if (error) {
    throw new Error(error.details[0].message);
  } else {
    return value;
  }
};

export default {
  joiBlogSchema,
  joiCommentSchema,
  joiUserSchema,
  validateJoiSchema,
};
