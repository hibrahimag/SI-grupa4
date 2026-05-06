const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Reset lozinke',
    html: `
      <h2>Obnavljanje lozinke</h2>
      <p>Kliknite na link ispod da postavite novu lozinku:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link važi 1 sat.</p>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
};