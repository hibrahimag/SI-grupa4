import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getActiveListings } from '../services/listingsService';
import './StudentDashboard.css';

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_PRAKSE = [
  {
    id: 1,
    naziv: 'Frontend Developer Intern',
    kompanija: 'LANACO d.o.o.',
    logo: 'LA',
    logoColor: '#1a6fd4',
    opis: 'Tražimo motiviranog studenta za rad na modernim web aplikacijama koristeći React i TypeScript. Naučit ćeš best practices u razvoju UI komponenti i raditi na stvarnim projektima u agilnom timu sa iskusnim seniorima.',
    tehnologije: ['React', 'TypeScript', 'CSS', 'Git'],
    trajanje: 3,
    brojMjesta: 2,
    lokacija: 'Sarajevo',
    tip: 'Hybrid',
    datumObjave: '2026-04-25',
    datumPocetka: '2026-06-01',
    stipendija: true,
  },
  {
    id: 2,
    naziv: 'Backend Developer Intern (Node.js)',
    kompanija: 'Telegroup d.o.o.',
    logo: 'TG',
    logoColor: '#0e9e6e',
    opis: 'Pridruži se backend timu i radi na razvoju REST API-ja, integraciji baza podataka i optimizaciji serverskih aplikacija. Odlična prilika za upoznavanje sa production sistemima i cloud arhitekturom.',
    tehnologije: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    trajanje: 6,
    brojMjesta: 1,
    lokacija: 'Banja Luka',
    tip: 'Onsite',
    datumObjave: '2026-04-20',
    datumPocetka: '2026-07-01',
    stipendija: false,
  },
  {
    id: 3,
    naziv: 'Data Science Intern',
    kompanija: 'Intera d.o.o.',
    logo: 'IN',
    logoColor: '#6d4ce1',
    opis: 'Istraži svijet podataka uz naš tim data scientista. Radićeš na analizi podataka, vizualizaciji i izgradnji ML modela za stvarne poslovne probleme. Obuka na internim datasetima i mentorstvo senior kolega.',
    tehnologije: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter', 'SQL'],
    trajanje: 4,
    brojMjesta: 2,
    lokacija: 'Mostar',
    tip: 'Remote',
    datumObjave: '2026-05-01',
    datumPocetka: '2026-06-15',
    stipendija: true,
  },
  {
    id: 4,
    naziv: 'Mobile Developer Intern (React Native)',
    kompanija: 'ASA Tech',
    logo: 'AT',
    logoColor: '#e07b1a',
    opis: 'Razvijaj cross-platform mobilne aplikacije za iOS i Android. Radićeš u timu iskusnih mobile developera na live projektu sa stotinama hiljada korisnika. Pokrivamo sve aspekte modernog mobilnog razvoja.',
    tehnologije: ['React Native', 'JavaScript', 'Firebase', 'Redux'],
    trajanje: 3,
    brojMjesta: 1,
    lokacija: 'Sarajevo',
    tip: 'Hybrid',
    datumObjave: '2026-04-18',
    datumPocetka: '2026-06-01',
    stipendija: false,
  },
  {
    id: 5,
    naziv: 'DevOps / Cloud Intern',
    kompanija: 'Logosoft d.o.o.',
    logo: 'LS',
    logoColor: '#0891b2',
    opis: 'Nauči kako funkcionira moderna cloud infrastruktura. Radićeš sa CI/CD pipeline-ovima, containerizacijom i automatizaciji deployment procesa. Direktan pristup AWS okruženju i real-world projektima od prvog dana.',
    tehnologije: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    trajanje: 6,
    brojMjesta: 1,
    lokacija: 'Sarajevo',
    tip: 'Remote',
    datumObjave: '2026-05-05',
    datumPocetka: '2026-07-15',
    stipendija: true,
  },
  {
    id: 6,
    naziv: 'Full Stack Developer Intern',
    kompanija: 'Mistral Technologies',
    logo: 'MT',
    logoColor: '#be185d',
    opis: 'Idealna praksa za studente koji žele iskustvo na svim slojevima aplikacije. Radićeš na internom projektu za upravljanje resursima koji koriste stotine zaposlenih kompanije i njenih partnera.',
    tehnologije: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    trajanje: 4,
    brojMjesta: 3,
    lokacija: 'Sarajevo',
    tip: 'Hybrid',
    datumObjave: '2026-04-10',
    datumPocetka: '2026-06-01',
    stipendija: false,
  },
  {
    id: 7,
    naziv: 'UI/UX Design Intern',
    kompanija: 'Bit Alliance',
    logo: 'BA',
    logoColor: '#7c3aed',
    opis: 'Kreativna praksa za studente zainteresovane za product design. Radićeš na istraživanju korisnika, wireframingu i high-fidelity prototipovima koristeći Figma. Mentorstvo od senior designera na klijentskim projektima.',
    tehnologije: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    trajanje: 2,
    brojMjesta: 2,
    lokacija: 'Tuzla',
    tip: 'Remote',
    datumObjave: '2026-05-08',
    datumPocetka: '2026-06-01',
    stipendija: true,
  },
  {
    id: 8,
    naziv: 'Java Backend Developer Intern',
    kompanija: 'LANACO d.o.o.',
    logo: 'LA',
    logoColor: '#1a6fd4',
    opis: 'Pridruži se timu koji razvija enterprise aplikacije za bankarski sektor. Naučit ćeš Spring Boot, REST API dizajn i rad sa Oracle bazama podataka u high-availability okruženju sa strogim SLA zahtjevima.',
    tehnologije: ['Java', 'Spring Boot', 'Oracle DB', 'REST API', 'Maven'],
    trajanje: 5,
    brojMjesta: 1,
    lokacija: 'Sarajevo',
    tip: 'Onsite',
    datumObjave: '2026-04-22',
    datumPocetka: '2026-07-01',
    stipendija: false,
  },
];

