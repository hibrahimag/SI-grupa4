// KoordinatorDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { koordinatorService } from '../services/koordinatorService';
import { checkCoordinatorDeactivation, deactivateCoordinatorAccount } from '../services/userService';
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
  const [aktivan, setAktivan]         = useState('prijave');
  const [stats, setStats]             = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [profileMenuOpen, setProfileMenuOpen]   = useState(false);
  const [deactivateCheck, setDeactivateCheck]   = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating]         = useState(false);
  const [deactivateError, setDeactivateError]   = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClick(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

  const ucitajStats = useCallback(() => {
    setLoadingStats(true);
    koordinatorService.getDashboardStats()
      .then(res => res.success && setStats(res.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => { ucitajStats(); }, [ucitajStats]);

  const handleLogout = () => { logout(); navigate('/'); };

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkCoordinatorDeactivation();
      setDeactivateCheck(result);
      setShowDeactivateConfirm(true);
    } catch (err) {
      setDeactivateError(err.message || 'Greška pri provjeri statusa naloga.');
    }
  }

  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError('');
    try {
      await deactivateCoordinatorAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeactivating(false);
      setDeactivateError(err.message || 'Greška pri deaktivaciji naloga.');
    }
  }

  function handleCancelDeactivate() {
    setShowDeactivateConfirm(false);
    setDeactivateCheck(null);
    setDeactivateError('');
  }

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
      <div className="kd-navbar-user-area" ref={profileMenuRef}>
        {profileMenuOpen && (
          <div className="kd-profile-menu">
            <button className="kd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); setSettingsOpen(true); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Postavke</span>
            </button>
          </div>
        )}
        <button className="kd-navbar-user" onClick={() => setProfileMenuOpen(v => !v)}>
          {user?.ime} {user?.prezime}
        </button>
        <span className="kd-navbar-role-chip">Koordinator</span>
      </div>
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

      {settingsOpen && (
        <div className="kd-settings-page">
          <aside className="kd-settings-sidebar">
            <div className="kd-settings-sidebar-top">
              <button className="kd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Nazad
              </button>
              <span className="kd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="kd-settings-nav">
              <div className="kd-settings-nav-label">Opšte</div>
              <button className="kd-settings-nav-item active">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Račun</span>
              </button>
            </nav>
          </aside>

          <div className="kd-settings-main">
            <div className="kd-settings-content">
              <h2 className="kd-settings-heading">Račun</h2>
              <div className="kd-settings-user-info">
                <div className="kd-settings-user-name">{user?.ime} {user?.prezime}</div>
                <div className="kd-settings-user-email">{user?.email}</div>
              </div>
              <div className="kd-settings-danger-zone">
                <div className="kd-settings-danger-title">Deaktiviraj nalog</div>
                <div className="kd-settings-danger-desc">
                  Deaktivacijom naloga gubi se pristup platformi. Prijave koje su vam dodijeljene ostaće trenutno bez koordinatora. Administrator može ponovo aktivirati nalog.
                </div>
                {deactivateError && (
                  <div className="kd-settings-error" role="alert">{deactivateError}</div>
                )}
                <button className="kd-settings-danger-btn" onClick={handleOpenDeactivate}>
                  Deaktiviraj nalog
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeactivateConfirm && (
        <div className="kd-modal-overlay" role="dialog" aria-modal="true">
          <div className="kd-confirm-modal">
            {deactivateCheck?.canDeactivate === false ? (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Deaktivacija nije moguća</h3>
                <p className="kd-confirm-text">
                  Imate aktivne prakse u toku. Morate ih riješiti prije deaktivacije naloga.
                </p>
                <ul className="kd-confirm-app-list">
                  {(deactivateCheck.studenti || []).map((ime, i) => <li key={i}>{ime}</li>)}
                </ul>
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={handleCancelDeactivate}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Deaktivirajte račun</h3>
                <p className="kd-confirm-text">
                  Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom.
                  Samo administrator može ponovo aktivirati vaš nalog.
                </p>
                {deactivateCheck?.pendingCount > 0 && (
                  <div className="kd-confirm-warn-box">
                    <p className="kd-confirm-warn-label">
                      {deactivateCheck.pendingCount} {deactivateCheck.pendingCount === 1 ? 'prijava' : 'prijave'} ostaće trenutno bez koordinatora.
                    </p>
                  </div>
                )}
                {deactivateError && <p className="kd-settings-error" role="alert">{deactivateError}</p>}
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={handleCancelDeactivate} disabled={deactivating}>Odustani</button>
                  <button className="kd-confirm-btn kd-confirm-btn--danger" onClick={handleConfirmDeactivate} disabled={deactivating}>
                    {deactivating ? 'Deaktivacija...' : 'Deaktiviraj nalog'}
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