import React, { useState, useEffect, useCallback } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export default function PWAInstallPrompt({ onTriggerReady }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Vérifier si l'application fonctionne déjà en mode PWA autonome (Standalone)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Détection iOS (Safari iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // 3. Écouter l'événement beforeinstallprompt pour Chrome, Edge, Android, Desktop
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Si l'utilisateur n'a pas fermé la bannière dans cette session
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Écouter quand l'app a été installée avec succès
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log('[PWA] Application installée avec succès !');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Sur iOS, afficher la bannière après un court délai si pas encore fermée
    if (isIosDevice && !isStandalone) {
      const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Déclencher l'installation selon la plateforme
  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      // Android / Chrome / Edge / Desktop PWA
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Choix de l'utilisateur: ${outcome}`);
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Guide pas-à-pas pour Apple iOS
      setShowIOSModal(true);
    } else {
      // Instructions de secours pour autres navigateurs
      alert("Pour installer Eco Clean :\n• Sur ordinateur : Cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur.\n• Sur mobile : Ouvrez le menu de votre navigateur et appuyez sur 'Ajouter à l'écran d'accueil'.");
    }
  }, [deferredPrompt, isIOS]);

  // Fermer la bannière temporairement
  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // Exposer le déclencheur d'installation globalement si nécessaire
  useEffect(() => {
    if (onTriggerReady) {
      onTriggerReady({
        canInstall: !isInstalled && (!!deferredPrompt || isIOS),
        isInstalled,
        triggerInstall
      });
    }
  }, [deferredPrompt, isInstalled, isIOS, onTriggerReady, triggerInstall]);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Bannière flottante d'installation moderne en bas de page */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E2E8F0',
          padding: '16px 18px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'pwaSlideUp 0.35s ease-out'
        }}>
          {/* Logo / Icône App */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#E8F5E9',
            border: '1.5px solid #C8E6C9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <img src="/icons/icon-192x192.png" alt="Eco Clean" style={{ width: '38px', height: '38px', borderRadius: '8px' }} />
          </div>

          {/* Textes explicatifs */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Installer Eco Clean
              <span style={{ fontSize: '0.70rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                App Gratuite
              </span>
            </div>
            <div style={{ fontSize: '0.80rem', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
              Accédez directement à vos services depuis votre écran d'accueil, même hors-ligne.
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={triggerInstall}
              style={{
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 15px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(46, 125, 50, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Download size={15} />
              Installer
            </button>

            <button
              onClick={dismissBanner}
              aria-label="Fermer"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modale d'instructions spécifiques pour iOS / iPhone / iPad */}
      {showIOSModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                margin: '0 auto 12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
              }}>
                <img src="/icons/icon-192x192.png" alt="Eco Clean" style={{ width: '100%', height: '100%' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                Installer Eco Clean sur iPhone / iPad
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                Suivez ces 2 étapes simples sur Safari :
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  1
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1E293B' }}>
                  Appuyez sur le bouton <strong>Partager</strong> <Share size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', color: '#0284C7' }} /> en bas de l'écran.
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  2
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1E293B' }}>
                  Faites défiler et sélectionnez <strong>« Sur l'écran d'accueil »</strong> <PlusSquare size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', color: '#2E7D32' }} />.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              C'est compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
