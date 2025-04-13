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
  process.exit(1);
}

//  SMTP Transporter — використовує твою пошту на WEDOS
const transporter = nodemailer.createTransport({
  host: 'wes1-smtp.wedos.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Таймаут обгортка
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('⏰ Email odesílání trvalo příliš dlouho!')),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
};

// 📬 Головна функція
export const sendEmails = async (
  clientEmail,
  clientName,
  clientPhone,
  clientMessage,
) => {
  try {
    if (!clientEmail || !clientName || !clientPhone || !clientMessage) {
      throw new Error('❌ Всі поля обовʼязкові для надсилання email!');
    }

    const clientMailOptions = {
      from: `"RRP s.r.o." <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: '✅ Váš požadavek byl úspěšně přijat.',
      text: `Dobrý den, ${clientName}! Děkujeme za vaši žádost...`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; text-align: center;">
          <img src="cid:logo" alt="Logo" style="width: 300px; margin-bottom: 24px;" />
          <h2>Dobrý den, ${clientName}!</h2>
          <p>Děkujeme za vaši žádost! Vaši zprávu jsme obdrželi a brzy se s vámi spojíme.</p>
          <p>Pokud máte jakékoli další dotazy, neváhejte odpovědět na tento e-mail.</p>
          <p><strong>Jednatel RRP s.r.o.</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: path.resolve('src/assets/logo.png.png'), // перевір шлях!
          cid: 'logo',
        },
      ],
    };

    const ownerMailOptions = {
      from: `"RRP s.r.o." <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: 'Nová žádost od klienta.',
      text: `
📩 Nová žádost od klienta!

🔹 Jméno: ${clientName}
📧 Email: ${clientEmail}
📞 Telefon: ${clientPhone}
📝 Zpráva:
${clientMessage}

📅 Datum odeslání: ${new Date().toLocaleString()}
      `,
    };

    // Надсилання з таймаутом
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
