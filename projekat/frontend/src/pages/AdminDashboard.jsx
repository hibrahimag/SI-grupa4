import { Fragment, useEffect, useMemo, useReducer, useState } from 'react';
import {
  getUsers,
  updateUserRole,
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getOdsjeci,
  createOdsjek,
  deleteOdsjek,
  getUserApprovalRequests,
  getUserApprovalRequestById,
  approveUserRequest,
  rejectUserRequest,
} from '../services/adminService';
import { useTheme } from '../context/ThemeContext';
import './AdminDashboard.css';

const ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN'];
const APPROVAL_ROLES = ['STUDENT', 'COMPANY', 'COORDINATOR'];

const STATUS_FILTERS = [
  { label: 'Svi', value: '' },
  { label: 'Na cekanju', value: 'PENDING' },
  { label: 'Aktivni', value: 'ACTIVE' },
  { label: 'Deaktivirani', value: 'DEACTIVATED' },
];

const USER_ROLE_FILTERS = [
  { label: 'Sve role', value: '' },
  { label: 'Studenti', value: 'STUDENT' },
  { label: 'Kompanije', value: 'COMPANY' },
  { label: 'Koordinatori', value: 'COORDINATOR' },
  { label: 'Admini', value: 'ADMIN' },
];

const APPROVAL_ROLE_FILTERS = [
  { label: 'Sve role', value: '' },
  { label: 'Student', value: 'STUDENT' },
  { label: 'Kompanija', value: 'COMPANY' },
  { label: 'Koordinator', value: 'COORDINATOR' },
];

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
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
      return { ...state, statusFilter: action.payload };
    case 'SET_ROLE_FILTER':
      return { ...state, roleFilter: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload, usersLoading: false };
    case 'SET_USERS_LOADING':
      return { ...state, usersLoading: action.payload };
    case 'SET_ROLE_USERS':
      return { ...state, roleUsers: action.payload, roleUsersLoading: false };
    case 'SET_ROLE_USERS_LOADING':
      return { ...state, roleUsersLoading: action.payload };
    case 'SYNC_UPDATED_USER_ROLE':
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.payload.id ? { ...u, role: action.payload.role } : u)),
        roleUsers: state.roleUsers.map((u) => (u.id === action.payload.id ? { ...u, role: action.payload.role } : u)),
      };
    case 'SET_FACULTIES':
      return { ...state, faculties: action.payload };
    case 'SET_USER_APPROVAL_REQUESTS':
      return { ...state, userApprovalRequests: action.payload };
    case 'SET_SELECTED_APPROVAL_REQUEST':
      return { ...state, selectedApprovalRequest: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

const initialState = {
  view: 'overview',
  statusFilter: '',
  roleFilter: '',
  users: [],
  usersLoading: false,
  roleUsers: [],
  roleUsersLoading: false,
  toast: null,
  faculties: [],
  userApprovalRequests: [],
  selectedApprovalRequest: null,
};

export default function AdminDashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    view,
    statusFilter,
    roleFilter,
    users,
    usersLoading,
    roleUsers,
    roleUsersLoading,
    toast,
    faculties,
    userApprovalRequests,
    selectedApprovalRequest,
  } = state;
  const { darkMode } = useTheme();
  const [sidebarOpen] = useState(false);

  function showToast(message, type = 'success') {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500);
  }

  async function refreshApprovalRequests() {
    try {
      const data = await getUserApprovalRequests();
      dispatch({ type: 'SET_USER_APPROVAL_REQUESTS', payload: data });
    } catch {
      showToast('Greska pri ucitavanju zahtjeva za odobravanje.', 'error');
    }
  }

  useEffect(() => {
    refreshApprovalRequests();
    dispatch({ type: 'SET_ROLE_USERS_LOADING', payload: true });
    getUsers()
      .then((data) => dispatch({ type: 'SET_ROLE_USERS', payload: data }))
      .catch(() => {
        dispatch({ type: 'SET_ROLE_USERS_LOADING', payload: false });
      });
  }, []);

  useEffect(() => {
    if (view === 'faculties') {
      getFaculties()
        .then((data) => dispatch({ type: 'SET_FACULTIES', payload: data }))
        .catch(() => showToast('Greska pri ucitavanju fakulteta.', 'error'));
    }
  }, [view]);

  useEffect(() => {
    if (view === 'users') {
      dispatch({ type: 'SET_USERS_LOADING', payload: true });
      getUsers(statusFilter || undefined)
        .then((data) => dispatch({ type: 'SET_USERS', payload: data }))
        .catch(() => {
          dispatch({ type: 'SET_USERS_LOADING', payload: false });
          showToast('Greska pri ucitavanju korisnika.', 'error');
        });
    }
  }, [view, statusFilter]);

  useEffect(() => {
    if (view === 'roles') {
      dispatch({ type: 'SET_ROLE_USERS_LOADING', payload: true });
      getUsers()
        .then((data) => dispatch({ type: 'SET_ROLE_USERS', payload: data }))
        .catch(() => {
          dispatch({ type: 'SET_ROLE_USERS_LOADING', payload: false });
          showToast('Greska pri ucitavanju korisnika za role.', 'error');
        });
    }
  }, [view]);

  useEffect(() => {
    if (view === 'approvals') {
      refreshApprovalRequests();
    }
  }, [view]);

  async function handleRoleChange(userId, role) {
    try {
      const updated = await updateUserRole(userId, role);
      dispatch({ type: 'SYNC_UPDATED_USER_ROLE', payload: { id: userId, role: updated.user.role } });
      showToast(`Rola uspjesno promijenjena u ${updated.user.role}.`);
    } catch {
      showToast('Greska pri promjeni role.', 'error');
    }
  }

  async function handleAssignAdmin(email) {
    try {
      const allUsers = await getUsers();
      const user = allUsers.find((u) => u.email === email);
      if (!user) {
        showToast('Korisnik s tim emailom nije pronadjen.', 'error');
        return;
      }
      await updateUserRole(user.id, 'ADMIN');
      dispatch({ type: 'SYNC_UPDATED_USER_ROLE', payload: { id: user.id, role: 'ADMIN' } });
      showToast(`${user.name} sada ima admin rolu.`);
    } catch {
      showToast('Greska pri dodjeli admin role.', 'error');
    }
  }

  async function handleCreateFaculty(data) {
    try {
      const created = await createFaculty(data);
      dispatch({ type: 'SET_FACULTIES', payload: [...faculties, created].sort((a, b) => a.naziv.localeCompare(b.naziv)) });
      showToast('Fakultet uspjesno dodan.');
    } catch {
      showToast('Greska pri dodavanju fakulteta.', 'error');
    }
  }

  async function handleUpdateFaculty(id, data) {
    try {
      const updated = await updateFaculty(id, data);
      dispatch({ type: 'SET_FACULTIES', payload: faculties.map((f) => (f.id === id ? updated : f)) });
      showToast('Fakultet uspjesno izmijenjen.');
    } catch {
      showToast('Greska pri izmjeni fakulteta.', 'error');
    }
  }

  async function handleDeleteFaculty(id) {
    try {
      await deleteFaculty(id);
      dispatch({ type: 'SET_FACULTIES', payload: faculties.filter((f) => f.id !== id) });
      showToast('Fakultet uspjesno obrisan.');
    } catch {
      showToast('Ne mozete obrisati fakultet u upotrebi.', 'error');
    }
  }

  async function handleOpenApprovalDetails(id) {
    try {
      const data = await getUserApprovalRequestById(id);
      dispatch({ type: 'SET_SELECTED_APPROVAL_REQUEST', payload: data });
    } catch {
      showToast('Greska pri ucitavanju detalja zahtjeva.', 'error');
    }
  }

  async function handleApproveUserRequest(id, role) {
    try {
      await approveUserRequest(id, role);
      dispatch({ type: 'SET_SELECTED_APPROVAL_REQUEST', payload: null });
      await refreshApprovalRequests();
      showToast(`Zahtjev odobren. Dodijeljena rola: ${role}.`);
    } catch (err) {
      showToast(err.message || 'Greska pri odobravanju zahtjeva.', 'error');
    }
  }

  async function handleRejectUserRequest(id, reason) {
    try {
      await rejectUserRequest(id, reason);
      dispatch({ type: 'SET_SELECTED_APPROVAL_REQUEST', payload: null });
      await refreshApprovalRequests();
      showToast('Zahtjev odbijen.');
    } catch (err) {
      showToast(err.message || 'Greska pri odbijanju zahtjeva.', 'error');
    }
  }

  const visibleUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  const overviewStats = useMemo(() => {
    const all = roleUsers;
    const active = all.filter((u) => u.status === 'ACTIVE').length;
    const byRole = all.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { STUDENT: 0, COMPANY: 0, COORDINATOR: 0, ADMIN: 0 }
    );
    return {
      total: all.length,
      active,
      pendingApprovals: userApprovalRequests.length,
      students: byRole.STUDENT,
      companies: byRole.COMPANY,
      coordinators: byRole.COORDINATOR,
      admins: byRole.ADMIN,
    };
  }, [roleUsers, userApprovalRequests]);

  return (
    <div className={`ad-layout${darkMode ? ' dark' : ''}`}>
      <aside className={`ad-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="ad-logo">
          <img src="/logo2.png" alt="PraksaHub" style={{ height: 40 }} />
          <div className="ad-logo-sub">Admin panel</div>
        </div>

        <button className="ad-sidebar-toggle" style={{ display: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="ad-nav-group">
          <div className="ad-nav-label">Navigacija</div>
          <nav className="ad-nav">
            <button className={`ad-nav-item ${view === 'overview' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'overview' })}>
              Pregled
            </button>
            <button className={`ad-nav-item ${view === 'approvals' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'approvals' })}>
              Odobravanje naloga
              {userApprovalRequests.length > 0 && <span className="ad-badge">{userApprovalRequests.length}</span>}
            </button>
            <button className={`ad-nav-item ${view === 'users' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'users' })}>
              Korisnici
            </button>
            <button className={`ad-nav-item ${view === 'roles' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'roles' })}>
              Role i dozvole
            </button>
            <button className={`ad-nav-item ${view === 'faculties' ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_VIEW', payload: 'faculties' })}>
              Fakulteti i odsjeci
            </button>
          </nav>
        </div>
      </aside>

      <main className="ad-main">
        {view === 'overview' && (
          <OverviewView
            stats={overviewStats}
            approvalRequests={userApprovalRequests}
            onGoToApprovals={() => dispatch({ type: 'SET_VIEW', payload: 'approvals' })}
            onGoToUsers={() => dispatch({ type: 'SET_VIEW', payload: 'users' })}
            onGoToRoles={() => dispatch({ type: 'SET_VIEW', payload: 'roles' })}
          />
        )}

        {view === 'approvals' && (
          <UserApprovalsView
            requests={userApprovalRequests}
            selected={selectedApprovalRequest}
            onOpenDetails={handleOpenApprovalDetails}
            onApprove={handleApproveUserRequest}
            onReject={handleRejectUserRequest}
            onCloseDetails={() => dispatch({ type: 'SET_SELECTED_APPROVAL_REQUEST', payload: null })}
          />
        )}

        {view === 'users' && (
          <UsersView users={visibleUsers} loading={usersLoading} statusFilter={statusFilter} roleFilter={roleFilter} dispatch={dispatch} />
        )}

        {view === 'roles' && (
          <RoleManagementView
            users={roleUsers}
            loading={roleUsersLoading}
            onRoleChange={handleRoleChange}
            onAssignAdmin={handleAssignAdmin}
          />
        )}

        {view === 'faculties' && (
          <FacultiesView faculties={faculties} onCreate={handleCreateFaculty} onUpdate={handleUpdateFaculty} onDelete={handleDeleteFaculty} />
        )}
      </main>

      {toast && <div className={`ad-toast ad-toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

function OverviewView({ stats, approvalRequests, onGoToApprovals, onGoToUsers, onGoToRoles }) {
  const preview = approvalRequests.slice(0, 5);
  const cards = [
    { label: 'Ukupno korisnika', value: stats.total, sub: `Aktivni: ${stats.active}`, subClass: 'ad-stat-sub--green' },
    { label: 'Zahtjevi na cekanju', value: stats.pendingApprovals, sub: 'Potrebna odluka admina', subClass: 'ad-stat-sub--orange' },
    { label: 'Studenti', value: stats.students, sub: `Kompanije: ${stats.companies}`, subClass: 'ad-stat-sub--blue' },
    { label: 'Koordinatori', value: stats.coordinators, sub: `Admini: ${stats.admins}`, subClass: 'ad-stat-sub--green' },
  ];

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Pregled</h1>
        <div className="ad-subtitle">Kljucni pokazatelji sistema i brzi pristup vaznim sekcijama</div>
      </div>

      <div className="ad-stats-grid">
        {cards.map((s) => (
          <div key={s.label} className="ad-stat-card">
            <span className="ad-stat-label">{s.label}</span>
            <span className="ad-stat-value">{String(s.value)}</span>
            <span className={`ad-stat-sub ${s.subClass}`}>{s.sub}</span>
          </div>
        ))}
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Zahtjevi za odobravanje - kratki pregled</h2>
          <span className="ad-section-count">{approvalRequests.length} na cekanju</span>
        </div>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Korisnik</th>
              <th>Email</th>
              <th>Rola</th>
              <th>Datum zahtjeva</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((u) => (
              <tr key={u.id}>
                <td>{`${u.ime} ${u.prezime}`.trim()}</td>
                <td>{u.email}</td>
                <td><span className={`ad-role-badge ad-role--${String(u.role || 'student').toLowerCase()}`}>{u.role}</span></td>
                <td>{u.approvalRequestedAt ? String(u.approvalRequestedAt).slice(0, 10) : '—'}</td>
              </tr>
            ))}
            {preview.length === 0 && (
              <tr><td colSpan={4} className="ad-empty">Trenutno nema zahtjeva za odobravanje.</td></tr>
            )}
          </tbody>
        </table>
        <div className="ad-overview-actions">
          <button className="ad-btn ad-btn--primary" onClick={onGoToApprovals}>Pogledaj zahtjeve</button>
          <button className="ad-btn ad-btn--neutral" onClick={onGoToUsers}>Otvori korisnike</button>
          <button className="ad-btn ad-btn--neutral" onClick={onGoToRoles}>Otvori role i dozvole</button>
        </div>
      </div>
    </div>
  );
}

function RoleManagementView({ users, loading, onRoleChange, onAssignAdmin }) {
  const [search, setSearch] = useState('');
  const [draftRoles, setDraftRoles] = useState({});
  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  function saveRole(user) {
    const nextRole = draftRoles[user.id];
    if (!nextRole || nextRole === user.role) return;
    onRoleChange(user.id, nextRole);
  }

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Role i dozvole</h1>
        <div className="ad-subtitle">Promjena rola postojecih korisnika i dodjela admin role</div>
      </div>

      <div className="ad-filters">
        <input
          className="ad-input"
          style={{ maxWidth: 360 }}
          placeholder="Pretraga po imenu ili emailu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!loading && <span className="ad-filters-count">{filteredUsers.length} korisnika</span>}
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Promjena role korisnika</h2>
        </div>
        {loading ? (
          <p className="ad-loading">Ucitavanje...</p>
        ) : (
          <table className="ad-table">
            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Trenutna rola</th>
                <th>Nova rola</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
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
                  <td><span className={`ad-role-badge ad-role--${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td>
                    <select
                      className="ad-select"
                      value={draftRoles[u.id] || u.role}
                      onChange={(e) => setDraftRoles((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td>
                    <button
                      className="ad-btn ad-btn--approve"
                      disabled={!draftRoles[u.id] || draftRoles[u.id] === u.role}
                      onClick={() => saveRole(u)}
                    >
                      Sacuvaj
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && <tr><td colSpan={4} className="ad-empty">Nema korisnika za prikaz.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Dodjela admin role</h2>
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
          <p className="ad-form-desc">Unesi email adresu postojeceg korisnika kojem zelis dodijeliti admin rolu.</p>
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
      setOdsjeci((prev) => [...prev, created].sort((a, b) => a.naziv.localeCompare(b.naziv)));
      setNewNaziv('');
    } catch {
      setLoadError(true);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteOdsjek(id);
      setOdsjeci((prev) => prev.filter((o) => o.id !== id));
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

      {loadError && <div style={{ fontSize: '0.78rem', color: '#c0392b', marginBottom: 8 }}>Greska pri ucitavanju odsjeka.</div>}
      {odsjeci.length === 0 && !loadError && (
        <div style={{ fontSize: '0.82rem', color: '#9aabbc', marginBottom: 10, fontStyle: 'italic' }}>
          Nema dodanih odsjeka.
        </div>
      )}

      {odsjeci.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {odsjeci.map((o) => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #e2ecf5' }}>
              <span style={{ fontSize: '0.85rem', flex: 1, color: '#2c3e50' }}>- {o.naziv}</span>
              <button
                className="ad-btn ad-btn--reject"
                style={{ padding: '2px 10px', fontSize: '0.78rem' }}
                onClick={() => handleDelete(o.id)}
              >
                Obrisi
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
          onChange={(e) => setNewNaziv(e.target.value)}
        />
        <button type="submit" className="ad-btn ad-btn--primary" style={{ padding: '5px 14px', fontSize: '0.85rem' }}>
          Dodaj
        </button>
      </form>

      <div style={{ borderTop: '1px solid #dce8f5', paddingTop: 10, textAlign: 'right' }}>
        <button className="ad-btn ad-btn--approve" onClick={onClose} style={{ fontSize: '0.85rem' }}>
          Zavrsi dodavanje
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
    setExpandedId((prev) => (prev === id ? null : id));
    setEditingId(null);
  }

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Fakulteti i odsjeci</h1>
        <div className="ad-subtitle">Upravljanje fakultetima i odsjecima u sistemu</div>
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Dodaj fakultet</h2>
        </div>
        <form className="ad-assign-form" onSubmit={handleSubmit}>
          <input className="ad-input" placeholder="Naziv fakulteta *" value={form.naziv} onChange={(e) => setForm({ ...form, naziv: e.target.value })} required />
          <input className="ad-input" placeholder="Email (opcionalno)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="ad-input" placeholder="Adresa (opcionalno)" value={form.adresa} onChange={(e) => setForm({ ...form, adresa: e.target.value })} />
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
              <Fragment key={f.id}>
                <tr>
                  {editingId === f.id ? (
                    <>
                      <td><input className="ad-input" value={editForm.naziv} onChange={(e) => setEditForm({ ...editForm, naziv: e.target.value })} /></td>
                      <td><input className="ad-input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></td>
                      <td><input className="ad-input" value={editForm.adresa} onChange={(e) => setEditForm({ ...editForm, adresa: e.target.value })} /></td>
                      <td>
                        <div className="ad-actions">
                          <button className="ad-btn ad-btn--approve" onClick={() => saveEdit(f.id)}>Sacuvaj</button>
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
                          <button className="ad-btn ad-btn--neutral" onClick={() => toggleOdsjeci(f.id)}>
                            {expandedId === f.id ? 'Zatvori' : 'Odsjeci'}
                          </button>
                          <button className="ad-btn ad-btn--reject" onClick={() => onDelete(f.id)}>Obrisi</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                {expandedId === f.id && (
                  <tr>
                    <td colSpan={4} style={{ background: '#f7fafd', padding: '0 16px 8px' }}>
                      <OdsjekPanel fakultetID={f.id} onClose={() => setExpandedId(null)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {faculties.length === 0 && <tr><td colSpan={4} className="ad-empty">Nema dodanih fakulteta.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersView({ users, loading, statusFilter, roleFilter, dispatch }) {
  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Korisnici</h1>
        <div className="ad-subtitle">Pregled korisnickih naloga, statusa i pripadajucih rola</div>
      </div>

      <div className="ad-filters">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all-status'}
            className={`ad-filter-btn ${statusFilter === f.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_STATUS_FILTER', payload: f.value })}
          >
            {f.label}
          </button>
        ))}
        <span className="ad-filter-sep" />
        {USER_ROLE_FILTERS.map((f) => (
          <button
            key={f.value || 'all-role'}
            className={`ad-filter-btn ${roleFilter === f.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_ROLE_FILTER', payload: f.value })}
          >
            {f.label}
          </button>
        ))}
        {!loading && <span className="ad-filters-count">{users.length} korisnika</span>}
      </div>

      {loading ? (
        <p className="ad-loading">Ucitavanje...</p>
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
                  <td><span className={`ad-role-badge ad-role--${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td><span className={`ad-status-badge ad-status--${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td className="ad-col-institution" style={{ color: '#5a7a9a', fontSize: '0.85rem' }}>{u.institution || '—'}</td>
                  <td className="ad-col-date" style={{ color: '#9aabbc', fontSize: '0.82rem' }}>
                    {u.created_at ? u.created_at.slice(0, 10) : '—'}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="ad-empty">Nema korisnika za odabrani filter.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserApprovalsView({ requests, selected, onOpenDetails, onApprove, onReject, onCloseDetails }) {
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [rejectionReason, setRejectionReason] = useState('');
  const [localError, setLocalError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (selected) {
      setSelectedRole(selected.role || 'STUDENT');
      setRejectionReason('');
      setLocalError('');
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return undefined;
    function onEscape(event) {
      if (event.key === 'Escape') onCloseDetails();
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [selected, onCloseDetails]);

  const filteredRequests = requests.filter((u) => {
    const byRole = roleFilter ? u.role === roleFilter : true;
    const q = search.trim().toLowerCase();
    if (!q) return byRole;
    const fullName = `${u.ime} ${u.prezime}`.toLowerCase();
    const bySearch = fullName.includes(q) || String(u.email || '').toLowerCase().includes(q);
    return byRole && bySearch;
  });

  function handleReject() {
    if (!rejectionReason.trim()) {
      setLocalError('Razlog odbijanja je obavezan.');
      return;
    }
    onReject(selected.id, rejectionReason);
  }

  return (
    <div className="ad-content">
      <div className="ad-header">
        <h1 className="ad-title">Odobravanje naloga</h1>
        <div className="ad-subtitle">Odobravanje i odbijanje zahtjeva nakon email verifikacije</div>
      </div>

      <div className="ad-filters">
        {APPROVAL_ROLE_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            className={`ad-filter-btn ${roleFilter === f.value ? 'active' : ''}`}
            onClick={() => setRoleFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <input
          className="ad-input"
          style={{ maxWidth: 280 }}
          placeholder="Pretraga po imenu ili emailu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="ad-filters-count">{filteredRequests.length} zahtjeva</span>
      </div>

      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">Lista zahtjeva</h2>
          <span className="ad-section-count">{filteredRequests.length} na cekanju</span>
        </div>
        <table className="ad-table">
          <thead>
            <tr>
              <th>Korisnik</th>
              <th>Email</th>
              <th>Rola</th>
              <th>Datum verifikacije</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((u) => (
              <tr key={u.id}>
                <td>{`${u.ime} ${u.prezime}`.trim()}</td>
                <td>{u.email}</td>
                <td><span className={`ad-role-badge ad-role--${String(u.role || 'student').toLowerCase()}`}>{u.role}</span></td>
                <td>{u.approvalRequestedAt ? String(u.approvalRequestedAt).slice(0, 10) : '—'}</td>
                <td><span className="ad-status-badge ad-status--pending">PENDING_APPROVAL</span></td>
                <td>
                  <button className="ad-btn ad-btn--approve" onClick={() => onOpenDetails(u.id)}>
                    Detalji
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && <tr><td colSpan={6} className="ad-empty">Nema zahtjeva na cekanju.</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="ad-modal-backdrop" onClick={onCloseDetails}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-close" onClick={onCloseDetails} aria-label="Zatvori modal">x</button>
            <div className="ad-section-header">
              <h2 className="ad-section-title">Detalji zahtjeva za nalog</h2>
            </div>
            <div className="ad-modal-body">
              <p><strong>ID zahtjeva:</strong> #{selected.id}</p>
              <p><strong>Ime:</strong> {selected.ime} {selected.prezime}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Trenutna rola:</strong> {selected.role}</p>

              <div className="ad-approval-actions">
                <select className="ad-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  {APPROVAL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button className="ad-btn ad-btn--approve" onClick={() => onApprove(selected.id, selectedRole)}>
                  Odobri i dodijeli rolu
                </button>
              </div>

              <div className="ad-approval-actions ad-approval-actions--stack">
                <textarea
                  className="ad-input ad-textarea"
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (localError) setLocalError('');
                  }}
                  placeholder="Razlog odbijanja (obavezno)"
                />
                {localError && <div className="ad-inline-error">{localError}</div>}
                <div className="ad-actions">
                  <button className="ad-btn ad-btn--reject" onClick={handleReject}>Odbij zahtjev</button>
                  <button className="ad-btn ad-btn--primary" onClick={onCloseDetails}>Zatvori</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
