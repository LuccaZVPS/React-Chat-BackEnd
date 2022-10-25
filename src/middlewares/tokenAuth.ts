import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
export const middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Missing token" });
  }

  const splitHeader = authorization?.split(" ");
  if (splitHeader === undefined || splitHeader.length < 2) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const token = splitHeader[1];
    const userEmail = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!userEmail) {
      return res.status(403).json({ error: "Invalid token" });
    }
    var { id } = userEmail as decodedToken;
    const user = await User.findById(id);

    if (!user) {
      return res.status(401).json("Invalid token");
    }
    req.user = {
      username: user.username,
      avatar: user.avatar || "",
      isUsingAvatar: user.isUsingAvatar,
      friends: user.friends || [],
      friendRequests: user.requests || [],
      token: token,
      email: user.email,
      id: user.id,
    };
    return next();
  } catch (e) {
    console.log(e);
    return res.status(500).json("unknown error");
  }
};
interface decodedToken {
  id: string;
}
