import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// 🔧 Налаштування Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 Налаштування сховища Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'team', // 📁 Папка в Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' },
    ], // необов'язково: обмеження розміру
  },
});

// 📤 Multer middleware для завантаження файлу на Cloudinary
export const upload = multer({ storage });

// ⚙️ Middleware для обробки фото (URL або файл)
export const handlePhotoInput = (req, res, next) => {
  if (req.body.photoUrl) {
    req.photoSource = 'url';
  } else if (req.file && req.file.path) {
    req.photoSource = 'file';
    req.body.cloudinaryUrl = req.file.path; // Cloudinary повертає URL у file.path
    req.body.cloudinaryPublicId = req.file.filename; // ⬅️ збережемо також публічний ID
  } else {
    return res.status(400).json({
      message: 'Je nutné poskytnout photoUrl nebo soubor s fotografií.',
    });
  }
  next();
};

// 🗑 Видалення зображення з Cloudinary за публічним ID
export const deleteCloudinaryImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑 Obrázek byl odstraněn z Cloudinary: ${publicId}`);
  } catch (err) {
    console.error('❌ Chyba při odstraňování obrázku z Cloudinary:', err);
  }
};
