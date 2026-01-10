import prisma from "../db/prisma.js";

// --- (C)REATE with Image & System ---
export const createOrgan = async (req, res) => {
    const { name, description, funFact, model3D_Url, systemId } = req.body;
    
    // Ambil URL Cloudinary
    const imageUrl = req.file ? req.file.path : null;

    if (!name || !description) {
        return res.status(400).json({
            message: "Nama dan Deskripsi wajib diisi",
        });
    }

    try {
        const newOrgan = await prisma.organ.create({
            data: {
                name,
                description,
                funFact,
                model3D_Url,
                imageUrl, 
                // ParseInt systemId. Kalau NaN (not a number), set null biar gak error validasi
                systemId: (systemId && !isNaN(parseInt(systemId))) ? parseInt(systemId) : null, 
            },
        });
        res.status(201).json({
            message: "Organ baru berhasil dibuat!",
            data: newOrgan,
        });
    } catch (error) {
        console.error("❌ Error Create Organ:", error); // Log detail ke terminal

        // Handle Unique Constraint (Nama Kembar)
        if (error.code === "P2002") {
            return res.status(409).json({ 
                message: `Gagal: Nama organ '${name}' sudah ada. Harap gunakan nama lain.` 
            });
        }
        
        // Handle Foreign Key Constraint (System ID gak ada)
        if (error.code === "P2003") {
            return res.status(400).json({ 
                message: "Gagal: System ID yang dimasukkan tidak ditemukan di database." 
            });
        }

        // Handle Value Too Long
        if (error.code === "P2000") {
            return res.status(400).json({ 
                message: "Gagal: Data terlalu panjang (misal: Deskripsi atau Fakta Unik melebihi batas database)." 
            });
        }

        // Error Generic
        res.status(500).json({ 
            message: "Terjadi error internal server", 
            error: error.message, 
            code: error.code 
        });
    }
};

// --- (R)EAD: Get All ---
export const getAllOrgans = async (req, res) => {
    try {
        const organs = await prisma.organ.findMany({
            include: { system: true }
        });
        res.status(200).json({ data: organs });
    } catch (error) {
        console.error("❌ Error Get All Organs:", error);
        res.status(500).json({ message: "Gagal mengambil data organ", error: error.message });
    }
};

// --- (R)EAD: Get By Name ---
export const getOrganByName = async (req, res) => {
    const { name } = req.params;
    try {
        const organ = await prisma.organ.findUnique({
            where: { name: name },
            include: { system: true }
        });
        
        if (organ) {
            res.status(200).json({ data: organ });
        } else {
            res.status(404).json({ message: `Organ dengan nama '${name}' tidak ditemukan` });
        }
    } catch (error) {
        console.error("❌ Error Get Organ By Name:", error);
        res.status(500).json({ message: "Terjadi error saat mencari organ", error: error.message });
    }
};

// --- (U)PDATE with Image ---
export const updateOrgan = async (req, res) => {
    const { id } = req.params;
    const { name, description, funFact, model3D_Url, systemId } = req.body;
    
    const imageUrl = req.file ? req.file.path : undefined;

    // Validasi ID harus angka
    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID Organ harus berupa angka" });
    }

    try {
        const updatedOrgan = await prisma.organ.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                funFact,
                model3D_Url,
                // Logic System ID: Kalo dikirim kosong (""), set jadi null (hapus relasi). Kalo ada angka, update.
                systemId: systemId === "" ? null : (systemId ? parseInt(systemId) : undefined),
                ...(imageUrl && { imageUrl }), 
            },
        });
        res.status(200).json({ message: "Update berhasil", data: updatedOrgan });
    } catch (error) {
        console.error("❌ Error Update Organ:", error);

        // Record Not Found
        if (error.code === "P2025") {
            return res.status(404).json({ message: `Organ dengan ID ${id} tidak ditemukan` });
        }
        
        // Unique Constraint (Ganti nama jadi nama yg udah ada)
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Gagal update: Nama organ sudah digunakan oleh data lain." });
        }

        // Foreign Key (System ID salah)
        if (error.code === "P2003") {
            return res.status(400).json({ message: "Gagal update: System ID tidak valid." });
        }

        // Handle Value Too Long (P2000) 
        if (error.code === "P2000") {
            return res.status(400).json({ 
                message: "Gagal update: Data terlalu panjang. Cek apakah ada gambar yang masuk sebagai teks (base64) di deskripsi.",
                meta: error.meta
            });
        }

        res.status(500).json({ 
            message: "Terjadi error saat update", 
            error: error.message,
            code: error.code
        });
    }
};

// --- (D)ELETE ---
export const deleteOrgan = async (req, res) => {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID Organ harus berupa angka" });
    }

    try {
        await prisma.organ.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Data organ berhasil dihapus" });
    } catch (error) {
        console.error("❌ Error Delete Organ:", error);

        if (error.code === "P2025") {
             return res.status(404).json({ message: `Organ dengan ID ${id} tidak ditemukan` });
        }
        
        res.status(500).json({ 
            message: "Gagal menghapus organ", 
            error: error.message,
            code: error.code
        });
    }
};