// frontend/src/pages/KompanijaDashboard.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyProfile.service';
import { checkCompanyDeactivation, deactivateCompanyAccount } from '../services/userService';
import './KompanijaDashboard.css';

const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  PROFILE: 'profil',
  EDIT_PROFILE: 'uredi-profil',
  SETTINGS: 'postavke',
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
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { user, logout } = useAuth();

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
    navigate('/');
  }

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkCompanyDeactivation();
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
      await deactivateCompanyAccount();
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

  async function handleSaveCompanyProfile(data) {
    const result = await updateCompanyProfile(data);
    const updatedProfile = getUpdatedCompanyProfile(result, data, companyProfile);
    setCompanyProfile(updatedProfile);
    return updatedProfile;
  }

  return (
    <div className={`cd-layout${darkMode ? ' dark' : ''}`}>

      {/* ── Top navbar ── */}
      <nav className="cd-navbar">
        <span className="cd-navbar-brand">PraksaHub</span>
      </nav>

      <aside className="cd-sidebar">

        {/* Collapsed icon strip */}
        <div className="cd-sidebar-tab">
          <div className="cd-sb-tab-icon" onClick={() => openView(VIEWS.DASHBOARD)} title="Dashboard" style={{cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div className="cd-sb-tab-icon" onClick={() => openView(VIEWS.LISTINGS)} title="Oglasi" style={{cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <div className="cd-sb-tab-icon" onClick={() => openView(VIEWS.PROFILE)} title="Profil" style={{cursor:'pointer'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="cd-sb-tab-footer">
            <div className="cd-sb-tab-icon">
              <div className="cd-nav-avatar cd-sb-tab-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
            </div>
            <div className="cd-sb-tab-icon" onClick={handleLogout} title="Odjava" style={{cursor:'pointer'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded inner */}
        <div className="cd-sidebar-inner">
          <div className="cd-sidebar-scroll">
            <div className="cd-nav-group">
              <div className="cd-nav-label">Pregled</div>
              <nav className="cd-nav">
                <button type="button" className={`cd-nav-item ${view === VIEWS.DASHBOARD ? 'active' : ''}`} onClick={() => openView(VIEWS.DASHBOARD)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  Dashboard
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.LISTINGS ? 'active' : ''}`} onClick={() => openView(VIEWS.LISTINGS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  Oglasi
                </button>
              </nav>
            </div>
            <div className="cd-nav-group">
              <div className="cd-nav-label">Profil</div>
              <nav className="cd-nav">
                <button type="button" className={`cd-nav-item ${view === VIEWS.PROFILE || view === VIEWS.EDIT_PROFILE ? 'active' : ''}`} onClick={() => openView(VIEWS.PROFILE)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profil
                </button>
              </nav>
            </div>
          </div>

          <div className="cd-sidebar-footer" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="cd-profile-menu">
                <button className="cd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); openView(VIEWS.SETTINGS); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  <span>Postavke</span>
                </button>
              </div>
            )}
            <button className="cd-sb-footer-row" onClick={() => setProfileMenuOpen(v => !v)}>
              <div className="cd-nav-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
              <span className="cd-sb-footer-text">{companyName}</span>
            </button>
            <button className="cd-sb-footer-row cd-sb-logout-row" onClick={handleLogout}>
              <svg className="cd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="cd-sb-footer-text">Odjava</span>
            </button>
          </div>{/* end cd-sidebar-footer */}
        </div>{/* end cd-sidebar-inner */}
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
        {view === VIEWS.SETTINGS && (
          <SettingsShell
            user={user}
            onDeactivate={handleOpenDeactivate}
            deactivateError={deactivateError}
          />
        )}
      </main>

      {showDeactivateConfirm && (
        <DeactivateModal
          check={deactivateCheck}
          deactivating={deactivating}
          onConfirm={handleConfirmDeactivate}
          onCancel={handleCancelDeactivate}
        />
      )}
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

function SettingsShell({ user, onDeactivate, deactivateError }) {
  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Postavke</h1>
        <p className="cd-subtitle">Upravljajte podešavanjima vašeg naloga.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Račun</h2>
        </div>
        <div className="cd-settings-user-info">
          <div className="cd-settings-user-name">{user?.ime} {user?.prezime}</div>
          <div className="cd-settings-user-email">{user?.email}</div>
        </div>
        <div className="cd-settings-danger-zone">
          <div className="cd-settings-danger-content">
            <div className="cd-settings-danger-title">Deaktiviraj nalog</div>
            <div className="cd-settings-danger-desc">
              Deaktivacijom naloga gubi se pristup platformi. Aktivni oglasi bez prijava biće automatski zatvoreni. Administrator može ponovo aktivirati nalog.
            </div>
            {deactivateError && (
              <div className="cd-inline-message cd-inline-message--error" role="alert">
                {deactivateError}
              </div>
            )}
            <button type="button" className="cd-btn cd-btn--danger" onClick={onDeactivate}>
              Deaktiviraj nalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function DeactivateModal({ check, deactivating, onConfirm, onCancel }) {
  const isBlocked = check && !check.canDeactivate;
  const oglasiToClose = check?.oglasiToClose || [];

  return (
    <div className="cd-modal-overlay" role="dialog" aria-modal="true">
      <div className="cd-confirm-modal">
        {isBlocked ? (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--warn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 className="cd-confirm-title">Deaktivacija nije moguća</h3>
            <p className="cd-confirm-text">
              Vaši oglasi imaju aktivne prijave. Zatvorite sve oglase sa prijavama prije deaktivacije naloga.
            </p>
            <ul className="cd-confirm-app-list">
              {(check.oglasi || []).map((naziv, i) => <li key={i}>{naziv}</li>)}
            </ul>
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel}>Zatvori</button>
            </div>
          </>
        ) : (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 className="cd-confirm-title">Deaktivirajte račun</h3>
            <p className="cd-confirm-text">
              Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom.
              Samo administrator može ponovo aktivirati vaš nalog.
            </p>
            {oglasiToClose.length > 0 && (
              <div className="cd-confirm-warn-box">
                <p className="cd-confirm-warn-label">Sljedeći aktivni oglasi bit će automatski zatvoreni:</p>
                <ul className="cd-confirm-app-list">
                  {oglasiToClose.map((naziv, i) => <li key={i}>{naziv}</li>)}
                </ul>
              </div>
            )}
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={deactivating}>Odustani</button>
              <button type="button" className="cd-btn cd-btn--danger" onClick={onConfirm} disabled={deactivating}>
                {deactivating ? 'Deaktivacija...' : 'Deaktiviraj nalog'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
