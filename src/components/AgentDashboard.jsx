import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';
import { 
  Truck, 
  CheckCircle2, 
  CheckSquare,
  Globe
} from 'lucide-react';
import { VILLES_RDC } from '../data/mockData';

export default function AgentDashboard({ agent, passages, onConfirmPassage }) {
  const [selectedVilleFilter, setSelectedVilleFilterState] = useState(() => {
    try {
      return localStorage.getItem('eco_clean_agent_filter') || 'Tous';
    } catch {
      return 'Tous';
    }
  });

  const setSelectedVilleFilter = (f) => {
    setSelectedVilleFilterState(f);
    try {
      localStorage.setItem('eco_clean_agent_filter', f);
    } catch {}
  };
  const [noteText, setNoteText] = useState({});

  const agentPassages = passages.filter(p =>
    p.agentId === agent.id ||
    (agent.quartiersAssigned && agent.quartiersAssigned.some(z => z === p.quartier || z === p.commune))
  );

  const displayedPassages = selectedVilleFilter === 'Tous'
    ? agentPassages
    : agentPassages.filter(p => (p.ville || 'Kinshasa') === selectedVilleFilter);

  const completedCount = agentPassages.filter(p => p.status === 'Ramassé').length;
  const pendingCount = agentPassages.length - completedCount;

  const handlePassageValidation = (passageId) => {
    const note = noteText[passageId] || 'Ramassage effectué avec succès.';
    onConfirmPassage(passageId, note);
    alert('Passage validé ! L\'Admin et le Client ont été notifiés.');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      
      {/* Agent Banner */}
      <div className="eco-card" style={{ padding: '24px', borderRadius: '20px', backgroundColor: '#FFFFFF', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1B5E20', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={30} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>Feuille de Route — {agent.name}</h2>
              <span className="badge badge-active">{agent.status || 'En Mission'}</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={14} color="#2E7D32" />
              <span>Véhicule: <strong>{agent.tricycleNo}</strong></span>
              <Globe size={14} color="#2E7D32" />
              <span>Zones assignées: <strong>{agent.quartiersAssigned ? agent.quartiersAssigned.join(', ') : 'Non défini'}</strong></span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ padding: '10px 18px', borderRadius: '12px', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803D' }}>{completedCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>Parcelles Ramassées</div>
          </div>
          <div style={{ padding: '10px 18px', borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B45309' }}>{pendingCount}</div>
            <div style={{ fontSize: '0.78rem', color: '#92400E', fontWeight: 600 }}>En Attente</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ marginBottom: '28px' }}>
        <InteractiveMap passages={agentPassages} role="agent" />
      </div>

      {/* Mission list header + filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare color="#2E7D32" /> Ordres de Mission du Jour ({displayedPassages.length} ménages)
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>Filtrer par Ville:</span>
          <select className="form-select" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }} value={selectedVilleFilter} onChange={(e) => setSelectedVilleFilter(e.target.value)}>
            <option value="Tous">Toutes les villes</option>
            {VILLES_RDC.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {displayedPassages.length === 0 ? (
        <div className="eco-card" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
          Aucune tournée planifiée pour ce filtre.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {displayedPassages.map(p => {
            const isDone = p.status === 'Ramassé';
            return (
              <div key={p.id} className="eco-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: isDone ? '6px solid #2E7D32' : '6px solid #F59E0B', backgroundColor: isDone ? '#FAFDFB' : '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{p.clientName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#2E7D32', fontWeight: 700, marginTop: '2px' }}>
                      📍 {p.ville || 'Kinshasa'} — {p.commune || 'Commune'} / {p.quartier} ({p.avenue}, {p.parcelleNo})
                    </div>
                  </div>
                  <span className={`badge ${isDone ? 'badge-ramasse' : 'badge-planifie'}`}>{p.status}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
                  <span>🕒 <strong>{p.timeSlot}</strong></span>
                </div>

                {isDone ? (
                  <div style={{ backgroundColor: '#DCFCE7', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', color: '#166534' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Collecte Confirmée à {p.completedAt}
                    </div>
                    {p.agentNote && <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Note: "{p.agentNote}"</div>}
                  </div>
                ) : (
                  <div>
                    <input type="text" className="form-input" placeholder="Remarque agent (ex: 2 sacs enlevés)..." style={{ fontSize: '0.85rem', padding: '8px 12px', marginBottom: '10px' }} value={noteText[p.id] || ''} onChange={(e) => setNoteText({...noteText, [p.id]: e.target.value})} />
                    <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }} onClick={() => handlePassageValidation(p.id)}>
                      <CheckCircle2 size={18} /> Valider l'Exécution du Ramassage
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
