import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { loginUser } from '../services/auth.service';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES = {
  STUDENT: '/dashboard/student',
  COMPANY: '/dashboard/company',
  COORDINATOR: '/dashboard/coordinator',
  ADMIN: '/admin',
};

export default function AuthPage() {
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isVerifyRoute = location.pathname === '/verify-email' || location.pathname === '/auth/verify-email';
  const lastVerifiedTokenRef = useRef(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (!isVerifyRoute) return;

    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setError('Verifikacioni token nije pronađen u URL-u.');
      return;
    }
    if (lastVerifiedTokenRef.current === token) return;
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

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setShowResend(false);

    try {
      const { token, user } = await loginUser(identifier.trim(), password);
      login(token, user);
      navigate(ROLE_ROUTES[user.role] ?? '/', { replace: true });
    } catch (err) {
      const isUnverifiedEmail = err.message?.toLowerCase().includes('nije verifikovan') || err.status === 403;
      setError(err.message || 'Prijava nije uspjela.');
      if (isUnverifiedEmail) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    const email = identifier.includes('@') ? identifier.trim() : '';
    if (!email) {
      setError('Za ponovno slanje unesite e-mail adresu u polje za prijavu.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiRequest('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
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
      <main style={pageStyle(darkMode)}>
        <section style={cardStyle(darkMode, 480)}>
          <h1 style={{ marginTop: 0 }}>Verifikacija email-a</h1>
          {isLoading && <p>Verifikacija u toku...</p>}
          {message && <p style={{ color: darkMode ? '#86efac' : '#0e9e6e' }}>{message}</p>}
          {error && <p style={{ color: '#dc2626' }}>{error}</p>}
          <Link to="/login" style={primaryButtonStyle}>
            Idi na prijavu
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle(darkMode)}>
      <section style={cardStyle(darkMode, 520)}>
        <h1 style={{ margin: '0 0 1rem' }}>Prijava</h1>

        {message && <p style={{ color: darkMode ? '#86efac' : '#0e9e6e' }}>{message}</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <label htmlFor="identifier">Korisničko ime ili email</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={inputStyle(darkMode)}
          />

          <label htmlFor="password">Lozinka</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle(darkMode)}
          />

          <button type="submit" disabled={isLoading} style={submitStyle}>
            {isLoading ? 'Molimo sačekaj...' : 'Prijavi se'}
          </button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          <p style={{ marginBottom: '0.4rem' }}>Niste dobili verifikacioni email?</p>
          <button type="button" onClick={handleResendVerification} disabled={isLoading} style={linkButtonStyle(darkMode)}>
            Pošalji verifikacioni email ponovo na unesenu adresu
          </button>
        </div>

        {showResend && (
          <p style={{ marginTop: '0.75rem', color: darkMode ? '#facc15' : '#b45309' }}>
            Email nije verifikovan. Možeš poslati novi verifikacioni link klikom iznad.
          </p>
        )}

        <p style={{ marginTop: '1rem' }}>
          Nemaš nalog? <Link to="/register">Registruj se</Link>
        </p>
      </section>
    </main>
  );
}

function pageStyle(darkMode) {
  return {
    minHeight: '100vh',
    padding: '2rem 1rem',
    background: darkMode ? '#111827' : '#f0f6ff',
    color: darkMode ? '#f9fafb' : '#0d1f3c',
  };
}

function cardStyle(darkMode, width) {
  return {
    maxWidth: width,
    margin: '2.5rem auto',
    padding: '1.5rem',
    borderRadius: 16,
    border: darkMode ? '1px solid #374151' : '1px solid #d0e3f7',
    background: darkMode ? '#1f2937' : 'white',
    boxShadow: darkMode ? 'none' : '0 8px 24px rgba(26, 111, 212, 0.12)',
  };
}

function inputStyle(darkMode) {
  return {
    width: '100%',
    margin: '0.35rem 0 0.85rem',
    padding: '10px 12px',
    borderRadius: 10,
    border: darkMode ? '1px solid #4b5563' : '1px solid #c7d8eb',
    background: darkMode ? '#111827' : '#fff',
    color: darkMode ? '#f9fafb' : '#0d1f3c',
    boxSizing: 'border-box',
  };
}

const submitStyle = {
  width: '100%',
  border: 'none',
  padding: '11px 14px',
  borderRadius: 10,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
  background: 'linear-gradient(135deg,#1a6fd4,#2d9cdb)',
};

const primaryButtonStyle = {
  display: 'inline-block',
  marginTop: '0.75rem',
  padding: '10px 16px',
  borderRadius: 10,
  textDecoration: 'none',
  color: '#fff',
  background: 'linear-gradient(135deg,#1a6fd4,#2d9cdb)',
  fontWeight: 600,
};

function linkButtonStyle(darkMode) {
  return {
    border: 'none',
    background: 'transparent',
    color: darkMode ? '#93c5fd' : '#1a6fd4',
    padding: 0,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  };
}
