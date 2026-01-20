import express from "express";
import { 
    createQuizWithQuestions, 
    getAllQuizzes, 
    getQuizById, 
    submitQuiz,
    updateQuiz, 
    deleteQuiz
} from "../controllers/quizController.js";

const router = express.Router();

// POST: Buat Kuis Baru (Admin)
router.post("/", createQuizWithQuestions);

router.get("/", getAllQuizzes);

// GET: Ambil DETAIL kuis buat dimainin (Unity pas klik Start Kuis A)
router.get("/:id", getQuizById);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

// POST: Submit jawaban & update poin
router.post("/:quizId/submit", submitQuiz);

export default router;