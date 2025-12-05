import express from "express";
import { postLogin, postRegister, postLogout } from "../controllers/auth";

const router = express.Router();

router.post("/register", postRegister);
router.post("/login", postLogin);
router.post("/logout", postLogout);

export default router;
