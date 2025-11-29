// File: routes/aiRoutes.js
// Router baru khusus untuk endpoint AI

import { Router } from 'express';
import { getAIDetail } from '../controllers/aiController.js';

const router = Router();

// Endpoint utama kita buat Unity
// GET /api/ai/detail/jantung
// GET /api/ai/detail/paru-paru
router.post('/ai/detail/:organName', getAIDetail);

export default router;