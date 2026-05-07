const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || process.env.SMTP_HOST,
  port: Number(process.env.MAIL_PORT || process.env.SMTP_PORT),
  secure: false,
  family: 4,
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
  from: `"PraksaHub" <${process.env.SMTP_USER}>`,
  to,
  subject: 'Obnavljanje lozinke',
  html: `
    <div style="
      margin:0;
      padding:40px 20px;
      background-color:#f4f7fb;
      font-family:Arial,sans-serif;
    ">
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 8px 24px rgba(0,0,0,0.08);
      ">

        <!-- HEADER -->
        <div style="
          background:linear-gradient(135deg,#071b4a,#0f52ba);
          padding:40px 32px;
          color:white;
        ">
          <h1 style="
            margin:0;
            font-size:34px;
            font-weight:700;
          ">
            PraksaHub
          </h1>

          <p style="
            margin-top:12px;
            font-size:16px;
            opacity:0.9;
          ">
            Platforma za studentske prakse
          </p>
        </div>

        <!-- BODY -->
        <div style="padding:40px 32px;">
          <h2 style="
            margin-top:0;
            color:#071b4a;
            font-size:28px;
          ">
            Obnavljanje lozinke
          </h2>

          <p style="
            color:#4b5563;
            font-size:15px;
            line-height:1.7;
          ">
            Primili smo zahtjev za promjenu lozinke vašeg korisničkog naloga.
            Kliknite na dugme ispod kako biste postavili novu lozinku.
          </p>

          <div style="
            text-align:center;
            margin:40px 0;
          ">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:16px 32px;
                background:linear-gradient(90deg,#2563eb,#38bdf8);
                color:white;
                text-decoration:none;
                border-radius:12px;
                font-size:16px;
                font-weight:bold;
              "
            >
              Resetuj lozinku
            </a>
          </div>

          <p style="
            color:#6b7280;
            font-size:14px;
            line-height:1.6;
          ">
            Link za reset lozinke važi 1 sat.
            Ako niste vi poslali zahtjev, možete ignorisati ovaj email.
          </p>

          <div style="
            margin-top:32px;
            padding:16px;
            background:#f9fafb;
            border-radius:10px;
            word-break:break-all;
            font-size:12px;
            color:#6b7280;
          ">
            ${resetLink}
          </div>
        </div>

        <!-- FOOTER -->
        <div style="
          padding:24px;
          text-align:center;
          border-top:1px solid #e5e7eb;
          color:#9ca3af;
          font-size:12px;
        ">
          © 2026 PraksaHub. Sva prava zadržana.
        </div>
      </div>
    </div>
  `,
});
}

async function sendEmailVerificationEmail(to, verificationLink) {
  await transporter.sendMail({
    from: `"PraksaHub" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verifikacija email adrese',
    html: `
  <div style="
    margin:0;
    padding:40px 20px;
    background-color:#f4f7fb;
    font-family:Arial,sans-serif;
  ">
    <div style="
      max-width:600px;
      margin:0 auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 8px 24px rgba(0,0,0,0.08);
    ">

      <!-- HEADER -->
      <div style="
        background:linear-gradient(135deg,#071b4a,#0f52ba);
        padding:40px 32px;
        color:white;
      ">
        <h1 style="
          margin:0;
          font-size:34px;
          font-weight:700;
        ">
          PraksaHub
        </h1>

        <p style="
          margin-top:12px;
          font-size:16px;
          opacity:0.9;
        ">
          Platforma za studentske prakse
        </p>
      </div>

      <!-- BODY -->
      <div style="padding:40px 32px;">
        <h2 style="
          margin-top:0;
          color:#071b4a;
          font-size:28px;
        ">
          Potvrdite email adresu
        </h2>

        <p style="
          color:#4b5563;
          font-size:15px;
          line-height:1.7;
        ">
          Hvala vam na registraciji na platformu PraksaHub.
          Kako biste aktivirali vaš korisnički račun,
          potrebno je potvrditi email adresu.
        </p>

        <div style="
          text-align:center;
          margin:40px 0;
        ">
          <a
            href="${verificationLink}"
            style="
              display:inline-block;
              padding:16px 32px;
              background:linear-gradient(90deg,#2563eb,#38bdf8);
              color:white;
              text-decoration:none;
              border-radius:12px;
              font-size:16px;
              font-weight:bold;
            "
          >
            Potvrdi email adresu
          </a>
        </div>

        <p style="
          color:#6b7280;
          font-size:14px;
          line-height:1.6;
        ">
          Verifikacioni link važi 24 sata.
          Ako niste kreirali nalog na platformi PraksaHub,
          možete ignorisati ovaj email.
        </p>

        <div style="
          margin-top:32px;
          padding:16px;
          background:#f9fafb;
          border-radius:10px;
          word-break:break-all;
          font-size:12px;
          color:#6b7280;
        ">
          ${verificationLink}
        </div>
      </div>

      <!-- FOOTER -->
      <div style="
        padding:24px;
        text-align:center;
        border-top:1px solid #e5e7eb;
        color:#9ca3af;
        font-size:12px;
      ">
        © 2026 PraksaHub. Sva prava zadržana.
      </div>
    </div>
  </div>
`,
  });
}

async function sendAccountApprovedEmail(to, role) {
  await transporter.sendMail({
    from: `"PraksaHub" <${process.env.SMTP_USER}>`,
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
    from: `"PraksaHub" <${process.env.SMTP_USER}>`,
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