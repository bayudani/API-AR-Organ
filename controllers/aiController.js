// ============================================================
// Gemini AI Controller - BIOLEns
// ============================================================

// ------------------------------------------------------------
// Fungsi untuk memanggil Gemini API
// ------------------------------------------------------------
async function callGeminiAPI(organName, userPrompt) {

  // ==========================================================
  // 1. SYSTEM PROMPT
  // ==========================================================
  const systemPrompt = `
Anda adalah asisten pintar untuk aplikasi BIOLEns.

BIOLEns adalah aplikasi Augmented Reality (AR) untuk pembelajaran
anatomi tubuh manusia yang menggunakan model 3D.

Aplikasi ini dibuat oleh Bayu Dani Kurniawan.

============================================================
KONTEKS SAAT INI
============================================================

Pengguna sedang mempelajari organ:

"${organName.toUpperCase()}"

Model 3D organ ditampilkan pada menu lain di aplikasi,
yaitu menu "Lihat 3D/AR".

Model 3D TIDAK ditampilkan secara langsung di chat ini.

============================================================
ATURAN UTAMA
============================================================

1. FOKUS PADA ORGAN:
"${organName}"

Jawaban harus berhubungan dengan organ tersebut.

2. JIKA PENGGUNA BERTANYA TENTANG ORGAN LAIN:

Contoh:

Pengguna:
"Apa fungsi jantung?"

Padahal organ yang sedang dipelajari:
"paru-paru"

Maka jangan langsung menjelaskan jantung.

Jawab dengan sopan bahwa konteks saat ini sedang fokus
pada "${organName}".

Contoh:

"Eits, saat ini kita sedang fokus mempelajari ${organName}.
Yuk tanya seputar ${organName} dulu!"

Jika pengguna tetap ingin mengetahui organ lain,
arahkan pengguna untuk memilih organ tersebut pada menu
yang sesuai di aplikasi.

3. JIKA PERTANYAAN DI LUAR TOPIK BIOLOGI:

Contoh:
- resep makanan
- politik
- berita
- game
- coding
- masalah pribadi
- hiburan
- pertanyaan umum yang tidak berkaitan dengan biologi

Tolak dengan sopan.

Contoh:

"Maaf, aku dirancang khusus sebagai asisten pembelajaran
BIOLEns untuk membantu memahami organ tubuh manusia.
Yuk kita bahas ${organName} saja!"

4. JAWAB PERTANYAAN SECARA SPESIFIK.

Jika pengguna bertanya:

"Kenapa ${organName} berwarna merah?"

Jawab alasan warna merahnya.

Jangan memberikan penjelasan panjang mengenai seluruh fungsi
dan struktur organ kecuali memang diperlukan.

5. JIKA PENGGUNA MEMINTA FUNGSI:

Jelaskan fungsi utama organ secara singkat dan mudah dipahami.

6. JIKA PENGGUNA MEMINTA BAGIAN/STRUKTUR:

Jelaskan bagian yang ditanyakan dan hubungannya dengan organ.

7. JIKA PENGGUNA MENANYAKAN PENYAKIT:

Berikan penjelasan edukatif secara umum.

Jangan memberikan diagnosis kepada pengguna.

8. GAYA BAHASA:

- Bahasa Indonesia
- singkat
- padat
- edukatif
- mudah dipahami siswa SMA
- ramah
- sedikit Gen-Z
- seperti tour guide museum
- jangan terlalu kaku
- jangan menggunakan istilah medis yang terlalu sulit tanpa penjelasan

9. JANGAN MENGARANG INFORMASI.

Jika informasi yang ditanyakan tidak cukup jelas atau tidak
berhubungan dengan organ "${organName}", katakan dengan jujur.

10. JANGAN MEMBAHAS IMPLEMENTASI TEKNIS APLIKASI.

Anda adalah asisten pembelajaran biologi, bukan asisten coding.
`;


  // ==========================================================
  // 2. USER PROMPT
  // ==========================================================
  const chatPrompt = `
Pertanyaan pengguna:

"${userPrompt}"

Tugas:

Jawab pertanyaan pengguna berdasarkan konteks organ
"${organName}".

Pastikan jawaban mengikuti seluruh aturan yang telah diberikan.
`;


  // ==========================================================
  // 3. AMBIL API KEY
  // ==========================================================
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error(
      "❌ GEMINI_API_KEY tidak ditemukan pada environment variable."
    );

    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi pada server."
    );
  }


  // ==========================================================
  // 4. GEMINI MODEL
  // ==========================================================
  const model = "gemini-3.5-flash";


  // ==========================================================
  // 5. GEMINI API URL
  // ==========================================================
  const apiUrl =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


  console.log("========================================");
  console.log("🤖 Gemini Request");
  console.log("Model:", model);
  console.log("Organ:", organName);
  console.log("Prompt:", userPrompt);
  console.log("API Key tersedia:", !!apiKey);
  console.log("========================================");


  // ==========================================================
  // 6. REQUEST PAYLOAD
  // ==========================================================
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `${systemPrompt}\n\n${chatPrompt}`
          }
        ]
      }
    ]
  };


  // ==========================================================
  // 7. CALL GEMINI API
  // ==========================================================
  try {

    const response = await fetch(apiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },

      body: JSON.stringify(payload)
    });


    // ========================================================
    // 8. BACA RESPONSE
    // ========================================================
    const responseText = await response.text();


    console.log("Gemini HTTP Status:", response.status);


    // ========================================================
    // 9. JIKA GEMINI ERROR
    // ========================================================
    if (!response.ok) {

      console.error("========================================");
      console.error("❌ GEMINI API ERROR");
      console.error("HTTP Status:", response.status);
      console.error("Response:", responseText);
      console.error("========================================");


      let errorMessage = responseText;

      try {

        const errorJson = JSON.parse(responseText);

        errorMessage =
          errorJson?.error?.message ||
          responseText;

      } catch (parseError) {

        // Response bukan JSON
        errorMessage = responseText;
      }


      throw new Error(
        `Gemini API Error ${response.status}: ${errorMessage}`
      );
    }


    // ========================================================
    // 10. PARSE JSON RESPONSE
    // ========================================================
    let result;

    try {

      result = JSON.parse(responseText);

    } catch (parseError) {

      console.error(
        "❌ Response Gemini bukan JSON:",
        responseText
      );

      throw new Error(
        "Response dari Gemini tidak valid."
      );
    }


    // ========================================================
    // 11. AMBIL TEXT RESPONSE
    // ========================================================
    const aiText =
      result?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        ?.join("")
        ?.trim();


    // ========================================================
    // 12. VALIDASI RESPONSE
    // ========================================================
    if (!aiText) {

      console.error(
        "❌ Gemini tidak mengembalikan text."
      );

      console.error(
        "Full Gemini Response:",
        JSON.stringify(result, null, 2)
      );

      throw new Error(
        "Gemini tidak mengembalikan jawaban."
      );
    }


    // ========================================================
    // 13. SUCCESS
    // ========================================================
    console.log("========================================");
    console.log("✅ GEMINI SUCCESS");
    console.log("Response:", aiText);
    console.log("========================================");


    return aiText;


  } catch (error) {

    console.error("========================================");
    console.error("❌ ERROR CALLING GEMINI");
    console.error("Message:", error.message);
    console.error("========================================");

    throw error;
  }
}



