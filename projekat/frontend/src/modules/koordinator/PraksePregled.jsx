// PraksePregled.jsx
// Shows all internships the coordinator can monitor.

import { useState, useEffect } from 'react';
import { koordinatorService } from '../../services/koordinatorService';

const STATUS_MAP = {
  aktivna:  { label: 'Aktivna',  cls: 'kd-status--aktivna'  },
  zavrsena: { label: 'Završena', cls: 'kd-status--zavrsena' },
  otkazana: { label: 'Otkazana', cls: 'kd-status--odbijena' },
};

export default function PraksePregled() {
  const [prakse, setPrakse]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filterStatus, setFilter] = useState('');
  const [odabranaId, setOdabranaId] = useState(null);

  useEffect(() => {
    setLoading(true);
    koordinatorService.getPrakse(filterStatus)
      .then(res => {
        if (res.success) setPrakse(res.data);
        else setError('Greška pri učitavanju praksi.');
      })
      .catch(() => setError('Greška pri učitavanju praksi.'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const odabrana = prakse.find(p => p.id === odabranaId);

  return (
    <div>
      <div className="kd-module-header">
        <h2 className="kd-module-title">Aktivne prakse</h2>
        <select
          className="kd-select"
          value={filterStatus}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">Sve prakse</option>
          <option value="aktivna">Aktivne</option>
          <option value="zavrsena">Završene</option>
        </select>
      </div>

      <div className="kd-info-banner">
        <IconInfo /> Detaljan tok prakse (prisustvo, aktivnosti, evaluacija) bit će dostupan nakon Sprinta 10.
      </div>

      {loading && <div className="kd-loading">Učitavanje praksi…</div>}
      {error   && <div className="kd-empty"><IconWarning /><p className="kd-empty-text">{error}</p></div>}

      {!loading && !error && prakse.length === 0 && (
        <div className="kd-empty">
          <IconEmpty />
          <p className="kd-empty-text">Nema praksi za prikaz.</p>
        </div>
      )}

      {!loading && !error && prakse.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: odabranaId ? '1fr 1fr' : '1fr', gap: 'var(--space-4)' }}>
          {/* List */}
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Oglas / Kompanija</th>
                  <th>Aktivnosti</th>
                  <th>Prisustvo</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prakse.map(pr => {
                  const prijava = pr.prijava;
                  const student = prijava?.student;
                  const user    = student?.user;
                  const oglas   = prijava?.oglas;
                  const komp    = oglas?.kompanija;
                  const aktivnostiLen = pr.aktivnosti?.length || 0;
                  const prisustvo = pr.prisustvo || [];
                  const prisutanBr = prisustvo.filter(x => x.prisutan).length;
                  const s = STATUS_MAP[pr.status] || { label: pr.status, cls: 'kd-status--default' };

                  return (
                    <tr key={pr.id} style={odabranaId === pr.id ? { background: 'var(--color-primary-subtle)' } : {}}>
                      <td>
                        <strong>{user?.ime} {user?.prezime}</strong>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{student?.indeks}</div>
                      </td>
                      <td>
                        <div>{oglas?.naziv || '—'}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{komp?.naziv || ''}</div>
                      </td>
                      <td style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
                        {aktivnostiLen > 0
                          ? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{aktivnostiLen}</span>
                          : <span style={{ color: 'var(--color-faint)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {prisustvo.length > 0 ? (
                          <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                            {prisutanBr}/{prisustvo.length}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--color-faint)' }}>—</span>
                        )}
                      </td>
                      <td><span className={`kd-status ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <button
                          className="kd-btn kd-btn--ghost kd-btn--sm"
                          onClick={() => setOdabranaId(odabranaId === pr.id ? null : pr.id)}
                        >
                          {odabranaId === pr.id ? 'Zatvori' : 'Pregled'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {odabranaId && odabrana && (
            <PraksaDetaljiPanel praksa={odabrana} onClose={() => setOdabranaId(null)} />
          )}
        </div>
      )}
    </div>
  );
}

function PraksaDetaljiPanel({ praksa, onClose }) {
  const prijava   = praksa.prijava;
  const student   = prijava?.student;
  const user      = student?.user;
  const oglas     = prijava?.oglas;
  const komp      = oglas?.kompanija;
  const aktivnosti = praksa.aktivnosti || [];
  const prisustvo  = praksa.prisustvo  || [];
  const prisutanBr = prisustvo.filter(x => x.prisutan).length;
  const prisPost   = prisustvo.length > 0 ? Math.round((prisutanBr / prisustvo.length) * 100) : 0;

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface-alt)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>
          {user?.ime} {user?.prezime}
        </span>
        <button className="kd-modal-close" onClick={onClose}>✕</button>
      </div>

      <div style={{ padding: 'var(--space-5)' }}>
        {/* Student + Oglas basics */}
        <div className="kd-detail-grid" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="kd-detail-field"><label>Indeks</label><span style={{ fontFamily: 'monospace' }}>{student?.indeks}</span></div>
          <div className="kd-detail-field"><label>Odsjek</label><span>{student?.odsjek}</span></div>
          <div className="kd-detail-field"><label>Oglas</label><span>{oglas?.naziv}</span></div>
          <div className="kd-detail-field"><label>Kompanija</label><span>{komp?.naziv}</span></div>
        </div>

        {/* Prisustvo progress */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <p className="kd-detail-section-title">Prisustvo</p>
          {prisustvo.length === 0 ? (
            <div className="kd-info-banner" style={{ fontSize: 'var(--font-size-xs)' }}>
              Evidencija prisustva dostupna u Sprintu 10.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="kd-progress-bar-wrap" style={{ flex: 1 }}>
                <div className="kd-progress-bar" style={{ width: `${prisPost}%`, background: prisPost >= 80 ? 'var(--color-success)' : prisPost >= 50 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{prisPost}%</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{prisutanBr}/{prisustvo.length}</span>
            </div>
          )}
        </div>

        {/* Recent activities */}
        <div>
          <p className="kd-detail-section-title">Nedavne aktivnosti ({aktivnosti.length})</p>
          {aktivnosti.length === 0 ? (
            <div className="kd-info-banner" style={{ fontSize: 'var(--font-size-xs)' }}>
              Aktivnosti dostupne u Sprintu 10.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: 220, overflowY: 'auto' }}>
              {aktivnosti.map(a => (
                <div key={a.id} style={{
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-3)',
                }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                    {new Date(a.createdAt).toLocaleDateString('bs-BA')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>{a.opis || '—'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function IconEmpty() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}