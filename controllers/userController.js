import prisma from "../db/prisma.js";

// --- GET ALL USERS (LEADERBOARD) ---
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                points: 'desc' // Urutkan dari poin tertinggi (Descending)
            },
            // Pilih kolom yang perlu aja biar hemat bandwidth
            select: {
                id: true,
                fullName: true,
                grade: true,
                deviceId: true, // Buat admin ngecek ID HP
                points: true,
                createdAt: true
            }
        });

        res.status(200).json({ 
            message: "Berhasil ambil data siswa",
            data: users 
        });
    } catch (error) {
        console.error("❌ Error Get All Users:", error);
        res.status(500).json({ 
            message: "Gagal mengambil data siswa", 
            error: error.message 
        });
    }
};