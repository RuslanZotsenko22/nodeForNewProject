import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 🔐 Створення access токена
const generateAccessToken = (adminId) => {
  return jwt.sign({ adminId, isAdmin: true }, process.env.ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_EXPIRES || '15m',
  });
};

// ♻️ Створення refresh токена
const generateRefreshToken = (adminId) => {
  return jwt.sign({ adminId, isAdmin: true }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES || '7d',
  });
};

// 🔑 POST /api/admin/login
export const login = (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Zadejte heslo' });
  }

  if (password !== process.env.ADMIN_PANEL_PASSWORD) {
    return res.status(401).json({ message: 'Neplatné heslo' });
  }

  const adminId = process.env.ADMIN_ID || 'admin'; // або з бази, або статичне значення
  const accessToken = generateAccessToken(adminId);
  const refreshToken = generateRefreshToken(adminId);

  // Зберігаємо refresh токен в HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None', // якщо фронт і бек на різних доменах
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  });

  res.status(200).json({ token: accessToken });
};

// 🔁 POST /api/admin/refresh
export const refreshToken = (req, res) => {
  const tokenFromCookie = req.cookies.refreshToken;

  if (!tokenFromCookie) {
    return res.status(401).json({ message: 'Chybí obnovovací token' });
  }

  try {
    const decoded = jwt.verify(tokenFromCookie, process.env.REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.adminId);

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res
      .status(403)
      .json({ message: 'Neplatný nebo vypršený obnovovací token' });
  }
};

// 🔐 GET /api/admin/protected
export const getProtectedData = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token chybí' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    res
      .status(200)
      .json({ message: 'Přístup povolen', adminId: decoded.adminId });
  } catch (error) {
    res.status(401).json({ message: 'Neplatný nebo vypršený token' });
  }
};
