import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  MOCK_PRAKSE, SVE_TEHNOLOGIJE,
  formatDate, relativeDate, trajanjeLabel, mjestLabel, deadlineInfo,
} from '../data/mockPrakse';
import './StudentDashboard.css';

// ── PraksaCard ─────────────────────────────────────────────────────────────
function PraksaCard({ praksa, onSelect }) {
  const inactive = !praksa.aktivan;
  return (
    <div
      className={`sd-card-wrap${inactive ? ' sd-card-wrap--inactive' : ''}`}
      onClick={() => !inactive && onSelect(praksa)}
    >
    <article className="sd-card" tabIndex={inactive ? -1 : 0} role="button" aria-label={`${praksa.naziv} — ${praksa.kompanija}`}>
      <div className="sd-card-head">
        <div className="sd-company-row">
          <div className="sd-logo" style={{ background: praksa.logoColor }}>
            {praksa.logo}
          </div>
          <div className="sd-company-info">
            <span className="sd-company-name">{praksa.kompanija}</span>
            <span className="sd-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {praksa.lokacija}
            </span>
          </div>
          <div className="sd-head-badges">
            {inactive && <span className="sd-inactive-badge">Istekao</span>}
            <span className={`sd-tip-badge sd-tip--${praksa.tip.toLowerCase()}`}>{praksa.tip}</span>
            {praksa.stipendija && <span className="sd-stip-badge">Stipendija</span>}
          </div>
        </div>
        <h2 className="sd-card-title">{praksa.naziv}</h2>
        <p className="sd-card-opis">{praksa.opis}</p>
      </div>

      <div className="sd-tech-row">
        {praksa.tehnologije.map(t => (
          <span key={t} className="sd-tech-tag">{t}</span>
        ))}
      </div>

      <div className="sd-card-foot">
        <div className="sd-meta-row">
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {trajanjeLabel(praksa.trajanje)}
          </span>
          <span className="sd-meta-dot"/>
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {mjestLabel(praksa.brojMjesta)}
          </span>
          <span className="sd-meta-dot"/>
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Počinje {formatDate(praksa.datumPocetka)}
          </span>
        </div>
        <div className="sd-foot-right">
          <span className="sd-published">{relativeDate(praksa.datumObjave)}</span>
          <button
            className="sd-btn-detail"
            disabled={inactive}
            onClick={e => { e.stopPropagation(); if (!inactive) onSelect(praksa); }}
            tabIndex={-1}
          >
            {inactive ? 'Oglas istekao' : 'Saznaj više'}
            {!inactive && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
    </div>
  );
}

// ── PraksaModal ────────────────────────────────────────────────────────────
function PraksaModal({ praksa, onClose, darkMode }) {
  const dl = deadlineInfo(praksa.rokPrijave);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sd-modal-header">
          <div className="sd-company-row">
            <div className="sd-logo" style={{ background: praksa.logoColor }}>{praksa.logo}</div>
            <div className="sd-company-info">
              <span className="sd-company-name">{praksa.kompanija}</span>
              <span className="sd-location">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {praksa.lokacija}
              </span>
              <div className="sd-head-badges">
                <span className={`sd-tip-badge sd-tip--${praksa.tip.toLowerCase()}`}>{praksa.tip}</span>
                {praksa.stipendija && <span className="sd-stip-badge">Stipendija</span>}
              </div>
            </div>
          </div>
          <h2 className="sd-modal-title">{praksa.naziv}</h2>
          <button className="sd-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="sd-modal-body">

          {/* Meta chips */}
          <div className="sd-modal-meta">
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {trajanjeLabel(praksa.trajanje)}
            </span>
            <span className="sd-meta-dot"/>
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {mjestLabel(praksa.brojMjesta)}
            </span>
            <span className="sd-meta-dot"/>
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Počinje {formatDate(praksa.datumPocetka)}
            </span>
          </div>

          {/* Deadline */}
          <div className={`sd-modal-deadline sd-modal-deadline--${dl.cls}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div className="sd-modal-deadline-text">
              <span className="sd-modal-deadline-label">Rok za prijavu</span>
              <span className="sd-modal-deadline-date">{formatDate(praksa.rokPrijave)}</span>
            </div>
            <span className={`sd-modal-deadline-badge sd-modal-deadline-badge--${dl.cls}`}>{dl.label}</span>
          </div>

          {/* Opis */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Opis prakse</p>
            <p className="sd-modal-text">{praksa.opis}</p>
          </div>

          {/* Uslovi */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Uslovi i zahtjevi</p>
            <ul className="sd-modal-list">
              {praksa.uslovi.map((u, i) => (
                <li key={i} className="sd-modal-list-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tehnologije */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Tehnologije</p>
            <div className="sd-tech-row">
              {praksa.tehnologije.map(t => (
                <span key={t} className="sd-tech-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Kontakt</p>
            <div className="sd-modal-contact">
              <div className="sd-modal-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{praksa.kontakt.osoba}</span>
              </div>
              <div className="sd-modal-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href={`mailto:${praksa.kontakt.email}`} className="sd-modal-email">{praksa.kontakt.email}</a>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="sd-modal-cta">
            <button className="sd-btn-apply">
              Prijavi se
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className="sd-btn-modal-cancel" onClick={onClose}>Zatvori</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── StudentDashboard ───────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedPraksa, setSelectedPraksa] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTehs, setFilterTehs] = useState([]);
  const [filterTips, setFilterTips] = useState([]);
  const [filterTrajanja, setFilterTrajanja] = useState([]);
  const [sortBy, setSortBy] = useState('najnovije');
  const [sectionsOpen, setSectionsOpen] = useState({ tech: false, duration: false, type: false, sort: false });

  function handleLogout() {
    logout();
    navigate('/auth');
  }

  const filteredPrakse = useMemo(() => {
    let r = [...MOCK_PRAKSE];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      r = r.filter(p =>
        p.naziv.toLowerCase().includes(s) ||
        p.kompanija.toLowerCase().includes(s) ||
        p.tehnologije.some(t => t.toLowerCase().includes(s))
      );
    }
    if (filterTehs.length) r = r.filter(p => filterTehs.some(t => p.tehnologije.includes(t)));
    if (filterTips.length) r = r.filter(p => filterTips.includes(p.tip));
    if (filterTrajanja.length) r = r.filter(p =>
      filterTrajanja.some(range => {
        if (range === '1-2') return p.trajanje <= 2;
        if (range === '3') return p.trajanje === 3;
        if (range === '4-5') return p.trajanje >= 4 && p.trajanje <= 5;
        if (range === '6+') return p.trajanje >= 6;
        return false;
      })
    );
    if (sortBy === 'najnovije') r.sort((a, b) => new Date(b.datumObjave) - new Date(a.datumObjave));
    else if (sortBy === 'najstarije') r.sort((a, b) => new Date(a.datumObjave) - new Date(b.datumObjave));
    else if (sortBy === 'trajanje-asc') r.sort((a, b) => a.trajanje - b.trajanje);
    else if (sortBy === 'trajanje-desc') r.sort((a, b) => b.trajanje - a.trajanje);
    return r;
  }, [search, filterTehs, filterTips, filterTrajanja, sortBy]);

  const hasFilters = search || filterTehs.length || filterTips.length || filterTrajanja.length;

  function toggleSection(key) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArr(setter, value) {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  function resetFilters() {
    setSearch(''); setFilterTehs([]); setFilterTips([]); setFilterTrajanja([]);
  }

  return (
    <div className={`sd-page${darkMode ? ' dark' : ''}`}>
      {/* Navbar */}
      <nav className="sd-nav">
        <span className="sd-nav-brand">PraksaHub</span>
        <div className="sd-nav-right">
          <button className="sd-theme-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Svjetla tema' : 'Tamna tema'}>
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
        </div>
      </nav>

      {/* ── Collapsing filter sidebar ───────────────────────────────────── */}
      <aside className="sd-sidebar">
        {/* Collapsed icon strip */}
        <div className="sd-sidebar-tab">
          <div className="sd-sb-tab-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            {filterTehs.length > 0 && <span className="sd-sb-badge">{filterTehs.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {filterTrajanja.length > 0 && <span className="sd-sb-badge">{filterTrajanja.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {filterTips.length > 0 && <span className="sd-sb-badge">{filterTips.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4"/><polyline points="3 8 7 4 11 8"/>
              <path d="M17 8v12"/><polyline points="21 16 17 20 13 16"/>
            </svg>
          </div>
          {/* Footer icons — avatar + exit */}
          <div className="sd-sb-tab-footer">
            <div className="sd-sb-tab-icon">
              <div className="sd-nav-avatar sd-sb-tab-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
            </div>
            <div className="sd-sb-tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div className="sd-sidebar-inner">
          <div className="sd-sidebar-content">
          {/* Search with spinning glow border on focus */}
          <div className="sd-sb-search-outer sd-sidebar-search">
            <div className="sd-search-wrap">
              <svg className="sd-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="sd-search"
                type="text"
                placeholder="Pretraži..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="sd-search-clear" onClick={() => setSearch('')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* VS Code-style collapsible sections */}
          <div className="sd-sidebar-filters">

            {/* Tehnologija — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('tech')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <span className="sd-sb-section-title">Tehnologija</span>
                {filterTehs.length > 0 && <span className="sd-sb-count">{filterTehs.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.tech ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.tech && (
                <div className="sd-sb-section-body">
                  {SVE_TEHNOLOGIJE.map(t => (
                    <label key={t} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTehs.includes(t)} onChange={() => toggleArr(setFilterTehs, t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Trajanje — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('duration')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="sd-sb-section-title">Trajanje</span>
                {filterTrajanja.length > 0 && <span className="sd-sb-count">{filterTrajanja.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.duration ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.duration && (
                <div className="sd-sb-section-body">
                  {[['1-2','1–2 mj.'],['3','3 mj.'],['4-5','4–5 mj.'],['6+','6+ mj.']].map(([val,lbl]) => (
                    <label key={val} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTrajanja.includes(val)} onChange={() => toggleArr(setFilterTrajanja, val)} />
                      <span>{lbl}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tip prakse — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('type')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="sd-sb-section-title">Tip prakse</span>
                {filterTips.length > 0 && <span className="sd-sb-count">{filterTips.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.type ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.type && (
                <div className="sd-sb-section-body">
                  {['Remote','Hybrid','Onsite'].map(tip => (
                    <label key={tip} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTips.includes(tip)} onChange={() => toggleArr(setFilterTips, tip)} />
                      <span>{tip}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sortiranje — single radio selection */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('sort')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16V4"/><polyline points="3 8 7 4 11 8"/>
                  <path d="M17 8v12"/><polyline points="21 16 17 20 13 16"/>
                </svg>
                <span className="sd-sb-section-title">Sortiraj po</span>
                <svg className={`sd-sb-chevron${sectionsOpen.sort ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.sort && (
                <div className="sd-sb-section-body">
                  {[['najnovije','Najnovije'],['najstarije','Najstarije'],['trajanje-asc','Trajanje ↑'],['trajanje-desc','Trajanje ↓']].map(([val,lbl]) => (
                    <label key={val} className="sd-sb-radio-row">
                      <input type="radio" name="sortBy" value={val} checked={sortBy === val} onChange={() => setSortBy(val)} />
                      <span>{lbl}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {hasFilters && (
              <button className="sd-reset-btn sd-sb-reset" onClick={resetFilters}>Resetuj filtere</button>
            )}
          </div>
          </div>{/* end sd-sidebar-content */}

          {/* Sticky footer — user + logout */}
          <div className="sd-sidebar-footer">
            <button className="sd-sb-footer-row">
              <div className="sd-nav-avatar sd-sb-footer-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
              <span className="sd-sb-footer-text">{user?.username || 'Student'}</span>
            </button>
            <button className="sd-sb-footer-row sd-sb-logout-row" onClick={handleLogout}>
              <svg className="sd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="sd-sb-footer-text">Odjava</span>
            </button>
          </div>
        </div>{/* end sd-sidebar-inner */}
      </aside>

      <div className="sd-container">
        {/* Header */}
        <header className="sd-header">
          <div className="sd-header-text">
            <h1 className="sd-title">Dostupne prakse</h1>
            <p className="sd-subtitle">Pronađi svoju idealnu praksu i pokreni karijeru</p>
          </div>
          <div className="sd-stats">
            <div className="sd-stat-card">
              <span className="sd-stat-num">{MOCK_PRAKSE.length}</span>
              <span className="sd-stat-lbl">Aktivnih oglasa</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-num">{new Set(MOCK_PRAKSE.map(p => p.kompanija)).size}</span>
              <span className="sd-stat-lbl">Kompanija</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-num">{MOCK_PRAKSE.reduce((s, p) => s + p.brojMjesta, 0)}</span>
              <span className="sd-stat-lbl">Slobodnih mjesta</span>
            </div>
          </div>
        </header>

        <p className="sd-results-info">
          {filteredPrakse.length === 0
            ? 'Nema rezultata'
            : <><strong>{filteredPrakse.length}</strong> {filteredPrakse.length === 1 ? 'oglas' : 'oglasa'} pronađeno{hasFilters && ' · filtrirano'}</>
          }
        </p>

        {/* List */}
        <div className="sd-list">
          {filteredPrakse.length === 0 ? (
            <div className="sd-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="sd-empty-title">Nema pronađenih oglasa</p>
              <p className="sd-empty-sub">
                Pokušaj sa drugačijim filterima ili{' '}
                <button className="sd-empty-link" onClick={resetFilters}>resetuj pretragu</button>.
              </p>
            </div>
          ) : (
            filteredPrakse.map(p => <PraksaCard key={p.id} praksa={p} onSelect={sel => setSelectedPraksa(sel)} />)
          )}
        </div>
      </div>

      {selectedPraksa && (
        <PraksaModal
          praksa={selectedPraksa}
          onClose={() => setSelectedPraksa(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
