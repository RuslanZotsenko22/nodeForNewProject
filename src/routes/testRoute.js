import TestModel from '../models/testModel.js';
import { sendEmails } from '../service/emailService.js';
import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Валідація
  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      message: "Ім'я, Email, Номер телефону та Повідомлення є обов'язковими!",
    });
  }

  // Перевірка на ім'я
  const nameRegex = /^[A-Za-zА-Яа-яЁёіІїЇєЄ' -]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ message: 'Невірний формат імені!' });
  }

  // Перевірка на email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Невірний формат email!' });
  }

  // Перевірка номера телефону
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ message: 'Невірний формат номера телефону!' });
  }

  // Перевірка повідомлення
  // if (message.length < 0) {
  //   return res
  //     .status(400)
  //     .json({ message: 'Повідомлення повинно містити мінімум 0 символів!' });
  // }

  try {
    // Створення нового запису в базі даних
    const newTestData = new TestModel({ name, email, phone, message });
    await newTestData.save();

    // Відправлення email
    const emailSent = await sendEmails(email, name, phone, message);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: 'Дані збережено, але email не надіслано!' });
    }

    res.status(201).json({
      message: 'Дані успішно збережено та email відправлено!',
      status: 201,
    });
  } catch (err) {
    console.error('Помилка збереження даних:', err);
    res.status(500).json({ message: 'Щось пішло не так!' });
  }
});

export default router;
