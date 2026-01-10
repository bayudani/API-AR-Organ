import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Setup Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ar_organ_app', // Nama folder di Cloudinary lo
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Format yang dibolehin
  },
});

const upload = multer({ storage: storage });

export default upload;