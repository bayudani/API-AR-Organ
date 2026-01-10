
# 📚 Dokumentasi API AR Organ Tubuh

Yo, selamat datang di dokumentasi API buat project AR Organ Tubuh lo!
Di sini lengkap semua cara nembak endpoint, mulai dari CRUD data organ, sistem organ, upload gambar, sampe minta bantuan AI (Gemini).

**Base URL:** `http://localhost:3000/api` (Sesuaikan port lo kalo beda)

## 🚀 1. Organ (Anak)

Ini endpoint utama yang bakal sering dipake Unity dan Admin Panel.

### A. Get All Organs

Ambil semua daftar organ yang ada.

* **Method:** `GET`
* **Endpoint:** `/organs`
* **Response:**
  ```
  {
    "data": [
      {
        "id": 1,
        "name": "jantung",
        "imageUrl": "[https://res.cloudinary.com/](https://res.cloudinary.com/)...",
        "systemId": 2,
        "system": { ... }
      },
      ...
    ]
  }

  ```

### B. Get Organ By Name (🔥 PENTING BUAT UNITY)

Ini endpoint yang dipanggil pas marker AR ke-detect.

* **Method:** `GET`
* **Endpoint:** `/organs/name/:name`
* **Contoh:** `/organs/name/jantung`
* **Response:**
  ```
  {
    "data": {
      "id": 1,
      "name": "jantung",
      "description": "<p>Jantung adalah...</p><img src='url_foto_lain.jpg'>",
      "funFact": "Jantung berdetak...",
      "imageUrl": "[https://res.cloudinary.com/](https://res.cloudinary.com/)...",
      "model3D_Url": "http://...",
      "system": { "name": "Sistem Peredaran Darah" }
    }
  }

  ```

### C. Create Organ (Buat Admin)

**PENTING:** Karena ada upload foto, Body Request **WAJIB** pake `form-data`, BUKAN `raw JSON`.

* **Method:** `POST`
* **Endpoint:** `/organs`
* **Body (form-data):**
  * `name`: (Text) Nama organ (unik)
  * `description`: (Text/HTML) Penjelasan organ. **Bisa isi banyak foto** (sebagai tag `<img>` di dalam teks). Gunakan endpoint `/upload-media` untuk mendapatkan URL foto yang mau diselipkan di sini.
  * `funFact`: (Text) Fakta unik
  * `model3D_Url`: (Text) Link asset bundle (opsional)
  * `systemId`: (Text/Number) ID dari Sistem Organ induknya
  * `image`: (File) **Foto Utama/Thumbnail** organ (Cuma 1 foto).

### D. Update Organ

* **Method:** `PUT`
* **Endpoint:** `/organs/:id`
* **Body (form-data):** Sama kayak Create. Kalo gambar gak diisi, dia pake gambar lama.

### E. Delete Organ

* **Method:** `DELETE`
* **Endpoint:** `/organs/:id`

## 🌳 2. Sistem Organ (Induk)

Ini buat nge-kelompokkin organ, misal: "Sistem Pencernaan" isinya Mulut, Lambung, Usus.

### A. Get All Systems

* **Method:** `GET`
* **Endpoint:** `/systems`
* **Response:** List sistem beserta anak-anak organnya (`include: organs`).

### B. Get System Detail

* **Method:** `GET`
* **Endpoint:** `/systems/:id`

### C. Create System

**PENTING:** Body Request pake `form-data`.

* **Method:** `POST`
* **Endpoint:** `/systems`
* **Body (form-data):**
  * `name`: (Text) Nama sistem
  * `description`: (Text) Deskripsi umum. **Bisa isi banyak foto** (HTML).
  * `process`: (Text) Penjelasan urutan proses
  * `image`: (File) **Foto Utama/Thumbnail** ilustrasi sistem (Cuma 1 foto).

### D. Update System

* **Method:** `PUT`
* **Endpoint:** `/systems/:id`

### E. Delete System

* **Method:** `DELETE`
* **Endpoint:** `/systems/:id`

## 🤖 3. AI & Utilities (Fitur Tambahan)

### A. Ask AI Detail (Gemini)

Minta penjelasan mendalam ke AI tentang organ tertentu secara  *real-time* .

* **Method:** `GET`
* **Endpoint:** `/ai/detail/:organName`
* **Contoh:** `/ai/detail/paru-paru`
* **Response:** String teks panjang penjelasan dari AI.

### B. Upload Media (Buat Rich Text Editor)

Endpoint khusus buat nge-upload gambar "lepasan" pas lagi nulis artikel di Admin Panel (React). Gunanya buat nyelipin **banyak foto tambahan** di dalam teks deskripsi organ/sistem.

* **Method:** `POST`
* **Endpoint:** `/upload-media`
* **Body (form-data):**
  * `file`: (File) Gambar yang mau diupload
* **Response:**
  ```
  {
    "message": "Upload berhasil",
    "url": "[https://res.cloudinary.com/](https://res.cloudinary.com/)...", 
    "filename": "..."
  }

  ```

## 🛠 Tips Ngetes di Postman

Karena API kita sekarang support upload file, cara tesnya beda dikit:

1. Pilih Method (POST/PUT).
2. Masukin URL.
3. Klik tab  **Body** .
4. Pilih **form-data** (JANGAN `raw` atau `json`).
5. Di kolom  **Key** :
   * Tulis `name`, di sebelah kanannya pilih  **Text** , isi value-nya.
   * Tulis `image` (atau `file` buat endpoint media), lalu ubah dropdown di kanan key dari **Text** jadi  **File** .
   * Klik tombol "Select Files" di kolom Value, pilih gambar dari laptop lo.
6. Klik  **Send** .

*Happy Coding! Jangan lupa ngopi biar gak panik.* ☕️
