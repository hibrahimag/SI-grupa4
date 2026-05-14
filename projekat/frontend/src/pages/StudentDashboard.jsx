import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { checkDeactivation, deactivateAccount, deleteMyAccount } from '../services/userService';
import { getActiveListings } from '../services/listingsService';
import {
  formatDate, relativeDate, trajanjeLabel, mjestLabel, deadlineInfo,
} from '../data/mockPrakse';
import './StudentDashboard.css';

const LOGO_COLORS = ['#1a6fd4', '#0e9e6e', '#6d4ce1', '#e07b1a', '#0891b2', '#be185d', '#7c3aed', '#c0392b'];
function deriveLogoColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length];
}
function deriveLogo(naziv) {
  const parts = (naziv || '').split(/\s+/).filter(w => w.length > 2);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (naziv || '??').slice(0, 2).toUpperCase();
}
function mapOglas(oglas) {
  const kompNaziv = oglas.Kompanija?.naziv || 'Kompanija';
  return {
    id: oglas.id,
    naziv: oglas.naziv,
    kompanija: kompNaziv,
    logo: deriveLogo(kompNaziv),
    logoColor: deriveLogoColor(kompNaziv),
    opis: oglas.opis || '',
    tehnologije: oglas.tehnologije || [],
    trajanje: oglas.trajanje ? Number(oglas.trajanje) : null,
    brojMjesta: oglas.brojMjesta,
    lokacija: oglas.lokacija || '',
    tip: oglas.tip || 'Onsite',
    datumObjave: oglas.datumObjave ? oglas.datumObjave.slice(0, 10) : null,
    datumPocetka: oglas.datumPocetka ? oglas.datumPocetka.slice(0, 10) : null,
    stipendija: oglas.placenaPraksa,
    rokPrijave: oglas.rokPrijave ? oglas.rokPrijave.slice(0, 10) : null,
    aktivan: oglas.status === 'AKTIVAN',
    uslovi: oglas.uslovi || [],
    kontakt: {
      osoba: oglas.Kompanija?.kontaktOsoba || '',
      email: oglas.Kompanija?.User?.email || '',
    },
  };
}

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

  const [prakse, setPrakse] = useState([]);
  const [praksaLoading, setPraksaLoading] = useState(true);
  const [praksaError, setPraksaError] = useState('');

  const [selectedPraksa, setSelectedPraksa] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTehs, setFilterTehs] = useState([]);
  const [filterTips, setFilterTips] = useState([]);
  const [filterTrajanja, setFilterTrajanja] = useState([]);
  const [sortBy, setSortBy] = useState('najnovije');
  const [sectionsOpen, setSectionsOpen] = useState({ tech: false, duration: false, type: false, sort: false });

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    let active = true;
    setPraksaLoading(true);
    getActiveListings()
      .then(data => { if (active) setPrakse((data || []).map(mapOglas)); })
      .catch(err => { if (active) setPraksaError(err.message || 'Greška pri učitavanju oglasa.'); })
      .finally(() => { if (active) setPraksaLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkDeactivation();
      setDeactivateCheck(result);
      setShowDeactivateConfirm(true);
    } catch {
      setDeactivateError('Greška pri provjeri statusa prijava. Pokušajte ponovo.');
    }
  }

  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError('');
    try {
      await deactivateAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeactivateError(err.message || 'Greška pri deaktivaciji naloga.');
      setDeactivating(false);
    }
  }

  async function handleOpenDelete() {
    setDeleteError('');
    try {
      const result = await checkDeactivation();
      setDeleteCheck(result);
      setShowDeleteConfirm(true);
    } catch {
      setDeleteError('Greška pri provjeri statusa prijava. Pokušajte ponovo.');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMyAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Greška pri brisanju naloga.');
      setDeleting(false);
    }
  }

  const sveTehnologije = useMemo(
    () => [...new Set(prakse.flatMap(p => p.tehnologije || []))].sort(),
    [prakse]
  );

  const filteredPrakse = useMemo(() => {
    let r = [...prakse];
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
                  {sveTehnologije.map(t => (
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
          <div className="sd-sidebar-footer" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="sd-profile-menu">
                <button className="sd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Profil</span>
                </button>

                <button className="sd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); setSettingsOpen(true); setSettingsTab('account'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Postavke</span>
                </button>
              </div>
            )}
            <button className="sd-sb-footer-row" onClick={() => setProfileMenuOpen(v => !v)}>
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

      {settingsOpen ? (
        <div className="sd-settings-page">
          <aside className="sd-settings-sidebar">
            <div className="sd-settings-sidebar-top">
              <button className="sd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Nazad
              </button>
              <span className="sd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="sd-settings-nav">
              <div className="sd-settings-nav-label">Opšte</div>
              <button
                className={`sd-settings-nav-item${settingsTab === 'account' ? ' active' : ''}`}
                onClick={() => setSettingsTab('account')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Račun</span>
              </button>
            </nav>
          </aside>

          <div className="sd-settings-main">
            <div className="sd-settings-content">
              {settingsTab === 'account' && (
                <div className="sd-settings-account">
                  <h3 className="sd-settings-section-title">Račun</h3>
                  <div className="sd-settings-user-info">
                    <div className="sd-settings-avatar">
                      {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                      <div className="sd-settings-username">{user?.username || 'Student'}</div>
                      <div className="sd-settings-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="sd-danger-section">
                    <h4 className="sd-danger-section-title">Deaktivacija računa</h4>
                    <div className="sd-settings-danger-zone">
                      <p className="sd-settings-danger-desc">
                        Deaktivacijom naloga više nećete moći pristupiti platformi. Vaše prijave na prakse bit će automatski povučene.
                      </p>
                      {deactivateError && <p className="sd-settings-error">{deactivateError}</p>}
                      <button className="sd-btn-deactivate" onClick={handleOpenDeactivate}>
                        Deaktiviraj račun
                      </button>
                    </div>
                  </div>
                  <div className="sd-danger-section">
                    <h4 className="sd-danger-section-title">Brisanje računa</h4>
                    <div className="sd-settings-danger-zone">
                      <p className="sd-settings-danger-desc">
                        Brisanjem naloga trajno se uklanjaju svi vaši podaci iz sistema. Ova akcija je nepovratna.
                      </p>
                      {deleteError && <p className="sd-settings-error">{deleteError}</p>}
                      <button className="sd-btn-deactivate" onClick={handleOpenDelete}>
                        Obriši račun
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="sd-container">
          {praksaLoading ? (
            <p className="sd-results-info">Učitavanje oglasa...</p>
          ) : praksaError ? (
            <p className="sd-results-info" style={{ color: 'var(--color-danger, #c0392b)' }}>{praksaError}</p>
          ) : (
            <>
              <p className="sd-results-info">
                {filteredPrakse.length === 0
                  ? 'Nema rezultata'
                  : <><strong>{filteredPrakse.length}</strong> {filteredPrakse.length === 1 ? 'oglas' : 'oglasa'} pronađeno{hasFilters && ' · filtrirano'}</>
                }
              </p>

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
            </>
          )}
        </div>
      )}

      {selectedPraksa && (
        <PraksaModal
          praksa={selectedPraksa}
          onClose={() => setSelectedPraksa(null)}
          darkMode={darkMode}
        />
      )}

      {showDeactivateConfirm && (
        <div className="sd-modal-overlay sd-modal-overlay--top">
          <div className="sd-confirm-modal">
            {deactivateCheck?.canDeactivate === false ? (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Deaktivacija nije moguća</h3>
                <p className="sd-confirm-text">
                  Imate odobrenu praksu kod: <strong>{deactivateCheck.companies.join(', ')}</strong>.
                  Morate se najprije odjaviti s prakse prije deaktivacije naloga.
                </p>
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => setShowDeactivateConfirm(false)}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Deaktivirajte račun</h3>
                <p className="sd-confirm-text">
                  Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom.
                  Samo administrator može ponovo aktivirati vaš nalog.
                </p>
                {deactivateCheck?.pendingApplications?.length > 0 && (
                  <div className="sd-confirm-warn-box">
                    <p className="sd-confirm-warn-label">Sljedeće prijave će biti automatski povučene:</p>
                    <ul className="sd-confirm-app-list">
                      {deactivateCheck.pendingApplications.map((a, i) => (
                        <li key={i}><strong>{a.oglasNaziv}</strong> — {a.kompanijaNaziv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {deactivateError && <p className="sd-settings-error">{deactivateError}</p>}
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => { setShowDeactivateConfirm(false); setDeactivateError(''); }} disabled={deactivating}>
                    Odustani
                  </button>
                  <button className="sd-btn-danger" onClick={handleConfirmDeactivate} disabled={deactivating}>
                    {deactivating ? 'Deaktivacija...' : 'Potvrdi deaktivaciju'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="sd-modal-overlay sd-modal-overlay--top">
          <div className="sd-confirm-modal">
            {deleteCheck?.canDeactivate === false ? (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Brisanje nije moguće</h3>
                <p className="sd-confirm-text">
                  Imate odobrenu praksu kod: <strong>{deleteCheck.companies.join(', ')}</strong>.
                  Morate se najprije odjaviti s prakse prije brisanja naloga.
                </p>
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Obriši nalog</h3>
                <p className="sd-confirm-text">
                  Ova akcija je <strong>trajna i nepovratna</strong>. Svi vaši podaci bit će trajno obrisani sa platforme.
                </p>
                {deleteCheck?.pendingApplications?.length > 0 && (
                  <div className="sd-confirm-warn-box">
                    <p className="sd-confirm-warn-label">Sljedeće prijave će biti automatski povučene:</p>
                    <ul className="sd-confirm-app-list">
                      {deleteCheck.pendingApplications.map((a, i) => (
                        <li key={i}><strong>{a.oglasNaziv}</strong> — {a.kompanijaNaziv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {deleteError && <p className="sd-settings-error">{deleteError}</p>}
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleting}>
                    Odustani
                  </button>
                  <button className="sd-btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                    {deleting ? 'Brisanje...' : 'Obriši nalog'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
