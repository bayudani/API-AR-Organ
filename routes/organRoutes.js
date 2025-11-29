import { Router } from "express";

import {
    createOrgan,
    getAllOrgans,
    getOrganByName,
    updateOrgan,
    deleteOrgan,
} from "../controllers/organController.js";

const router = Router();

// POST /api/organs

router.post("/organs", createOrgan);
// documentation


// GET /api/organs
router.get("/organs", getAllOrgans);

// GET /api/organs/name/:name
router.get("/organs/name/:name", getOrganByName);

// PUT /api/organs/:id
router.put("/organs/:id", updateOrgan);

// DELETE /api/organs/:id
router.delete("/organs/:id", deleteOrgan);

export default router;
