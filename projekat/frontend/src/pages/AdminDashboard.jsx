import { useEffect, useReducer } from 'react';
import { getUsers, updateUserRole } from '../services/adminService';
import './AdminDashboard.css';

const ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];

const STATUS_FILTERS = [
  { label: 'Svi', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Aktivni', value: 'ACTIVE' },
  { label: 'Deaktivirani', value: 'DEACTIVATED' },
];

const ROLE_FILTERS = [
  { label: 'Studenti', value: 'STUDENT' },
  { label: 'Kompanije', value: 'COMPANY' },
  { label: 'Koordinatori', value: 'COORDINATOR' },
  { label: 'Admini', value: 'ADMIN' },
];

const STATIC_AUDIT = [
  { iconClass: 'ad-audit-icon--green',  symbol: '✓', action: 'Praksa odobrena',        sub: 'Koordinator Maja P.',   time: '14:32' },
  { iconClass: 'ad-audit-icon--blue',   symbol: '○', action: 'Registracija',            sub: 'Adnan Kovačević',       time: '13:55' },
  { iconClass: 'ad-audit-icon--red',    symbol: '✕', action: 'Nalog obrisan',           sub: 'Anonimni korisnik',     time: '11:08' },
  { iconClass: 'ad-audit-icon--orange', symbol: '≡', action: 'Oglas zatvoren',          sub: 'Symphony d.o.o.',       time: '10:50' },
  { iconClass: 'ad-audit-icon--gray',   symbol: '○', action: 'Neuspješan login pokušaj', sub: 'nepoznat@mail.com',    time: '09:44' },
];

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, roleFilter: '' };
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload, statusFilter: '' };
    case 'SET_USERS':
      return { ...state, users: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER_ROLE':
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? { ...u, role: action.payload.role } : u
        ),
      };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

