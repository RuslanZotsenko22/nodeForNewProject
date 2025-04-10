/**
 * @swagger
 * tags:
 *   name: Блог
 *   description: API для керування блог-постами
 */

import express from 'express';
import BlogPost from '../models/blogModel.js';
import {
  uploadBlogImage,
  handleBlogImage,
  deleteBlogImage,
} from '../middleware/uploadBlog.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Отримати всі пости (з пагінацією)
 *     tags: [Блог]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Номер сторінки (за замовчуванням 1)
 *     responses:
 *       200:
 *         description: Список постів
 *       500:
 *         description: Помилка сервера
 */
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  try {
    const posts = await BlogPost.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await BlogPost.countDocuments();

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se načíst příspěvky' });
  }
});

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Отримати один пост за ID
 *     tags: [Блог]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID поста
 *     responses:
 *       200:
 *         description: Успішно отримано пост
 *       404:
 *         description: Пост не знайдено
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: 'Příspěvek nebyl nalezen' });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se načíst příspěvek' });
  }
});

router.use(verifyAdminToken);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Створити новий пост
 *     tags: [Блог]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - date
 *               - description
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeLink:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Пост створено
 *       400:
 *         description: Некоректні дані
 *       500:
 *         description: Помилка сервера
 */
router.post(
  '/',
  uploadBlogImage.single('image'),
  handleBlogImage,
  async (req, res) => {
    const {
      title,
      category,
      date,
      description,
      youtubeLink,
      imageUrl,
      cloudinaryPublicId,
    } = req.body;

    if (!title || !category || !date || !description || !imageUrl) {
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const newPost = new BlogPost({
        title,
        category,
        date,
        description,
        youtubeLink,
        imageUrl,
        cloudinaryPublicId,
      });

      await newPost.save();
      res.status(201).json({
        message: 'Příspěvek byl úspěšně vytvořen!',
        post: newPost,
      });
    } catch (error) {
      res.status(500).json({ message: 'Nepodařilo se vytvořit příspěvek' });
    }
  },
);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Оновити пост
 *     tags: [Блог]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID поста
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
 *               date:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubeLink:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пост оновлено
 *       404:
 *         description: Пост не знайдено
 *       500:
 *         description: Помилка сервера
 */
router.put(
  '/:id',
  uploadBlogImage.single('image'),
  handleBlogImage,
  async (req, res) => {
    try {
      const post = await BlogPost.findById(req.params.id);
      if (!post)
        return res.status(404).json({ message: 'Příspěvek nebyl nalezen' });

      if (post.cloudinaryPublicId) {
        await deleteBlogImage(post.cloudinaryPublicId);
      }

      const updatedData = {
        ...req.body,
        imageUrl: req.body.imageUrl,
        cloudinaryPublicId: req.body.cloudinaryPublicId,
      };

      const updated = await BlogPost.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        },
      );

      res
        .status(200)
        .json({ message: 'Příspěvek byl aktualizován!', post: updated });
    } catch (error) {
      res.status(500).json({ message: 'Nepodařilo se aktualizovat příspěvek' });
    }
  },
);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Видалити пост
 *     tags: [Блог]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID поста
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Пост видалено
 *       404:
 *         description: Пост не знайдено
 *       500:
 *         description: Помилка сервера
 */
router.delete('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Příspěvek nenalezen' });

    if (post.cloudinaryPublicId) {
      await deleteBlogImage(post.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Příspěvek byl odstraněn' });
  } catch (error) {
    res.status(500).json({ message: 'Nepodařilo se odstranit příspěvek' });
  }
});

export default router;
