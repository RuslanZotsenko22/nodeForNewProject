import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Створюємо директорію, якщо не існує
const uploadDir = 'uploads/team';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Обмеження на розмір файлу (5MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Неприпустимий тип файлу. Дозволені: jpg, png, webp.'));
    }
  },
});

// Додатковий middleware для обробки як URL, так і файла
export const handlePhotoInput = (req, res, next) => {
  if (req.body.photoUrl) {
    req.photoSource = 'url';
  } else if (req.file) {
    req.photoSource = 'file';
    req.body.photoFilePath = `/uploads/team/${req.file.filename}`;
  } else {
    return res
      .status(400)
      .json({ message: 'Необхідно надати photoUrl або фотофайл.' });
  }
  next();
};
