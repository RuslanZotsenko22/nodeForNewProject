import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Немає токена' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }
  } catch (err) {
    return res.status(403).json({ message: 'Недійсний токен' });
  }
};
