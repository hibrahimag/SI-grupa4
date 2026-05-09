// frontend/src/pages/KompanijaDashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './KompanijaDashboard.css';

const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  PROFILE: 'profil',
  EDIT_PROFILE: 'uredi-profil',
};

export default function KompanijaDashboard() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const companyName = user?.institution || user?.ime || 'Kompanija';
  const profileStatus = user?.email && companyName !== 'Kompanija' ? 'Profil aktivan' : 'Profil u pripremi';

  function openView(nextView) {
    setView(nextView);
    setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
    navigate('/auth', { replace: true });
  }

  return (
    <div className={`cd-layout${darkMode ? ' dark' : ''}`}>
      <aside className={`cd-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="cd-logo">
          <img src="/logo2.png" alt="PraksaHub" />
          <div className="cd-logo-sub">Kompanija panel</div>
        </div>

        <button
          type="button"
          className="cd-sidebar-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? 'Zatvori navigaciju' : 'Otvori navigaciju'}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="cd-nav-group">
          <div className="cd-nav-label">Pregled</div>
          <nav className="cd-nav">
            <button
              type="button"
              className={`cd-nav-item ${view === VIEWS.DASHBOARD ? 'active' : ''}`}
              onClick={() => openView(VIEWS.DASHBOARD)}
            >
              Dashboard
            </button>
            <button
              type="button"
              className={`cd-nav-item ${view === VIEWS.LISTINGS ? 'active' : ''}`}
              onClick={() => openView(VIEWS.LISTINGS)}
            >
              Oglasi
            </button>
          </nav>
        </div>

        <div className="cd-nav-group">
          <div className="cd-nav-label">Nalog</div>
          <nav className="cd-nav">
            <button
              type="button"
              className={`cd-nav-item ${view === VIEWS.PROFILE || view === VIEWS.EDIT_PROFILE ? 'active' : ''}`}
              onClick={() => openView(VIEWS.PROFILE)}
            >
              Profil
            </button>
            <button type="button" className="cd-nav-item cd-nav-item--logout" onClick={handleLogout}>
              Odjava
            </button>
          </nav>
        </div>
      </aside>

      <main className="cd-main">
        {view === VIEWS.DASHBOARD && (
          <DashboardShell
            companyName={companyName}
            profileStatus={profileStatus}
            onOpenView={openView}
          />
        )}
        {view === VIEWS.LISTINGS && (
          <ListingsShell />
        )}
        {view === VIEWS.PROFILE && (
          <ProfileShell
            user={user}
            companyName={companyName}
            profileStatus={profileStatus}
            onEdit={() => openView(VIEWS.EDIT_PROFILE)}
          />
        )}
        {view === VIEWS.EDIT_PROFILE && <EditProfileShell companyName={companyName} />}
      </main>
    </div>
  );
}

function DashboardShell({ companyName, profileStatus, onOpenView }) {
  const stats = [
    { label: 'Aktivni oglasi', value: '0', sub: 'Nema aktivnih oglasa', tone: 'blue' },
    { label: 'Ukupno oglasa', value: '0', sub: 'Nema kreiranih oglasa', tone: 'muted' },
    { label: 'Status profila', value: profileStatus, sub: companyName, tone: 'green' },
  ];

  const quickActions = [
    { label: 'Kreiraj oglas', desc: 'Pripremite novi oglas za praksu' },
    { label: 'Moji oglasi', desc: 'Pregled oglasa kompanije', view: VIEWS.LISTINGS },
    { label: 'Profil kompanije', desc: 'Osnovni podaci naloga', view: VIEWS.PROFILE },
    { label: 'Uredi profil', desc: 'Priprema izmjene podataka', view: VIEWS.EDIT_PROFILE },
  ];

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Dashboard kompanije</h1>
        <p className="cd-subtitle">
          Upravljajte profilom kompanije i oglasima za stručnu praksu iz jednog pregleda.
        </p>
      </header>

      <section className="cd-stats-grid" aria-label="Sažetak kompanije">
        {stats.map((stat) => (
          <article key={stat.label} className="cd-stat-card">
            <span className="cd-stat-label">{stat.label}</span>
            <span className="cd-stat-value">{stat.value}</span>
            <span className={`cd-stat-sub cd-stat-sub--${stat.tone}`}>{stat.sub}</span>
          </article>
        ))}
      </section>

      <section className="cd-action-grid" aria-label="Brze akcije">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`cd-action-card ${action.view ? '' : 'cd-action-card--inactive'}`}
            onClick={action.view ? () => onOpenView(action.view) : undefined}
            aria-disabled={action.view ? undefined : 'true'}
          >
            <span className="cd-action-title">{action.label}</span>
            <span className="cd-action-desc">{action.desc}</span>
          </button>
        ))}
      </section>

      <ListingsShell />
    </div>
  );
}

function ListingsShell() {
  return (
    <section className="cd-section">
      <div className="cd-section-header">
        <h2 className="cd-section-title">Moji oglasi</h2>
        <span className="cd-section-count">0 oglasa</span>
      </div>
      <div className="cd-empty-state">
        <div className="cd-empty-title">Još nemate kreiranih oglasa.</div>
        <p className="cd-empty-text">
          Kada oglas bude kreiran, pojavit će se u ovom pregledu za kompaniju.
        </p>
        <button type="button" className="cd-btn cd-btn--primary" disabled>
          Kreiraj prvi oglas
        </button>
      </div>
    </section>
  );
}

function ProfileShell({ user, companyName, profileStatus, onEdit }) {
  const fields = [
    { label: 'Naziv', value: companyName },
    { label: 'Email', value: user?.email || 'Nije dostupno' },
    { label: 'Korisničko ime', value: user?.username || 'Nije dostupno' },
    { label: 'Institucija', value: user?.institution || 'Nije dostupno' },
    { label: 'Status naloga', value: user?.status || 'Nije dostupno' },
    { label: 'Profil', value: profileStatus },
  ];

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Profil kompanije</h1>
        <p className="cd-subtitle">Osnovni podaci povezani s prijavljenim kompanijskim nalogom.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Podaci profila</h2>
          <button type="button" className="cd-btn cd-btn--secondary" onClick={onEdit}>
            Uredi profil
          </button>
        </div>
        <div className="cd-profile-grid">
          {fields.map((field) => (
            <div key={field.label} className="cd-profile-field">
              <span className="cd-profile-label">{field.label}</span>
              <span className="cd-profile-value">{field.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EditProfileShell({ companyName }) {
  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Uredi profil</h1>
        <p className="cd-subtitle">Pregled informacija koje opisuju profil kompanije.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Informacije kompanije</h2>
          <span className="cd-section-count">Profil</span>
        </div>
        <div className="cd-placeholder-form" aria-label="Informacije profila kompanije">
          <div className="cd-form-row">
            <div className="cd-form-field">
              <span className="cd-form-label">Naziv kompanije</span>
              <div className="cd-input-shell">{companyName}</div>
            </div>
            <div className="cd-form-field">
              <span className="cd-form-label">Kontakt osoba</span>
              <div className="cd-input-shell">Nije uneseno</div>
            </div>
          </div>
          <div className="cd-form-row">
            <div className="cd-form-field">
              <span className="cd-form-label">Adresa</span>
              <div className="cd-input-shell">Nije uneseno</div>
            </div>
            <div className="cd-form-field">
              <span className="cd-form-label">Telefon</span>
              <div className="cd-input-shell">Nije uneseno</div>
            </div>
          </div>
          <div className="cd-form-field">
            <span className="cd-form-label">Opis poslovanja</span>
            <div className="cd-textarea-shell">Kratak opis kompanije.</div>
          </div>
          <div className="cd-inline-note">Izmjene profila trenutno nisu dostupne.</div>
        </div>
      </section>
    </div>
  );
}
