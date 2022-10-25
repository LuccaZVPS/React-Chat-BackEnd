import userAuthRoutes from "./routes/userAuthRoutes";
import userDataRoutes from "./routes/userDataRoutes";
import messageRoutes from "./routes/messageRoutes";

import { Router } from "express";

const router = Router();
router.use("/user", userAuthRoutes);
router.use("/user", userDataRoutes);
router.use("/message", messageRoutes);

export default router;