const MOCK_TEHNOLOGIJE = [...new Set(MOCK_PRAKSE.flatMap(p => p.tehnologije))].sort();

function formatDate(dateStr) {
  if (!dateStr) return 'Nije uneseno';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Nije uneseno';

  return date.toLocaleDateString('bs-BA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function relativeDate(dateStr) {
  if (!dateStr) return 'Nije uneseno';

  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (Number.isNaN(diff)) return 'Nije uneseno';
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Juče';
  if (diff < 7) return `Prije ${diff} dana`;
  if (diff < 30) return `Prije ${Math.floor(diff / 7)} sedm.`;
  return formatDate(dateStr);
}

function trajanjeLabel(mj) {
  if (!mj) return 'Trajanje nije uneseno';
  if (typeof mj === 'string' && Number.isNaN(Number(mj))) return mj;

  mj = Number(mj);
  if (mj === 1) return '1 mjesec';
  if (mj < 5) return `${mj} mjeseca`;
  return `${mj} mjeseci`;
}

function mjestLabel(n) {
  return n === 1 ? '1 mjesto' : `${n} mjesta`;
}

function normalizeListing(listing) {
  const kompanija = listing.Kompanija || listing.kompanija || {};
  const companyName = kompanija.naziv || 'Kompanija';
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'KO';

  return {
    id: listing.id,
    naziv: listing.naziv,
    kompanija: companyName,
    logo: initials,
    logoColor: '#1a6fd4',
    opis: listing.opis || 'Opis oglasa nije unesen.',
    tehnologije: listing.oblast ? [listing.oblast] : [],
    trajanje: listing.trajanje,
    brojMjesta: Number(listing.brojMjesta) || 0,
    lokacija: kompanija.adresa || 'Lokacija nije unesena',
    tip: 'Onsite',
    datumObjave: listing.datumObjave,
    rokPrijave: listing.rokPrijave,
    stipendija: Boolean(listing.placenaPraksa),
  };
}

// ── PraksaCard ─────────────────────────────────────────────────────────────
function PraksaCard({ praksa }) {
  return (
    <div className="sd-card-wrap">
    <article className="sd-card" tabIndex={0} role="button" aria-label={`${praksa.naziv} — ${praksa.kompanija}`}>
      <div className="sd-card-head">
        <div className="sd-company-row">
          <div className="sd-logo" style={{ background: praksa.logoColor }}>
            {praksa.logo}
          </div>
          <div className="sd-company-info">
            <span className="sd-company-name">{praksa.kompanija}</span>
            <span className="sd-location">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {praksa.lokacija}
            </span>
          </div>
          <div className="sd-head-badges">
            <span className={`sd-tip-badge sd-tip--${praksa.tip.toLowerCase()}`}>{praksa.tip}</span>
            {praksa.stipendija && <span className="sd-stip-badge">Stipendija</span>}
          </div>
        </div>
        <h2 className="sd-card-title">{praksa.naziv}</h2>
        <p className="sd-card-opis">{praksa.opis}</p>
      </div>

      <div className="sd-tech-row">
        {praksa.tehnologije.map(t => (
          <span key={t} className="sd-tech-tag">{t}</span>
        ))}
      </div>

      <div className="sd-card-foot">
        <div className="sd-meta-row">
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {trajanjeLabel(praksa.trajanje)}
          </span>
          <span className="sd-meta-dot"/>
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {mjestLabel(praksa.brojMjesta)}
          </span>
          <span className="sd-meta-dot"/>
          <span className="sd-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Rok prijave {formatDate(praksa.rokPrijave)}
          </span>
        </div>
        <div className="sd-foot-right">
          <span className="sd-published">{relativeDate(praksa.datumObjave)}</span>
          <button className="sd-btn-detail" onClick={e => e.stopPropagation()} tabIndex={-1}>
            Saznaj više
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
    </div>
  );
}

// ── StudentDashboard ───────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterTehs, setFilterTehs] = useState([]);
  const [filterTips, setFilterTips] = useState([]);
  const [filterTrajanja, setFilterTrajanja] = useState([]);
  const [sortBy, setSortBy] = useState('najnovije');
  const [sectionsOpen, setSectionsOpen] = useState({ tech: false, duration: false, type: false, sort: false });
  const [prakse, setPrakse] = useState([]);
  const [loadingPrakse, setLoadingPrakse] = useState(true);
  const [prakseError, setPrakseError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadActiveListings() {
      setLoadingPrakse(true);
      setPrakseError('');

      try {
        const listings = await getActiveListings();
        if (active) {
          setPrakse(Array.isArray(listings) ? listings.map(normalizeListing) : []);
        }
      } catch (err) {
        if (active) setPrakseError(err.message || 'Greška pri učitavanju oglasa.');
      } finally {
        if (active) setLoadingPrakse(false);
      }
    }

    loadActiveListings();

    return () => {
      active = false;
    };
  }, []);

  const sveTehnologije = useMemo(() => {
    const source = prakse.length ? prakse : [];
    return [...new Set(source.flatMap(p => p.tehnologije))].sort();
  }, [prakse]);

  function handleLogout() {
    logout();
    navigate('/auth');
  }

  const filteredPrakse = useMemo(() => {
    let r = [...prakse];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      r = r.filter(p =>
        p.naziv.toLowerCase().includes(s) ||
        p.kompanija.toLowerCase().includes(s) ||
        p.tehnologije.some(t => t.toLowerCase().includes(s))
      );
    }
    if (filterTehs.length) r = r.filter(p => filterTehs.some(t => p.tehnologije.includes(t)));
    if (filterTips.length) r = r.filter(p => filterTips.includes(p.tip));
    if (filterTrajanja.length) r = r.filter(p =>
      filterTrajanja.some(range => {
        const trajanje = Number(p.trajanje);
        if (Number.isNaN(trajanje)) return false;
        if (range === '1-2') return trajanje <= 2;
        if (range === '3') return trajanje === 3;
        if (range === '4-5') return trajanje >= 4 && trajanje <= 5;
        if (range === '6+') return trajanje >= 6;
        return false;
      })
    );
    if (sortBy === 'najnovije') r.sort((a, b) => new Date(b.datumObjave) - new Date(a.datumObjave));
    else if (sortBy === 'najstarije') r.sort((a, b) => new Date(a.datumObjave) - new Date(b.datumObjave));
    else if (sortBy === 'trajanje-asc') r.sort((a, b) => Number(a.trajanje) - Number(b.trajanje));
    else if (sortBy === 'trajanje-desc') r.sort((a, b) => Number(b.trajanje) - Number(a.trajanje));
    return r;
  }, [prakse, search, filterTehs, filterTips, filterTrajanja, sortBy]);

  const hasFilters = search || filterTehs.length || filterTips.length || filterTrajanja.length;

  function toggleSection(key) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArr(setter, value) {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  function resetFilters() {
    setSearch(''); setFilterTehs([]); setFilterTips([]); setFilterTrajanja([]);
  }

  return (
    <div className={`sd-page${darkMode ? ' dark' : ''}`}>
      {/* Navbar */}
      <nav className="sd-nav">
        <span className="sd-nav-brand">PraksaHub</span>
        <div className="sd-nav-right">
          <button className="sd-theme-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Svjetla tema' : 'Tamna tema'}>
            {darkMode ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Collapsing filter sidebar ───────────────────────────────────── */}
      <aside className="sd-sidebar">
        {/* Collapsed icon strip */}
        <div className="sd-sidebar-tab">
          <div className="sd-sb-tab-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            {filterTehs.length > 0 && <span className="sd-sb-badge">{filterTehs.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {filterTrajanja.length > 0 && <span className="sd-sb-badge">{filterTrajanja.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {filterTips.length > 0 && <span className="sd-sb-badge">{filterTips.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4"/><polyline points="3 8 7 4 11 8"/>
              <path d="M17 8v12"/><polyline points="21 16 17 20 13 16"/>
            </svg>
          </div>
          {/* Footer icons — avatar + exit */}
          <div className="sd-sb-tab-footer">
            <div className="sd-sb-tab-icon">
              <div className="sd-nav-avatar sd-sb-tab-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
            </div>
            <div className="sd-sb-tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div className="sd-sidebar-inner">
          <div className="sd-sidebar-content">
          {/* Search with spinning glow border on focus */}
          <div className="sd-sb-search-outer sd-sidebar-search">
            <div className="sd-search-wrap">
              <svg className="sd-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="sd-search"
                type="text"
                placeholder="Pretraži..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="sd-search-clear" onClick={() => setSearch('')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* VS Code-style collapsible sections */}
          <div className="sd-sidebar-filters">

            {/* Tehnologija — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('tech')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <span className="sd-sb-section-title">Tehnologija</span>
                {filterTehs.length > 0 && <span className="sd-sb-count">{filterTehs.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.tech ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.tech && (
                <div className="sd-sb-section-body">
                  {sveTehnologije.map(t => (
                    <label key={t} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTehs.includes(t)} onChange={() => toggleArr(setFilterTehs, t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Trajanje — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('duration')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span className="sd-sb-section-title">Trajanje</span>
                {filterTrajanja.length > 0 && <span className="sd-sb-count">{filterTrajanja.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.duration ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.duration && (
                <div className="sd-sb-section-body">
                  {[['1-2','1–2 mj.'],['3','3 mj.'],['4-5','4–5 mj.'],['6+','6+ mj.']].map(([val,lbl]) => (
                    <label key={val} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTrajanja.includes(val)} onChange={() => toggleArr(setFilterTrajanja, val)} />
                      <span>{lbl}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Tip prakse — multi-select checkboxes */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('type')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="sd-sb-section-title">Tip prakse</span>
                {filterTips.length > 0 && <span className="sd-sb-count">{filterTips.length}</span>}
                <svg className={`sd-sb-chevron${sectionsOpen.type ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.type && (
                <div className="sd-sb-section-body">
                  {['Remote','Hybrid','Onsite'].map(tip => (
                    <label key={tip} className="sd-sb-checkbox-row">
                      <input type="checkbox" checked={filterTips.includes(tip)} onChange={() => toggleArr(setFilterTips, tip)} />
                      <span>{tip}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sortiranje — single radio selection */}
            <div className="sd-sb-section">
              <button className="sd-sb-section-header" onClick={() => toggleSection('sort')}>
                <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 16V4"/><polyline points="3 8 7 4 11 8"/>
                  <path d="M17 8v12"/><polyline points="21 16 17 20 13 16"/>
                </svg>
                <span className="sd-sb-section-title">Sortiraj po</span>
                <svg className={`sd-sb-chevron${sectionsOpen.sort ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              {sectionsOpen.sort && (
                <div className="sd-sb-section-body">
                  {[['najnovije','Najnovije'],['najstarije','Najstarije'],['trajanje-asc','Trajanje ↑'],['trajanje-desc','Trajanje ↓']].map(([val,lbl]) => (
                    <label key={val} className="sd-sb-radio-row">
                      <input type="radio" name="sortBy" value={val} checked={sortBy === val} onChange={() => setSortBy(val)} />
                      <span>{lbl}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {hasFilters && (
              <button className="sd-reset-btn sd-sb-reset" onClick={resetFilters}>Resetuj filtere</button>
            )}
          </div>
          </div>{/* end sd-sidebar-content */}

          {/* Sticky footer — user + logout */}
          <div className="sd-sidebar-footer">
            <button className="sd-sb-footer-row">
              <div className="sd-nav-avatar sd-sb-footer-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
              <span className="sd-sb-footer-text">{user?.username || 'Student'}</span>
            </button>
            <button className="sd-sb-footer-row sd-sb-logout-row" onClick={handleLogout}>
              <svg className="sd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="sd-sb-footer-text">Odjava</span>
            </button>
          </div>
        </div>{/* end sd-sidebar-inner */}
      </aside>

      <div className="sd-container">
        {/* Header */}
        <header className="sd-header">
          <div className="sd-header-text">
            <h1 className="sd-title">Dostupne prakse</h1>
            <p className="sd-subtitle">Pronađi svoju idealnu praksu i pokreni karijeru</p>
          </div>
          <div className="sd-stats">
            <div className="sd-stat-card">
              <span className="sd-stat-num">{loadingPrakse ? '...' : prakse.length}</span>
              <span className="sd-stat-lbl">Aktivnih oglasa</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-num">{loadingPrakse ? '...' : new Set(prakse.map(p => p.kompanija)).size}</span>
              <span className="sd-stat-lbl">Kompanija</span>
            </div>
            <div className="sd-stat-card">
              <span className="sd-stat-num">{loadingPrakse ? '...' : prakse.reduce((s, p) => s + p.brojMjesta, 0)}</span>
              <span className="sd-stat-lbl">Slobodnih mjesta</span>
            </div>
          </div>
        </header>

        <p className="sd-results-info">
          {loadingPrakse
            ? 'Ucitavanje oglasa...'
            : prakseError
              ? prakseError
              : filteredPrakse.length === 0
            ? 'Nema rezultata'
            : <><strong>{filteredPrakse.length}</strong> {filteredPrakse.length === 1 ? 'oglas' : 'oglasa'} pronađeno{hasFilters && ' · filtrirano'}</>
          }
        </p>

        {/* List */}
        <div className="sd-list">
          {loadingPrakse ? (
            <div className="sd-empty">
              <p className="sd-empty-title">Ucitavanje oglasa...</p>
            </div>
          ) : prakseError ? (
            <div className="sd-empty">
              <p className="sd-empty-title">Greska pri ucitavanju oglasa</p>
              <p className="sd-empty-sub">{prakseError}</p>
            </div>
          ) : filteredPrakse.length === 0 ? (
            <div className="sd-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="sd-empty-title">Nema pronađenih oglasa</p>
              <p className="sd-empty-sub">
                Pokušaj sa drugačijim filterima ili{' '}
                <button className="sd-empty-link" onClick={resetFilters}>resetuj pretragu</button>.
              </p>
            </div>
          ) : (
            filteredPrakse.map(p => <PraksaCard key={p.id} praksa={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
