// frontend/src/pages/KompanijaDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyProfile.service';
import './KompanijaDashboard.css';

const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  PROFILE: 'profil',
  EDIT_PROFILE: 'uredi-profil',
};

const EMPTY_PROFILE = {
  naziv: '',
  opisPoslovanja: '',
  djelatnost: '',
  adresa: '',
  telefon: '',
  kontaktOsoba: '',
};

const PROFILE_FIELDS = ['naziv', 'opisPoslovanja', 'djelatnost', 'adresa', 'telefon', 'kontaktOsoba'];

export default function KompanijaDashboard() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const companyName = companyProfile?.naziv || user?.institution || user?.ime || 'Kompanija';
  const accountStatus = getAccountStatusDisplay(user?.status);

  useEffect(() => {
    let active = true;

    async function loadCompanyProfile() {
      setProfileLoading(true);
      setProfileError('');
      try {
        const profile = await getCompanyProfile();
        if (active) setCompanyProfile(profile);
      } catch (err) {
        if (active) setProfileError(err.message || 'Greška pri učitavanju profila kompanije.');
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadCompanyProfile();

    return () => {
      active = false;
    };
  }, []);

  function openView(nextView) {
    setView(nextView);
    setSidebarOpen(false);
  }

  function handleLogout() {
    logout();
    navigate('/auth', { replace: true });
  }

  async function handleSaveCompanyProfile(data) {
    const result = await updateCompanyProfile(data);
    const updatedProfile = getUpdatedCompanyProfile(result, data, companyProfile);
    setCompanyProfile(updatedProfile);
    return updatedProfile;
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
          <div className="cd-nav-label">Profil</div>
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
            accountStatus={accountStatus}
            onOpenView={openView}
          />
        )}
        {view === VIEWS.LISTINGS && (
          <ListingsShell />
        )}
        {view === VIEWS.PROFILE && (
          <ProfileShell
            profile={companyProfile}
            loading={profileLoading}
            error={profileError}
            onEdit={() => openView(VIEWS.EDIT_PROFILE)}
          />
        )}
        {view === VIEWS.EDIT_PROFILE && (
          <EditProfileShell
            profile={companyProfile}
            loading={profileLoading}
            error={profileError}
            onSave={handleSaveCompanyProfile}
            onCancel={() => openView(VIEWS.PROFILE)}
          />
        )}
      </main>
    </div>
  );
}

