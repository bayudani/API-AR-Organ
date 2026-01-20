import express from "express";
import { authUser } from "../controllers/authConroller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/auth/login", authUser);

export default router;