// ============================================================
// CONTROLLER ENDPOINT
// ============================================================

export const getAIDetail = async (req, res) => {

  // ----------------------------------------------------------
  // Ambil parameter
  // ----------------------------------------------------------
  const { organName } = req.params;
  const { prompt } = req.body;


  // ----------------------------------------------------------
  // Validasi organ
  // ----------------------------------------------------------
  if (!organName) {

    return res.status(400).json({
      status: "error",
      message: "Nama organ wajib dikirim."
    });
  }


  // ----------------------------------------------------------
  // Validasi prompt
  // ----------------------------------------------------------
  if (!prompt || !prompt.trim()) {

    return res.status(400).json({
      status: "error",
      message: "Prompt user wajib dikirim."
    });
  }


  // ----------------------------------------------------------
  // Bersihkan nama organ
  // ----------------------------------------------------------
  const cleanOrganName =
    organName.trim().toLowerCase();


  // ----------------------------------------------------------
  // Bersihkan prompt
  // ----------------------------------------------------------
  const cleanPrompt =
    prompt.trim();


  console.log("========================================");
  console.log("📥 AI REQUEST");
  console.log("Organ:", cleanOrganName);
  console.log("Prompt:", cleanPrompt);
  console.log("========================================");


  try {

    // --------------------------------------------------------
    // Panggil Gemini
    // --------------------------------------------------------
    const aiResponse =
      await callGeminiAPI(
        cleanOrganName,
        cleanPrompt
      );


    // --------------------------------------------------------
    // Response berhasil
    // --------------------------------------------------------
    return res.status(200).json({

      status: "success",

      organ: cleanOrganName,

      user_query: cleanPrompt,

      ai_response: aiResponse

    });


  } catch (error) {

    console.error("========================================");
    console.error("❌ CONTROLLER AI ERROR");
    console.error("Error:", error.message);
    console.error("========================================");


    // --------------------------------------------------------
    // Bedakan error API
    // --------------------------------------------------------
    const errorMessage =
      error?.message ||
      "Terjadi kesalahan saat memproses AI.";


    return res.status(500).json({

      status: "error",

      message:
        "Terjadi error ketika memproses permintaan AI.",

      error:
        errorMessage

    });
  }
};
