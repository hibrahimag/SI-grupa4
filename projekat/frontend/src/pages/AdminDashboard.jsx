import { useEffect, useReducer, useState } from 'react';
import { getUsers, updateUserRole, updateUserStatus, getFaculties, createFaculty, updateFaculty, deleteFaculty, getOdsjeci, createOdsjek, deleteOdsjek } from '../services/adminService';
import { useTheme } from '../context/ThemeContext';
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
    case 'SET_PENDING':
      return { ...state, pending: action.payload };
    case 'REMOVE_PENDING':
      return {
        ...state,
        pending: state.pending.filter((u) => u.id !== action.payload),
      };
    case 'SET_FACULTIES':
      return { ...state, faculties: action.payload };
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
  pending: [],
  toast: null,
  faculties: [],
};

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { view, statusFilter, roleFilter, users, loading, pending, toast, faculties } = state;
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    getUsers('PENDING')
      .then((data) => dispatch({ type: 'SET_PENDING', payload: data.filter((u) => u.role !== 'ADMIN') }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view === 'faculties') {
      getFaculties()
        .then((data) => dispatch({ type: 'SET_FACULTIES', payload: data }))
        .catch(() => showToast('Greška pri učitavanju fakulteta.', 'error'));
    }
  }, [view]);

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

  async function handleStatusChange(userId, status, name) {
    try {
      await updateUserStatus(userId, status);
      dispatch({ type: 'REMOVE_PENDING', payload: userId });
      showToast(status === 'ACTIVE' ? `${name} odobren.` : `${name} odbijen.`);
    } catch {
      showToast('Greška pri promjeni statusa.', 'error');
    }
  }

  async function handleAssignAdmin(email) {
    try {
      const allUsers = await getUsers();
      const user = allUsers.find((u) => u.email === email);
      if (!user) {
        showToast('Korisnik s tim emailom nije pronađen.', 'error');
        return;
      }
      await updateUserRole(user.id, 'ADMIN');
      await updateUserStatus(user.id, 'ACTIVE');
      dispatch({ type: 'REMOVE_PENDING', payload: user.id });
      showToast(`${user.name} je sada admin.`);
    } catch {
      showToast('Greška pri dodjeli admin role.', 'error');
    }
  }

  async function handleCreateFaculty(data) {
    try {
      const created = await createFaculty(data);
      dispatch({ type: 'SET_FACULTIES', payload: [...faculties, created].sort((a, b) => a.naziv.localeCompare(b.naziv)) });
      showToast('Fakultet uspješno dodan.');
    } catch {
      showToast('Greška pri dodavanju fakulteta.', 'error');
    }
  }

  async function handleUpdateFaculty(id, data) {
    try {
      const updated = await updateFaculty(id, data);
      dispatch({ type: 'SET_FACULTIES', payload: faculties.map((f) => (f.id === id ? updated : f)) });
      showToast('Fakultet uspješno izmijenjen.');
    } catch {
      showToast('Greška pri izmjeni fakulteta.', 'error');
    }
  }

  async function handleDeleteFaculty(id) {
    try {
      await deleteFaculty(id);
      dispatch({ type: 'SET_FACULTIES', payload: faculties.filter((f) => f.id !== id) });
      showToast('Fakultet uspješno obrisan.');
    } catch {
      showToast('Ne možete obrisati fakultet u upotrebi!', 'error');
    }
  }

  const visibleUsers = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;

  return (
    <div className={`ad-layout${darkMode ? ' dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`ad-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="ad-logo">
          <img src="/logo2.png" alt="PraksaHub" style={{ height: 40 }} />
          <div className="ad-logo-sub">Admin panel</div>
        </div>
        {/* Toggle — vidljiv samo na mobilnom */}
<button
  className="ad-sidebar-toggle"
  style={{ display: "none" }}
  onClick={() => setSidebarOpen(o => !o)}
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    {sidebarOpen
      ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
      : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
    }
  </svg>
</button>

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
              {pending.length > 0 && <span className="ad-badge">{pending.length}</span>}
            </button>
            <button
              className={`ad-nav-item ${view === 'users' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'users' })}
            >
              Korisnici
            </button>
            <button
              className={`ad-nav-item ${view === 'faculties' ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'faculties' })}
            >
              Fakulteti
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="ad-main">
        {view === 'dashboard' && (
          <DashboardView pending={pending} showToast={showToast} onStatusChange={handleStatusChange} />
        )}
        {view === 'roles' && (
          <RolesView pending={pending} showToast={showToast} onStatusChange={handleStatusChange} onAssignAdmin={handleAssignAdmin} />
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
        {view === 'faculties' && (
          <FacultiesView
            faculties={faculties}
            onCreate={handleCreateFaculty}
            onUpdate={handleUpdateFaculty}
            onDelete={handleDeleteFaculty}
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

function DashboardView({ pending, showToast, onStatusChange }) {
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
                <th className="ad-col-institution">Institucija</th>
                <th className="ad-col-date">Datum</th>
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
                  <td className="ad-col-institution" style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{u.institution}</td>
                  <td className="ad-col-date" style={{ color: '#9aabbc', fontSize: '0.82rem' }}>{u.date}</td>
                  <td>
                    <div className="ad-actions">
                      <button
                        className="ad-btn ad-btn--approve"
                        onClick={() => onStatusChange(u.id, 'ACTIVE', u.name)}
                      >
                        Odobri
                      </button>
                      <button
                        className="ad-btn ad-btn--reject"
                        onClick={() => onStatusChange(u.id, 'DEACTIVATED', u.name)}
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

function PendingTable({ rows, onStatusChange, emptyMsg }) {
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
                  <button className="ad-btn ad-btn--approve" onClick={() => onStatusChange(u.id, 'ACTIVE', u.name)}>Odobri</button>
                  <button className="ad-btn ad-btn--reject" onClick={() => onStatusChange(u.id, 'DEACTIVATED', u.name)}>Odbij</button>
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

function RolesView({ pending, showToast, onStatusChange, onAssignAdmin }) {
  const coordinatorsPending = pending.filter((u) => u.role === 'COORDINATOR');
  const companiesPending = pending.filter((u) => u.role === 'COMPANY');

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Dodjela rola</h1>
        <div className="ad-subtitle">Odobravanje koordinatora i kompanija</div>
      </div>

      <div className="ad-roles-cols">
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Koordinatori na čekanju</h2>
            <span className="ad-section-count">{coordinatorsPending.length} zahtjeva</span>
          </div>
          <PendingTable rows={coordinatorsPending} onStatusChange={onStatusChange} emptyMsg="Nema koordinatora na čekanju." />
        </div>

        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Kompanije na čekanju</h2>
            <span className="ad-section-count">{companiesPending.length} zahtjeva</span>
          </div>
          <PendingTable rows={companiesPending} onStatusChange={onStatusChange} emptyMsg="Nema kompanija na čekanju." />
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
            const email = e.target.elements[0].value;
            onAssignAdmin(email);
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

function OdsjekPanel({ fakultetID, onClose }) {
  const [odsjeci, setOdsjeci] = useState([]);
  const [newNaziv, setNewNaziv] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getOdsjeci(fakultetID)
      .then(setOdsjeci)
      .catch(() => setLoadError(true));
  }, [fakultetID]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newNaziv.trim()) return;
    try {
      const created = await createOdsjek(fakultetID, newNaziv.trim());
      setOdsjeci(prev => [...prev, created].sort((a, b) => a.naziv.localeCompare(b.naziv)));
      setNewNaziv('');
    } catch {
      setLoadError(true);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOdsjek(id);
      setOdsjeci(prev => prev.filter(o => o.id !== id));
    } catch {
      setLoadError(true);
    }
  }

  return (
    <div style={{ background: '#f0f5fb', border: '1px solid #dce8f5', borderRadius: 8, padding: '14px 16px', marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3a5a7a' }}>Odsjeci</span>
        <span style={{ fontSize: '0.78rem', color: '#9aabbc' }}>{odsjeci.length} odsjeka</span>
      </div>

      {loadError && (
        <div style={{ fontSize: '0.78rem', color: '#c0392b', marginBottom: 8 }}>Greška pri učitavanju odsjeka.</div>
      )}

      {odsjeci.length === 0 && !loadError && (
        <div style={{ fontSize: '0.82rem', color: '#9aabbc', marginBottom: 10, fontStyle: 'italic' }}>
          Nema dodanih odsjeka.
        </div>
      )}

      {odsjeci.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {odsjeci.map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #e2ecf5' }}>
              <span style={{ fontSize: '0.85rem', flex: 1, color: '#2c3e50' }}>• {o.naziv}</span>
              <button
                className="ad-btn ad-btn--reject"
                style={{ padding: '2px 10px', fontSize: '0.78rem' }}
                onClick={() => handleDelete(o.id)}
              >
                Obriši
              </button>
            </div>
          ))}
        </div>
      )}

      <form style={{ display: 'flex', gap: 8, marginBottom: 12 }} onSubmit={handleAdd}>
        <input
          className="ad-input"
          style={{ flex: 1, padding: '5px 10px', fontSize: '0.85rem' }}
          placeholder="Naziv odsjeka"
          value={newNaziv}
          onChange={e => setNewNaziv(e.target.value)}
        />
        <button type="submit" className="ad-btn ad-btn--primary" style={{ padding: '5px 14px', fontSize: '0.85rem' }}>
          Dodaj
        </button>
      </form>

      <div style={{ borderTop: '1px solid #dce8f5', paddingTop: 10, textAlign: 'right' }}>
        <button className="ad-btn ad-btn--approve" onClick={onClose} style={{ fontSize: '0.85rem' }}>
          Završi dodavanje
        </button>
      </div>
    </div>
  );
}

function FacultiesView({ faculties, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState({ naziv: '', email: '', adresa: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedId, setExpandedId] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    onCreate(form);
    setForm({ naziv: '', email: '', adresa: '' });
  }

  function startEdit(f) {
    setEditingId(f.id);
    setExpandedId(null);
    setEditForm({ naziv: f.naziv, email: f.email || '', adresa: f.adresa || '' });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  function saveEdit(id) {
    onUpdate(id, editForm);
    cancelEdit();
  }

  function toggleOdsjeci(id) {
    setExpandedId(prev => (prev === id ? null : id));
    setEditingId(null);
  }

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Fakulteti</h1>
        <div className="ad-subtitle">Upravljanje fakultetima u sistemu</div>
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Dodaj fakultet</h2>
        </div>
        <form className="ad-assign-form" onSubmit={handleSubmit}>
          <input
            className="ad-input"
            placeholder="Naziv fakulteta *"
            value={form.naziv}
            onChange={(e) => setForm({ ...form, naziv: e.target.value })}
            required
          />
          <input
            className="ad-input"
            placeholder="Email (opcionalno)"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="ad-input"
            placeholder="Adresa (opcionalno)"
            value={form.adresa}
            onChange={(e) => setForm({ ...form, adresa: e.target.value })}
          />
          <button type="submit" className="ad-btn ad-btn--primary">Dodaj fakultet</button>
        </form>
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Lista fakulteta</h2>
          <span className="ad-section-count">{faculties.length} fakulteta</span>
        </div>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Email</th>
              <th>Adresa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => (
              <>
                <tr key={f.id}>
                  {editingId === f.id ? (
                    <>
                      <td><input className="ad-input" value={editForm.naziv} onChange={(e) => setEditForm({ ...editForm, naziv: e.target.value })} /></td>
                      <td><input className="ad-input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                      <td><input className="ad-input" value={editForm.adresa} onChange={(e) => setEditForm({ ...editForm, adresa: e.target.value })} /></td>
                      <td>
                        <div className="ad-actions">
                          <button className="ad-btn ad-btn--approve" onClick={() => saveEdit(f.id)}>Sačuvaj</button>
                          <button className="ad-btn ad-btn--reject" onClick={cancelEdit}>Odustani</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{f.naziv}</td>
                      <td style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{f.email || '—'}</td>
                      <td style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{f.adresa || '—'}</td>
                      <td>
                        <div className="ad-actions">
                          <button className="ad-btn ad-btn--approve" onClick={() => startEdit(f)}>Uredi</button>
                          <button className="ad-btn" style={{ background: '#e8eef5', color: '#3a5a7a' }} onClick={() => toggleOdsjeci(f.id)}>
                            {expandedId === f.id ? 'Zatvori' : 'Odsjeci'}
                          </button>
                          <button className="ad-btn ad-btn--reject" onClick={() => onDelete(f.id)}>Obriši</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                {expandedId === f.id && (
                  <tr key={`${f.id}-odsjeci`}>
                    <td colSpan={4} style={{ background: '#f7fafd', padding: '0 16px 8px' }}>
                      <OdsjekPanel fakultetID={f.id} onClose={() => setExpandedId(null)} />
                    </td>
                  </tr>
                )}
              </>
            ))}
            {faculties.length === 0 && (
              <tr><td colSpan={4} className="ad-empty">Nema dodanih fakulteta.</td></tr>
            )}
          </tbody>
        </table>
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
                <th className="ad-col-institution">Institucija</th>
                <th className="ad-col-date">Registrovan</th>
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
                  <td className="ad-col-institution" style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{u.institution || '—'}</td>
                  <td className="ad-col-date" style={{ color: '#9aabbc', fontSize: '0.82rem' }}>
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
