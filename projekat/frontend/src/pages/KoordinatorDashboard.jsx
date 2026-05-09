// KoordinatorDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { koordinatorService } from '../services/koordinatorService';
import PrijavePregled from '../modules/koordinator/PrijavePregled';
import PraksePregled from '../modules/koordinator/PraksePregled';
import StudentListaPregled from '../modules/koordinator/StudentListaPregled';
import OdobravanjePregled from '../modules/koordinator/OdobravanjePregled';
import './KoordinatorDashboard.css';

const IconMoon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSun = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const TABS = [
  { id: 'prijave',      label: 'Prijave na čekanju' },
  { id: 'sve',          label: 'Sve prijave'         },
  { id: 'prakse',       label: 'Aktivne prakse'      },
  { id: 'studenti',     label: 'Studenti'             },
  { id: 'odobravanje',  label: 'Odobravanje naloga'  },
];

export default function KoordinatorDashboard() {
  const { user, logout }          = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const navigate                  = useNavigate();
  const [aktivan, setAktivan]     = useState('prijave');
  const [stats, setStats]         = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const ucitajStats = useCallback(() => {
    setLoadingStats(true);
    koordinatorService.getDashboardStats()
      .then(res => res.success && setStats(res.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => { ucitajStats(); }, [ucitajStats]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`kd-root${darkMode ? ' kd-dark' : ''}`}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="kd-navbar">
  <div className="kd-navbar-inner">
    <div className="kd-navbar-left">
      <Link to="/" className="kd-navbar-logo">
        <img src="/logo2.png" alt="PraksaHub" style={{ height: 48 }} />
      </Link>
      <div className="kd-navbar-divider" />
      <div className="kd-navbar-title-block">
        <span className="kd-navbar-title">Koordinatorski panel</span>
        <span className="kd-navbar-subtitle">Upravljanje prijavama i praćenje toka studentskih praksi</span>
      </div>
    </div>
    <div className="kd-navbar-right">
      <button
        className="kd-navbar-theme-btn"
        onClick={() => setDarkMode(!darkMode)}
        title="Promijeni temu"
      >
        {darkMode
          ? <IconSun  size={17} color={darkMode ? '#f9fafb' : '#3a5a8a'} />
          : <IconMoon size={17} color={darkMode ? '#f9fafb' : '#3a5a8a'} />
        }
      </button>
      <span className="kd-navbar-user">
        {user?.ime} {user?.prezime}
        <span className="kd-navbar-role-chip">Koordinator</span>
      </span>
      <button className="kd-btn kd-btn--ghost kd-btn--sm" onClick={handleLogout}>
        Odjavi se
      </button>
    </div>
  </div>
</nav>

      {/* ── Stats strip ────────────────────────────────────── */}
      <section className="kd-stats-strip">
        <StatCard label="Na čekanju"     value={stats?.podnesene}     color="warning" loading={loadingStats} onClick={() => setAktivan('prijave')} clickable />
        <StatCard label="Odobreno"       value={stats?.odobrene}      color="success" loading={loadingStats} />
        <StatCard label="Odbijeno"       value={stats?.odbijene}      color="danger"  loading={loadingStats} />
        <StatCard label="Aktivne prakse" value={stats?.aktivnePrakse} color="primary" loading={loadingStats} onClick={() => setAktivan('prakse')} clickable />
        <StatCard label="Završene"       value={stats?.zavrsene}      color="purple"  loading={loadingStats} />
      </section>

      {/* ── Tab nav ────────────────────────────────────────── */}
      <nav className="kd-tab-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`kd-tab-btn${aktivan === t.id ? ' kd-tab-btn--active' : ''}`}
            onClick={() => setAktivan(t.id)}
          >
            {t.label}
            {t.id === 'prijave' && stats?.podnesene > 0 && (
              <span className="kd-badge">{stats.podnesene}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Content ────────────────────────────────────────── */}
      <main className="kd-content">
        {aktivan === 'prijave'     && <PrijavePregled filterStatus="PODNESENA" onOdluka={ucitajStats} />}
        {aktivan === 'sve'         && <PrijavePregled filterStatus="" onOdluka={ucitajStats} />}
        {aktivan === 'prakse'      && <PraksePregled />}
        {aktivan === 'studenti'    && <StudentListaPregled />}
        {aktivan === 'odobravanje' && <OdobravanjePregled />}
      </main>
    </div>
  );
}

function StatCard({ label, value, color, loading, onClick, clickable }) {
  return (
    <div
      className={`kd-stat-card kd-stat-card--${color}${clickable ? ' kd-stat-card--clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <span className="kd-stat-value">
        {loading ? <span className="kd-skeleton-inline" /> : (value ?? '—')}
      </span>
      <span className="kd-stat-label">{label}</span>
    </div>
  );
}