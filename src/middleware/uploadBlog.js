import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const blogStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, crop: 'limit' }],
  },
});

export const uploadBlogImage = multer({
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неприпустимий тип файлу. Дозволено: JPEG, PNG, WEBP'));
    }
  },
});

export const handleBlogImage = (req, res, next) => {
  if (req.file && req.file.path) {
    req.body.imageUrl = req.file.path;
    req.body.cloudinaryPublicId = req.file.filename;
    next();
  } else {
    return res.status(400).json({ message: 'Зображення обов’язкове' });
  }
};

export const deleteBlogImage = async (publicId) => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      console.warn('⚠️ Зображення не видалено або вже не існує.');
    }
  } catch (err) {
    console.error('❌ Помилка при видаленні зображення з Cloudinary:', err);
  }
};
