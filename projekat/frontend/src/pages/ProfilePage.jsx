// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateStudentProfile } from '../services/api';
import './ProfilePage.css';

const ROLE_LABELS = {
  STUDENT:     'Student',
  COMPANY:     'Kompanija',
  COORDINATOR: 'Koordinator',
  ADMIN:       'Administrator',
};

const ROLE_ROUTES = {
  STUDENT:     '/dashboard/student',
  COMPANY:     '/dashboard/company',
  COORDINATOR: '/dashboard/coordinator',
  ADMIN:       '/admin',
};

const STATUS_LABELS = {
  ACTIVE:      'Aktivan',
  PENDING:     'Na čekanju',
  DEACTIVATED: 'Deaktiviran',
};

function IconWarning() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return <div className={`pf-toast pf-toast--${type}`}>{message}</div>;
}

const EMPTY_FORM = {
  ime: '', prezime: '', email: '',
  currentPassword: '', newPassword: '', confirmPassword: '',
};

export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const [profile,   setProfile]  = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [pageError, setPageError] = useState('');
  const [editMode,  setEditMode] = useState(false);
  const [saving,    setSaving]   = useState(false);
  const [toast,     setToast]    = useState(null);
  const [form,      setForm]     = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!authUser) { navigate('/auth', { replace: true }); return; }
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setPageError('');
    try {
      const data = await getMyProfile();
      setProfile(data);
      setForm({
        ime:             data.ime      || '',
        prezime:         data.prezime  || '',
        email:           data.email    || '',
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
      });
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  }

  function handleCancelEdit() {
    setEditMode(false);
    setFormError('');
    setForm({
      ime:             profile.ime     || '',
      prezime:         profile.prezime || '',
      email:           profile.email   || '',
      currentPassword: '',
      newPassword:     '',
      confirmPassword: '',
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');

    // ── Client-side validation ──
    if (!form.ime.trim() || !form.prezime.trim() || !form.email.trim()) {
      setFormError('Ime, prezime i e-mail su obavezni.');
      return;
    }

    const changingPassword = form.currentPassword || form.newPassword || form.confirmPassword;
    if (changingPassword) {
      if (!form.currentPassword) {
        setFormError('Unesite trenutnu lozinku da biste postavili novu.');
        return;
      }
      if (!form.newPassword) {
        setFormError('Unesite novu lozinku.');
        return;
      }
      if (form.newPassword.length < 8) {
        setFormError('Nova lozinka mora imati najmanje 8 karaktera.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setFormError('Nove lozinke se ne podudaraju.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ime:     form.ime.trim(),
        prezime: form.prezime.trim(),
        email:   form.email.trim(),
      };
      if (changingPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }

      const result = await updateStudentProfile(payload);

      // Sync AuthContext so the navbar name updates immediately
      const token = sessionStorage.getItem('token');
      login(token, { ...authUser, ...result.user });

      await loadProfile();
      setEditMode(false);
      setToast({ message: 'Profil je uspješno ažuriran.', type: 'success' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function getInitials(ime, prezime) {
    return `${ime?.[0] ?? ''}${prezime?.[0] ?? ''}`.toUpperCase();
  }

  // ── Loading / error states ──
  if (loading) {
    return (
      <div className="pf-page">
        <p className="pf-state-msg">Učitavanje profila…</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="pf-page">
        <p className="pf-state-msg pf-state-msg--error">{pageError}</p>
      </div>
    );
  }

  const isStudent    = profile?.role === 'STUDENT';
  const dashboardPath = ROLE_ROUTES[profile?.role] ?? '/dashboard';

  return (
    <div className="pf-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ── Top navigation bar ── */}
      <header className="pf-topbar">
        <Link to={dashboardPath} className="pf-back">
          <IconChevronLeft />
          Nazad na dashboard
        </Link>
        <span className="pf-topbar__title">Moj profil</span>
      </header>

      <main className="pf-main">

        {/* ── Profile header card ── */}
        <div className="pf-card pf-header-card">
          <div className="pf-avatar">
            {getInitials(profile.ime, profile.prezime)}
          </div>

          <div className="pf-header-info">
            <h1 className="pf-name">{profile.ime} {profile.prezime}</h1>
            <div className="pf-header-meta">
              <span className={`pf-role-badge pf-role--${profile.role.toLowerCase()}`}>
                {ROLE_LABELS[profile.role]}
              </span>
              <span className={`pf-status-badge pf-status--${profile.status.toLowerCase()}`}>
                {STATUS_LABELS[profile.status]}
              </span>
            </div>
            <p className="pf-username">@{profile.username}</p>
          </div>

          {isStudent && !editMode && (
            <button className="pf-btn pf-btn--primary pf-edit-btn"
              onClick={() => setEditMode(true)}>
              Uredi profil
            </button>
          )}
        </div>

        {editMode ? (
          /* ══════════════════════════════
             EDIT FORM  (students only)
          ══════════════════════════════ */
          <form className="pf-card pf-form" onSubmit={handleSave} noValidate>
            <h2 className="pf-section-title">Uredi podatke</h2>

            {formError && (
              <div className="pf-form-error" role="alert">
                <IconWarning />
                <span>{formError}</span>
              </div>
            )}

            {/* Name row */}
            <div className="pf-form-row">
              <div className="pf-field">
                <label className="pf-label" htmlFor="ime">Ime</label>
                <input id="ime" name="ime" type="text" className="pf-input"
                  value={form.ime} onChange={handleChange} disabled={saving} />
              </div>
              <div className="pf-field">
                <label className="pf-label" htmlFor="prezime">Prezime</label>
                <input id="prezime" name="prezime" type="text" className="pf-input"
                  value={form.prezime} onChange={handleChange} disabled={saving} />
              </div>
            </div>

            {/* Email */}
            <div className="pf-field">
              <label className="pf-label" htmlFor="email">E-mail adresa</label>
              <input id="email" name="email" type="email" className="pf-input"
                value={form.email} onChange={handleChange} disabled={saving} />
            </div>

            {/* Password section */}
            <div className="pf-divider" />
            <h3 className="pf-subsection-title">
              Promjena lozinke
              <span className="pf-optional"> — opcionalno</span>
            </h3>

            <div className="pf-field">
              <label className="pf-label" htmlFor="currentPassword">Trenutna lozinka</label>
              <input id="currentPassword" name="currentPassword" type="password"
                className="pf-input" placeholder="Unesite trenutnu lozinku"
                value={form.currentPassword} onChange={handleChange} disabled={saving}
                autoComplete="current-password" />
            </div>

            <div className="pf-form-row">
              <div className="pf-field">
                <label className="pf-label" htmlFor="newPassword">Nova lozinka</label>
                <input id="newPassword" name="newPassword" type="password"
                  className="pf-input" placeholder="Min. 8 karaktera"
                  value={form.newPassword} onChange={handleChange} disabled={saving}
                  autoComplete="new-password" />
              </div>
              <div className="pf-field">
                <label className="pf-label" htmlFor="confirmPassword">Potvrdi novu lozinku</label>
                <input id="confirmPassword" name="confirmPassword" type="password"
                  className="pf-input" placeholder="Ponovi novu lozinku"
                  value={form.confirmPassword} onChange={handleChange} disabled={saving}
                  autoComplete="new-password" />
              </div>
            </div>

            {/* Actions */}
            <div className="pf-form-actions">
              <button type="button" className="pf-btn pf-btn--secondary"
                onClick={handleCancelEdit} disabled={saving}>
                Odustani
              </button>
              <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
                {saving && <span className="pf-spinner" aria-hidden="true" />}
                {saving ? 'Snimanje…' : 'Sačuvaj izmjene'}
              </button>
            </div>
          </form>

        ) : (
          /* ══════════════════════════════
             READ-ONLY VIEW  (all roles)
          ══════════════════════════════ */
          <>
            {/* Basic info */}
            <div className="pf-card">
              <h2 className="pf-section-title">Osnovni podaci</h2>
              <div className="pf-info-grid">
                <div className="pf-info-item">
                  <span className="pf-info-label">Ime</span>
                  <span className="pf-info-value">{profile.ime}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Prezime</span>
                  <span className="pf-info-value">{profile.prezime}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Korisničko ime</span>
                  <span className="pf-info-value">@{profile.username}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">E-mail adresa</span>
                  <span className="pf-info-value">{profile.email}</span>
                </div>
                {profile.institution && (
                  <div className="pf-info-item">
                    <span className="pf-info-label">Institucija</span>
                    <span className="pf-info-value">{profile.institution}</span>
                  </div>
                )}
                <div className="pf-info-item">
                  <span className="pf-info-label">Nalog kreiran</span>
                  <span className="pf-info-value">
                    {new Date(profile.created_at).toLocaleDateString('bs-BA')}
                  </span>
                </div>
              </div>
            </div>

            {/* Student-specific section */}
            {isStudent && profile.Student && (
              <div className="pf-card">
                <h2 className="pf-section-title">Podaci o studiju</h2>
                <p className="pf-readonly-note">
                  Ove podatke može mijenjati samo koordinator fakulteta.
                </p>
                <div className="pf-info-grid">
                  <div className="pf-info-item">
                    <span className="pf-info-label">Broj indeksa</span>
                    <span className="pf-info-value">{profile.Student.index_number}</span>
                  </div>
                  <div className="pf-info-item">
                    <span className="pf-info-label">Godina studija</span>
                    <span className="pf-info-value">{profile.Student.year_of_study}. godina</span>
                  </div>
                  {profile.Student.Fakultet && (
                    <div className="pf-info-item">
                      <span className="pf-info-label">Fakultet</span>
                      <span className="pf-info-value">{profile.Student.Fakultet.naziv}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}