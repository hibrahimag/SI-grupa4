// frontend/src/pages/KompanijaDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyProfile.service';
import './KompanijaDashboard.css';
import { createListing, getCompanyListings } from '../services/listingsService';


const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  PROFILE: 'profil',
  EDIT_PROFILE: 'uredi-profil',
  CREATE_LISTING: 'create-oglas',
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
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const companyName = companyProfile?.naziv || user?.institution || user?.ime || 'Kompanija';
  const accountStatus = getAccountStatusDisplay(user?.status);

  useEffect(() => {
    let active = true;

    async function loadCompanyData() {
      setProfileLoading(true);
      setListingsLoading(true);
      setProfileError('');
      setListingsError('');
      try {
        const [profile, companyListings] = await Promise.all([
          getCompanyProfile(),
          getCompanyListings(),
        ]);
        if (active) {
          setCompanyProfile(profile);
          setListings(Array.isArray(companyListings) ? companyListings : []);
        }
      } catch (err) {
        if (active) setListingsError(err.message || 'Greska pri ucitavanju oglasa.');
        if (active) setProfileError(err.message || 'Greška pri učitavanju profila kompanije.');
      } finally {
        if (active) {
          setProfileLoading(false);
          setListingsLoading(false);
        }
      }
    }

    loadCompanyData();

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
            listings={listings}
            listingsLoading={listingsLoading}
            listingsError={listingsError}
            onOpenView={openView}
          />
        )}
        {view === VIEWS.LISTINGS && (
         <ListingsShell listings={listings} loading={listingsLoading} error={listingsError} onOpenView={openView} />
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

        {view === VIEWS.CREATE_LISTING && (
          <CreateListingShell
            onCancel={() => openView(VIEWS.LISTINGS)}
            onCreated={(listing) => {
              if (listing) {
                setListings((current) => [listing, ...current]);
              }
              openView(VIEWS.LISTINGS);
            }}
          />
         )}
      </main>
    </div>
  );
}

function DashboardShell({ companyName, accountStatus, listings, listingsLoading, listingsError, onOpenView }) {
  const activeListings = listings.filter((listing) => listing.status === 'AKTIVAN').length;
  const stats = [
    {
      label: 'Aktivni oglasi',
      value: listingsLoading ? '...' : String(activeListings),
      sub: activeListings === 1 ? '1 aktivan oglas' : `${activeListings} aktivnih oglasa`,
      tone: 'blue',
    },
    {
      label: 'Ukupno oglasa',
      value: listingsLoading ? '...' : String(listings.length),
      sub: listings.length === 1 ? '1 kreiran oglas' : `${listings.length} kreiranih oglasa`,
      tone: 'muted',
    },
    { label: 'Rola', value: 'COMPANY', sub: accountStatus.label, tone: accountStatus.tone, compact: true },
  ];

  const quickActions = [
   // { label: 'Kreiraj oglas', desc: 'Pripremite novi oglas za praksu' },
    { label: 'Kreiraj oglas', desc: 'Pripremite novi oglas za praksu', view: VIEWS.CREATE_LISTING },
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

      <ListingsShell listings={listings} loading={listingsLoading} error={listingsError} onOpenView={onOpenView} />
    </div>
  );
}

