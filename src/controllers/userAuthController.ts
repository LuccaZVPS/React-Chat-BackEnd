import { Request, Response } from "express";
import { ValidateUser } from "../validations/userValidation";
import { validateGoogleAccount } from "../validations/userGoogleValidation";
import { validateLogin } from "../validations/loginValidation";
import brcyptjs from "bcryptjs";
import { IUser } from "../types/IUser";
import { IUserGoogle } from "../types/IUserGoogle";
import { ILogin } from "../types/ILogin";
import jwt from "jsonwebtoken";
import { isError } from "joi";
import {
  verifyEmail,
  createUser,
  verifyGoogleToken,
  createUserGoogle,
} from "../services/userAuthServices";
import { IUserModel } from "../types/IUserModel";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const validatedUser: IUser = await ValidateUser.validateAsync(req.body);
    const emailUsed = await verifyEmail(validatedUser.email);
    if (emailUsed) {
      return res.status(409).send("Email adress already taken");
    }
    const userSaved = await createUser(validatedUser);

    if (!userSaved) {
      return res.status(500).send("Error while saving in database");
    }
    return res.status(200).send("Account created");
  } catch (e) {
    if (isError(e)) {
      return res.status(400).send("Invalid Fields");
    }
  }
};
export const createAccountWithGoogle = async (req: Request, res: Response) => {
  try {
    const validatedUser: IUserGoogle =
      await validateGoogleAccount.validateAsync(req.body);

    const isEmail = await verifyGoogleToken(validatedUser.token);
    if (!isEmail) {
      return res.status(400).send("Invalid Token");
    }
    const emailUsed = await verifyEmail(isEmail.email);
    if (emailUsed) {
      return res.status(409).send("Email adress already taken");
    }
    const userSaved = await createUserGoogle(
      validatedUser.username,
      isEmail.email
    );
    if (!userSaved) {
      return res.status(500).send("Error while saving in database");
    }
    return res.status(200).send("Account created");
  } catch (e) {
    console.log(e);
    if (isError(e)) {
      return res.status(400).send("Invalid Fields");
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedLogin: ILogin = await validateLogin.validateAsync(req.body);
    const accountFound: IUserModel | false = await verifyEmail(
      validatedLogin.email
    );
    if (!accountFound) {
      return res.status(401).send("email not found");
    }

    if (accountFound.hashedPassword === undefined || accountFound.withGoogle) {
      return res.status(401).send("Account was created with Google");
    }

    const equalPassword = await brcyptjs.compare(
      validatedLogin.password,
      accountFound.hashedPassword
    );
    if (!equalPassword) {
      return res.status(401).send("not authorized");
    }
    const token = jwt.sign(
      { id: accountFound.id },
      process.env.JWT_SECRET as string
    );
    return res.status(200).send(token);
  } catch (e) {
    if (isError(e)) {
      return res.status(400).send("Invalid Fields");
    }
  }
};
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (typeof token !== "string") {
      return res.status(400).send("Invalid Fields");
    }
    const isEmail = await verifyGoogleToken(token);
    if (!isEmail) {
      return res.status(400).send("Invalid token");
    }
    const emailFound = await verifyEmail(isEmail.email);
    if (!emailFound) {
      return res.status(401).send("Email not found");
    }

    if (emailFound.hashedPassword || !emailFound.withGoogle) {
      return res.status(401).send("Account created with password");
    }
    const jwtToken = jwt.sign(
      { id: emailFound.id },
      process.env.JWT_SECRET as string
    );
    return res.status(200).send(jwtToken);
  } catch (e) {
    if (isError(e)) {
      return res.status(400).send("Invalid Fields");
    }
  }
};
