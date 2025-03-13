import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); //використовую .env для збереження паролів

const transporter = nodemailer.createTransport({
  service: 'gmail', // Або інший поштовий сервіс
  auth: {
    user: process.env.EMAIL_USER, // Логін (твоя пошта)
    pass: process.env.EMAIL_PASS, // Пароль або спеціальний App Password
  },
});

export const sendConfirmationEmail = async (to, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Підтвердження заявки',
      text: `Привіт, ${name}! Дякуємо за вашу заявку. Ми зв'яжемося з вами найближчим часом.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email надіслано на ${to}`);
  } catch (error) {
    console.error('Помилка при відправці email:', error);
  }
};
