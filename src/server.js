import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import testRoutes from './routes/testRoute.js';
import createRouter from './routes/createRouter.js'; // ✅ ДОДАНО
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 📌 Підключення маршрутів
app.use('/api', testRoutes);
app.use('/api', createRouter); // ✅ ДОДАНО

// Централізований обробник помилок
app.use(errorHandler);

// Тестовий маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});

// Підключення до MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));
