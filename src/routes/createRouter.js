import express from 'express';
import TeamMember from '../models/teamMemberModel.js';
import {
  upload,
  handlePhotoInput,
  deleteCloudinaryImage,
} from '../middleware/upload.js';

const router = express.Router();

// ➕ Створити нового учасника
router.post(
  '/team',
  upload.single('image'),
  handlePhotoInput,
  async (req, res) => {
    const {
      name,
      position,
      photoUrl,
      cloudinaryPublicId,
      facebook,
      instagram,
      linkedin,
      twitter,
    } = req.body;

    if (!name || !position) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const newMember = new TeamMember({
        name,
        position,
        photoUrl: req.photoSource === 'url' ? photoUrl : req.body.cloudinaryUrl,
        cloudinaryPublicId:
          req.photoSource === 'file' ? cloudinaryPublicId : undefined,
        socialLinks: {
          facebook: facebook || '',
          instagram: instagram || '',
          linkedin: linkedin || '',
          twitter: twitter || '',
        },
      });

      await newMember.save();
      res
        .status(201)
        .json({ message: 'Учасника додано успішно!', member: newMember });
    } catch (error) {
      console.error('❌ Помилка при створенні члена команди:', error);
      res.status(500).json({ message: 'Щось пішло не так!' });
    }
  },
);

// 📤 Отримати всіх учасників
router.get('/team', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Помилка при отриманні членів команди:', error);
    res.status(500).json({ message: 'Не вдалося завантажити дані' });
  }
});

// ✏️ Оновити учасника
router.put(
  '/team/:id',
  upload.single('image'),
  handlePhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      position,
      photoUrl,
      cloudinaryPublicId,
      facebook,
      instagram,
      linkedin,
      twitter,
    } = req.body;

    if (!name || !position) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const existingMember = await TeamMember.findById(id);
      if (!existingMember) {
        return res.status(404).json({ message: 'Учасника не знайдено' });
      }

      const updatedData = {
        name,
        position,
        socialLinks: {
          facebook: facebook || existingMember.socialLinks?.facebook || '',
          instagram: instagram || existingMember.socialLinks?.instagram || '',
          linkedin: linkedin || existingMember.socialLinks?.linkedin || '',
          twitter: twitter || existingMember.socialLinks?.twitter || '',
        },
      };

      if (req.photoSource === 'url') {
        updatedData.photoUrl = photoUrl;
        updatedData.cloudinaryPublicId = undefined;
      } else if (req.photoSource === 'file') {
        if (existingMember.cloudinaryPublicId) {
          await deleteCloudinaryImage(existingMember.cloudinaryPublicId);
        }
        updatedData.photoUrl = req.body.cloudinaryUrl;
        updatedData.cloudinaryPublicId = cloudinaryPublicId;
      }

      const updatedMember = await TeamMember.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
          runValidators: true,
        },
      );

      res
        .status(200)
        .json({ message: 'Учасника оновлено успішно!', member: updatedMember });
    } catch (error) {
      console.error('❌ Помилка при оновленні члена команди:', error);
      res.status(500).json({ message: 'Не вдалося оновити дані' });
    }
  },
);

// ❌ Видалити учасника
router.delete('/team/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Учасника не знайдено' });
    }

    if (deleted.cloudinaryPublicId) {
      await deleteCloudinaryImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Учасника успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка при видаленні члена команди:', error);
    res.status(500).json({ message: 'Не вдалося видалити запис' });
  }
});

export default router;
