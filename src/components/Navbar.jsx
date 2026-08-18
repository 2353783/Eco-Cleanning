import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { User, Shield, Truck, LogOut, UserPlus, LogIn, Menu, X, CreditCard, HelpCircle, ChevronRight } from 'lucide-react';

export default function Navbar({ currentUser, currentRole, onLogout, onOpenAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const roleLabel = currentRole === 'client' ? '👤 Espace Client'
    : currentRole === 'agent' ? '👷 Espace Agent'
    : currentRole === 'admin' ? '⚙️ Administration'
    : null;

  const RoleIcon = currentRole === 'agent' ? Truck : currentRole === 'admin' ? Shield : User;

  const navLinks = [
    { href: '#tarifs', icon: <CreditCard size={17} />, label: 'Tarifs & Bouquets' },
    { href: '#fonctionnement', icon: <HelpCircle size={17} />, label: 'Comment ça marche' },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          {/* Brand */}
          <div style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => { if (currentRole !== 'public') onLogout(); }}>
            <Logo size={38} showText={true} />
          </div>

          {/* Desktop Nav */}
          {currentRole === 'public' && (
            <nav className="navbar-links-desktop">
              {navLinks.map(l => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
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
                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{currentUser?.name || 'Utilisateur'}</div>
                  <div style={{ fontSize: '0.74rem', color: '#2E7D32', fontWeight: 700 }}>{roleLabel}</div>
                </div>
                <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem', borderColor: '#FCA5A5', color: '#DC2626' }} onClick={onLogout}>
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button className="hamburger-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && <div className="mobile-overlay" onClick={closeMenu} />}

      {/* Sidebar Drawer */}
      <aside className={`mobile-sidebar ${menuOpen ? 'mobile-sidebar--open' : ''}`}>

        {/* Header */}
        <div className="mobile-sidebar__header">
          <Logo size={32} showText={true} />
          <button onClick={closeMenu} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#64748B', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* User Badge */}
        {currentRole !== 'public' && (
          <div className="mobile-sidebar__user">
            <div className="mobile-sidebar__user-avatar">
              <RoleIcon size={20} color="white" />
            </div>
            <div>
              <div className="mobile-sidebar__user-name">{currentUser?.name || 'Utilisateur'}</div>
              <div className="mobile-sidebar__user-role">{roleLabel}</div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="mobile-sidebar__nav">
          {currentRole === 'public' && (
            <>
              <div className="mobile-sidebar__nav-label">Navigation</div>
              {navLinks.map(l => (
                <a key={l.href} href={l.href} className="mobile-sidebar__link" onClick={closeMenu}>
                  <span className="mobile-sidebar__link-icon">{l.icon}</span>
                  {l.label}
                  <ChevronRight size={15} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </a>
              ))}
            </>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="mobile-sidebar__footer">
          {currentRole === 'public' ? (
            <>
              <button
                className="btn btn-outline"
                style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.92rem' }}
                onClick={() => { onOpenAuth('login'); closeMenu(); }}
              >
                <LogIn size={16} /> Se Connecter
              </button>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '0.92rem' }}
                onClick={() => { onOpenAuth('register'); closeMenu(); }}
              >
                <UserPlus size={16} /> Inscription Client Gratuit
              </button>
            </>
          ) : (
            <button
              className="btn"
              style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '0.92rem', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '10px' }}
              onClick={() => { onLogout(); closeMenu(); }}
            >
              <LogOut size={16} /> Déconnexion
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
