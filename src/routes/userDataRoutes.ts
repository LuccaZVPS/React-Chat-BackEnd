import { Router } from "express";
import { middleware } from "../middlewares/tokenAuth";
import {
  getUserData,
  changeAvatar,
  sendRequest,
  getRequests,
  refuseRequest,
  acceptFriend,
  getFriends,
} from "../controllers/userDataControllers";

const router = Router();
router.get("/", middleware, getUserData);
router.put("/avatar", middleware, changeAvatar);
router.post("/request", middleware, sendRequest);
router.get("/request", middleware, getRequests);
router.delete("/request", middleware, refuseRequest);
router.post("/friend", middleware, acceptFriend);
router.get("/friend", middleware, getFriends);

export default router;
