import express from "express";
import { getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// GET /api/users -> Ambil semua siswa buat leaderboard
router.get("/users", getAllUsers);

export default router;