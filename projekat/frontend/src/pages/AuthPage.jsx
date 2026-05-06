import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const initialRegisterState = {
  ime: '',
  prezime: '',
  username: '',
  email: '',
  password: '',
  role: 'STUDENT',
  institution: '',
};

const initialLoginState = {
  email: '',
  password: '',
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const isVerifyRoute = location.pathname === '/verify-email' || location.pathname === '/auth/verify-email';
  const isRegisterRoute = location.pathname === '/register';
  const isLoginRoute = location.pathname === '/login';

  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'register' : 'login');
  const [registerForm, setRegisterForm] = useState(initialRegisterState);
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [showResend, setShowResend] = useState(false);
  const lastVerifiedTokenRef = useRef(null);

  useEffect(() => {
    if (isVerifyRoute) {
      return;
    }
    if (isRegisterRoute) {
      setActiveTab('register');
      return;
    }
    if (isLoginRoute) {
      setActiveTab('login');
    }
  }, [isLoginRoute, isRegisterRoute, isVerifyRoute]);

  const roleFromQuery = useMemo(() => {
    const role = new URLSearchParams(location.search).get('role');
    if (role === 'student') return 'STUDENT';
    if (role === 'company') return 'COMPANY';
    if (role === 'coordinator') return 'COORDINATOR';
    return null;
  }, [location.search]);

  useEffect(() => {
    if (roleFromQuery) {
      setRegisterForm((prev) => ({ ...prev, role: roleFromQuery }));
      setActiveTab('register');
    }
  }, [roleFromQuery]);

  useEffect(() => {
    if (!isVerifyRoute) {
      return;
    }

    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setError('Verifikacioni token nije pronađen u URL-u.');
      return;
    }
    if (lastVerifiedTokenRef.current === token) {
      return;
    }
    lastVerifiedTokenRef.current = token;

    async function verifyEmail() {
      setIsLoading(true);
      setError('');
      setMessage('');

      try {
        const response = await apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setMessage(response?.message || 'Email uspješno verifikovan.');
      } catch (err) {
        setError(err.message || 'Verifikacija email-a nije uspjela.');
      } finally {
        setIsLoading(false);
      }
    }

    verifyEmail();
  }, [isVerifyRoute, location.search]);

  async function handleRegister(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });

      setMessage(response?.message || 'Registracija uspješna. Provjerite email za aktivaciju naloga.');
      setRegisterForm(initialRegisterState);
      setActiveTab('login');
      setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      setResendEmail(registerForm.email);
    } catch (err) {
      setError(err.message || 'Registracija nije uspjela.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setShowResend(false);

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      setMessage(response?.message || 'Uspješna prijava.');
      navigate('/');
    } catch (err) {
      const isUnverifiedEmail = err.status === 403;
      setError(err.message || 'Prijava nije uspjela.');
      if (isUnverifiedEmail) {
        setShowResend(true);
        setResendEmail(loginForm.email);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    const emailToResend = loginForm.email || resendEmail;
    if (!emailToResend) {
      setError('Unesite email u formu za prijavu, pa pokušajte ponovo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: emailToResend }),
      });
      setMessage(response?.message || 'Novi verifikacioni link je poslan.');
    } catch (err) {
      setError(err.message || 'Neuspješno slanje verifikacionog linka.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isVerifyRoute) {
    return (
      <main
        style={{
          minHeight: '100vh',
          padding: '2rem 1rem',
          background: darkMode ? '#111827' : '#f0f6ff',
          color: darkMode ? '#f9fafb' : '#0d1f3c',
        }}
      >
        <section
          style={{
            maxWidth: 480,
            margin: '3rem auto',
            padding: '1.5rem',
            borderRadius: 16,
            border: darkMode ? '1px solid #374151' : '1px solid #d0e3f7',
            background: darkMode ? '#1f2937' : 'white',
            boxShadow: darkMode ? 'none' : '0 8px 24px rgba(26, 111, 212, 0.12)',
          }}
        >
          <h1 style={{ marginTop: 0 }}>Verifikacija email-a</h1>
        {isLoading && <p>Verifikacija u toku...</p>}
        {message && <p style={{ color: darkMode ? '#86efac' : '#0e9e6e' }}>{message}</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '0.75rem',
              padding: '10px 16px',
              borderRadius: 10,
              textDecoration: 'none',
              color: '#fff',
              background: 'linear-gradient(135deg,#1a6fd4,#2d9cdb)',
              fontWeight: 600,
            }}
          >
            Idi na prijavu
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '2rem 1rem',
        background: darkMode ? '#111827' : '#f0f6ff',
        color: darkMode ? '#f9fafb' : '#0d1f3c',
      }}
    >
      <section
        style={{
          maxWidth: 520,
          margin: '2.5rem auto',
          padding: '1.5rem',
          borderRadius: 16,
          border: darkMode ? '1px solid #374151' : '1px solid #d0e3f7',
          background: darkMode ? '#1f2937' : 'white',
          boxShadow: darkMode ? 'none' : '0 8px 24px rgba(26, 111, 212, 0.12)',
        }}
      >
      <h1 style={{ margin: '0 0 1rem' }}>Autentifikacija</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Link
          to="/login"
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            color: activeTab === 'login' ? '#fff' : '#1a6fd4',
            background: activeTab === 'login' ? '#1a6fd4' : 'transparent',
            border: '1px solid #1a6fd4',
            fontWeight: 600,
          }}
        >
          Prijava
        </Link>
        <Link
          to="/register"
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            textDecoration: 'none',
            color: activeTab === 'register' ? '#fff' : '#1a6fd4',
            background: activeTab === 'register' ? '#1a6fd4' : 'transparent',
            border: '1px solid #1a6fd4',
            fontWeight: 600,
          }}
        >
          Registracija
        </Link>
      </div>

      {message && <p style={{ color: darkMode ? '#86efac' : '#0e9e6e' }}>{message}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {activeTab === 'login' ? (
        <form onSubmit={handleLogin}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="login-password">Lozinka</label>
          <input
            id="login-password"
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              border: 'none',
              padding: '11px 14px',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'linear-gradient(135deg,#1a6fd4,#2d9cdb)',
            }}
          >
            {isLoading ? 'Molimo sačekaj...' : 'Prijava'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <label htmlFor="register-ime">Ime</label>
          <input
            id="register-ime"
            value={registerForm.ime}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, ime: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="register-prezime">Prezime</label>
          <input
            id="register-prezime"
            value={registerForm.prezime}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, prezime: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            value={registerForm.username}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="register-password">Lozinka</label>
          <input
            id="register-password"
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <label htmlFor="register-role">Uloga</label>
          <select
            id="register-role"
            value={registerForm.role}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, role: e.target.value }))}
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="COMPANY">COMPANY</option>
            <option value="COORDINATOR">COORDINATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <label htmlFor="register-institution">Institucija (opcionalno)</label>
          <input
            id="register-institution"
            value={registerForm.institution}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, institution: e.target.value }))}
            style={{
              width: '100%',
              margin: '0.35rem 0 0.85rem',
              padding: '10px 12px',
              borderRadius: 10,
              border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
              background: darkMode ? '#111827' : '#fff',
              color: darkMode ? '#f9fafb' : '#0d1f3c',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              border: 'none',
              padding: '11px 14px',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'linear-gradient(135deg,#1a6fd4,#2d9cdb)',
            }}
          >
            {isLoading ? 'Molimo sačekaj...' : 'Registruj se'}
          </button>
        </form>
      )}

      <section style={{ marginTop: '1rem', borderTop: darkMode ? '1px solid #374151' : '1px solid #d0e3f7', paddingTop: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>Niste dobili verifikacioni email?</p>
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isLoading}
          style={{
            border: 'none',
            background: 'transparent',
            color: darkMode ? '#93c5fd' : '#1a6fd4',
            padding: 0,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Pošalji verifikacioni email ponovo na unesenu adresu
        </button>
      </section>

      {showResend && (
        <section style={{ marginTop: '1rem' }}>
          <p style={{ margin: 0, color: darkMode ? '#facc15' : '#b45309' }}>
            Email nije verifikovan. Možeš poslati novi verifikacioni link iz sekcije iznad.
          </p>
        </section>
      )}
      </section>
    </main>
  );
}
