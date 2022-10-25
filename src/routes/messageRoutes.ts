import { Router } from "express";
import { middleware } from "../middlewares/tokenAuth";
import { addMessage, getMessage } from "../controllers/messageController";
const router = Router();
router.get("/:id", middleware, getMessage);
router.post("/", middleware, addMessage);
export default router;
