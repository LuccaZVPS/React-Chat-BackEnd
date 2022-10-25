import { Request, Response } from "express";
import {
  changeUserAvatar,
  findByEmail,
  getRequestsInfo,
  deleteRequest,
  addFriend,
  getAllFriends,
} from "../services/userDataServices";
import { IUserData } from "../types/IUserData";
export const getUserData = async (req: Request, res: Response) => {
  const { user } = req;

  if (!user) {
    return res.status(403).json("Must be logged");
  }

  return res.status(200).json(user);
};
export const changeAvatar = async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;
    const { id } = req.user as IUserData;
    if (typeof avatar !== "string") {
      return res.status(403).json("Invalid avatar");
    }

    const avatarChanged = await changeUserAvatar(avatar, id);

    if (!avatarChanged) {
      return res.status(500).json("Error while saving you avatar");
    }
    return res.status(200).json(avatar);
  } catch {}
};
export const sendRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!req.user) {
      return res.status(403).json("Must be logged");
    }
    if (typeof email !== "string") {
      return res.status(400).json("Invalid email");
    }
    const user = await findByEmail(email);
    if (!user) {
      return res.status(404).json("User not found");
    }
    //impede o user de mandar solicitações para ele mesmo
    if (user.email === req.user.email) {
      return res.status(409).json("request to own email");
    }

    if (user.requests?.includes(req.user.id)) {
      return res.status(409).json("Request already sent");
    }
    if (user.friends?.includes(req.user.id)) {
      return res.status(409).json("User already a friend");
    }

    const requestList = user.requests;
    requestList?.push(req.user.id);
    user.requests = requestList;
    await user.save();
    return res.status(200).json({ id: user.id });
  } catch {}
};
export const getRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).send("Must be logged");
    }

    const requestList = req.user.friendRequests as string[];
    if (requestList.length === 0) {
      return res.status(400).send("No users in request list");
    }
    const requests = await getRequestsInfo(requestList);
    if (!requests) {
      return res.status(404).send("Requests not found");
    }

    return res.status(200).json(requests);
  } catch {}
};
export const refuseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (typeof id !== "string" || !id) {
      return res.status(400).json("Invalid email");
    }
    if (!req.user) {
      return res.status(403).send("Must be logged");
    }

    var requestList = req.user.friendRequests as string[];
    if (requestList.length === 0) {
      return res.status(400).send("No users in request list");
    }
    const index = requestList.indexOf(id);
    if (index < 0) {
      return res.status(404).send("Request not found in list");
    }

    requestList.splice(index, 1);
    const updatedRequest = await deleteRequest(requestList, req.user.id);
    if (!updatedRequest) {
      return res.status(500).send("Error while update your request list");
    }
    return res.status(200).json("sucess");
  } catch {}
};
export const acceptFriend = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (typeof id !== "string" || !id) {
      return res.status(400).send("Invalid id");
    }
    if (!req.user) {
      return res.status(403).send("Must be logged");
    }
    const requestList = req?.user.friendRequests as string[];
    if (!requestList.includes(id)) {
      return res.status(404).send("Request not found for this user");
    }

    const newFriend = await addFriend(req.user.id, id);
    if (!newFriend) {
      return res.status(500).send("Error while updating friend list");
    }

    return res.status(200).send("sucess");
  } catch {}
};
export const getFriends = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(403).send("Must be logged");
    }
    const friendList = req.user.friends as string[];
    const friendsData = await getAllFriends(friendList);
    if (!friendsData) {
      return res.status(404).send("No friends found");
    }
    return res.status(200).json(friendsData);
  } catch {}
};
