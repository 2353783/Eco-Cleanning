import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { User, Shield, Truck, LogOut, UserPlus, LogIn, Menu, X, Home, CreditCard, MapPin, HelpCircle } from 'lucide-react';

export default function Navbar({ currentUser, currentRole, onLogout, onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const roleLabel = currentRole === 'client' ? '👤 Espace Client'
    : currentRole === 'agent' ? '👷 Espace Agent'
    : currentRole === 'admin' ? '⚙️ Administration'
    : null;

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Brand Logo */}
          <div style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => { if (currentRole !== 'public') onLogout(); }}>
            <Logo size={38} showText={true} />
          </div>

          {/* Desktop Nav Links (public only) */}
          {currentRole === 'public' && (
            <nav className="navbar-links-desktop">
              <a href="#tarifs">Tarifs &amp; Bouquets</a>
              <a href="#quartiers">Nos Quartiers</a>
              <a href="#fonctionnement">Comment ça marche</a>
            </nav>
          )}

          {/* Desktop Buttons */}
          <div className="navbar-actions-desktop">
            {currentRole === 'public' ? (
              <>
                <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.88rem' }} onClick={() => onOpenAuth('login')}>
                  <LogIn size={16} /> Se Connecter
                </button>
                <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }} onClick={() => onOpenAuth('register')}>
                  <UserPlus size={16} /> Inscription Gratuite
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>
                    {currentUser?.name || 'Utilisateur'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>{roleLabel}</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#CBD5E1', color: '#DC2626' }} onClick={onLogout}>
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Button (mobile only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={closeMenu} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`mobile-sidebar ${menuOpen ? 'mobile-sidebar--open' : ''}`}>
        {/* Sidebar Header */}
        <div className="mobile-sidebar__header">
          <Logo size={34} showText={true} />
          <button onClick={closeMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={22} />
          </button>
        </div>

        {/* User badge (if logged in) */}
        {currentRole !== 'public' && (
          <div className="mobile-sidebar__user">
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {currentRole === 'client' && <User size={20} color="#2E7D32" />}
              {currentRole === 'agent' && <Truck size={20} color="#2E7D32" />}
              {currentRole === 'admin' && <Shield size={20} color="#2E7D32" />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{currentUser?.name || 'Utilisateur'}</div>
              <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>{roleLabel}</div>
            </div>
          </div>
        )}

        {/* Sidebar Nav Links */}
        <nav className="mobile-sidebar__nav">
          {currentRole === 'public' && (
            <>
              <a href="#tarifs" className="mobile-sidebar__link" onClick={closeMenu}>
                <CreditCard size={18} /> Tarifs &amp; Bouquets
              </a>
              <a href="#quartiers" className="mobile-sidebar__link" onClick={closeMenu}>
                <MapPin size={18} /> Nos Quartiers
              </a>
              <a href="#fonctionnement" className="mobile-sidebar__link" onClick={closeMenu}>
                <HelpCircle size={18} /> Comment ça marche
              </a>
            </>
          )}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="mobile-sidebar__footer">
          {currentRole === 'public' ? (
            <>
              <button className="btn btn-outline" style={{ width: '100%', padding: '12px' }} onClick={() => { onOpenAuth('login'); closeMenu(); }}>
                <LogIn size={16} /> Se Connecter
              </button>
              <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => { onOpenAuth('register'); closeMenu(); }}>
                <UserPlus size={16} /> Inscription Client Gratuit
              </button>
            </>
          ) : (
            <button className="btn btn-outline" style={{ width: '100%', padding: '12px', borderColor: '#FCA5A5', color: '#DC2626' }} onClick={() => { onLogout(); closeMenu(); }}>
              <LogOut size={16} /> Déconnexion
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
