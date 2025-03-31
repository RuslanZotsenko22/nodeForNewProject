import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import testRoutes from './routes/testRoute.js';
import createRouter from './routes/createRouter.js';
import projectRoutes from './routes/projectRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import blogRoutes from './routes/blogRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Тестовий маршрут (перевірка, що сервер працює)
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is working!' });
});

// 📌 Підключення маршрутів (із базовими префіксами)
app.use('/api/projects', projectRoutes); // ➕ /api/projects/...
app.use('/api/test', testRoutes); // ➕ /api/test/...
app.use('/api/team', createRouter); // ➕ /api/create/...
app.use('/api/blog', blogRoutes);
// 🛠 Централізований обробник помилок
app.use(errorHandler);

// 🔌 Підключення до MongoDB і запуск сервера
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
