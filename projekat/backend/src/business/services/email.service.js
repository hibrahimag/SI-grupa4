const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || process.env.SMTP_HOST,
  port: Number(process.env.MAIL_PORT || process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER || process.env.SMTP_USER,
    pass: process.env.MAIL_PASS || process.env.SMTP_PASS,
  },
});

function getSender() {
  return process.env.MAIL_FROM || process.env.MAIL_USER || process.env.SMTP_USER;
}

async function sendPasswordResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: getSender(),
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

async function sendEmailVerificationEmail(to, verificationLink) {
  await transporter.sendMail({
    from: getSender(),
    to,
    subject: 'Verifikacija email adrese',
    html: `
      <h2>Potvrdite vašu email adresu</h2>
      <p>Kliknite na link ispod kako biste aktivirali nalog:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>Link važi 24 sata.</p>
    `,
  });
}

async function sendAccountApprovedEmail(to, role) {
  await transporter.sendMail({
    from: getSender(),
    to,
    subject: 'Vaš račun je odobren',
    html: `
      <h2>Račun je odobren</h2>
      <p>Vaš korisnički račun je uspješno odobren.</p>
      <p>Dodijeljena rola: <strong>${role}</strong></p>
    `,
  });
}

async function sendAccountRejectedEmail(to, reason) {
  await transporter.sendMail({
    from: getSender(),
    to,
    subject: 'Vaš zahtjev je odbijen',
    html: `
      <h2>Zahtjev za odobrenje je odbijen</h2>
      <p>Nažalost, vaš korisnički račun nije odobren.</p>
      <p>Razlog odbijanja: <strong>${reason}</strong></p>
    `,
  });
}

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
};