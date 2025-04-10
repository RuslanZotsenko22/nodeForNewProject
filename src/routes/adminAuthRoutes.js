/**
 * @swagger
 * tags:
 *   name: Адмін
 *   description: Авторизація та захищені маршрути для адміністратора
 */

import express from 'express';
import dotenv from 'dotenv';
import {
  login,
  refreshToken,
  getProtectedData,
} from '../controllers/adminController.js';

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Авторизація адміністратора
 *     tags: [Адмін]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Успішний вхід. Повертає токени.
 *       401:
 *         description: Невірні дані
 */
router.post('/login', login);

/**
 * @swagger
 * /api/admin/refresh:
 *   post:
 *     summary: Оновити access токен через refresh
 *     tags: [Адмін]
 *     responses:
 *       200:
 *         description: Новий access токен
 *       403:
 *         description: Немає refresh токена або він недійсний
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/admin/protected:
 *   get:
 *     summary: Захищений маршрут для перевірки access токена
 *     tags: [Адмін]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Доступ дозволено
 *       401:
 *         description: Немає або недійсний access токен
 */
router.get('/protected', getProtectedData);

export default router;
