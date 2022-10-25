import { IUserModel } from "./../types/IUserModel";
import User from "../models/user";
import { Document } from "mongoose";

export const changeUserAvatar = async (avatar: string, id: string) => {
  try {
    const updatedAvatar = await User.findByIdAndUpdate(id, {
      $set: {
        avatar,
        isUsingAvatar: true,
      },
    });
    if (!updatedAvatar) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
export const findByEmail = async (email: string) => {
  try {
    const user = User.findOne({
      email: email,
    });
    if (!user) {
      return false;
    }
    return user;
  } catch {}
};
export const getRequestsInfo = async (requests: string[]) => {
  try {
    const requestList = await User.find({
      _id: {
        $in: requests,
      },
    }).select("id username avatar ");
    if (requestList.length === 0) {
      return false;
    }

    return requestList;
  } catch {}
};
export const deleteRequest = async (newList: string[], id: string) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, {
      $set: {
        requests: newList,
      },
    });
    if (!updatedUser) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
export const addFriend = async (id: string, idRequest: string) => {
  try {
    const users = await User.find({
      _id: {
        $in: [id, idRequest],
      },
    });

    if (users.length !== 2) {
      return false;
    }
    const sucess = await Promise.all(
      users.map(async (user) => {
        let saved = await add(user, [users[0].id, users[1].id]);
        return saved;
      })
    );

    if (sucess.includes(false)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

const add = async (
  user: Document<unknown, any, IUserModel> & IUserModel,
  ids: string[]
) => {
  var newRequestList = user.requests;
  var newFriedList = user.friends;
  var requestId = ids[0] === user.id ? ids[1] : ids[0];
  if (newRequestList?.includes(requestId)) {
    newRequestList.splice(newRequestList.indexOf(requestId), 1);
  }
  newFriedList?.push(requestId);
  user.requests = newRequestList;
  user.friends = newFriedList;
  try {
    user.save();
    return true;
  } catch {
    return false;
  }
};
export const getAllFriends = async (ids: string[]) => {
  try {
    const friends = await User.find({
      _id: {
        $in: ids,
      },
    }).select("id username avatar ");
    return friends;
  } catch {
    return false;
  }
};
