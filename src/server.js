import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Swagger
import { swaggerDocs } from './swagger.js';

// Роути
import testRoutes from './routes/testRoute.js';
import createRouter from './routes/createRouter.js';
import projectRoutes from './routes/projectRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://rrp-git-main-svitlanahavrylets-projects.vercel.app',
  'https://rrp-sandy.vercel.app',
  'https://rrp-frontend.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS відхилено для origin: ${origin}`);
        callback(new Error('CORS not allowed for this origin'));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Swagger Docs
swaggerDocs(app);

// Перевірка
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is working!' });
});

// Роути
app.use('/api/test', testRoutes);
app.use('/api/team', createRouter);
app.use('/api/projects', projectRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminAuthRoutes);

// Error handler
app.use(errorHandler);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущено на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
