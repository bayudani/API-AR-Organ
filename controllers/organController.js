// File: controllers/organController.js
// Ini rumah baru buat semua logic/fungsi kita

import prisma from "../db/prisma.js"; // Prisma-nya kita impor di sini

// --- (C)REATE ---
export const createOrgan = async (req, res) => {
    const { name, description, funFact } = req.body;

    if (!name || !description) {
        return res.status(400).json({
            message: "Nama dan Deskripsi wajib diisi",
        });
    }

    try {
        const newOrgan = await prisma.organ.create({
            data: {
                name: name,
                description: description,
                funFact: funFact,
            },
        });
        res.status(201).json({
            message: "Organ baru berhasil dibuat!",
            data: newOrgan,
        });
    } catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return res.status(409).json({
                message: "Error: Nama organ sudah ada (harus unik)",
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Terjadi error di server",
            error: error.message,
        });
    }
};

// --- (R)EAD: Get All ---
export const getAllOrgans = async (req, res) => {
    try {
        const organs = await prisma.organ.findMany();
        res.status(200).json({
            message: "Semua data organ berhasil diambil",
            data: organs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Terjadi error di server",
            error: error.message,
        });
    }
};

// --- (R)EAD: Get by Name (ENDPOINT UTAMA BUAT UNITY) ---
export const getOrganByName = async (req, res) => {
    const { name } = req.params;

    try {
        const organ = await prisma.organ.findUnique({
            where: {
                name: name,
            },
        });

        if (organ) {
            res.status(200).json({
                message: "Data organ ditemukan",
                data: organ,
            });
        } else {
            res.status(404).json({
                message: "Organ tidak ditemukan",
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Terjadi error di server",
            error: error.message,
        });
    }
};

// --- (U)PDATE ---
export const updateOrgan = async (req, res) => {
    const { id } = req.params;
    const { name, description, funFact } = req.body;

    try {
        const updatedOrgan = await prisma.organ.update({
            where: {
                id: parseInt(id),
            },
            data: {
                name,
                description,
                funFact,
            },
        });
        res.status(200).json({
            message: "Data organ berhasil di-update",
            data: updatedOrgan,
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res
                .status(404)
                .json({ message: "Organ dengan ID tersebut tidak ditemukan" });
        }
        if (error.code === "P2002" && error.meta?.target?.includes("name")) {
            return res.status(409).json({
                message: "Error: Nama organ sudah ada (harus unik)",
            });
        }
        console.error(error);
        res.status(500).json({
            message: "Terjadi error di server",
            error: error.message,
        });
    }
};

// --- (D)ELETE ---
export const deleteOrgan = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.organ.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.status(200).json({
            message: "Data organ berhasil dihapus",
        });
    } catch (error) {
        if (error.code === "P2025") {
            return res
                .status(404)
                .json({ message: "Organ dengan ID tersebut tidak ditemukan" });
        }
        console.error(error);
        res.status(500).json({
            message: "Terjadi error di server",
            error: error.message,
        });
    }
};
