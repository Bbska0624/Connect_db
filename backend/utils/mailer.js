import nodemailer from 'nodemailer';

export const sendOtpEmail = async (to, code) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"NumConnect" <${process.env.SMTP_USER}>`,
    to,
    subject: 'NumConnect — Нэвтрэх OTP код',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <div style="font-size:22px;font-weight:700;margin-bottom:4px">NumConnect</div>
        <div style="color:#6b7280;font-size:13px;margin-bottom:24px">МУИС оюутнуудын платформ</div>
        <p style="font-size:15px;color:#111">Таны нэвтрэх нэг удаагийн код:</p>
        <div style="letter-spacing:10px;font-size:36px;font-weight:700;color:#4f46e5;text-align:center;padding:16px 0">${code}</div>
        <p style="font-size:13px;color:#6b7280">Энэ код <strong>5 минут</strong> хүчинтэй. Та хүсээгүй бол энэ имэйлийг үл тооно уу.</p>
      </div>
    `,
  });
};
