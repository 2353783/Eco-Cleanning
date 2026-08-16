import React from 'react';
import Logo from './Logo';
import { User, Shield, Truck, LogOut, UserPlus, LogIn } from 'lucide-react';

export default function Navbar({ currentUser, currentRole, onLogout, onOpenAuth }) {
  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div style={{ cursor: 'pointer' }} onClick={() => { if (currentRole !== 'public') onLogout(); }}>
          <Logo size={42} showText={true} />
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {currentRole === 'public' && (
            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.92rem', fontWeight: 600, color: '#475569' }}>
              <a href="#tarifs" style={{ color: 'inherit', textDecoration: 'none' }}>Tarifs & Bouquets</a>
              <a href="#quartiers" style={{ color: 'inherit', textDecoration: 'none' }}>Nos Quartiers</a>
              <a href="#fonctionnement" style={{ color: 'inherit', textDecoration: 'none' }}>Comment ça marche</a>
            </nav>
          )}
        </div>

        {/* User Session Info / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentRole === 'public' ? (
            <>
              <button 
                className="btn btn-outline" 
                style={{ padding: '8px 16px', fontSize: '0.88rem' }}
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={16} /> Se Connecter
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                onClick={() => onOpenAuth('register')}
              >
                <UserPlus size={16} /> Inscription Client Gratuit
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                  {currentUser?.name || (currentRole === 'admin' ? 'Administrateur Eco Clean' : 'Utilisateur')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>
                  {currentRole === 'client' && '👤 Espace Client'}
                  {currentRole === 'agent' && '👷 Espace Agent Collecteur'}
                  {currentRole === 'admin' && '⚙️ Espace Administration'}
                </div>
              </div>

              <button 
                className="btn btn-outline" 
                style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#CBD5E1', color: '#DC2626' }}
                onClick={onLogout}
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
