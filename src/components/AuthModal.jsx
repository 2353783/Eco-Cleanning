import React, { useState } from 'react';
import Logo from './Logo';
import { VILLES_RDC } from '../data/mockData';
import { X, User, Shield, Truck, Info } from 'lucide-react';

export default function AuthModal({ isOpen, mode = 'login', selectedBouquetId = null, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(mode);
  const [loginRole, setLoginRole] = useState('client');
  const [selectedVille, setSelectedVille] = useState('Kinshasa');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    ville: 'Kinshasa',
    commune: '',
    quartier: '',
    avenue: '',
    parcelleNo: ''
  });

  if (!isOpen) return null;

  const selectedVilleObj = VILLES_RDC.find(v => v.name === formData.ville) || VILLES_RDC[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'register') {
      onLoginSuccess('client', formData);
    } else {
      onLoginSuccess(loginRole, formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Logo size={36} showText={true} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={24} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '20px' }}>
          <button type="button" style={{ flex: 1, padding: '12px', fontWeight: 700, fontSize: '0.92rem', color: authMode === 'login' ? '#2E7D32' : '#64748B', borderBottom: authMode === 'login' ? '3px solid #2E7D32' : 'none', background: 'none', cursor: 'pointer', border: 'none', borderBottom: authMode === 'login' ? '3px solid #2E7D32' : '3px solid transparent' }} onClick={() => setAuthMode('login')}>
            🔑 Se Connecter
          </button>
          <button type="button" style={{ flex: 1, padding: '12px', fontWeight: 700, fontSize: '0.92rem', color: authMode === 'register' ? '#2E7D32' : '#64748B', background: 'none', cursor: 'pointer', border: 'none', borderBottom: authMode === 'register' ? '3px solid #2E7D32' : '3px solid transparent' }} onClick={() => setAuthMode('register')}>
            ✨ Inscription Client Gratuit
          </button>
        </div>

        {/* Role Selector (Login only) */}
        {authMode === 'login' && (
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Type de compte :</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
              <button type="button" className={`btn ${loginRole === 'client' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: '8px' }} onClick={() => setLoginRole('client')}>
                <User size={14} /> Client
              </button>
              <button type="button" className={`btn ${loginRole === 'agent' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: '8px' }} onClick={() => setLoginRole('agent')}>
                <Truck size={14} /> Agent
              </button>
              <button type="button" className={`btn ${loginRole === 'admin' ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px', fontSize: '0.8rem', borderRadius: '8px' }} onClick={() => setLoginRole('admin')}>
                <Shield size={14} /> Admin
              </button>
            </div>
          </div>
        )}

        {/* Info badge for registration */}
        {authMode === 'register' && (
          <div style={{ padding: '10px 14px', backgroundColor: '#E8F5E9', borderRadius: '8px', fontSize: '0.82rem', color: '#1B5E20', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="#2E7D32" />
            L'inscription est gratuite pour tous les ménages en RDC. Les comptes Agents et Admins sont créés uniquement par l'Administration.
          </div>
        )}

        {selectedBouquetId && authMode === 'register' && (
          <div style={{ padding: '10px 14px', backgroundColor: '#FEF3C7', borderRadius: '8px', fontSize: '0.85rem', color: '#92400E', marginBottom: '16px', fontWeight: 600 }}>
            Bouquet sélectionné : {selectedBouquetId === 'petit' ? '🌱 Petit (15 000 FC)' : selectedBouquetId === 'moyen' ? '🌿 Moyen (25 000 FC)' : '🌳 Grand (40 000 FC)'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Registration fields */}
          {authMode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label">Nom et Prénom Complet</label>
                <input type="text" className="form-input" placeholder="Ex: KABAMBA Joseph" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Ville RDC</label>
                  <select className="form-select" value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value, commune: ''})}>
                    {VILLES_RDC.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Commune</label>
                  <select className="form-select" value={formData.commune} onChange={(e) => setFormData({...formData, commune: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {selectedVilleObj.communes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Quartier</label>
                  <input type="text" className="form-input" placeholder="Quartier" value={formData.quartier} onChange={(e) => setFormData({...formData, quartier: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Avenue</label>
                  <input type="text" className="form-input" placeholder="Avenue" value={formData.avenue} onChange={(e) => setFormData({...formData, avenue: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">N° Parcelle</label>
                  <input type="text" className="form-input" placeholder="N° 45B" value={formData.parcelleNo} onChange={(e) => setFormData({...formData, parcelleNo: e.target.value})} required />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Numéro de Téléphone</label>
            <input type="tel" className="form-input" placeholder="+243 82 00 00 000" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: '0.95rem', marginTop: '10px' }}>
            {authMode === 'login' ? `Accéder à l'Espace ${loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}` : 'Créer mon Compte Client Gratuit'}
          </button>

        </form>

      </div>
    </div>
  );
}
