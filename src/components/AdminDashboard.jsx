import React, { useState } from 'react';
import InteractiveMap from './InteractiveMap';
import { CheckCircle2, Truck, Shield, Globe, Trash2 } from 'lucide-react';
import { VILLES_RDC } from '../data/mockData';

export default function AdminDashboard({ 
  clients, agents, admins, passages, complaints,
  onValidatePayment, onResolveComplaint, onAddAgent, onAddAdmin,
  onDeleteClient, onDeleteAgent, onDeleteAdmin
}) {
  const [activeTab, setActiveTab] = useState('payments');
  const [selectedProofModal, setSelectedProofModal] = useState(null);
  const [selectedComplaintPhotoModal, setSelectedComplaintPhotoModal] = useState(null);

  // Agent creation
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPhone, setNewAgentPhone] = useState('');
  const [newAgentPassword, setNewAgentPassword] = useState('');
  const [selectedVilleAgent, setSelectedVilleAgent] = useState('Kinshasa');
  const [selectedCommunesAgent, setSelectedCommunesAgent] = useState([]);
  const [agentSuccess, setAgentSuccess] = useState(false);

  // Admin creation
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminSuccess, setAdminSuccess] = useState(false);

  const pendingPayments = clients.flatMap(c =>
    (c.paymentHistory || [])
      .filter(p => p.status === 'En attente')
      .map(p => ({ ...p, clientName: c.name, ville: c.ville, commune: c.commune, quartier: c.quartier, avenue: c.avenue, clientId: c.id }))
  );

  const totalRevenueFC = clients.reduce((acc, c) => {
    return acc + (c.paymentHistory || []).filter(p => p.status === 'Validé').reduce((s, p) => s + (p.amount || 0), 0);
  }, 0);

  const activeCount = clients.filter(c => c.status === 'Actif').length;
  const pendingComplaintsCount = complaints.filter(c => c.status !== 'Résolu').length;

  const villeObj = VILLES_RDC.find(v => v.name === selectedVilleAgent) || VILLES_RDC[0];

  const toggleCommune = (c) => {
    setSelectedCommunesAgent(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleCreateAgent = (e) => {
    e.preventDefault();
    // Auto-assign tricycle number based on total agents count (sequential, padded)
    const nextTricycleNum = String(agents.length + 1).padStart(2, '0');
    const autoTricycleNo = `Tricycle EcoClean #${nextTricycleNum}`;
    onAddAgent({
      id: `agt-${Date.now()}`,
      name: newAgentName,
      phone: newAgentPhone,
      password: newAgentPassword,
      tricycleNo: autoTricycleNo,
      quartiersAssigned: selectedCommunesAgent.length > 0 ? selectedCommunesAgent : [selectedVilleAgent],
      ratingAvg: 5.0, ratingsCount: 0, status: 'Sur le terrain'
    });
    setAgentSuccess(true);
    setNewAgentName(''); setNewAgentPhone(''); setNewAgentPassword(''); setSelectedCommunesAgent([]);
    setTimeout(() => setAgentSuccess(false), 3000);
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    onAddAdmin({ id: `adm-${Date.now()}`, name: newAdminName, phone: newAdminPhone, password: newAdminPassword });
    setAdminSuccess(true); setNewAdminName(''); setNewAdminPhone(''); setNewAdminPassword('');
    setTimeout(() => setAdminSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto', padding: '0 20px' }}>

      {/* Stats banner */}
      <div className="eco-card" style={{ padding: '24px', borderRadius: '20px', backgroundColor: '#FFFFFF', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚙️ Espace Administration — Eco Clean RDC
            <span className="badge badge-active">Admin Principal</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px' }}>Gestion nationale du service d'assainissement à travers toute la République Démocratique du Congo.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#E8F5E9', border: '1px solid #A5D6A7' }}>
            <div style={{ fontSize: '0.75rem', color: '#1B5E20', fontWeight: 700, textTransform: 'uppercase' }}>Recettes Totales RDC</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>{totalRevenueFC.toLocaleString()} <span style={{ fontSize: '0.9rem' }}>FC</span></div>
          </div>
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#F0F7F4', border: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: '0.75rem', color: '#1B5E20', fontWeight: 700, textTransform: 'uppercase' }}>Abonnés Actifs (RDC)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{activeCount} <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Ménages</span></div>
          </div>
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '0.75rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase' }}>Paiements en Attente</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400E', marginTop: '4px' }}>{pendingPayments.length} <span style={{ fontSize: '0.9rem' }}>À vérifier</span></div>
          </div>
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <div style={{ fontSize: '0.75rem', color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>Réclamations</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>{pendingComplaintsCount} <span style={{ fontSize: '0.9rem' }}>Incidents</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
        {[
          { id: 'payments', label: `💳 Validation Paiements (${pendingPayments.length})` },
          { id: 'create_account', label: '➕ Créer Comptes (Agents & Admins)' },
          { id: 'dispatch', label: '📍 Carte & Affectation Agents' },
          { id: 'quality', label: `🚨 Contrôle Qualité (${complaints.length})` },
          { id: 'clients', label: `👥 Répertoire Clients (${clients.length})` },
        ].map(tab => (
          <button key={tab.id} className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '10px 18px', fontSize: '0.85rem', borderRadius: '10px', whiteSpace: 'nowrap' }} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className="tab-transition-enter">
      {/* TAB: PAYMENT VERIFICATION */}
      {activeTab === 'payments' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '16px' }}>💳 Vérification & Approbation des Paiements Mobile Money</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '20px' }}>
            Vérifiez le numéro de série et la preuve de paiement soumise. Lorsque vous cliquez sur "Approuver", l'abonnement du client s'active automatiquement pour une période officielle de 30 jours.
          </p>
          {pendingPayments.length === 0 ? (
            <div className="eco-card" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>✅ Aucun paiement en attente d'approbation.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {pendingPayments.map(p => (
                <div key={p.id} className="eco-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: '5px solid #F59E0B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>{p.clientName}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{p.ville || 'Kinshasa'} — {p.commune || ''} • {p.quartier}, {p.avenue}</div>
                    </div>
                    <span className="badge badge-pending">Validation Requise</span>
                  </div>

                  <div style={{ backgroundColor: '#F8FAF8', padding: '14px', borderRadius: '10px', fontSize: '0.88rem', marginBottom: '16px' }}>
                    <div>Opérateur Mobile Money: <strong>{p.provider}</strong></div>
                    <div>Montant Transféré: <strong style={{ color: '#2E7D32' }}>{p.amount?.toLocaleString()} FC</strong></div>
                    <div>N° de Série Transaction: <code style={{ backgroundColor: '#E2E8F0', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>{p.serialNumber}</code></div>
                    <div>Date de Soumission: <strong>{p.date}</strong></div>
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #CBD5E1', color: '#1B5E20', fontSize: '0.82rem', fontWeight: 600 }}>
                      📅 Période si approuvé aujourd'hui : du <strong>{new Date().toISOString().split('T')[0]}</strong> au <strong>{new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}</strong>
                    </div>
                  </div>

                  {p.proofUrl && (
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>Capture d'écran de preuve :</div>
                      <img src={p.proofUrl} alt="Proof" style={{ height: '120px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', objectFit: 'cover' }} onClick={() => setSelectedProofModal(p.proofUrl)} />
                      <div style={{ fontSize: '0.72rem', color: '#2E7D32', marginTop: '2px', cursor: 'pointer' }} onClick={() => setSelectedProofModal(p.proofUrl)}>🔍 Agrandir la Preuve</div>
                    </div>
                  )}

                  <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.92rem', backgroundColor: '#2E7D32' }} onClick={() => { onValidatePayment(p.clientId, p.id); alert(`Paiement de ${p.clientName} approuvé ! Abonnement actif pour 30 jours.`); }}>
                    <CheckCircle2 size={18} /> Approuver le Paiement & Activer l'Abonnement (30 Jours)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CREATE ACCOUNTS */}
      {activeTab === 'create_account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          
          {/* Agent form */}
          <div className="eco-card" style={{ padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1B5E20', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={22} color="#2E7D32" /> Créer un Compte Agent Collecteur
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '18px' }}>Seul l'Admin peut enregistrer les agents de terrain et leur affecter des zones en RDC.</p>
            {agentSuccess && <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700, marginBottom: '16px', fontSize: '0.85rem' }}>✅ Compte Agent créé avec succès !</div>}

            {/* Auto tricycle preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#E8F5E9', borderRadius: '10px', border: '1px solid #A5D6A7', marginBottom: '18px' }}>
              <Truck size={18} color="#2E7D32" />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#1B5E20', fontWeight: 700, textTransform: 'uppercase' }}>Tricycle auto-assigné</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1B5E20' }}>Tricycle EcoClean #{String(agents.length + 1).padStart(2, '0')}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', backgroundColor: '#2E7D32', color: 'white', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>Attribué automatiquement</span>
            </div>

            <form onSubmit={handleCreateAgent}>
              <div className="form-group">
                <label className="form-label">Nom Complet de l'Agent</label>
                <input type="text" className="form-input" placeholder="Ex: MUKENDI Marcel" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Numéro de Téléphone <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>(identifiant)</span></label>
                  <input type="tel" className="form-input" placeholder="+243 81 00 00 000" value={newAgentPhone} onChange={(e) => setNewAgentPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de Passe</label>
                  <input type="text" className="form-input" placeholder="Mot de passe initial" value={newAgentPassword} onChange={(e) => setNewAgentPassword(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ville d'Intervention en RDC</label>
                <select className="form-select" value={selectedVilleAgent} onChange={(e) => { setSelectedVilleAgent(e.target.value); setSelectedCommunesAgent([]); }}>
                  {VILLES_RDC.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Communes Attribuées ({selectedCommunesAgent.length} sélectionnées)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {villeObj.communes.map(c => {
                    const isSel = selectedCommunesAgent.includes(c);
                    return (
                      <button key={c} type="button" onClick={() => toggleCommune(c)} style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, border: isSel ? '1px solid #2E7D32' : '1px solid #E2E8F0', backgroundColor: isSel ? '#E8F5E9' : '#FFFFFF', color: isSel ? '#1B5E20' : '#64748B', cursor: 'pointer' }}>
                        {isSel ? '✓ ' : '+ '}{c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                Enregistrer le Compte Agent
              </button>
            </form>
          </div>

          {/* Admin form + list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="eco-card" style={{ padding: '28px', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1B5E20', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={22} color="#2E7D32" /> Créer un Compte Administrateur
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '18px' }}>Ajouter un administrateur secondaire. Le numéro de téléphone servira d'identifiant de connexion.</p>
              {adminSuccess && <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700, marginBottom: '16px', fontSize: '0.85rem' }}>✅ Compte Admin créé avec succès !</div>}
              <form onSubmit={handleCreateAdmin}>
                <div className="form-group">
                  <label className="form-label">Nom Complet de l'Administrateur</label>
                  <input type="text" className="form-input" placeholder="Ex: KANKU Beatrice" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>(identifiant)</span></label>
                    <input type="tel" className="form-input" placeholder="+243 90 00 00 000" value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mot de Passe</label>
                    <input type="text" className="form-input" placeholder="Mot de passe initial" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required />
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '12px' }}>
                  Enregistrer l'Administrateur
                </button>
              </form>
            </div>

            {/* Admin list */}
            <div className="eco-card" style={{ padding: '24px', borderRadius: '20px' }}>
              <h4 style={{ fontSize: '1rem', color: '#1B5E20', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#2E7D32" /> Administrateurs Enregistrés ({admins ? admins.length : 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(admins || []).map((adm, idx) => (
                  <div key={adm.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#F8FAF8', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>{adm.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>📞 {adm.phone}</div>
                      {adm.password && <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>🔑 Mdp : <span style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{'•'.repeat(adm.password.length)}</span></div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {idx === 0 && <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Principal</span>}
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer l'administrateur ${adm.name} ?`)) {
                            onDeleteAdmin(adm.id);
                          }
                        }}
                        disabled={idx === 0}
                        title={idx === 0 ? 'Impossible de supprimer l\'admin principal' : 'Supprimer cet admin'}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: idx === 0 ? '1px solid #E2E8F0' : '1px solid #FCA5A5', backgroundColor: idx === 0 ? '#F1F5F9' : '#FEF2F2', color: idx === 0 ? '#94A3B8' : '#DC2626', cursor: idx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPATCH */}
      {activeTab === 'dispatch' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '6px' }}>📍 Carte Nationale & Affectation des Itinéraires aux Agents</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B' }}>Attribuez les zones et communes de la RDC aux agents tricycles sur le terrain.</p>
          </div>
          <div style={{ marginBottom: '28px' }}>
            <InteractiveMap passages={passages} role="admin" />
          </div>
          <h4 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '16px' }}>Agents Actifs ({agents.length})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {agents.map(agt => (
              <div key={agt.id} className="eco-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1B5E20' }}>{agt.name}</div>
                  <span className="badge badge-active">{agt.tricycleNo}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '10px' }}>
                  Zones: <strong>{agt.quartiersAssigned ? agt.quartiersAssigned.join(', ') : 'Non assigné'}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#15803D', fontWeight: 600, marginBottom: '14px' }}>
                  ⭐ Note moyenne: {agt.ratingAvg || 5.0} / 5 ({agt.ratingsCount || 0} avis)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} onClick={() => alert(`Modifier la feuille de route de ${agt.name}`)}>
                    Modifier Itinéraire
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer l'agent ${agt.name} ? Cette action est irréversible.`)) {
                        onDeleteAgent(agt.id);
                      }
                    }}
                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 600 }}
                    title="Supprimer cet agent"
                  >
                    <Trash2 size={14} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUALITY CONTROL */}
      {activeTab === 'quality' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '16px' }}>🚨 Contrôle Qualité & Preuves Photos des Clients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complaints.map(rec => (
              <div key={rec.id} className="eco-card" style={{ padding: '24px', borderRadius: '16px', borderLeft: rec.status === 'Résolu' ? '6px solid #2E7D32' : '6px solid #EF4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#0F172A' }}>{rec.subject}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                      Client: <strong>{rec.clientName}</strong> — {rec.ville || 'Kinshasa'} / {rec.commune || rec.quartier} • {rec.avenue}
                    </div>
                  </div>
                  <span className={`badge ${rec.status === 'Résolu' ? 'badge-resolu' : 'badge-danger'}`}>{rec.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', backgroundColor: '#F8FAF8', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>"{rec.description}"</p>
                {rec.photoUrl && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>📸 Photo de l'état des lieux :</div>
                    <img src={rec.photoUrl} alt="Réclamation" style={{ maxHeight: '160px', borderRadius: '10px', border: '2px solid #FCA5A5', cursor: 'pointer', objectFit: 'cover' }} onClick={() => setSelectedComplaintPhotoModal(rec.photoUrl)} />
                    <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '2px', cursor: 'pointer' }} onClick={() => setSelectedComplaintPhotoModal(rec.photoUrl)}>🔍 Agrandir l'image de preuve</div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>Agent concerné: <strong>{rec.agentAssigned}</strong></div>
                  {rec.status !== 'Résolu' && (
                    <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => { onResolveComplaint(rec.id); alert('Incident résolu ! Re-intervention ordonnée.'); }}>
                      <CheckCircle2 size={16} /> Marquer Résolu & Envoyer l'Agent
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CLIENTS DIRECTORY */}
      {activeTab === 'clients' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '16px' }}>👥 Répertoire des Abonnés Eco Clean RDC</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAF8', borderBottom: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Localisation RDC</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Bouquet</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Statut</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Date Début</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>Date Fin / Échéance</th>
                  <th style={{ padding: '14px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '0.88rem' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>
                      {c.name}
                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 400 }}>{c.phone}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 600, color: '#2E7D32' }}>{c.ville || 'Kinshasa'}</span> / {c.commune || 'N/A'} — {c.quartier}, {c.avenue} ({c.parcelleNo})
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>{c.bouquetName}</td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${c.status === 'Actif' ? 'badge-active' : 'badge-pending'}`}>{c.status}</span>
                    </td>
                    <td style={{ padding: '14px', color: '#15803D', fontWeight: 600 }}>{c.subscriptionStartDate || 'En attente'}</td>
                    <td style={{ padding: '14px', color: '#B45309', fontWeight: 600 }}>{c.subscriptionExpires || 'En attente'}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer le client ${c.name} ? Cette action supprimera définitivement son compte et tout son historique.`)) {
                            onDeleteClient(c.id);
                          }
                        }}
                        title="Supprimer ce client"
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700 }}
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      {/* Proof Modal */}
      {selectedProofModal && (
        <div className="modal-overlay" onClick={() => setSelectedProofModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1B5E20' }}>Capture de Preuve de Paiement</h4>
            <img src={selectedProofModal} alt="Zoom proof" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px' }} />
            <div style={{ marginTop: '16px' }}><button className="btn btn-outline" onClick={() => setSelectedProofModal(null)}>Fermer</button></div>
          </div>
        </div>
      )}

      {/* Complaint Photo Modal */}
      {selectedComplaintPhotoModal && (
        <div className="modal-overlay" onClick={() => setSelectedComplaintPhotoModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#DC2626' }}>Photo de l'État des Lieux (Preuve Réclamation)</h4>
            <img src={selectedComplaintPhotoModal} alt="Zoom complaint" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', border: '2px solid #FCA5A5' }} />
            <div style={{ marginTop: '16px' }}><button className="btn btn-outline" onClick={() => setSelectedComplaintPhotoModal(null)}>Fermer</button></div>
          </div>
        </div>
      )}

    </div>
  );
}
