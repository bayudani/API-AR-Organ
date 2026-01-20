
# 📚 Dokumentasi API BioLens (AR Organ Tubuh)

Yo, selamat datang di dokumentasi API buat project Skripsi BioLens! 🔥
Di sini lengkap semua cara nembak endpoint, mulai dari CRUD data, Auth Siswa, Kuis, sampe AI.

**Base URL:** `http://localhost:3000/api` (Sesuaikan port lo kalo beda)

## 🔐 1. Authentication (User/Siswa)

Fitur login tanpa password. Cukup pake Device ID HP dan Nama.

### A. Login / Register Siswa (Unity Start)

Endpoint ini dipanggil pas user klik tombol "Mulai" di Unity setelah input nama.

* **Method:** `POST`
* **Endpoint:** `/auth/login`
* **Body (Raw JSON):**
  ```
  {
    "deviceId": "hp_xiaomi_budi_123",  // Didapat dari SystemInfo.deviceUniqueIdentifier
    "fullName": "Budi Santoso",        // Inputan User
    "grade": "XII IPA 1"               // Inputan User
  }
  ```
* **Response:**
  **PENTING:** Simpan `id` dari response ini di Unity (misal pake `PlayerPrefs`) buat dipake pas Submit Kuis nanti.
  ```
  {
    "message": "Data siswa berhasil disimpan!",
    "data": {
      "id": 5, 
      "deviceId": "hp_xiaomi_budi_123",
      "fullName": "Budi Santoso",
      "grade": "XII IPA 1",
      "points": 100
    }
  }
  ```

## 🎮 2. Kuis (Mini Games)

Fitur kuis general buat asah otak dan cari poin.

### A. Get All Quizzes (Menu Kuis)

Buat nampilin daftar kuis yang tersedia di Menu Utama.

* **Method:** `GET`
* **Endpoint:** `/quiz`
* **Response:**
  ```
  {
    "data": [
      {
        "id": 1,
        "title": "Tantangan Harian",
        "description": "Coba jawab 5 soal ini!",
        "thumbnailUrl": "http://...",
        "_count": { "questions": 5 }
      },
      ...
    ]
  }
  ```

### B. Get Quiz Detail (Start Game)

Ambil soal-soal buat dimainin.

* **Method:** `GET`
* **Endpoint:** `/quiz/:id`
* **Response:** List soal beserta opsi jawabannya (tapi gak dikasih tau mana yang bener, biar gak dicheat di client).

### C. Submit Quiz (Finish Game)

Kirim jawaban user, server yang hitung nilai & update poin biar aman anti-cheat.

* **Method:** `POST`
* **Endpoint:** `/quiz/:quizId/submit`
* **Body (Raw JSON):**
  ```
  {
    "userId": 5,  // ID yang didapat pas Login
    "answers": [
       { "questionId": 10, "optionId": 45 },
       { "questionId": 11, "optionId": 48 }
    ]
  }
  ```
* **Response:**
  ```
  {
    "message": "Kuis selesai!",
    "result": {
      "correct": 2,
      "total": 5,
      "scoreEarned": 20,
      "currentTotalPoints": 120
    }
  }
  ```

### D. Create Quiz (Admin Only)

Buat bikin kuis beserta soal & jawabannya sekaligus (Nested Write).

* **Method:** `POST`
* **Endpoint:** `/quiz`
* **Body (Raw JSON):**
  ```
  {
    "title": "Kuis Sistem Saraf",
    "description": "Tes pemahaman saraf",
    "questions": [
      {
        "questionText": "Otak terbagi menjadi...?",
        "options": [
           { "optionText": "2 Bagian", "isCorrect": false },
           { "optionText": "3 Bagian", "isCorrect": true } 
        ]
      }
    ]
  }
  ```

## 🚀 3. Organ (Data AR)

Ini endpoint utama yang bakal sering dipake Unity pas scan marker.

### A. Get All Organs

* **Method:** `GET`
* **Endpoint:** `/organs`

### B. Get Organ By Name (🔥 Scan Marker)

Endpoint sakti buat AR.

* **Method:** `GET`
* **Endpoint:** `/organs/name/:name`
* **Contoh:** `/organs/name/jantung`
* **Response:** Detail lengkap organ, URL 3D model, deskripsi, dll.

### C. Create Organ (Admin)

**PENTING:** Body Request **WAJIB** pake `form-data` karena ada upload file.

* **Method:** `POST`
* **Endpoint:** `/organs`
* **Body (form-data):**
  * `name`: (Text)
  * `description`: (Text/HTML)
  * `funFact`: (Text)
  * `model3D_Url`: (Text) Link asset bundle
  * `systemId`: (Text/Number) ID Sistem Induk
  * `image`: (File) Foto Utama Organ

### D. Update Organ

* **Method:** `PUT`
* **Endpoint:** `/organs/:id`
* **Body:** `form-data` (sama kayak create).

### E. Delete Organ

* **Method:** `DELETE`
* **Endpoint:** `/organs/:id`

## 🌳 4. Sistem Organ (Kategori)

Pengelompokan organ (Contoh: Sistem Pencernaan).

### A. Get All Systems

* **Method:** `GET`
* **Endpoint:** `/systems`
* **Response:** List sistem + organ-organ di dalamnya.

### B. Create System (Admin)

* **Method:** `POST`
* **Endpoint:** `/systems`
* **Body (form-data):**
  * `name`: (Text)
  * `description`: (Text)
  * `process`: (Text)
  * `image`: (File) Thumbnail

### C. Update & Delete

* Update: `PUT /systems/:id`
* Delete: `DELETE /systems/:id`

## 🤖 5. AI & Utilities

### A. Ask AI Detail (Gemini)

Minta penjelasan organ ke AI secara  *real-time* .

* **Method:** `GET`
* **Endpoint:** `/ai/detail/:organName`

### B. Upload Media (Rich Text Editor)

Buat upload gambar tambahan buat diselipin di dalam teks deskripsi artikel.

* **Method:** `POST`
* **Endpoint:** `/upload-media`
* **Body (form-data):**
  * `file`: (File) Gambar yang mau diupload
* **Response:** Return URL gambar Cloudinary.

## 🛠 Tips Ngetes di Postman

1. **Login/Kuis:** Gunakan Body -> **raw** ->  **JSON** .
2. **Organ/Sistem:** Gunakan Body ->  **form-data** .
   * Text: `key` biasa.
   * File: Ubah dropdown di kanan key dari "Text" jadi "File", terus pilih gambar.

*Happy Coding! Skripsi lancar, wisuda aman!* 🎓☕️
