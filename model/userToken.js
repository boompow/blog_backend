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

    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 30 * 86400, //30 days later refreshes token
    },
  },
  {
    timestamps: true,
  }
);

const UserToken = model("UserToken", userTokenSchema);

export default UserToken;
