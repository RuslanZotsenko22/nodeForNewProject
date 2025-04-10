import TestModel from '../models/testModel.js';
import { sendEmails } from '../service/emailService.js';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();

// 🛡️ Захист: обмеження 1 запит/хвилину з IP
const formLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 хвилина
  max: 1, // 1 запит
  message: {
    message: '⏳ Занадто багато запитів. Спробуйте ще раз за хвилину.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/test:
 *   post:
 *     summary: Надіслати контактну форму
 *     tags: [Форма]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ruslan Devman
 *               email:
 *                 type: string
 *                 example: ruslan@example.com
 *               phone:
 *                 type: string
 *                 example: +420123456789
 *               message:
 *                 type: string
 *                 example: Хочу замовити сайт!
 *     responses:
 *       201:
 *         description: Дані збережені, email буде надіслано
 *       400:
 *         description: Некоректні або відсутні поля
 *       429:
 *         description: Занадто багато запитів
 *       500:
 *         description: Внутрішня помилка сервера
 */

router.post('/', formLimiter, async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      message: "Ім'я, Email, Номер телефону та Повідомлення є обов'язковими!",
    });
  }

  const nameRegex =
    /^[A-Za-zА-Яа-яЁёІіЇїЄєČčĎďĚěŇňŘřŠšŤťŮůŽžÁáÉéÍíÓóÚúÝý' -]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ message: 'Neplatný formát jména!' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Neplatný formát e-mailu!' });
  }

  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ message: 'Neplatný formát telefonního čísla!' });
  }

  try {
    const newTestData = new TestModel({ name, email, phone, message });
    await newTestData.save();

    sendEmails(email, name, phone, message)
      .then(() => {
        console.log(`📨 Email úspěšně odeslán pro ${email}`);
      })
      .catch((err) => {
        console.error(`❌ Email odesílání selhalo pro ${email}:`, err.message);
      });

    res.status(201).json({
      message: 'Data byla úspěšně uložena! E-mail bude odeslán brzy.',
      status: 201,
    });
  } catch (err) {
    console.error('❌ Chyba při ukládání dat:', err);
    res.status(500).json({ message: 'Něco se pokazilo!' });
  }
});

export default router;
