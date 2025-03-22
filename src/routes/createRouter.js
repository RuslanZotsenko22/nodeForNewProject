// createRouter.js
import express from 'express';
import TeamMember from '../models/teamMemberModel.js'; //../models/TeamMember.js
import { upload, handlePhotoInput } from '../middleware/upload.js';

const router = express.Router();

router.post(
  '/team',
  upload.single('image'),
  handlePhotoInput,
  async (req, res) => {
    const { firstName, lastName, position, photoUrl } = req.body;

    if (!firstName || !lastName || !position) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const newMember = new TeamMember({
        firstName,
        lastName,
        position,
        photoUrl: req.photoSource === 'url' ? photoUrl : undefined,
        localPhotoPath:
          req.photoSource === 'file' ? req.body.photoFilePath : undefined,
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

// 📤 GET: Отримати всіх учасників команди
router.get('/team', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Помилка при отриманні членів команди:', error);
    res.status(500).json({ message: 'Не вдалося завантажити дані' });
  }
});

// 🛠 PUT: Оновити учасника команди
router.put(
  '/team/:id',
  upload.single('image'),
  handlePhotoInput,
  async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, position, photoUrl } = req.body;

    if (!firstName || !lastName || !position) {
      return res.status(400).json({ message: 'Всі поля обов’язкові' });
    }

    try {
      const updatedData = {
        firstName,
        lastName,
        position,
      };

      if (req.photoSource === 'url') {
        updatedData.photoUrl = photoUrl;
        updatedData.localPhotoPath = undefined;
      } else if (req.photoSource === 'file') {
        updatedData.localPhotoPath = req.body.photoFilePath;
        updatedData.photoUrl = undefined;
      }

      const updatedMember = await TeamMember.findByIdAndUpdate(
        id,
        updatedData,
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedMember) {
        return res.status(404).json({ message: 'Учасника не знайдено' });
      }

      res
        .status(200)
        .json({ message: 'Учасника оновлено успішно!', member: updatedMember });
    } catch (error) {
      console.error('❌ Помилка при оновленні члена команди:', error);
      res.status(500).json({ message: 'Не вдалося оновити дані' });
    }
  },
);

// ❌ DELETE: Видалити учасника команди
router.delete('/team/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Учасника не знайдено' });
    }

    res.status(200).json({ message: 'Учасника успішно видалено' });
  } catch (error) {
    console.error('❌ Помилка при видаленні члена команди:', error);
    res.status(500).json({ message: 'Не вдалося видалити запис' });
  }
});

export default router;
