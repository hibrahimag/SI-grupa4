// frontend/src/pages/KompanijaDashboard.jsx
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyProfile.service';
import { checkCompanyDeactivation, deactivateCompanyAccount, deleteMyCompanyAccount } from '../services/userService';
import './KompanijaDashboard.css';
import { createListing, getCompanyListings } from '../services/listingsService';

const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  CREATE_LISTING: 'create-oglas',
};

const COMPANY_PROFILE_UPDATED_EVENT = 'company-profile-updated';

function ThemeIcon({ darkMode }) {
  if (darkMode) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>
    </svg>
  );
}

export default function KompanijaDashboard() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { user, logout } = useAuth();

  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const companyName = companyProfile?.naziv || user?.institution || user?.ime || 'Kompanija';

  useEffect(() => {
    let active = true;

    async function loadCompanyData() {
      setListingsLoading(true);
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
        if (active) setListingsError(err.message || 'Greška pri učitavanju oglasa.');
      } finally {
        if (active) {
          setListingsLoading(false);
        }
      }
    }

    loadCompanyData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function refreshCompanyProfile() {
      try {
        const profile = await getCompanyProfile();
        if (active) setCompanyProfile(profile);
      } catch {
        // Keep the current dashboard state if background refresh fails.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshCompanyProfile();
      }
    }

    function handleCompanyProfileUpdated(event) {
      const updatedProfile = event.detail;
      if (updatedProfile && typeof updatedProfile === 'object') {
        setCompanyProfile((current) => ({ ...(current || {}), ...updatedProfile }));
      }
    }

    window.addEventListener('focus', refreshCompanyProfile);
    window.addEventListener('pageshow', refreshCompanyProfile);
    window.addEventListener(COMPANY_PROFILE_UPDATED_EVENT, handleCompanyProfileUpdated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener('focus', refreshCompanyProfile);
      window.removeEventListener('pageshow', refreshCompanyProfile);
      window.removeEventListener(COMPANY_PROFILE_UPDATED_EVENT, handleCompanyProfileUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function openView(nextView) {
    setView(nextView);
  }

  function openProfilePage() {
    navigate('/profile');
  }

  function openSettings() {
    setProfileMenuOpen(false);
    setSettingsTab('account');
    setSettingsOpen(true);
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

  async function handleOpenDelete() {
    setDeleteError('');
    try {
      const result = await checkCompanyDeactivation();
      setDeleteCheck(result);
      setShowDeleteConfirm(true);
    } catch (err) {
      setDeleteError(err.message || 'Greška pri provjeri statusa naloga.');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMyCompanyAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleting(false);
      setDeleteError(err.message || 'Greška pri brisanju naloga.');
    }
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
        <div className="cd-navbar-left">
          <Link to="/" className="cd-navbar-brand" aria-label="Idi na početnu stranicu">
            PraksaHub
          </Link>
          <div className="cd-navbar-divider" />
          <span className="cd-navbar-title">Dashboard kompanije</span>
        </div>
        <div className="cd-navbar-right">
          <button
            type="button"
            className="cd-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Uključi svijetlu temu' : 'Uključi tamnu temu'}
            title={darkMode ? 'Svijetla tema' : 'Tamna tema'}
          >
            <ThemeIcon darkMode={darkMode} />
          </button>
          <div className="cd-navbar-user-area">
            <span className="cd-navbar-user">{companyName}</span>
            <span className="cd-navbar-role-chip">Kompanija</span>
          </div>
        </div>
      </nav>

      <aside className="cd-sidebar">
        <div className="cd-sidebar-tab">
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.DASHBOARD)} title="Dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.LISTINGS)} title="Oglasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.CREATE_LISTING)} title="Kreiraj oglas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2"/>
              <line x1="12" y1="10" x2="12" y2="16"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={openProfilePage} title="Moj profil">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={openSettings} title="Postavke">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <div className="cd-sb-tab-footer">
            <button type="button" className="cd-sb-tab-icon" onClick={openProfilePage} title={companyName}>
              <div className="cd-nav-avatar cd-sb-tab-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
            </button>
            <button type="button" className="cd-sb-tab-icon" onClick={handleLogout} title="Odjava">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>

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
                <button type="button" className={`cd-nav-item ${view === VIEWS.CREATE_LISTING ? 'active' : ''}`} onClick={() => openView(VIEWS.CREATE_LISTING)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2"/>
                    <line x1="12" y1="10" x2="12" y2="16"/>
                    <line x1="9" y1="13" x2="15" y2="13"/>
                  </svg>
                  Kreiraj oglas
                </button>
              </nav>
            </div>
            <div className="cd-nav-group">
              <div className="cd-nav-label">Profil</div>
              <nav className="cd-nav">
                <button type="button" className="cd-nav-item" onClick={openProfilePage}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Moj profil
                </button>
              </nav>
            </div>
          </div>

          <div className="cd-sidebar-footer" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="cd-profile-menu">
                <button className="cd-profile-menu-item" onClick={openSettings}>
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
            <button
              type="button"
              className={`cd-sb-footer-row${settingsOpen ? ' active' : ''}`}
              onClick={openSettings}
            >
              <svg className="cd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span className="cd-sb-footer-text">Postavke</span>
            </button>
            <button type="button" className="cd-sb-footer-row cd-sb-logout-row" onClick={handleLogout}>
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
            listings={listings}
            listingsLoading={listingsLoading}
            listingsError={listingsError}
            onOpenView={openView}
          />
        )}
        {view === VIEWS.LISTINGS && (
          <ListingsShell listings={listings} loading={listingsLoading} error={listingsError} onOpenView={openView} />
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

      {settingsOpen && (
        <div className="cd-settings-page">
          <aside className="cd-settings-sidebar">
            <div className="cd-settings-sidebar-top">
              <button className="cd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Nazad
              </button>
              <span className="cd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="cd-settings-nav">
              <div className="cd-settings-nav-label">Opšte</div>
              <button
                className={`cd-settings-nav-item${settingsTab === 'account' ? ' active' : ''}`}
                onClick={() => setSettingsTab('account')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Račun</span>
              </button>
            </nav>
          </aside>
          <div className="cd-settings-main">
            <div className="cd-settings-content">
              {settingsTab === 'account' && (
                <div className="cd-settings-account">
                  <h3 className="cd-settings-section-title">Račun</h3>
                  <div className="cd-settings-user-info">
                    <div className="cd-settings-avatar">
                      {(companyName?.[0] || 'K').toUpperCase()}
                    </div>
                    <div>
                      <div className="cd-settings-username">{companyName}</div>
                      <div className="cd-settings-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="cd-danger-section">
                    <h4 className="cd-danger-section-title">Deaktivacija naloga</h4>
                    <div className="cd-settings-danger-zone">
                      <div className="cd-settings-danger-content">
                        <div className="cd-settings-danger-desc">
                          Deaktivacijom naloga gubi se pristup platformi. Aktivni oglasi bez prijava biće automatski zatvoreni. Administrator može ponovo aktivirati nalog.
                        </div>
                        {deactivateError && (
                          <div className="cd-inline-message cd-inline-message--error" role="alert">{deactivateError}</div>
                        )}
                        <button type="button" className="cd-btn cd-btn--danger" onClick={handleOpenDeactivate}>
                          Deaktiviraj nalog
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="cd-danger-section">
                    <h4 className="cd-danger-section-title">Brisanje naloga</h4>
                    <div className="cd-settings-danger-zone">
                      <div className="cd-settings-danger-content">
                        <div className="cd-settings-danger-desc">
                          Brisanjem naloga trajno se uklanjaju svi vaši podaci, oglasi i prijave sa platforme. Ova akcija je nepovratna.
                        </div>
                        {deleteError && (
                          <div className="cd-inline-message cd-inline-message--error" role="alert">{deleteError}</div>
                        )}
                        <button type="button" className="cd-btn cd-btn--danger" onClick={handleOpenDelete}>
                          Obriši nalog
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeactivateConfirm && (
        <DeactivateModal
          check={deactivateCheck}
          deactivating={deactivating}
          onConfirm={handleConfirmDeactivate}
          onCancel={handleCancelDeactivate}
        />
      )}

      {showDeleteConfirm && (
        <DeleteModal
          check={deleteCheck}
          deleting={deleting}
          deleteError={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteCheck(null); setDeleteError(''); }}
        />
      )}
    </div>
  );
}

function DashboardShell({ listings, listingsLoading, listingsError, onOpenView }) {
  const activeListings = listings.filter((l) => l.status === 'AKTIVAN').length;
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
  ];

  return (
    <div className="cd-content">
      <section className="cd-stats-grid" aria-label="Sažetak kompanije">
        {stats.map((stat) => (
          <article key={stat.label} className={`cd-stat-card${stat.compact ? ' cd-stat-card--compact' : ''}`}>
            <span className="cd-stat-label">{stat.label}</span>
            <span className="cd-stat-value">{stat.value}</span>
            <span className={`cd-stat-sub cd-stat-sub--${stat.tone}`}>{stat.sub}</span>
          </article>
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
        <button type="button" className="cd-btn cd-btn--primary cd-section-action" onClick={() => onOpenView(VIEWS.CREATE_LISTING)}>
          Kreiraj oglas
        </button>
      </div>
      {loading && <div className="cd-inline-message" role="status">Učitavanje oglasa...</div>}
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
          <button type="button" className="cd-btn cd-btn--primary" onClick={() => onOpenView(VIEWS.CREATE_LISTING)}>
            Kreiraj prvi oglas
          </button>
        </div>
      )}
    </section>
  );
}

const EMPTY_LISTING = {
  naziv: '', opis: '', brojMjesta: '', rokPrijave: '', datumPocetka: '',
  trajanje: '', oblast: '', lokacija: '', tip: 'Onsite',
  tehnologije: '', uslovi: '', placenaPraksa: false,
};

function CreateListingShell({ onCancel, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_LISTING);
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
      const result = await createListing({
        naziv: formData.naziv,
        opis: formData.opis,
        brojMjesta: Number(formData.brojMjesta),
        rokPrijave: formData.rokPrijave,
        datumPocetka: formData.datumPocetka || null,
        trajanje: formData.trajanje || null,
        oblast: formData.oblast || null,
        lokacija: formData.lokacija || null,
        tip: formData.tip,
        placenaPraksa: formData.placenaPraksa,
        tehnologije: formData.tehnologije.split(',').map(t => t.trim()).filter(Boolean),
        uslovi: formData.uslovi.split('\n').map(u => u.trim()).filter(Boolean),
      });
      setSuccess('Oglas je uspješno kreiran.');
      setFormData(EMPTY_LISTING);
      onCreated(result?.oglas || result);
    } catch (err) {
      setError(err.message || 'Greška pri kreiranju oglasa.');
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
          {error && <div className="cd-inline-message cd-inline-message--error">{error}</div>}
          {success && <div className="cd-inline-message cd-inline-message--success">{success}</div>}

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Naziv oglasa *</label>
              <input className="cd-input" type="text" value={formData.naziv} onChange={(e) => handleChange('naziv', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Broj mjesta *</label>
              <input className="cd-input" type="number" min="1" value={formData.brojMjesta} onChange={(e) => handleChange('brojMjesta', e.target.value)} />
            </div>
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Opis *</label>
            <textarea className="cd-textarea" rows={4} value={formData.opis} onChange={(e) => handleChange('opis', e.target.value)} />
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Rok prijave *</label>
              <input className="cd-input" type="date" value={formData.rokPrijave} onChange={(e) => handleChange('rokPrijave', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Datum početka prakse</label>
              <input className="cd-input" type="date" value={formData.datumPocetka} onChange={(e) => handleChange('datumPocetka', e.target.value)} />
            </div>
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Lokacija</label>
              <input className="cd-input" type="text" placeholder="npr. Sarajevo" value={formData.lokacija} onChange={(e) => handleChange('lokacija', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Tip prakse</label>
              <select className="cd-input" value={formData.tip} onChange={(e) => handleChange('tip', e.target.value)}>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Trajanje (u mjesecima)</label>
              <input className="cd-input" type="number" min="1" placeholder="npr. 3" value={formData.trajanje} onChange={(e) => handleChange('trajanje', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Oblast</label>
              <input className="cd-input" type="text" placeholder="npr. Web razvoj" value={formData.oblast} onChange={(e) => handleChange('oblast', e.target.value)} />
            </div>
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Tehnologije / vještine (odvojene zarezom)</label>
            <input className="cd-input" type="text" placeholder="npr. React, Node.js, PostgreSQL" value={formData.tehnologije} onChange={(e) => handleChange('tehnologije', e.target.value)} />
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Uslovi / zahtjevi (svaki u novom redu)</label>
            <textarea className="cd-textarea" rows={4} placeholder={"Osnove JavaScript-a\nPoznavanje Gita\nStudent 3. ili 4. godine"} value={formData.uslovi} onChange={(e) => handleChange('uslovi', e.target.value)} />
          </div>

          <div className="cd-form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="placena-praksa" checked={formData.placenaPraksa} onChange={(e) => handleChange('placenaPraksa', e.target.checked)} />
            <label className="cd-form-label" htmlFor="placena-praksa" style={{ margin: 0 }}>Plaćena praksa (stipendija)</label>
          </div>

          <div className="cd-form-actions">
            <button type="submit" className="cd-btn cd-btn--primary" disabled={saving}>
              {saving ? 'Kreiranje...' : 'Objavi oglas'}
            </button>
            <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={saving}>
              Nazad
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatListingDate(value) {
  if (!value) return 'Nije uneseno';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Nije uneseno';
  return date.toLocaleDateString('bs-BA');
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

function DeleteModal({ check, deleting, deleteError, onConfirm, onCancel }) {
  const isBlocked = check && !check.canDeactivate;

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
            <h3 className="cd-confirm-title">Brisanje nije moguće</h3>
            <p className="cd-confirm-text">
              Vaši oglasi imaju aktivne prijave. Zatvorite sve oglase sa prijavama prije brisanja naloga.
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
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 className="cd-confirm-title">Obriši nalog</h3>
            <p className="cd-confirm-text">
              Ova akcija je <strong>trajna i nepovratna</strong>. Svi vaši podaci bit će trajno obrisani sa platforme.
            </p>
            {deleteError && (
              <div className="cd-inline-message cd-inline-message--error" role="alert">{deleteError}</div>
            )}
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={deleting}>Odustani</button>
              <button type="button" className="cd-btn cd-btn--danger" onClick={onConfirm} disabled={deleting}>
                {deleting ? 'Brisanje...' : 'Obriši nalog'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