const initialState = {
  view: 'dashboard',
  statusFilter: '',
  roleFilter: '',
  users: [],
  loading: true,
  toast: null,
};

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { view, statusFilter, roleFilter, users, loading, toast } = state;

  useEffect(() => {
    if (view === 'users') {
      dispatch({ type: 'SET_LOADING', payload: true });
      getUsers(statusFilter || undefined)
        .then((data) => dispatch({ type: 'SET_USERS', payload: data }))
        .catch(() => showToast('Greška pri učitavanju korisnika.', 'error'));
    }
  }, [view, statusFilter]);

  function showToast(message, type = 'success') {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500);
  }

  async function handleRoleChange(userId, role) {
    try {
      const updated = await updateUserRole(userId, role);
      dispatch({ type: 'UPDATE_USER_ROLE', payload: { id: userId, role: updated.user.role } });
      showToast(`Rola uspješno promijenjena u ${updated.user.role}.`);
    } catch {
      showToast('Greška pri promjeni role.', 'error');
    }
  }

  const visibleUsers = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;

  const mockPending = [
    { id: 1, name: 'Adnan Kovačević', role: 'STUDENT',     institution: 'ETF Sarajevo',  date: '2. jan' },
    { id: 2, name: 'Telegroup Inc.',  role: 'COMPANY',     institution: 'Sarajevo',       date: '3. jan' },
    { id: 3, name: 'Maja Petrović',   role: 'COORDINATOR', institution: 'FIN Sarajevo',  date: '4. jan' },
    { id: 4, name: 'Sara Alibegović', role: 'STUDENT',     institution: 'PMF Sarajevo',  date: '4. jan' },
    { id: 5, name: 'Burch International', role: 'COMPANY', institution: 'Sarajevo',      date: '5. jan' },
  ];

  return (
    <div className="ad-layout">
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-logo">
          <div className="ad-logo-name">PraksaHub</div>
          <div className="ad-logo-sub">Admin panel</div>
        </div>

        <div className="ad-nav-group">
          <div className="ad-nav-label">Pregled</div>
          <nav className="ad-nav">
            <button
              className={`ad-nav-item ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })}
            >
              Dashboard
            </button>
          </nav>
        </div>

        <div className="ad-nav-group">
          <div className="ad-nav-label">Upravljanje</div>
          <nav className="ad-nav">
            <button
              className={`ad-nav-item ${view === 'roles' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'roles' })}
            >
              Dodjela rola
              <span className="ad-badge">{mockPending.length}</span>
            </button>
            <button
              className={`ad-nav-item ${view === 'users' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'users' })}
            >
              Korisnici
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        {view === 'dashboard' && (
          <DashboardView pending={mockPending} showToast={showToast} />
        )}
        {view === 'roles' && (
          <RolesView pending={mockPending} showToast={showToast} />
        )}
        {view === 'users' && (
          <UsersView
            users={visibleUsers}
            loading={loading}
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            dispatch={dispatch}
            onRoleChange={handleRoleChange}
          />
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`ad-toast ad-toast--${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

function DashboardView({ pending, showToast }) {
  const stats = [
    { label: 'Korisnika ukupno', value: '1,840', sub: '+23 ove sedmice',  subClass: 'ad-stat-sub--green' },
    { label: 'Na odobravanju',   value: pending.length, sub: 'Čeka akciju', subClass: 'ad-stat-sub--orange' },
    { label: 'Kompanije',        value: '93',   sub: '+8 ove sedmice',  subClass: 'ad-stat-sub--blue' },
    { label: 'Prakse ukupno',    value: '312',  sub: '+8 ove sedmice',  subClass: 'ad-stat-sub--green' },
  ];

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Admin</h1>
        <div className="ad-subtitle">Upravljanje korisnicima · PraksaHub</div>
      </div>

      <div className="ad-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="ad-stat-card">
            <span className="ad-stat-label">{s.label}</span>
            <span className="ad-stat-value">{s.value}</span>
            <span className={`ad-stat-sub ${s.subClass}`}>{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="ad-dashboard-cols">
        {/* Approval table */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Zahtjevi za odobravanje</h2>
            <span className="ad-section-count">{pending.length} na čekanju</span>
          </div>
          <table className="ad-table">
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
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="ad-user-cell">
                      <div className="ad-avatar">{initials(u.name)}</div>
                      <span className="ad-user-name">{u.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`ad-role-badge ad-role--${u.role.toLowerCase()}`}>
                      {u.role === 'STUDENT' ? 'Student' : u.role === 'COMPANY' ? 'Kompanija' : 'Koordinator'}
                    </span>
                  </td>
                  <td style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{u.institution}</td>
                  <td style={{ color: '#9aabbc', fontSize: '0.82rem' }}>{u.date}</td>
                  <td>
                    <div className="ad-actions">
                      <button
                        className="ad-btn ad-btn--approve"
                        onClick={() => showToast(`${u.name} odobren.`)}
                      >
                        Odobri
                      </button>
                      <button
                        className="ad-btn ad-btn--reject"
                        onClick={() => showToast(`${u.name} odbijen.`, 'error')}
                      >
                        Odbij
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit log */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Audit log</h2>
          </div>
          {STATIC_AUDIT.map((entry, i) => (
            <div key={i} className="ad-audit-row">
              <div className={`ad-audit-icon ${entry.iconClass}`}>{entry.symbol}</div>
              <div className="ad-audit-body">
                <div className="ad-audit-action">{entry.action}</div>
                <div className="ad-audit-sub">{entry.sub}</div>
              </div>
              <div className="ad-audit-time">{entry.time}</div>
            </div>
          ))}
          <div className="ad-audit-footer">
            <button onClick={() => showToast('Audit log nije još implementiran.')}>
              Cijeli log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PendingTable({ rows, showToast, emptyMsg }) {
  return (
    <div className="ad-table-scroll">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Korisnik</th>
            <th>Institucija</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="ad-user-cell">
                  <div className="ad-avatar">{initials(u.name)}</div>
                  <span className="ad-user-name">{u.name}</span>
                </div>
              </td>
              <td style={{ color: '#5a7a9a', fontSize: '0.82rem' }}>{u.institution}</td>
              <td>
                <div className="ad-actions">
                  <button className="ad-btn ad-btn--approve" onClick={() => showToast(`${u.name} odobren.`)}>Odobri</button>
                  <button className="ad-btn ad-btn--reject" onClick={() => showToast(`${u.name} odbijen.`, 'error')}>Odbij</button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={3} className="ad-empty">{emptyMsg}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RolesView({ pending, showToast }) {
  const coordinatorsPending = pending.filter((u) => u.role === 'COORDINATOR');
  const companiesPending = pending.filter((u) => u.role === 'COMPANY');

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Dodjela rola</h1>
        <div className="ad-subtitle">Odobravanje koordinatora, kompanije i dodjela admin pristupa</div>
      </div>

      <div className="ad-roles-cols">
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Koordinatori na čekanju</h2>
            <span className="ad-section-count">{coordinatorsPending.length} zahtjeva</span>
          </div>
          <PendingTable rows={coordinatorsPending} showToast={showToast} emptyMsg="Nema koordinatora na čekanju." />
        </div>

        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Kompanije na čekanju</h2>
            <span className="ad-section-count">{companiesPending.length} zahtjeva</span>
          </div>
          <PendingTable rows={companiesPending} showToast={showToast} emptyMsg="Nema kompanija na čekanju." />
        </div>
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Dodjela admin pristupa</h2>
        </div>
        <form
          className="ad-assign-form"
          onSubmit={(e) => {
            e.preventDefault();
            showToast('Admin rola dodijeljena.');
            e.target.reset();
          }}
        >
          <p className="ad-form-desc">
            Unesi email adresu postojećeg korisnika kome želiš dodijeliti admin rolu.
            Admin ima puni pristup sistemu uključujući odobravanje korisnika i upravljanje rolama.
          </p>
          <input type="email" placeholder="email@korisnik.ba" className="ad-input" required />
          <button type="submit" className="ad-btn ad-btn--primary">Dodijeli admin rolu</button>
        </form>
      </div>
    </div>
  );
}

function UsersView({ users, loading, statusFilter, roleFilter, dispatch, onRoleChange }) {
  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Korisnici</h1>
        <div className="ad-subtitle">Pregled i upravljanje svim korisničkim računima</div>
      </div>

      <div className="ad-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`ad-filter-btn ${statusFilter === f.value && !roleFilter ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_STATUS_FILTER', payload: f.value })}
          >
            {f.label}
          </button>
        ))}
        <span className="ad-filter-sep" />
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`ad-filter-btn ${roleFilter === f.value ? 'active' : ''}`}
            onClick={() =>
              dispatch({
                type: 'SET_ROLE_FILTER',
                payload: roleFilter === f.value ? '' : f.value,
              })
            }
          >
            {f.label}
          </button>
        ))}
        {!loading && (
          <span className="ad-filters-count">{users.length} korisnika</span>
        )}
      </div>

      {loading ? (
        <p className="ad-loading">Učitavanje...</p>
      ) : (
        <div className="ad-section">
          <table className="ad-table">
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="ad-user-cell">
                      <div className="ad-avatar">{initials(u.name)}</div>
                      <div>
                        <div className="ad-user-name">{u.name}</div>
                        <div className="ad-user-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`ad-role-badge ad-role--${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`ad-status-badge ad-status--${u.status.toLowerCase()}`}>{u.status}</span>
                  </td>
                  <td style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{u.institution || '—'}</td>
                  <td style={{ color: '#9aabbc', fontSize: '0.82rem' }}>
                    {u.created_at ? u.created_at.slice(0, 10) : '—'}
                  </td>
                  <td>
                    <select
                      className="ad-select"
                      value={u.role}
                      onChange={(e) => onRoleChange(u.id, e.target.value)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="ad-empty">Nema korisnika za odabrani filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
