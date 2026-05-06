// frontend/src/pages/AuthPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/auth.service';
import './AuthPage.css';

// Role → redirect path mapping
const ROLE_ROUTES = {
  STUDENT:     '/dashboard/student',
  COMPANY:     '/dashboard/company',
  COORDINATOR: '/dashboard/coordinator',
  ADMIN:       '/admin',
};

function IconWarning() {
  return (
    <svg
      className="auth-error__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconEye({ crossed }) {
  if (crossed) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AuthPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Unesite korisničko ime ili e-mail adresu.');
      return;
    }
    if (!password) {
      setError('Unesite lozinku.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await loginUser(identifier.trim(), password);
      login(token, user);
      const destination = ROLE_ROUTES[user.role] ?? '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Translate browser-level network errors; server errors pass through
      // already formatted in Bosnian from auth.service.js.
      if (err.message === 'Failed to fetch') {
        setError('Nije moguće uspostaviti vezu sa serverom. Provjerite internet konekciju.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left panel – branding ── */}
      <aside className="auth-panel auth-panel--brand">
        <div className="auth-brand">
          <div className="auth-brand__wordmark">PraksaHub</div>
          <h1 className="auth-brand__title">
            Vaš most prema<br />profesionalnom svijetu.
          </h1>
          <p className="auth-brand__sub">
            Platforma za upravljanje stručnom praksom koja povezuje
            studente, kompanije i koordinatore.
          </p>
        </div>

        <ul className="auth-features">
          <li className="auth-feature">
            <span className="auth-feature__dot auth-feature__dot--blue" />
            <span>Studenti pronalaze i prijavljuju se na prakse</span>
          </li>
          <li className="auth-feature">
            <span className="auth-feature__dot auth-feature__dot--purple" />
            <span>Kompanije objavljuju oglase i biraju kandidate</span>
          </li>
          <li className="auth-feature">
            <span className="auth-feature__dot auth-feature__dot--green" />
            <span>Koordinatori prate napredak i odobravaju prakse</span>
          </li>
        </ul>

        <p className="auth-panel__footer">
          &copy; {new Date().getFullYear()} PraksaHub. Sva prava zadržana.
        </p>
      </aside>

      {/* ── Right panel – form ── */}
      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <header className="auth-card__header">
            <h2 className="auth-card__title">Prijava</h2>
            <p className="auth-card__subtitle">
              Dobrodošli nazad. Unesite vaše podatke za pristup sistemu.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <IconWarning />
                <span>{error}</span>
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="identifier">
                Korisničko ime ili e-mail
              </label>
              <input
                id="identifier"
                type="text"
                className="auth-input"
                placeholder="korisnik@example.com"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Lozinka
              </label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input auth-input--padded-right"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-toggle-pass"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                  tabIndex={-1}
                >
                  <IconEye crossed={showPass} />
                </button>
              </div>

              <div className="auth-form__helper">
              <Link to="/forgot-password" className="auth-link">
                Zaboravili ste lozinku?
              </Link>
            </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading && <span className="auth-btn__spinner" aria-hidden="true" />}
              {loading ? 'Prijavljivanje…' : 'Prijavite se'}
            </button>
          </form>

          <div className="auth-roles">
            <span className="auth-roles__label">Pristup za:</span>
            <span className="auth-role-chip auth-role-chip--student">Studente</span>
            <span className="auth-role-chip auth-role-chip--company">Kompanije</span>
            <span className="auth-role-chip auth-role-chip--coordinator">Koordinatore</span>
            <span className="auth-role-chip auth-role-chip--admin">Admins</span>
          </div>
        </div>
      </main>
    </div>
  );
}
