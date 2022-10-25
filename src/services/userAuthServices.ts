import User from "../models/user";
import { IUser } from "../types/IUser";

import bcrypt from "bcryptjs";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);
const salt = bcrypt.genSaltSync(10);
export const verifyEmail = async (email: string) => {
  try {
    const emailExist = await User.findOne({
      email,
    });
    if (emailExist) {
      return emailExist;
    }
    return false;
  } catch {
    return false;
  }
};
export const createUser = async (user: IUser) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const newUser = new User({
      email: user.email,
      username: user.username,
      hashedPassword,
      withGoogle: false,
    });
    await newUser.save();
    return true;
  } catch {
    return false;
  }
};
export const createUserGoogle = async (username: string, email: string) => {
  try {
    const newUser = new User({
      email: email,
      username: username,
      withGoogle: true,
    });
    await newUser.save();
    return true;
  } catch {
    return false;
  }
};
export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID_GOOGLE,
    });
    const payload = (await ticket.getPayload()) as payload;
    return payload;
  } catch (e) {
    return false;
  }
};
interface payload {
  email: string;
}
