import multer from 'multer';
import { projectStorage } from '../config/cloudinaryProjects.js';
import { v2 as cloudinary } from 'cloudinary';

export const uploadProjectImage = multer({
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB обмеження
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неприпустимий тип файлу. Дозволено: JPEG, PNG, WEBP'));
    }
  },
});

// ⚙️ Middleware для обробки фото (URL або файл)
export const handleProjectPhotoInput = (req, res, next) => {
  if (req.body.imageUrl) {
    req.photoSource = 'url';
  } else if (req.file && req.file.path) {
    req.photoSource = 'file';
    req.body.cloudinaryUrl = req.file.path;
    req.body.cloudinaryPublicId = req.file.filename;
  } else {
    return res
      .status(400)
      .json({ message: 'Необхідно надати imageUrl або фотофайл.' });
  }
  next();
};

// 🗑 Видалення зображення з Cloudinary за публічним ID
export const deleteProjectImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      console.warn('⚠️ Cloudinary: Зображення не видалено або вже не існує.');
    }
  } catch (error) {
    console.error('❌ Помилка при видаленні зображення з Cloudinary:', error);
  }
};
