import { Router } from 'express';
import upload from '../middleware/uploadsMiddleware.js'; 
import { 
    createSystem, 
    getAllSystems, 
    getSystemDetail, 
    updateSystem, 
    deleteSystem,
    getSystemByName
} from '../controllers/sistemController.js';

const router = Router();

// --- ROUTE SISTEM ORGAN (Induk) ---
// Base URL nanti: /api/systems

// 1. Create System (Pake upload gambar 'image')
router.post('/systems', upload.single('image'), createSystem); 

// 2. Get All Systems
router.get('/systems', getAllSystems);

// 3. Get Detail System
router.get('/systems/:id', getSystemDetail);

// Get System by Name
router.get('/systems/name/:name', getSystemByName);

// 4. Update System
router.put('/systems/:id', upload.single('image'), updateSystem);

// 5. Delete System
router.delete('/systems/:id', deleteSystem);

export default router;