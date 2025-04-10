import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Перевірка змінних середовища
if (
  !process.env.EMAIL_USER ||
  !process.env.EMAIL_PASS ||
  !process.env.OWNER_EMAIL
) {
  console.error('❌ Chyba: chybí potřebné proměnné prostředí!');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Chybí');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✔️ Є' : '❌ Chybí');
  console.log('OWNER_EMAIL:', process.env.OWNER_EMAIL || '❌ Chybí');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'seznam',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🕒 Таймаут-обгортка для завислої SMTP-відправки
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('⏰ Email odesílání trvalo příliš dlouho!')),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
};

// 📨 Головна функція відправки emailів
export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  try {
    if (!clientEmail || !clientName || !clientPhone || !clientMessage) {
      throw new Error('❌ Chybí potřebné parametry pro odeslání emailu!');
    }

    // 📩 Повідомлення для клієнта
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: clientEmail,
      subject: '✅ Váš požadavek byl úspěšně přijat.',
      text: `Dobrý den, ${clientName}! Děkujeme za vaši žádost...`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
          <img 
            src="cid:logo" 
            alt="Logo" 
            style="width: 300px; height: auto; margin-bottom: 24px; display: block; margin-left: auto; margin-right: auto;" 
          />
          <h2 style="margin-top: 0;">Dobrý den, ${clientName}!</h2>
          <p>Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.</p>
          <p>Pokud máte jakékoli další dotazy, neváhejte nám napsat odpovědí na tento e-mail.</p>
          <p>S pozdravem,</p>
          <p><strong>Jednatel RRP s.r.o.</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: path.resolve('src/assets/logo.png.png'), // перевір ще раз шлях!
          cid: 'logo',
        },
      ],
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

    // ⏳ Відправка з таймаутом 7 сек
    await Promise.all([
      withTimeout(transporter.sendMail(clientMailOptions), 7000),
      withTimeout(transporter.sendMail(ownerMailOptions), 7000),
    ]);

    console.log(
      `✅ Email надіслано на ${clientEmail} і ${process.env.OWNER_EMAIL}`,
    );
    return true;
  } catch (error) {
    console.error('❌ Chyba při odesílání emailu:', error.message);
    if (error.response) console.error('📩 Odpověď SMTP:', error.response);
    return false;
  }
};
