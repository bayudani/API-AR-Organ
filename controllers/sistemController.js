import prisma from "../db/prisma.js";

// --- (C)REATE System ---
export const createSystem = async (req, res) => {
  const { name, description, process } = req.body;
  
  // Update: Pake req.file.path karena kita pake Cloudinary
  // Kalo user upload gambar, kita ambil URL-nya. Kalo enggak, null.
  const imageUrl = req.file ? req.file.path : null;

  try {
    const newSystem = await prisma.organSystem.create({
      data: {
        name,
        description,
        process,
        imageUrl,
      },
    });
    res.status(201).json({ message: "Sistem Organ berhasil dibuat", data: newSystem });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Nama sistem organ sudah ada" });
    }
    res.status(500).json({ message: "Error server", error: error.message });
  }
};

// --- (R)EAD: Get All Systems (Include Organs) ---
export const getAllSystems = async (req, res) => {
  try {
    const systems = await prisma.organSystem.findMany({
      select:{
        id: true,
        name: true,
        description: true,
        process: true,
        organs:{
          select:{
            id: true,
            name: true,
          }
        }
      }
    });
    res.status(200).json({ data: systems });
  } catch (error) {
    res.status(500).json({ message: "Error server", error: error.message });
  }
};

// --- (R)EAD: Get Detail System (buat menu penjelasan di Unity) ---
export const getSystemDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const system = await prisma.organSystem.findUnique({
      where: { id: parseInt(id) },
      include: { organs: true }, // Ambil anak-anak organnya juga
    });
    
    if (!system) return res.status(404).json({ message: "Sistem tidak ditemukan" });
    
    res.status(200).json({ data: system });
  } catch (error) {
    res.status(500).json({ message: "Error server", error: error.message });
  }
};

export const getSystemByName = async (req, res) => {
  const { name } = req.params;
  try {
    const system = await prisma.organSystem.findUnique({
      where: { name: name }, 
      select:{
        id: true,
        name: true,
        description: true,
        process: true,
        imageUrl: true,
        organs:{
          select:{
            id: true,
            name: true,
          }
        }
      }
    });
    
    if (!system) return res.status(404).json({ message: `Sistem '${name}' tidak ditemukan` });
    
    res.status(200).json({ data: system });
  } catch (error) {
    res.status(500).json({ message: "Error server", error: error.message });
  }
};

// --- (U)PDATE System ---
export const updateSystem = async (req, res) => {
  const { id } = req.params;
  const { name, description, process } = req.body;

  // Cek kalo user upload gambar baru
  // Kalo ada file baru, kita pake path baru. Kalo gak, undefined (biar gak nimpah yg lama jadi null)
  const imageUrl = req.file ? req.file.path : undefined;

  try {
    const updatedSystem = await prisma.organSystem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        process,
        // Syntax spread (...) ini biar field imageUrl cuma di-update kalo ada isinya
        ...(imageUrl && { imageUrl }), 
      },
    });

    res.status(200).json({ 
      message: "Sistem Organ berhasil di-update", 
      data: updatedSystem 
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Sistem Organ tidak ditemukan" });
    }
    res.status(500).json({ message: "Error server", error: error.message });
  }
};

// --- (D)ELETE System ---
export const deleteSystem = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.organSystem.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Sistem Organ berhasil dihapus" });
    
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Sistem Organ tidak ditemukan" });
    }
    // Error P2003 biasanya foreign key constraint (kalo sistemnya masih dipake sama organ)
    if (error.code === "P2003") {
      return res.status(400).json({ 
        message: "Gagal menghapus. Sistem ini masih memiliki organ yang terhubung. Hapus atau pindahkan organ terlebih dahulu." 
      });
    }
    res.status(500).json({ message: "Error server", error: error.message });
  }
};