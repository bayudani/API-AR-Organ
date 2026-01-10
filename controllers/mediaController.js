// File: controllers/mediaController.js
// Controller ini KHUSUS buat handle upload gambar "lepas" (misal: buat Rich Text Editor)

export const uploadMedia = (req, res) => {
  // Middleware multer-cloudinary udah jalan duluan sebelum masuk sini.
  // Jadi, req.file.path otomatis udah berisi URL gambar dari Cloudinary (https://res.cloudinary.com/...)
  
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
  }

  // Kita balikin JSON berisi URL gambar.
  // URL ini nanti ditangkep sama frontend (React) buat diselipin ke tag <img src="...">
  res.status(200).json({
    message: 'Upload berhasil',
    url: req.file.path, 
    filename: req.file.filename
  });
};