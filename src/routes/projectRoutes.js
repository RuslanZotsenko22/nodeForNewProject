import express from 'express';
import Project from '../models/projectModel.js';
import {
  uploadProjectImage,
  handleProjectPhotoInput,
  deleteProjectImage,
} from '../middleware/uploadProject.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Отримати всі проєкти (публічно)
 *     tags: [Проєкти]
 *     responses:
 *       200:
 *         description: Список проєктів
 *       500:
 *         description: Помилка при отриманні проєктів
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('❌ Chyba při načítání projektů:', error);
    res.status(500).json({ message: 'Nepodařilo se načíst projekty' });
  }
});

// 🛡 Захист усіх маршрутів нижче
router.use(verifyAdminToken);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Додати новий проєкт
 *     tags: [Проєкти]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Проєкт додано успішно
 *       400:
 *         description: Помилка у вхідних даних
 *       500:
 *         description: Внутрішня помилка сервера
 */
router.post(
  '/',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { title, category, description, imageUrl } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
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
        .json({ message: 'Projekt byl úspěšně přidán!', project: newProject });
    } catch (error) {
      console.error('❌ Chyba při vytváření projektu:', error);
      res.status(500).json({ message: 'Něco se pokazilo!' });
    }
  },
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Оновити існуючий проєкт
 *     tags: [Проєкти]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID проєкту
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Проєкт оновлено
 *       404:
 *         description: Проєкт не знайдено
 *       500:
 *         description: Помилка при оновленні
 */
router.put(
  '/:id',
  uploadProjectImage.single('image'),
  handleProjectPhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const { title, category, description, imageUrl, cloudinaryPublicId } =
      req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const existingProject = await Project.findById(id);
      if (!existingProject)
        return res.status(404).json({ message: 'Projekt nebyl nalezen' });

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

      res.status(200).json({
        message: 'Projekt byl úspěšně aktualizován!',
        project: updated,
      });
    } catch (error) {
      console.error('❌ Chyba při aktualizaci projektu:', error);
      res.status(500).json({ message: 'Nepodařilo se aktualizovat projekt' });
    }
  },
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Видалити проєкт
 *     tags: [Проєкти]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID проєкту
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Проєкт видалено
 *       404:
 *         description: Проєкт не знайдено
 *       500:
 *         description: Помилка при видаленні
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: 'Projekt nebyl nalezen' });

    if (deleted.cloudinaryPublicId) {
      await deleteProjectImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Projekt byl úspěšně odstraněn' });
  } catch (error) {
    console.error('❌ Chyba při odstraňování projektu:', error);
    res.status(500).json({ message: 'Projekt se nepodařilo odstranit' });
  }
});

export default router;
