import { useEffect } from "react";

export default function CookiesPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    padding: "120px 1.5rem 80px",
    backgroundColor: "#f9fbff",
    display: "flex",
    justifyContent: "center",
  };

  const contentStyle = {
    maxWidth: "850px",
    width: "100%",
    lineHeight: 1.75,
    color: "#1f2d3d",
  };

  const headingStyle = {
    fontSize: "2.4rem",
    fontWeight: 700,
    marginBottom: "30px",
  };

  const sectionTitle = {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: "40px",
    marginBottom: "10px",
  };

  const paragraphStyle = {
    fontSize: "0.95rem",
    color: "#445b78",
  };

  const listStyle = {
    paddingLeft: "20px",
    fontSize: "0.95rem",
    color: "#445b78",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Politika kolačića</h1>

        <p style={paragraphStyle}>
          Ova stranica objašnjava kako PraksaHub koristi kolačiće (cookies)
          radi poboljšanja funkcionalnosti i korisničkog iskustva.
        </p>

        <h2 style={sectionTitle}>1. Šta su kolačići?</h2>
        <p style={paragraphStyle}>
          Kolačići su male tekstualne datoteke koje se pohranjuju na vaš
          uređaj prilikom posjete web stranici.
        </p>

        <h2 style={sectionTitle}>2. Koje kolačiće koristimo?</h2>
        <ul style={listStyle}>
          <li>Neophodni kolačići – omogućavaju osnovno funkcionisanje.</li>
          <li>Funkcionalni kolačići – pamte vaše postavke.</li>
          <li>Analitički kolačići – pomažu unapređenju platforme.</li>
        </ul>

        <h2 style={sectionTitle}>3. Upravljanje kolačićima</h2>
        <p style={paragraphStyle}>
          Možete kontrolisati ili obrisati kolačiće putem postavki vašeg
          internet preglednika.
        </p>

        <h2 style={sectionTitle}>4. Izmjene politike</h2>
        <p style={paragraphStyle}>
          Zadržavamo pravo izmjene ove Politike kolačića u bilo kojem
          trenutku.
        </p>

        <p style={{ marginTop: "50px", fontSize: "0.8rem", color: "#7a8ca5" }}>
          Posljednje ažuriranje: April 2026.
        </p>
      </div>
    </div>
  );
}