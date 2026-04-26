import { useEffect, useReducer, useRef, useState } from 'react';
import { getUsers, updateUserRole } from '../services/adminService.js';
import './AdminDashboard.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  grid: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  users: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check: '✓', user: '○', x: '×', doc: '≡', alert: '◎',
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PENDING = [
  { id: 3,  name: 'Adnan Kovačević', type: 'Student',     institution: 'ETF Sarajevo',  date: '2. jan' },
  { id: 7,  name: 'Telegroup Inc.',  type: 'Kompanija',   institution: 'Sarajevo',      date: '3. jan' },
  { id: 8,  name: 'Maja Petrović',   type: 'Koordinator', institution: 'FIN Sarajevo',  date: '4. jan' },
  { id: 9,  name: 'Sara Alibegović', type: 'Student',     institution: 'PMF Sarajevo',  date: '4. jan' },
  { id: 10, name: 'Burch International', type: 'Kompanija', institution: 'Sarajevo',   date: '5. jan' },
];

const AUDIT_LOG = [
  { id: 1, icon: 'check', color: 'green',  action: 'Praksa odobrena',       who: 'Koordinator Maja P.',  time: '14:32' },
  { id: 2, icon: 'user',  color: 'blue',   action: 'Registracija',          who: 'Adnan Kovačević',      time: '13:55' },
  { id: 3, icon: 'x',     color: 'red',    action: 'Nalog obrisan',         who: 'Anonimni korisnik',    time: '11:08' },
  { id: 4, icon: 'doc',   color: 'orange', action: 'Oglas zatvoren',        who: 'Symphony d.o.o.',      time: '10:50' },
  { id: 5, icon: 'alert', color: 'gray',   action: 'Neuspješan login pokušaj', who: 'nepoznat@mail.com', time: '09:44' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name) =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('bs-BA', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

const roleBadge   = (r) => ({ STUDENT: 'badge-student', COMPANY: 'badge-company', COORDINATOR: 'badge-coordinator', ADMIN: 'badge-admin' }[r] ?? '');
const statusBadge = (s) => ({ PENDING: 'badge-pending', ACTIVE: 'badge-active', DEACTIVATED: 'badge-deactivated' }[s] ?? '');
const typeBadge   = (t) => ({ Kompanija: 'company', Koordinator: 'coordinator', Admin: 'admin' }[t] ?? '');

const ROLES   = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];
const FILTERS = [
  { value: '',            label: 'Svi' },
  { value: 'PENDING',     label: 'Pending' },
  { value: 'ACTIVE',      label: 'Active' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
  { value: 'STUDENT',     label: 'Studenti' },
  { value: 'COMPANY',     label: 'Kompanije' },
  { value: 'COORDINATOR', label: 'Koordinatori' },
  { value: 'ADMIN',       label: 'Admini' },
];

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':     return { ...state, loading: true, error: null };
    case 'LOADED':      return { ...state, loading: false, users: action.users };
    case 'ERROR':       return { ...state, loading: false, error: action.error };
    case 'SET_FILTER':  return { ...state, filter: action.filter };
    case 'UPDATE_ROLE': return { ...state, users: state.users.map((u) => u.id === action.id ? { ...u, role: action.role } : u) };
    case 'SET_TOAST':   return { ...state, toast: action.toast };
    case 'CLEAR_TOAST': return { ...state, toast: null };
    case 'REMOVE_PENDING': return { ...state, pending: state.pending.filter((p) => p.id !== action.id) };
    default: return state;
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [view, setView] = useState('dashboard');
  const [state, dispatch] = useReducer(reducer, {
    users: [], loading: true, error: null, filter: '',
    toast: null, pending: MOCK_PENDING,
  });
  const toastTimer = useRef(null);

  function showToast(message, type) {
    clearTimeout(toastTimer.current);
    dispatch({ type: 'SET_TOAST', toast: { message, type } });
    toastTimer.current = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500);
  }

  useEffect(() => {
    dispatch({ type: 'LOADING' });
    const status = ['PENDING', 'ACTIVE', 'DEACTIVATED'].includes(state.filter) ? state.filter : undefined;
    getUsers(status)
      .then((users) => {
        const roleFilter = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'].includes(state.filter);
        dispatch({ type: 'LOADED', users: roleFilter ? users.filter((u) => u.role === state.filter) : users });
      })
      .catch(() => dispatch({ type: 'ERROR', error: 'Greška pri učitavanju korisnika.' }));
  }, [state.filter]);

  async function handleRoleChange(userId, newRole) {
    try {
      await updateUserRole(userId, newRole);
      dispatch({ type: 'UPDATE_ROLE', id: userId, role: newRole });
      showToast(`Rola promijenjena u ${newRole}.`, 'success');
    } catch {
      showToast('Greška pri promjeni role.', 'error');
    }
  }

  function handleApprove(id, name) {
    dispatch({ type: 'REMOVE_PENDING', id });
    showToast(`${name} odobren.`, 'success');
  }

  function handleReject(id, name) {
    dispatch({ type: 'REMOVE_PENDING', id });
    showToast(`${name} odbijen.`, 'error');
  }

  const pendingCount = state.pending.length;

  return (
    <div className="admin-shell">
      <Sidebar view={view} setView={setView} pendingCount={pendingCount} />

      <div className="admin-main">
        {view === 'dashboard' && (
          <DashboardView
            pending={state.pending}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        {view === 'roles' && (
          <RolesView
            pending={state.pending}
            onApprove={handleApprove}
            onReject={handleReject}
            showToast={showToast}
          />
        )}
        {view === 'users' && (
          <UsersView
            state={state}
            dispatch={dispatch}
            onRoleChange={handleRoleChange}
          />
        )}
      </div>

      {state.toast && (
        <div className={`toast toast-${state.toast.type}`}>
          <div className="toast-dot" />
          {state.toast.message}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ view, setView, pendingCount }) {
  const nav = (id, icon, label, badge) => (
    <button
      key={id}
      className={`sidebar-nav-item${view === id ? ' active' : ''}`}
      onClick={() => setView(id)}
    >
      {icon}
      {label}
      {badge > 0 && <span className="sidebar-badge">{badge}</span>}
    </button>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">PraksaHub</div>
        <div className="sidebar-brand-sub">Admin panel</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Pregled</div>
        {nav('dashboard', Icon.grid, 'Dashboard')}
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Upravljanje</div>
        {nav('roles', Icon.shield, 'Dodjela rola', pendingCount)}
        {nav('users', Icon.users, 'Korisnici')}
      </div>
    </aside>
  );
}

// ── Dashboard view ────────────────────────────────────────────────────────────
function DashboardView({ pending, onApprove, onReject }) {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Admin</div>
          <div className="admin-topbar-sub">Upravljanje korisnicima · PraksaHub</div>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Korisnika ukupno" value="1,840" sub="+23 ove sedmice" subClass="positive" />
          <StatCard label="Na odobravanju"   value={pending.length} sub="Čeka akciju" subClass="warning" />
          <StatCard label="Kompanije"        value="93" />
          <StatCard label="Prakse ukupno"    value="312" sub="+8 ove sedmice" subClass="positive" />
        </div>

        {/* Mid */}
        <div className="mid-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Zahtjevi za odobravanje</span>
              {pending.length > 0 && (
                <span className="card-badge">{pending.length} na čekanju</span>
              )}
            </div>
            <ApprovalTable rows={pending} onApprove={onApprove} onReject={onReject} />
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Audit log</span>
            </div>
            <div className="audit-list">
              {AUDIT_LOG.map((entry) => (
                <div key={entry.id} className="audit-item">
                  <div className={`audit-icon ${entry.color}`}>{Icon[entry.icon]}</div>
                  <div className="audit-body">
                    <div className="audit-action">{entry.action}</div>
                    <div className="audit-who">{entry.who}</div>
                  </div>
                  <div className="audit-time">{entry.time}</div>
                </div>
              ))}
            </div>
            <div className="audit-footer">
              <button className="btn-ghost">Cijeli log</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ── Roles view ────────────────────────────────────────────────────────────────
function RolesView({ pending, onApprove, onReject, showToast }) {
  const [adminEmail, setAdminEmail] = useState('');

  const coordinators = pending.filter((p) => p.type === 'Koordinator');
  const companies    = pending.filter((p) => p.type === 'Kompanija');

  function handleAssignAdmin(e) {
    e.preventDefault();
    if (!adminEmail.trim()) return;
    showToast(`Admin rola dodijeljena: ${adminEmail}`, 'success');
    setAdminEmail('');
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Dodjela rola</div>
          <div className="admin-topbar-sub">Odobravanje koordinatora, kompanija i dodjela admin pristupa</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="roles-grid">
          {/* Koordinatori */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Koordinatori na čekanju</span>
              {coordinators.length > 0 && (
                <span className="card-badge">{coordinators.length} zahtjeva</span>
              )}
            </div>
            {coordinators.length === 0
              ? <div className="roles-empty">Nema zahtjeva za koordinatora.</div>
              : <ApprovalTable rows={coordinators} onApprove={onApprove} onReject={onReject} />}
          </div>

          {/* Kompanije */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Kompanije na čekanju</span>
              {companies.length > 0 && (
                <span className="card-badge">{companies.length} zahtjeva</span>
              )}
            </div>
            {companies.length === 0
              ? <div className="roles-empty">Nema zahtjeva za kompaniju.</div>
              : <ApprovalTable rows={companies} onApprove={onApprove} onReject={onReject} />}
          </div>
        </div>

        {/* Dodjela admin role */}
        <div className="admin-assign-card">
          <div className="card-header">
            <span className="card-title">Dodjela admin pristupa</span>
          </div>
          <div className="admin-assign-body">
            <p className="admin-assign-desc">
              Unesi email adresu postojećeg korisnika kome želiš dodijeliti admin rolu.
              Admin ima puni pristup sistemu uključujući odobravanje korisnika i upravljanje rolama.
            </p>
            <form onSubmit={handleAssignAdmin}>
              <input
                className="assign-input"
                type="email"
                placeholder="email@korisnik.ba"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <button className="btn-primary" type="submit">
                {Icon.shield} Dodijeli admin rolu
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Users view ────────────────────────────────────────────────────────────────
function UsersView({ state, dispatch, onRoleChange }) {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <div className="admin-topbar-title">Korisnici</div>
          <div className="admin-topbar-sub">Pregled i upravljanje svim korisničkim računima</div>
        </div>
      </div>

      <div className="admin-content">
        <div className="users-toolbar">
          <div className="filter-group">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-btn${state.filter === f.value ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_FILTER', filter: f.value })}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!state.loading && !state.error && (
            <span className="user-count">{state.users.length} korisnika</span>
          )}
        </div>

        <div className="card">
          {state.loading && <div className="table-empty">Učitavanje...</div>}
          {state.error   && <div className="table-empty" style={{ color: '#dc2626' }}>{state.error}</div>}

          {!state.loading && !state.error && (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Korisnik</th>
                  <th>Rola</th>
                  <th>Status</th>
                  <th>Institucija</th>
                  <th>Registrovan</th>
                  <th>Promijeni rolu</th>
                </tr>
              </thead>
              <tbody>
                {state.users.length === 0 ? (
                  <tr><td colSpan={6}><div className="table-empty">Nema korisnika za odabrani filter.</div></td></tr>
                ) : (
                  state.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="avatar">{initials(user.name)}</div>
                          <div>
                            <div className="user-name-text">{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 1 }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${roleBadge(user.role)}`}>{user.role}</span></td>
                      <td><span className={`badge ${statusBadge(user.status)}`}>{user.status}</span></td>
                      <td style={{ color: user.institution ? '#0f172a' : '#cbd5e1' }}>{user.institution ?? '—'}</td>
                      <td style={{ color: '#64748b' }}>{formatDate(user.created_at)}</td>
                      <td>
                        <select
                          className="role-select"
                          value={user.role}
                          onChange={(e) => onRoleChange(user.id, e.target.value)}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function ApprovalTable({ rows, onApprove, onReject }) {
  if (rows.length === 0) return <div className="roles-empty">Nema zahtjeva.</div>;
  return (
    <table className="approval-table">
      <thead>
        <tr>
          <th>Korisnik</th>
          <th>Tip</th>
          <th>Institucija</th>
          <th>Datum</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>
              <div className="user-cell">
                <div className="avatar">{initials(row.name)}</div>
                <span className="user-name-text">{row.name}</span>
              </div>
            </td>
            <td><span className={`type-badge ${typeBadge(row.type)}`}>{row.type}</span></td>
            <td style={{ color: '#64748b' }}>{row.institution}</td>
            <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{row.date}</td>
            <td>
              <div className="action-group">
                <button className="btn-approve" onClick={() => onApprove(row.id, row.name)}>Odobri</button>
                <button className="btn-reject"  onClick={() => onReject(row.id, row.name)}>Odbij</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatCard({ label, value, sub, subClass }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className={`stat-sub ${subClass ?? 'neutral'}`}>{sub}</div>}
    </div>
  );
}

