import prisma from "../db/prisma.js";

// --- LOGIN / REGISTER SISWA (Support Multi-Akun satu HP) ---
export const authUser = async (req, res) => {
    // Unity kirim: DeviceID (otomatis), Nama (input), Kelas (input)
    const { deviceId, fullName, grade } = req.body;

    // 1. Validasi Input
    if (!deviceId) return res.status(400).json({ message: "Device ID error" });
    if (!fullName || !grade) return res.status(400).json({ message: "Nama & Kelas wajib diisi!" });

    // Normalisasi nama: "  budi  " jadi "budi" biar pencarian lebih akurat
    // (Opsional: bisa di lower case semua kalau mau lebih strict)
    const cleanName = fullName.trim();

    try {
        // 2. Cari: Apakah di HP ini (deviceId) pernah ada user dengan nama ini (cleanName)?
        const existingUser = await prisma.user.findFirst({
            where: {
                deviceId: deviceId,
                fullName: cleanName
            }
        });

        let user;

        if (existingUser) {
            // SKENARIO A: LOGIN USER LAMA
            // "Halo Budi, welcome back!"
            // Kita update kelasnya aja (siapa tau naik kelas atau typo sebelumnya)
            user = await prisma.user.update({
                where: { id: existingUser.id }, // Update by ID yang ketemu
                data: { grade: grade }
            });
            console.log(`User Logged In: ${cleanName} (ID: ${user.id})`);
        } else {
            // SKENARIO B: USER BARU DI HP INI
            // "Halo Asep, ini akun barumu di HP ini ya"
            user = await prisma.user.create({
                data: {
                    deviceId: deviceId,
                    fullName: cleanName,
                    grade: grade,
                    points: 0
                }
            });
            console.log(`New User Created: ${cleanName} on device ${deviceId}`);
        }

        // 3. Balikin Data ke Unity
        res.status(200).json({
            message: existingUser ? "Welcome back!" : "Data siswa baru berhasil disimpan!",
            data: user
        });

    } catch (error) {
        console.error("❌ Error Auth User:", error);

        // Handle constraint error (P2002) kalau-kalau ada race condition aneh
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Konflik data user, coba login lagi." });
        }

        res.status(500).json({ message: "Server error saat login", error: error.message });
    }
};