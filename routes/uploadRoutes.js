import { Router } from 'express';
import upload from '../middleware/uploadsMiddleware.js';
import { uploadMedia } from '../controllers/mediaController.js';

const router = Router();

// --- ROUTE UTILITY ---
// Endpoint: POST /api/upload-media
router.post('/upload-media', upload.single('file'), uploadMedia);

export default router;