// Fungsi untuk memanggil Gemini API
async function callGeminiAPI(organName, userPrompt) {
  // 1. System Prompt: Menetapkan identitas dan batasan keras
  const systemPrompt = `
  Role: Anda adalah asisten pintar untuk aplikasi BIOLEns, Augmented Reality (AR) organ Tubuh Manusia, yang disajikan dalam model 3D. Dan Dibuat oleh Bayu Dani Kurniawan.
  
  KONTEKS SANGAT PENTING:
  Saat ini, pengguna sedang melihat model 3D dari organ: "${organName.toUpperCase()}".
  
  ATURAN UTAMA (Wajib Patuh):
  1. FOKUS MUTLAK pada "${organName}". Semua jawaban Anda harus tentang organ ini.
  2. JIKA pengguna bertanya tentang organ LAIN (misalnya user tanya "Jantung fungsinya apa?" padahal konteks adalah "PARU-PARU"):
     - TOLAK dengan sopan.
     - Contoh respon: "Eits, saat ini kita sedang fokus melihat ${organName}, bukan organ lain. Yuk tanya seputar ${organName} aja!"
  3. JIKA pengguna bertanya hal di luar topik biologi/anatomi (misal: resep masakan, politik, curhat):
     - Arahkan kembali ke topik "${organName}".
  4. JAWABLAH pertanyaan spesifik pengguna. Jangan memberikan ringkasan umum jika pengguna bertanya hal spesifik (misal: "Kenapa warnanya merah?", jawab alasan warnanya, jangan jelaskan fungsi umum).
  5. Gaya bahasa: Singkat, padat, edukatif, tapi mudah dimengerti (seperti tour guide museum). Maksimal 3-4 kalimat.
  `;

  // 2. User Prompt: Input pertanyaan user
  const chatPrompt = `
  Pertanyaan/Chat Pengguna: "${userPrompt}"
  
  Tugas Anda:
  Jawab pertanyaan di atas berdasarkan konteks organ "${organName}". 
  Ingat aturan main: Jangan bahas organ lain selain "${organName}".
  `;

  const apiKey = process.env.GEMINI_API_KEY || "";

  if (!apiKey) {
    console.error("GEMINI_API_KEY tidak ditemukan di .env");
    throw new Error("Konfigurasi API Key bermasalah.");
  }

  //  model flash cepat dan hemat token
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + chatPrompt }]
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      console.log("Gemini error:", err);
      throw new Error("Gagal memanggil AI");
    }

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates[0].content &&
      result.candidates[0].content.parts[0].text
    ) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error("Format respon Gemini tidak seperti yang diharapkan");
    }
  } catch (err) {
    console.error("Error AI:", err);
    throw err; // Re-throw agar ditangkap di controller
  }
}

// ----------------------------------------------------
// Controller Endpoint
// ----------------------------------------------------

export const getAIDetail = async (req, res) => {
  const { organName } = req.params;
  const { prompt } = req.body; // user chat prompt

  if (!organName) {
    return res.status(400).json({ message: "Nama organ wajib dikirim" });
  }

  if (!prompt) {
    return res.status(400).json({ message: "Prompt user wajib dikirim" });
  }

  

  const cleanOrganName = organName.toLowerCase();

  

  try {
    // Panggil fungsi AI dengan prompt yang sudah diperbaiki
    const aiResponse = await callGeminiAPI(cleanOrganName, prompt);

    res.status(200).json({
      status: "success",
      organ: cleanOrganName,
      user_query: prompt,
      ai_response: aiResponse
    });

  } catch (err) {
    res.status(500).json({
      message: "Terjadi error ketika memproses permintaan AI",
      error: err.message
    });
  }
};