import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyAdminToken } from '../middleware/verifyAdmin.js'; // ⬅️ імпортуємо middleware

dotenv.config();

const router = express.Router();

// 🔐 POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Введіть пароль' });
  }

  if (password !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ message: 'Невірний пароль' });
  }

  // 🔑 Генеруємо JWT токен
  const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });

  res.json({ token });
});

// ✅ GET /api/admin/protected — перевірка токена
router.get('/protected', verifyAdminToken, (req, res) => {
  res.status(200).json({ message: 'Токен дійсний. Ви авторизовані.' });
});

export default router;
