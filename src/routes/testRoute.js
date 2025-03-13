import TestModel from '../models/testModel.js';
import { sendConfirmationEmail } from '../service/emailService.js';
import { Router } from 'express';

const router = Router();

router.post('/test', async (req, res) => {
  const { name, email, phone } = req.body;

  // Валідація
  if (!name || !email || !phone) {
    return res
      .status(400)
      .json({ message: "Ім'я, Email та Номер телефону є обов'язковими!" });
  }

  // Перевірка на ім'я (мінімум 2 символи, лише літери, пробіли та дефіси)
  const nameRegex = /^[A-Za-zА-Яа-яЁёіІїЇєЄ' -]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ message: 'Невірний формат імені!' });
  }

  // Перевірка на email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Невірний формат email!' });
  }

  // Перевірка на номер телефону (формат (код країни)888888888)
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ message: 'Невірний формат номера телефону!' });
  }

  try {
    // Створення нового запису в MongoDB
    const newTestData = new TestModel({ name, email, phone });
    await newTestData.save();

    // Відправлення email-підтвердження
    const data = await sendConfirmationEmail(email, name);

    res
      .status(201)
      .json({
        message: 'Дані успішно збережено та email відправлено!',
        status: 201,
        data: data,
      });
  } catch (err) {
    console.error('Помилка збереження даних:', err);
    res.status(500).json({ message: 'Щось пішло не так!' });
  }
});

export default router;
