import express from 'express';
import TeamMember from '../models/teamMemberModel.js';
import {
  upload,
  handlePhotoInput,
  deleteCloudinaryImage,
} from '../middleware/upload.js';
import { verifyAdminToken } from '../middleware/verifyAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/team:
 *   get:
 *     summary: Отримати всіх учасників команди (публічно)
 *     tags: [Команда]
 *     responses:
 *       200:
 *         description: Успішне отримання списку учасників
 *       500:
 *         description: Внутрішня помилка сервера
 */
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Chyba při načítání členů týmu:', error);
    res.status(500).json({ message: 'Nepodařilo se načíst data' });
  }
});

router.use(verifyAdminToken);

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Додати нового учасника команди
 *     tags: [Команда]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               facebook:
 *                 type: string
 *               instagram:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Успішно додано нового учасника
 *       400:
 *         description: Помилка у вхідних даних
 *       500:
 *         description: Внутрішня помилка сервера
 */
router.post('/', upload.single('image'), handlePhotoInput, async (req, res) => {
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
    return res.status(400).json({ message: 'Všechna pole jsou povinná' });
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
      .json({ message: 'Člen byl úspěšně přidán!', member: newMember });
  } catch (error) {
    console.error('❌ Chyba při vytváření člena týmu:', error);
    res.status(500).json({ message: 'Něco se pokazilo!' });
  }
});

/**
 * @swagger
 * /api/team/{id}:
 *   put:
 *     summary: Оновити дані учасника команди
 *     tags: [Команда]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID учасника
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               facebook:
 *                 type: string
 *               instagram:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               twitter:
 *                 type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані успішно оновлено
 *       404:
 *         description: Учасник не знайдений
 *       500:
 *         description: Помилка при оновленні
 */
router.put(
  '/:id',
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
      return res.status(400).json({ message: 'Všechna pole jsou povinná' });
    }

    try {
      const existingMember = await TeamMember.findById(id);
      if (!existingMember) {
        return res.status(404).json({ message: 'Člen týmu nebyl nalezen' });
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

      res.status(200).json({
        message: 'Člen týmu byl úspěšně aktualizován!',
        member: updatedMember,
      });
    } catch (error) {
      console.error('❌ Chyba při aktualizaci člena týmu:', error);
      res.status(500).json({ message: 'Nepodařilo se aktualizovat údaje' });
    }
  },
);

/**
 * @swagger
 * /api/team/{id}:
 *   delete:
 *     summary: Видалити учасника команди
 *     tags: [Команда]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID учасника
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Учасника видалено
 *       404:
 *         description: Учасник не знайдений
 *       500:
 *         description: Внутрішня помилка сервера
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await TeamMember.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Člen nebyl nalezen' });
    }

    if (deleted.cloudinaryPublicId) {
      await deleteCloudinaryImage(deleted.cloudinaryPublicId);
    }

    res.status(200).json({ message: 'Člen byl úspěšně odstraněn' });
  } catch (error) {
    console.error('❌ Chyba při odstraňování člena týmu:', error);
    res.status(500).json({ message: 'Nepodařilo se odstranit záznam' });
  }
});

export default router;
