import winston from 'winston';

// Налаштування Winston
const logger = winston.createLogger({
  level: 'info', // Мінімальний рівень для логування
  transports: [
    // Логування в консоль
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Додає кольори в консолі
        winston.format.simple(), // Простіший формат виводу
      ),
    }),
    // Логування в файл
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Логування лише помилок у файл
      format: winston.format.combine(
        winston.format.timestamp(), // Додаємо час до кожного запису
        winston.format.json(), // Формат логів у JSON
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log', // Логування всіх повідомлень
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

// Експортуємо logger для використання в інших файлах
export default logger;
