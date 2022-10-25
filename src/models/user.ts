import { Schema, model } from "mongoose";
import { IUserModel } from "../types/IUserModel";

const userSchema = new Schema<IUserModel>({
  email: { type: String, required: true, unique: true },
  friends: { type: Array, required: false },
  requests: { type: Array, required: false },
  hashedPassword: { type: String, required: false },
  username: { type: String, required: true },
  withGoogle: { type: Boolean, required: true },
  avatar: { type: String, required: false },
  isUsingAvatar: { type: Boolean, required: true, default: false },
});
const User = model<IUserModel>("User", userSchema);
export default User;
