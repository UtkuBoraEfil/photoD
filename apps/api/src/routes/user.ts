import express from "express";
import { getMe, isProtected } from "../controllers/user";

const router = express.Router();

router.get("/me", getMe);
router.get("/isProtected", isProtected);
export default router;