function DashboardShell({ companyName, accountStatus, onOpenView }) {
  const stats = [
    { label: 'Aktivni oglasi', value: '0', sub: 'Nema aktivnih oglasa', tone: 'blue' },
    { label: 'Ukupno oglasa', value: '0', sub: 'Nema kreiranih oglasa', tone: 'muted' },
    { label: 'Rola', value: 'COMPANY', sub: accountStatus.label, tone: accountStatus.tone, compact: true },
  ];

  const quickActions = [
    { label: 'Kreiraj oglas', desc: 'Pripremite novi oglas za praksu' },
    { label: 'Moji oglasi', desc: 'Pregled oglasa kompanije', view: VIEWS.LISTINGS },
    { label: 'Profil kompanije', desc: 'Osnovni podaci kompanije', view: VIEWS.PROFILE },
    { label: 'Uredi profil', desc: 'Izmjena podataka profila', view: VIEWS.EDIT_PROFILE },
  ];

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Dashboard kompanije</h1>
        <p className="cd-company-name">{companyName}</p>
        <p className="cd-subtitle">
          Upravljajte profilom kompanije i oglasima za praksu.
        </p>
      </header>

      <section className="cd-stats-grid" aria-label="Sažetak kompanije">
        {stats.map((stat) => (
          <article key={stat.label} className={`cd-stat-card${stat.compact ? ' cd-stat-card--compact' : ''}`}>
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

function ProfileShell({ profile, loading, error, onEdit }) {
  const fields = [
    { label: 'Naziv kompanije', value: profile?.naziv },
    { label: 'Opis kompanije', value: profile?.opisPoslovanja },
    { label: 'Djelatnost', value: profile?.djelatnost },
    { label: 'Adresa', value: profile?.adresa },
    { label: 'Telefon', value: profile?.telefon },
    { label: 'Kontakt osoba', value: profile?.kontaktOsoba },
  ];

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Profil kompanije</h1>
        <p className="cd-subtitle">Osnovni podaci profila kompanije.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Podaci profila</h2>
          <button type="button" className="cd-btn cd-btn--secondary" onClick={onEdit}>
            Uredi profil
          </button>
        </div>
        {loading && <div className="cd-inline-message" role="status">Učitavanje profila kompanije...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}
        {!loading && !error && (
          <div className="cd-profile-grid">
            {fields.map((field) => (
              <div key={field.label} className="cd-profile-field">
                <span className="cd-profile-label">{field.label}</span>
                <span className="cd-profile-value">{displayValue(field.value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EditProfileShell({ profile, loading, error, onSave, onCancel }) {
  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(profileToForm(profile));
    setFieldErrors({});
    setSaveError('');
    setSaveMessage('');
  }, [profile]);

  function handleChange(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: false }));
    }
    setSaveError('');
    setSaveMessage('');
  }

  function validate() {
    const nextErrors = {};
    if (!formData.naziv.trim()) nextErrors.naziv = true;
    if (!formData.adresa.trim()) nextErrors.adresa = true;
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSaveError('Naziv kompanije i adresa su obavezni.');
      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveError('');
    setSaveMessage('');
    try {
      const payload = normalizeCompanyProfilePayload(formData);
      const updatedProfile = await onSave(payload);
      setFormData(profileToForm(updatedProfile));
      setSaveMessage('Profil kompanije je uspješno sačuvan.');
    } catch (err) {
      setSaveError(err.message || 'Greška pri čuvanju profila kompanije.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Uredi profil</h1>
        <p className="cd-subtitle">Ažurirajte osnovne informacije profila kompanije.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Informacije kompanije</h2>
          <span className="cd-section-count">Profil</span>
        </div>
        {loading && <div className="cd-inline-message" role="status">Učitavanje profila kompanije...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}
        {!loading && !error && (
          <form className="cd-profile-form" aria-label="Informacije profila kompanije" onSubmit={handleSubmit}>
            {saveError && <div className="cd-inline-message cd-inline-message--error" role="alert">{saveError}</div>}
            {saveMessage && <div className="cd-inline-message cd-inline-message--success" role="status">{saveMessage}</div>}

            <div className="cd-form-row">
              <ProfileInput
                label="Naziv kompanije"
                field="naziv"
                value={formData.naziv}
                error={fieldErrors.naziv}
                onChange={handleChange}
              />
              <ProfileInput
                label="Djelatnost"
                field="djelatnost"
                value={formData.djelatnost}
                onChange={handleChange}
              />
            </div>

            <div className="cd-form-row">
              <ProfileInput
                label="Adresa"
                field="adresa"
                value={formData.adresa}
                error={fieldErrors.adresa}
                onChange={handleChange}
              />
              <ProfileInput
                label="Telefon"
                field="telefon"
                value={formData.telefon}
                onChange={handleChange}
              />
            </div>

            <ProfileInput
              label="Kontakt osoba"
              field="kontaktOsoba"
              value={formData.kontaktOsoba}
              onChange={handleChange}
            />

            <div className="cd-form-field">
              <label className="cd-form-label" htmlFor="company-opisPoslovanja">Opis kompanije</label>
              <textarea
                id="company-opisPoslovanja"
                className="cd-textarea"
                value={formData.opisPoslovanja}
                onChange={(event) => handleChange('opisPoslovanja', event.target.value)}
                rows={5}
              />
            </div>

            <div className="cd-form-actions">
              <button type="submit" className="cd-btn cd-btn--primary" disabled={saving}>
                {saving ? 'Čuvanje...' : 'Sačuvaj promjene'}
              </button>
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={saving}>
                Odustani
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ProfileInput({ label, field, value, error = false, onChange }) {
  const inputId = `company-${field}`;

  return (
    <div className="cd-form-field">
      <label className="cd-form-label" htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={`cd-input${error ? ' cd-input--error' : ''}`}
        type="text"
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </div>
  );
}

function profileToForm(profile) {
  return {
    naziv: profile?.naziv || '',
    opisPoslovanja: profile?.opisPoslovanja || '',
    djelatnost: profile?.djelatnost || '',
    adresa: profile?.adresa || '',
    telefon: profile?.telefon || '',
    kontaktOsoba: profile?.kontaktOsoba || '',
  };
}

function normalizeCompanyProfilePayload(data) {
  return {
    naziv: normalizeProfileString(data?.naziv),
    opisPoslovanja: normalizeOptionalProfileString(data?.opisPoslovanja),
    djelatnost: normalizeOptionalProfileString(data?.djelatnost),
    adresa: normalizeProfileString(data?.adresa),
    telefon: normalizeOptionalProfileString(data?.telefon),
    kontaktOsoba: normalizeOptionalProfileString(data?.kontaktOsoba),
  };
}

function normalizeProfileString(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function normalizeOptionalProfileString(value) {
  const normalized = normalizeProfileString(value);
  return normalized || null;
}

function getUpdatedCompanyProfile(result, submittedData, currentProfile) {
  if (isCompanyProfileObject(result?.profile)) {
    return result.profile;
  }

  if (isCompanyProfileObject(result)) {
    return result;
  }

  return {
    ...(currentProfile || {}),
    ...submittedData,
  };
}

function isCompanyProfileObject(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      PROFILE_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(value, field))
  );
}

function getAccountStatusDisplay(status) {
  const normalizedStatus = String(status || '').toUpperCase();

  if (normalizedStatus === 'ACTIVE') {
    return { label: 'Aktivno', tone: 'green' };
  }

  if (normalizedStatus === 'DEACTIVATED') {
    return { label: 'Deaktivirano', tone: 'red' };
  }

  return { label: 'Nepoznato', tone: 'muted' };
}

function displayValue(value) {
  return value && String(value).trim() ? value : 'Nije uneseno';
}
