import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  MOCK_PRAKSE, formatDate, trajanjeLabel, mjestLabel, deadlineInfo,
} from '../data/mockPrakse';
import './PraksaDetailPage.css';

const SECTIONS = [
  { id: 'pd-sec-opis',     label: 'Opis prakse',  color: '#38bdf8' },
  { id: 'pd-sec-meta',     label: 'Detalji',       color: '#6366f1' },
  { id: 'pd-sec-deadline', label: 'Rok prijave',   color: '#8b5cf6' },
  { id: 'pd-sec-uslovi',   label: 'Uslovi',        color: '#a855f7' },
  { id: 'pd-sec-teh',      label: 'Tehnologije',   color: '#ec4899' },
  { id: 'pd-sec-kontakt',  label: 'Kontakt',       color: '#f43f5e' },
];

export default function PraksaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();
  const [activeSection, setActiveSection] = useState('pd-sec-opis');
  const [dotPositions, setDotPositions] = useState([]);
  const bodyRef = useRef(null);

  const praksa = MOCK_PRAKSE.find(p => p.id === Number(id));

  useEffect(() => {
    if (!praksa) { navigate('/dashboard/student', { replace: true }); return; }
    window.scrollTo(0, 0);

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0, rootMargin: '-80px 0px -65% 0px' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    function calcPositions() {
      if (!bodyRef.current) return;
      const bodyTop = bodyRef.current.getBoundingClientRect().top;
      const positions = SECTIONS.map(s => {
        const el = document.getElementById(s.id);
        if (!el) return 0;
        return el.getBoundingClientRect().top - bodyTop;
      });
      setDotPositions(positions);
    }

    calcPositions();
    window.addEventListener('resize', calcPositions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calcPositions);
    };
  }, [praksa, navigate]);

  if (!praksa) return null;

  const dl = deadlineInfo(praksa.rokPrijave);

  function scrollTo(secId) {
    document.getElementById(secId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const dotBg = (color, isActive) =>
    isActive ? color : (darkMode ? '#0d1117' : '#f0f6ff');

  const lineTop = dotPositions[0] ?? 0;
  const lineHeight = dotPositions.length === SECTIONS.length
    ? Math.max(0, dotPositions[SECTIONS.length - 1] - dotPositions[0])
    : 0;

  return (
    <div className={`pd-page${darkMode ? ' dark' : ''}`}>

      {/* ── Navbar ── */}
      <nav className="pd-nav">
        <button className="pd-back-btn" onClick={() => navigate('/dashboard/student')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Nazad
        </button>
        <span className="pd-nav-brand">PraksaHub</span>
        <button className="pd-theme-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Svjetla tema' : 'Tamna tema'}>
          {darkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </nav>

      <div className="pd-wrapper">

        {/* ── Hero ── */}
        <div className="pd-hero">
          <div className="pd-company-row">
            <div className="pd-logo" style={{ background: praksa.logoColor }}>{praksa.logo}</div>
            <div className="pd-company-info">
              <span className="pd-company-name">{praksa.kompanija}</span>
              <span className="pd-location">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {praksa.lokacija}
              </span>
            </div>
            <div className="pd-head-badges">
              <span className={`pd-tip-badge pd-tip--${praksa.tip.toLowerCase()}`}>{praksa.tip}</span>
              {praksa.stipendija && <span className="pd-stip-badge">Stipendija</span>}
            </div>
          </div>
          <h1 className="pd-title">{praksa.naziv}</h1>
        </div>

        {/* ── Body: content + timeline ── */}
        <div className="pd-body" ref={bodyRef}>

          {/* Main content */}
          <main className="pd-content">

            <section id="pd-sec-opis" className="pd-section">
              <h2 className="pd-section-title">Opis prakse</h2>
              <p className="pd-text">{praksa.opis}</p>
            </section>

            <section id="pd-sec-meta" className="pd-section">
              <h2 className="pd-section-title">Detalji</h2>
              <div className="pd-meta-grid">
                <div className="pd-meta-item">
                  <div className="pd-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="pd-meta-text">
                    <span className="pd-meta-label">Trajanje</span>
                    <span className="pd-meta-value">{trajanjeLabel(praksa.trajanje)}</span>
                  </div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="pd-meta-text">
                    <span className="pd-meta-label">Slobodna mjesta</span>
                    <span className="pd-meta-value">{mjestLabel(praksa.brojMjesta)}</span>
                  </div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div className="pd-meta-text">
                    <span className="pd-meta-label">Datum početka</span>
                    <span className="pd-meta-value">{formatDate(praksa.datumPocetka)}</span>
                  </div>
                </div>
                <div className="pd-meta-item">
                  <div className="pd-meta-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className="pd-meta-text">
                    <span className="pd-meta-label">Lokacija</span>
                    <span className="pd-meta-value">{praksa.lokacija}</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="pd-sec-deadline" className="pd-section">
              <h2 className="pd-section-title">Rok za prijavu</h2>
              <div className={`pd-deadline pd-deadline--${dl.cls}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <div className="pd-deadline-text">
                  <span className="pd-deadline-label">Krajnji rok</span>
                  <span className="pd-deadline-date">{formatDate(praksa.rokPrijave)}</span>
                </div>
                <span className={`pd-deadline-badge pd-deadline-badge--${dl.cls}`}>{dl.label}</span>
              </div>
            </section>

            <section id="pd-sec-uslovi" className="pd-section">
              <h2 className="pd-section-title">Uslovi i zahtjevi</h2>
              <ul className="pd-list">
                {praksa.uslovi.map((u, i) => (
                  <li key={i} className="pd-list-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="pd-sec-teh" className="pd-section">
              <h2 className="pd-section-title">Tehnologije</h2>
              <div className="pd-tech-row">
                {praksa.tehnologije.map(t => (
                  <span key={t} className="pd-tech-tag">{t}</span>
                ))}
              </div>
            </section>

            <section id="pd-sec-kontakt" className="pd-section">
              <h2 className="pd-section-title">Kontakt informacije</h2>
              <div className="pd-contact">
                <div className="pd-contact-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>{praksa.kontakt.osoba}</span>
                </div>
                <div className="pd-contact-row">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href={`mailto:${praksa.kontakt.email}`} className="pd-contact-email">{praksa.kontakt.email}</a>
                </div>
              </div>
            </section>

            <div className="pd-cta">
              <button className="pd-btn-apply">
                Prijavi se
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
              <button className="pd-btn-secondary" onClick={() => navigate('/dashboard/student')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Nazad na pregled
              </button>
            </div>
          </main>

          {/* ── Timeline sidebar ── */}
          <aside className="pd-timeline-sidebar">
            <div className="pd-timeline-track">
              {dotPositions.length === SECTIONS.length && (
                <div
                  className="pd-timeline-line"
                  style={{ top: lineTop, height: lineHeight }}
                />
              )}
              {SECTIONS.map((s, i) => {
                const isActive = activeSection === s.id;
                const top = dotPositions[i] ?? i * 70;
                return (
                  <div
                    key={s.id}
                    className={`pd-timeline-item${isActive ? ' active' : ''}`}
                    style={{ top }}
                    onClick={() => scrollTo(s.id)}
                  >
                    <div
                      className="pd-timeline-dot"
                      style={{
                        borderColor: s.color,
                        background: dotBg(s.color, isActive),
                        boxShadow: isActive ? `0 0 12px ${s.color}80` : 'none',
                      }}
                    />
                    <span
                      className="pd-timeline-label"
                      style={{ color: isActive ? s.color : undefined }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
