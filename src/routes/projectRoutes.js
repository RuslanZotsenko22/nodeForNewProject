import express from 'express';
import Project from '../models/projectModel.js';
import {
  uploadProjectImage,
  handleProjectPhotoInput,
  deleteProjectImage,
} from '../middleware/uploadProject.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js'; // ✅ додано

const router = express.Router();

// 📤 Отримати всі проєкти — ПУБЛІЧНО
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('❌ Помилка при отриманні проєктів:', error);
    res.status(500).json({ message: 'Не вдалося завантажити проєкти' });
  }
});

// 🛡 Захист усіх маршрутів нижче
router.use(verifyAdminToken);

// ➕ Додати проєкт
router.post(
  '/',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { title, category, description, imageUrl } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const newProject = new Project({
        title,
        category,
        description,
        imageUrl: req.photoSource === 'url' ? imageUrl : req.body.cloudinaryUrl,
        cloudinaryPublicId:
          req.photoSource === 'file' ? req.body.cloudinaryPublicId : undefined,
      });

      await newProject.save();
      res
        .status(201)
        .json({ message: 'Проєкт додано успішно!', project: newProject });
    } catch (error) {
      console.error('❌ Помилка при створенні проєкту:', error);
      res.status(500).json({ message: 'Щось пішло не так!' });
    }
  },
);

// ✏️ Оновити проєкт
router.put(
  '/:id',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const { title, category, description, imageUrl, cloudinaryPublicId } =
      req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const existingProject = await Project.findById(id);
      if (!existingProject)
        return res.status(404).json({ message: 'Проєкт не знайдено' });

      const updatedData = { title, category, description };

      if (req.photoSource === 'url') {
        updatedData.imageUrl = imageUrl;
        updatedData.cloudinaryPublicId = undefined;
      } else if (req.photoSource === 'file') {
        if (existingProject.cloudinaryPublicId) {
          await deleteProjectImage(existingProject.cloudinaryPublicId);
        }
        updatedData.imageUrl = req.body.cloudinaryUrl;
        updatedData.cloudinaryPublicId = cloudinaryPublicId;
      }

      const updated = await Project.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
      });

      res
        .status(200)
        .json({ message: 'Проєкт оновлено успішно!', project: updated });
    } catch (error) {
      console.error('❌ Помилка при оновленні проєкту:', error);
      res.status(500).json({ message: 'Не вдалося оновити проєкт' });
    }
  },
);

// ❌ Видалити проєкт
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: 'Проєкт не знайдено' });

    if (deleted.cloudinaryPublicId) {
      await deleteProjectImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Проєкт успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка при видаленні проєкту:', error);
    res.status(500).json({ message: 'Не вдалося видалити проєкт' });
  }
});

export default router;
