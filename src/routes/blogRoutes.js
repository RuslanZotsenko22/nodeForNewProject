import express from 'express';
import BlogPost from '../models/blogModel.js';
import {
  uploadBlogImage,
  handleBlogImage,
  deleteBlogImage,
} from '../middleware/uploadBlog.js';

const router = express.Router();

// ➕ Створити пост
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
      return res.status(400).json({ message: 'Усі поля обов’язкові' });
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
      res.status(201).json({ message: 'Пост створено!', post: newPost });
    } catch (error) {
      console.error('❌ Помилка при створенні поста:', error);
      res.status(500).json({ message: 'Не вдалося створити пост' });
    }
  },
);

// 📥 Отримати всі пости (з пагінацією)
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
    console.error('❌ Помилка при отриманні постів:', error);
    res.status(500).json({ message: 'Не вдалося отримати пости' });
  }
});

// 📄 Отримати один пост
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Пост не знайдено' });
    res.status(200).json(post);
  } catch (error) {
    console.error('❌ Помилка при отриманні поста:', error);
    res.status(500).json({ message: 'Не вдалося отримати пост' });
  }
});

// ✏️ Оновити пост
router.put(
  '/:id',
  uploadBlogImage.single('image'),
  handleBlogImage,
  async (req, res) => {
    try {
      const post = await BlogPost.findById(req.params.id);
      if (!post) return res.status(404).json({ message: 'Пост не знайдено' });

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

      res.status(200).json({ message: 'Пост оновлено!', post: updated });
    } catch (error) {
      console.error('❌ Помилка при оновленні поста:', error);
      res.status(500).json({ message: 'Не вдалося оновити пост' });
    }
  },
);

// ❌ Видалити пост
router.delete('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Пост не знайдено' });

    if (post.cloudinaryPublicId) {
      await deleteBlogImage(post.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Пост видалено' });
  } catch (error) {
    console.error('❌ Помилка при видаленні поста:', error);
    res.status(500).json({ message: 'Не вдалося видалити пост' });
  }
});

export default router;
