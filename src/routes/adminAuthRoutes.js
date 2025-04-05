import express from 'express';
import dotenv from 'dotenv';
import {
  login,
  refreshToken,
  getProtectedData,
} from '../controllers/adminController.js';

dotenv.config();

const router = express.Router();

// 🔐 POST /api/admin/login — логін з access + refresh токенами
router.post('/login', login);

// ♻️ POST /api/admin/refresh — оновлення access токена через refresh токен з cookie
router.post('/refresh', refreshToken);

// ✅ GET /api/admin/protected — перевірка access токена
router.get('/protected', getProtectedData);

export default router;
