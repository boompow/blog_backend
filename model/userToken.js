import { Schema, model } from "mongoose";

const userTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // after 7 days
    },
  },
  {
    timestamps: true,
  }
);

// mongos TTL removes this token when its expiration is reached
userTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const UserToken = model("UserToken", userTokenSchema);

export default UserToken;
