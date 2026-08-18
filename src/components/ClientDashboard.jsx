import React, { useState } from 'react';
import { BOUQUETS, MOBILE_MONEY_NUMBERS, VILLES_RDC } from '../data/mockData';
import { 
  User, 
  MapPin, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Send, 
  Truck
} from 'lucide-react';

export default function ClientDashboard({ client, onUpdateClient, passages, onAddPayment, onRateAgent, onSubmitComplaint }) {
  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('eco_clean_client_tab') || 'overview';
    } catch {
      return 'overview';
    }
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('eco_clean_client_tab', tab);
    } catch {}
  };

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: client.name || '',
    phone: client.phone || '',
    ville: client.ville || 'Kinshasa',
    commune: client.commune || 'Matete',
    quartier: client.quartier || 'Batandu',
    avenue: client.avenue || '',
    parcelleNo: client.parcelleNo || ''
  });

  // Payment Form State
  const [selectedBouquet, setSelectedBouquet] = useState(client.bouquetId || 'moyen');
  const [paymentProvider, setPaymentProvider] = useState('VODACOM M-PESA');
  const [serialNumber, setSerialNumber] = useState('');
  const [proofPreview, setProofPreview] = useState(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  // Rating State
  const [ratingPassageId, setRatingPassageId] = useState(null);
  const [starCount, setStarCount] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Complaint Form State
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState(null);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Handle Photo Upload Mock Preview
  const handleImageUpload = (e, setPhotoFn) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoFn(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateClient(profileData);
    alert('Profil et géolocalisation RDC mis à jour avec succès !');
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    if (!serialNumber.trim()) {
      alert('Veuillez saisir le numéro de série de la transaction Mobile Money.');
      return;
    }
    if (!proofPreview) {
      alert('Veuillez charger une capture d\'écran comme preuve de paiement.');
      return;
    }

    const b = BOUQUETS.find(x => x.id === selectedBouquet);
    onAddPayment({
      bouquetId: b.id,
      bouquetName: b.name,
      amount: b.price,
      provider: paymentProvider,
      serialNumber,
      proofUrl: proofPreview
    });

    setPaymentSuccessMsg(true);
    setTimeout(() => {
      setPaymentSuccessMsg(false);
      setActiveTab('overview');
    }, 2000);
  };

  const handleSaveRating = (passageId) => {
    onRateAgent(passageId, starCount, feedbackText);
    setRatingPassageId(null);
    setFeedbackText('');
    alert('Merci ! Votre note et avis ont été transmis.');
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    setComplaintError('');

    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      setComplaintError('Veuillez renseigner le sujet et la description du problème.');
      return;
    }
    if (!complaintPhoto) {
      setComplaintError('OBLIGATOIRE : Vous devez joindre une photo de l\'état des lieux pour prouver le problème.');
      return;
    }

    onSubmitComplaint({
      subject: complaintSubject,
      description: complaintDesc,
      photoUrl: complaintPhoto
    });

    setComplaintSuccess(true);
    setComplaintSubject('');
    setComplaintDesc('');
    setComplaintPhoto(null);

    setTimeout(() => {
      setComplaintSuccess(false);
      setActiveTab('reclamation');
    }, 2000);
  };

  const clientPassages = passages.filter(p => p.clientId === client.id || p.quartier === client.quartier);

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      
      {/* Client Header Banner */}
      <div className="eco-card" style={{ padding: '24px', borderRadius: '20px', marginBottom: '24px', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontWeight: 800, fontSize: '1.4rem' }}>
            {client.name ? client.name.charAt(0) : 'C'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#0F172A' }}>{client.name}</h2>
              <span className={`badge ${client.status === 'Actif' ? 'badge-active' : 'badge-pending'}`}>
                {client.status}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} color="#2E7D32" />
              <span>Ville: <strong>{client.ville || 'Kinshasa'}</strong> • Commune: <strong>{client.commune || 'Matete'}</strong> • {client.quartier} - {client.avenue} ({client.parcelleNo})</span>
            </div>
          </div>
        </div>

        {/* Current Plan & Dates status */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Abonnement Actuel</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2E7D32' }}>{client.bouquetName || 'Aucun bouquet'}</div>
          
          {client.status === 'Actif' ? (
            <div style={{ fontSize: '0.82rem', backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              📅 <strong>Début:</strong> {client.subscriptionStartDate || '01/08/2026'} • ⌛ <strong>Fin:</strong> {client.subscriptionExpires || '31/08/2026'}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              ⏳ En attente de validation & d'approbation Admin
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem', marginTop: '4px' }}
            onClick={() => setActiveTab('payment')}
          >
            Payer / Soumettre Preuve par Mobile Money
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0' }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
          onClick={() => setActiveTab('overview')}
        >
          <Truck size={16} /> Tableau de Bord
        </button>

        <button 
          className={`btn ${activeTab === 'payment' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
          onClick={() => setActiveTab('payment')}
        >
          <CreditCard size={16} /> Abonnement & Paiement
        </button>

        <button 
          className={`btn ${activeTab === 'passages' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
          onClick={() => setActiveTab('passages')}
        >
          <Clock size={16} /> Suivi Passages & Avis
        </button>

        <button 
          className={`btn ${activeTab === 'reclamation' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
          onClick={() => setActiveTab('reclamation')}
        >
          <Camera size={16} /> Réclamations (Photo Proof)
        </button>

        <button 
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 18px', fontSize: '0.88rem', borderRadius: '10px' }}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} /> Profil & Geocalisation
        </button>
      </div>

      <div key={activeTab} className="tab-transition-enter">
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: '#1B5E20' }}>Prochains Passages Prévus ({client.quartier || 'Votre Quartier'})</h3>
            
            {clientPassages.length === 0 ? (
              <div className="eco-card" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                Aucun passage programmé aujourd'hui dans ce secteur.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {clientPassages.map(p => (
                  <div key={p.id} className="eco-card" style={{ padding: '20px', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32' }}>
                          <Truck size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.avenue} • {p.parcelleNo}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Agent collecteur : <strong>{p.agentName}</strong></div>
                        </div>
                      </div>
                      <span className={`badge ${p.status === 'Ramassé' ? 'badge-ramasse' : 'badge-planifie'}`}>
                        {p.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                      <span>📅 Date : {p.scheduledDate} ({p.timeSlot})</span>
                      {p.status === 'Ramassé' && p.clientRating === null && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                          onClick={() => { setRatingPassageId(p.id); setActiveTab('passages'); }}
                        >
                          ⭐ Noter cet agent
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="eco-card" style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#F8FAF8' }}>
              <h4 style={{ fontSize: '1rem', color: '#1B5E20', marginBottom: '12px' }}>Numéros Mobile Money Officiels RDC</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
                Effectuez votre transfert puis enregistrez le code de transaction dans l'onglet Paiement.
              </p>

              {MOBILE_MONEY_NUMBERS.map(mm => (
                <div key={mm.operator} style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #E2E8F0', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: mm.color }}>{mm.operator}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{mm.number}</div>
                </div>
              ))}

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px', fontSize: '0.85rem' }}
                onClick={() => setActiveTab('payment')}
              >
                Envoyer Preuve de Paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION & MOBILE MONEY PAYMENT */}
      {activeTab === 'payment' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
            
            <h3 style={{ fontSize: '1.4rem', color: '#1B5E20', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard color="#2E7D32" /> Abonnement & Soumission de Paiement Mobile Money
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '24px' }}>
              1. Choisissez votre bouquet. 2. Effectuez le paiement Mobile Money. 3. Saisissez le numéro de série et téléversez la preuve de paiement.
            </p>

            {paymentSuccessMsg && (
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} /> Preuve de paiement soumise avec succès ! L'administrateur valide votre abonnement dans quelques instants.
              </div>
            )}

            <form onSubmit={handleSubmitPayment}>
              
              {/* Select Bouquet */}
              <div className="form-group">
                <label className="form-label">Sélectionnez le Bouquet Mensuel</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {BOUQUETS.map(b => (
                    <div 
                      key={b.id}
                      onClick={() => setSelectedBouquet(b.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: selectedBouquet === b.id ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                        backgroundColor: selectedBouquet === b.id ? '#E8F5E9' : '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 800, color: b.color }}>{b.name}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>{b.priceFormatted}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{b.passages}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Money Provider selection */}
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Opérateur Mobile Money Utilisé</label>
                <select 
                  className="form-select"
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value)}
                >
                  <option value="AIRTEL MONEY">AIRTEL MONEY (+243 983 850 447)</option>
                  <option value="VODACOM M-PESA">VODACOM M-PESA (+243 81 42 00 462)</option>
                </select>
              </div>

              {/* Serial number */}
              <div className="form-group">
                <label className="form-label">Numéro de Série / ID Transaction Mobile Money</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Ex: MP-9988220194 ou AM-88221049"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  required
                />
              </div>

              {/* Screenshot Proof Upload */}
              <div className="form-group">
                <label className="form-label">Capture d'Écran de la Preuve de Paiement</label>
                <div style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAF8',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setProofPreview)} 
                    style={{ display: 'none' }} 
                    id="payment-proof-input" 
                  />
                  <label htmlFor="payment-proof-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Upload size={32} color="#2E7D32" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                      Cliquez pour choisir l'image de la preuve (Screenshot SMS/App)
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Formats acceptés: JPG, PNG, WEBP</span>
                  </label>
                </div>

                {proofPreview && (
                  <div style={{ marginTop: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2E7D32', marginBottom: '6px' }}>Aperçu de la capture de paiement :</div>
                    <img 
                      src={proofPreview} 
                      alt="Proof" 
                      style={{ maxHeight: '180px', borderRadius: '10px', border: '1px solid #CBD5E1', boxShadow: 'var(--shadow-sm)' }} 
                    />
                  </div>
                )}
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '16px' }}>
                Valider et Transmettre la Preuve à l'Admin
              </button>

            </form>

          </div>

          {/* Current Subscription Dates & Status Summary Card */}
          <div className="eco-card" style={{ padding: '24px', borderRadius: '20px', marginTop: '24px', backgroundColor: '#FFFFFF' }}>
            <h4 style={{ fontSize: '1.1rem', color: '#1B5E20', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📅 Statut & Dates Officiennes de votre Abonnement
            </h4>

            {client.status === 'Actif' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#F0FDF4', padding: '18px', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Formule Souscrite</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>{client.bouquetName || 'Moyen Bouquet'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Date de Début</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>{client.subscriptionStartDate || '01/08/2026'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Date de Fin (Échéance)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>{client.subscriptionExpires || '31/08/2026'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Statut Admin</div>
                  <span className="badge badge-active">✓ Validé & Actif</span>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: '#FEF3C7', padding: '18px', borderRadius: '14px', border: '1px solid #FDE68A', color: '#B45309' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>⏳ Paiement en cours de vérification par l'Admin</div>
                <div style={{ fontSize: '0.88rem' }}>
                  Votre preuve de paiement a bien été soumise. Dès approbation par l'Administrateur, vos dates de début et de fin d'abonnement (30 jours) seront officiellement activées ci-dessus.
                </div>
              </div>
            )}

            {/* Payment History Table */}
            <div style={{ marginTop: '24px' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
                📜 Historique de vos Paiements Soumis
              </h5>
              {(client.paymentHistory && client.paymentHistory.length > 0) ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAF8', borderBottom: '1px solid #E2E8F0', color: '#64748B', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Opérateur</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>N° Série</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Montant</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Période (Début ➔ Fin)</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Statut Admin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.paymentHistory.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px', fontWeight: 600 }}>{p.date}</td>
                          <td style={{ padding: '10px' }}>{p.provider}</td>
                          <td style={{ padding: '10px' }}><code style={{ backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>{p.serialNumber}</code></td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#2E7D32' }}>{p.amount?.toLocaleString()} FC</td>
                          <td style={{ padding: '10px', fontWeight: 600, color: '#475569' }}>
                            {p.startDate ? `${p.startDate} ➔ ${p.endDate}` : 'En attente de validation'}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span className={`badge ${p.status === 'Validé' ? 'badge-active' : 'badge-pending'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>Aucun historique de paiement pour l'instant.</div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: PASSAGE SCHEDULE & RATING */}
      {activeTab === 'passages' && (
        <div>
          <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '16px' }}>
            📅 Planning des Passages & Cotation des Agents
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clientPassages.map(p => (
              <div key={p.id} className="eco-card" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#0F172A' }}>Passage Tricycle à {p.avenue} {p.parcelleNo}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      Ville <strong>{p.ville || 'Kinshasa'}</strong> • Commune <strong>{p.commune || 'Matete'}</strong> • Agent: <strong>{p.agentName}</strong>
                    </p>
                  </div>

                  <span className={`badge ${p.status === 'Ramassé' ? 'badge-ramasse' : 'badge-planifie'}`}>
                    {p.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', padding: '12px', backgroundColor: '#F8FAF8', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
                  <div>📅 Date prévue: <strong>{p.scheduledDate}</strong></div>
                  <div>⏰ Créneau: <strong>{p.timeSlot}</strong></div>
                  <div>✅ Statut: <strong>{p.status}</strong></div>
                </div>

                {/* Rating section if collected */}
                {p.status === 'Ramassé' && (
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                    {p.clientRating !== null ? (
                      <div style={{ backgroundColor: '#E8F5E9', padding: '12px 16px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Votre appréciation attribuée à l'agent : {'⭐'.repeat(p.clientRating)} ({p.clientRating}/5)
                        </div>
                        {p.clientFeedback && (
                          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px', fontStyle: 'italic' }}>
                            "{p.clientFeedback}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {ratingPassageId === p.id ? (
                          <div style={{ backgroundColor: '#F8FAF8', padding: '16px', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Attribuer une note à {p.agentName}</div>
                            
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setStarCount(star)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1.4rem'
                                  }}
                                >
                                  {star <= starCount ? '⭐' : '☆'}
                                </button>
                              ))}
                            </div>

                            <textarea 
                              className="form-textarea"
                              rows="2"
                              placeholder="Écrivez une appréciation ou remarque sur la propreté..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                            />

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                              <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => handleSaveRating(p.id)}>
                                Enregistrer la cotation
                              </button>
                              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => setRatingPassageId(null)}>
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setRatingPassageId(p.id)}>
                            ⭐ Evaluer la prestation de l'agent ({p.agentName})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RECLAMATIONS WITH OBLIGATORY PHOTO */}
      {activeTab === 'reclamation' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
            
            <h3 style={{ fontSize: '1.4rem', color: '#1B5E20', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera color="#EF4444" /> Signaler une Réclamation (Photo de l'état des lieux)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '24px' }}>
              Si le service a été mal fait ou si vos ordures n'ont pas été enlevées, joignez <strong>obligatoirement une photo</strong> de l'état des lieux pour permettre à l'administrateur d'intervenir.
            </p>

            {complaintSuccess && (
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700, marginBottom: '20px' }}>
                Réclamation transmise avec succès ! L'équipe d'intervention d'urgence a été notifiée.
              </div>
            )}

            {complaintError && (
              <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 700, marginBottom: '20px' }}>
                {complaintError}
              </div>
            )}

            <form onSubmit={handleCreateComplaint}>
              
              <div className="form-group">
                <label className="form-label">Sujet du problème</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Ex: Poubelle oubliée devant la parcelle"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description détaillée du mauvais travail</label>
                <textarea 
                  className="form-textarea"
                  rows="4"
                  placeholder="Précisez ce qui n'a pas été respecté par l'agent collecteur..."
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  required
                />
              </div>

              {/* Obligatory Photo Proof Upload */}
              <div className="form-group">
                <label className="form-label" style={{ color: '#DC2626' }}>
                  Photo Obligatoire de l'état des lieux (Preuve du mauvais travail) *
                </label>
                <div style={{
                  border: '2px dashed #FCA5A5',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#FEF2F2',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setComplaintPhoto)} 
                    style={{ display: 'none' }} 
                    id="complaint-photo-input" 
                  />
                  <label htmlFor="complaint-photo-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Camera size={36} color="#DC2626" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#B91C1C' }}>
                      Prendre ou télécharger la photo de l'état des lieux
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#7F1D1D' }}>Obligatoire pour validation par l'Administration</span>
                  </label>
                </div>

                {complaintPhoto && (
                  <div style={{ marginTop: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>Photo de preuve jointe :</div>
                    <img 
                      src={complaintPhoto} 
                      alt="Complaint proof" 
                      style={{ maxHeight: '200px', borderRadius: '10px', border: '2px solid #FCA5A5' }} 
                    />
                  </div>
                )}
              </div>

              <button className="btn btn-danger" style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '16px' }}>
                <Send size={18} /> Soumettre la Réclamation avec Photo Proof
              </button>

            </form>

          </div>
        </div>
      )}

      {/* TAB 5: PROFILE & LOCATION */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#1B5E20', marginBottom: '16px' }}>
              👤 Identité & Geocalisation du Domicile en RDC
            </h3>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Nom et Prénom</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Ville RDC</label>
                  <select 
                    className="form-select"
                    value={profileData.ville}
                    onChange={(e) => setProfileData({...profileData, ville: e.target.value})}
                  >
                    {VILLES_RDC.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Commune</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Ex: Gombe, Limete, Matete..."
                    value={profileData.commune}
                    onChange={(e) => setProfileData({...profileData, commune: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quartier</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Ex: Batandu"
                    value={profileData.quartier}
                    onChange={(e) => setProfileData({...profileData, quartier: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Avenue</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Avenue Maziya"
                    value={profileData.avenue}
                    onChange={(e) => setProfileData({...profileData, avenue: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">N° Parcelle</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="N° 45B"
                    value={profileData.parcelleNo}
                    onChange={(e) => setProfileData({...profileData, parcelleNo: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '16px' }}>
                Mettre à jour ma Localisation pour les Agents
              </button>
            </form>
          </div>
        </div>
      )}
      </div>

    </div>
  );
}
