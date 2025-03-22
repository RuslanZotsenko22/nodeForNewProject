import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Перевірка, чи всі змінні оточення задані
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.OWNER_EMAIL
) {
  console.error('❌ Помилка: відсутні необхідні змінні середовища!');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Відсутній');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ Є' : '❌ Відсутній');
  console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL || '❌ Відсутній');
  process.exit(1); // Завершуємо процес, якщо немає всіх змінних
}

const transporter = nodemailer.createTransport({
  service: 'seznam',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Функція для надсилання email клієнту та власнику
 */
export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  try {
    // Перевірка вхідних параметрів
    if (!clientEmail || !clientName || !clientPhone || !clientMessage) {
      throw new Error('❌ Відсутні необхідні параметри для відправки email!');
    }

    // 📩 Повідомлення для клієнта
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: '✅ Váš požadavek byl úspěšně přijat.!',
      text: `Dobrý den, ${clientName}!

Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.

📞 Vaše telefonní číslo: ${clientPhone}
📝 Vaše zpráva: ${clientMessage}

Pokud máte jakékoli další dotazy, neváhejte nám napsat odpovědí na tento e-mail.

S nejlepšími přáními,
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

    // 📩 Повідомлення для власника
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: 'Nová žádost od klienta.',
      text: `📩 Nová žádost od klienta!

🔹 Jméno a příjmení: ${clientName}
📧 Email: ${clientEmail}
📞 Telefon: ${clientPhone}
📝 Zpráva:
${clientMessage}

📅 Datum odeslání: ${new Date().toLocaleString()}`,
    };

    // Відправлення листів
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(ownerMailOptions),
    ]);

    console.log(
      `✅ Email надіслано на ${clientEmail} і ${process.env.OWNER_EMAIL}`,
    );
    return true;
  } catch (error) {
    console.error('❌ Помилка при відправці email:', error.message);
    if (error.response) console.error('📩 SMTP Відповідь:', error.response);
    return false;
  }
};
