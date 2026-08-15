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

// delete user by ID
export const deleteUserById = async (req, res) => {
    const { id } = req.params;  // ID user yang ingin dihapus

    try {
        // Cek apakah user dengan ID tersebut ada
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        // Hapus user
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.status(200).json({ message: "User berhasil dihapus" });
    } catch (error) {
        console.error("❌ Error Delete User:", error);
        res.status(500).json({
            message: "Gagal menghapus user",
            error: error.message
        });
    }
}