import { getFriends } from "./userDataControllers";
import { IUserData } from "./../types/IUserData";
import { Request, Response } from "express";
import Message from "../models/message";

export const getMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).send("Invalid friend id");
    }
    if (!req.user) {
      return res.status(401).send("Must be logged");
    }
    const friends = req.user.friends as string[];

    if (!friends.includes(id)) {
      return res.status(403).send("User not in friend list");
    }
    const userId = req.user.id;
    const messages = await Message.find({
      users: {
        $all: [userId, id],
      },
    }).sort({ updatedAt: 1 });

    return res.status(200).json(messages);
  } catch {}
};
export const addMessage = async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    const { id, friends } = req.user as IUserData;
    if (!to || !message) {
      return res.status(400).send("missing fields");
    }
    if (!req.user) {
      return res.status(401).send("must be logged");
    }

    if (!friends.includes(to)) {
      return res.status(403).send("Only messages to friends are allowed");
    }

    const newMessage = await Message.create({
      sender: id,
      users: [id, to],
      message: message,
    });
    return res.status(200).json(newMessage);
  } catch {
    return res.status(500).send("error");
  }
};
