import { Router } from "express";
import {
  createAccount,
  login,
  loginGoogle,
  createAccountWithGoogle,
} from "../controllers/userAuthController";
const router = Router();
router.post("/", createAccount);
router.post("/google", createAccountWithGoogle);
router.post("/login", login);
router.post("/login/google", loginGoogle);

export default router;
