import { Router } from 'express';
import upload from '../middleware/uploadsMiddleware.js'; 
import { 
    createOrgan, 
    getAllOrgans, 
    getOrganByName, 
    updateOrgan, 
    deleteOrgan 
} from '../controllers/organController.js';

const router = Router();

// --- ROUTE ORGAN (Anak) ---

// 1. Create Organ (Pake upload gambar 'image')
router.post('/organs', upload.single('image'), createOrgan);

// 2. Get All Organs
router.get('/organs', getAllOrgans);

// 3. Get Organ by Name (Utama buat Unity AR Camera)
router.get('/organs/name/:name', getOrganByName);

// 4. Update Organ (Pake upload gambar 'image')
router.put('/organs/:id', upload.single('image'), updateOrgan);

// 5. Delete Organ
router.delete('/organs/:id', deleteOrgan);

export default router;