function ListingsShell({ listings = [], loading = false, error = '', onOpenView }) {
  return (
    <section className="cd-section">
      <div className="cd-section-header">
        <h2 className="cd-section-title">Moji oglasi</h2>
        <span className="cd-section-count">{listings.length} {listings.length === 1 ? 'oglas' : 'oglasa'}</span>
      </div>
      {loading && <div className="cd-inline-message" role="status">Ucitavanje oglasa...</div>}
      {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}
      {!loading && !error && listings.length > 0 && (
        <div className="cd-listings-list">
          {listings.map((listing) => (
            <article key={listing.id} className="cd-listing-card">
              <div className="cd-listing-main">
                <h3 className="cd-listing-title">{listing.naziv}</h3>
                <p className="cd-listing-desc">{listing.opis}</p>
                <div className="cd-listing-meta">
                  <span>{listing.oblast || 'Oblast nije unesena'}</span>
                  <span>{listing.trajanje || 'Trajanje nije uneseno'}</span>
                  <span>{listing.brojMjesta} {Number(listing.brojMjesta) === 1 ? 'mjesto' : 'mjesta'}</span>
                </div>
              </div>
              <div className="cd-listing-side">
                <span className={`cd-listing-status cd-listing-status--${String(listing.status || '').toLowerCase()}`}>
                  {listing.status || 'Status'}
                </span>
                <span className="cd-listing-date">Rok: {formatListingDate(listing.rokPrijave)}</span>
                <span className="cd-listing-date">Objava: {formatListingDate(listing.datumObjave)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && listings.length === 0 && (
      <div className="cd-empty-state">
        <div className="cd-empty-title">Još nemate kreiranih oglasa.</div>
        <p className="cd-empty-text">
          Kada oglas bude kreiran, pojavit će se u ovom pregledu za kompaniju.
        </p>
        <button type="button" className="cd-btn cd-btn--primary"  onClick={() => onOpenView(VIEWS.CREATE_LISTING)}> 
          Kreiraj prvi oglas
        </button>
      </div>
      )}
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


function CreateListingShell({ onCancel, onCreated }) {
  const [formData, setFormData] = useState({
    naziv: '',
    opis: '',
    brojMjesta: '',
    rokPrijave: '',
    trajanje: '',
    oblast: '',
    placenaPraksa: false,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.naziv || !formData.opis || !formData.brojMjesta || !formData.rokPrijave) {
      setError('Naziv, opis, broj mjesta i rok prijave su obavezni.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // 🔹 Ovdje pozovi API kada povežeš backend
      const result = await createListing({
        ...formData,
        brojMjesta: Number(formData.brojMjesta),
      });

      setSuccess('Oglas je uspješno kreiran.');
      setFormData({
        naziv: '',
        opis: '',
        brojMjesta: '',
        rokPrijave: '',
        trajanje: '',
        oblast: '',
        placenaPraksa: false,
      });
      onCreated(result?.oglas || result);
    } catch (err) {
      setError('Greška pri kreiranju oglasa.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Kreiraj oglas</h1>
        <p className="cd-subtitle">Unesite podatke za novi oglas za praksu.</p>
      </header>

      <section className="cd-section">
        <form className="cd-profile-form" onSubmit={handleSubmit}>
          {error && (
            <div className="cd-inline-message cd-inline-message--error">
              {error}
            </div>
          )}

          {success && (
            <div className="cd-inline-message cd-inline-message--success">
              {success}
            </div>
          )}

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Naziv oglasa</label>
              <input
                className="cd-input"
                type="text"
                value={formData.naziv}
                onChange={(e) => handleChange('naziv', e.target.value)}
              />
            </div>

            <div className="cd-form-field">
              <label className="cd-form-label">Broj mjesta</label>
              <input
                className="cd-input"
                type="number"
                value={formData.brojMjesta}
                onChange={(e) => handleChange('brojMjesta', e.target.value)}
              />
            </div>
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Opis</label>
            <textarea
              className="cd-textarea"
              rows={4}
              value={formData.opis}
              onChange={(e) => handleChange('opis', e.target.value)}
            />
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Rok prijave</label>
              <input
                className="cd-input"
                type="date"
                value={formData.rokPrijave}
                onChange={(e) => handleChange('rokPrijave', e.target.value)}
              />
            </div>

            <div className="cd-form-field">
              <label className="cd-form-label">Trajanje</label>
              <input
                className="cd-input"
                type="text"
                value={formData.trajanje}
                onChange={(e) => handleChange('trajanje', e.target.value)}
              />
            </div>
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Oblast</label>
              <input
                className="cd-input"
                type="text"
                value={formData.oblast}
                onChange={(e) => handleChange('oblast', e.target.value)}
              />
            </div>

            <div className="cd-form-field" style={{ justifyContent: 'flex-end' }}>
              <label className="cd-form-label">Plaćena praksa</label>
              <input
                type="checkbox"
                checked={formData.placenaPraksa}
                onChange={(e) => handleChange('placenaPraksa', e.target.checked)}
              />
            </div>
          </div>

          <div className="cd-form-actions">
            <button
              type="submit"
              className="cd-btn cd-btn--primary"
              disabled={saving}
            >
              {saving ? 'Kreiranje...' : 'Objavi oglas'}
            </button>

            <button
              type="button"
              className="cd-btn cd-btn--secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Nazad
            </button>
          </div>
        </form>
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

function formatListingDate(value) {
  if (!value) return 'Nije uneseno';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Nije uneseno';

  return date.toLocaleDateString('bs-BA');
}
