import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'seznam', // Важливо! Переконайся, що це правильний сервіс
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Функція для надсилання email клієнту та замовнику
 */
export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  try {
    // 📩 Повідомлення для клієнта
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: '✅ Váš požadavek byl úspěšně přijat.!',
      text: `Dobrý den, ${clientName}!\n\n
      Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.\n\n
      📞 Vaše telefonní číslo.: ${clientPhone}\n
      📝 Vaše zpráva.: ${clientMessage}\n\n
      Pokud máte jakékoli další dotazy, neváhejte nám napsat odpovědí na tento e-mail.\n\n
      S nejlepšími přáními,\n
      Tým podpory.`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">Dobrý den, ${clientName}!</h2>
      <p>Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.</p>
      <p>Pokud máte jakékoli další dotazy, neváhejte nám napsat odpovědí na tento e-mail.</p>
      <p>S nejlepšími přáními,</p>
      <p><strong>Tým podpory</strong></p>
    </div>
  `,
    };

    // 📩 Повідомлення для замовника
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: 'Nová žádost od klienta.',
      text: `📩 Nová žádost od klienta!\n\n
  🔹 Jméno a příjmení: ${clientName}\n
  📧 Email: ${clientEmail}\n
  📞 Telefon: ${clientPhone}\n
  📝 Zpráva:\n${clientMessage}\n\n
  📅 Datum odeslání: ${new Date().toLocaleString()}`,
    };

    // Відправляємо обидва листи паралельно
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(ownerMailOptions),
    ]);

    console.log(
      `Email надіслано на ${clientEmail} і ${process.env.OWNER_EMAIL}`,
    );
    return true;
  } catch (error) {
    console.error('Помилка при відправці email:', error);
    return false;
  }
};
