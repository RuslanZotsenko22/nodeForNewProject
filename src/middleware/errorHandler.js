import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message); // Логування помилки

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Щось пішло не так!';

  res.status(statusCode).json({
    success: false,
    message,
  });
};
