import React from 'react';
import { BOUQUETS, MOBILE_MONEY_NUMBERS } from '../data/mockData';
import { 
  CheckCircle2, 
  Smartphone, 
  Truck, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Users, 
  Award, 
  Globe,
  Download,
  Laptop,
  Zap,
  WifiOff
} from 'lucide-react';

export default function LandingPage({ onOpenAuth, canInstall, onInstall }) {

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBouquet = (bouquetId) => {
    onOpenAuth('register', bouquetId);
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#1E293B' }}>

      {/* HERO SECTION WITH BACKGROUND IMAGE OVERLAY */}
      <section style={{
        position: 'relative',
        minHeight: '620px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.82) 0%, rgba(27, 94, 32, 0.88) 100%), url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center' }}>
          
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              color: '#A5D6A7',
              padding: '8px 18px',
              borderRadius: '30px',
              fontSize: '0.88rem',
              fontWeight: 700,
              border: '1px solid rgba(165, 214, 167, 0.3)',
              marginBottom: '24px'
            }}>
              <Globe size={18} color="#A5D6A7" />
              Service National d'Assainissement & de Salubrité Publique en RDC 🇨🇩
            </div>

            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15, marginBottom: '24px', letterSpacing: '-0.5px' }}>
              Une République Démocratique du Congo <span style={{ color: '#66BB6A' }}>Propre & Saine</span> pour Toutes nos Familles.
            </h1>

            <p style={{ fontSize: '1.18rem', color: '#E2E8F0', lineHeight: 1.7, marginBottom: '36px', maxWidth: '680px' }}>
              <strong>ECO CLEAN RDC</strong> est la plateforme numérique centrale dédiée à la gestion, la collecte régulière et l'évacuation des ordures ménagères à travers l'ensemble des villes et communes de la République Démocratique du Congo. Abonnez-vous maintenant, suivez le passage des tricycles dans votre avenue et payez facilement via Mobile Money.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <button 
                className="btn btn-primary" 
                style={{ padding: '16px 32px', fontSize: '1.05rem', backgroundColor: '#4CAF50', borderColor: '#4CAF50', boxShadow: '0 8px 24px rgba(76, 175, 80, 0.4)' }}
                onClick={() => onOpenAuth('register')}
              >
                Inscription Client Gratuit <ArrowRight size={20} />
              </button>

              <button 
                className="btn btn-outline" 
                style={{ padding: '16px 28px', fontSize: '1.05rem', color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                onClick={() => scrollToSection('tarifs')}
              >
                Voir les Formules & Tarifs
              </button>
            </div>

            {/* Key stats ticker */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', paddingTop: '28px', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#A5D6A7' }}>Toute la RDC</div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Villes & Communes couvertes</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#A5D6A7' }}>100% Digital</div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Airtel Money & M-Pesa</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#A5D6A7' }}>4.9 / 5 ⭐</div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Satisfaction Ménages RDC</div>
              </div>
            </div>

          </div>

          {/* Hero Visual Feature Box */}
          <div className="eco-card" style={{
            padding: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#1E293B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32' }}>
                <Truck size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', color: '#1B5E20', margin: 0 }}>Passage Tricycle en Temps Réel</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Réseau National d'Assainissement RDC</span>
              </div>
            </div>

            <div className="hero-team-img-wrapper" style={{ height: '230px', position: 'relative', marginBottom: '18px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
              <img 
                src="/assi.jpg" 
                alt="Équipe d'assainissement RDC" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 35%, rgba(15, 23, 42, 0.88) 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
                color: 'white',
                fontSize: '0.88rem',
                fontWeight: 600
              }}>
                "Équipe d'Assainissement Eco Clean RDC — Nos agents engagés sur le terrain."
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAF8', padding: '14px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Collecte à domicile : <strong>Du Lundi au Samedi</strong></span>
              <span style={{ color: '#2E7D32', fontWeight: 800 }}>✓ Service Garanti</span>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px', padding: '12px', fontSize: '0.95rem' }}
              onClick={() => onOpenAuth('register')}
            >
              S'inscrire Maintenant (Client Gratuit)
            </button>
          </div>

        </div>
      </section>

      {/* MOBILE MONEY NUMBERS BANNER */}
      <section style={{ padding: '48px 24px', backgroundColor: '#F8FAF8', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#1B5E20', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Smartphone color="#2E7D32" size={26} /> Numéros Officiels de Paiement Mobile Money en RDC
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#64748B' }}>
              Reglez vos abonnements mensuels directement via Airtel Money ou M-Pesa vers nos comptes officiels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {MOBILE_MONEY_NUMBERS.map(mm => (
              <div 
                key={mm.operator}
                className="eco-card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderLeft: `6px solid ${mm.color}`
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: mm.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {mm.operator}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '4px 0' }}>
                    {mm.number}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Code USSD Rapide : <strong style={{ color: '#1E293B' }}>{mm.code}</strong>
                  </div>
                </div>

                <div style={{
                  backgroundColor: mm.color,
                  color: 'white',
                  fontWeight: 800,
                  padding: '12px 18px',
                  borderRadius: '12px',
                  fontSize: '0.95rem'
                }}>
                  {mm.logoText}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* EXPLANATORY SECTION WITH SECONDARY BACKGROUND IMAGE */}
      <section style={{
        position: 'relative',
        padding: '90px 24px',
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 248, 0.94) 100%), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px auto' }}>
            <span style={{ color: '#2E7D32', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              POURQUOI ECO CLEAN EN RDC ?
            </span>
            <h2 style={{ fontSize: '2.4rem', color: '#0F172A', marginTop: '10px', marginBottom: '20px', fontWeight: 800 }}>
              Un Engagement National pour la Salubrité & la Santé Publique
            </h2>
            <p style={{ color: '#475569', fontSize: '1.08rem', lineHeight: 1.7 }}>
              L'accumulation des déchets ménagers non évacués est la cause principale des maladies évitables, des bouchons dans les canalisations et de la pollution visuelle dans nos cités. <strong>ECO CLEAN RDC</strong> apporte une solution moderne, fiable et structurée à chaque foyer congolais.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#0F172A', fontWeight: 700 }}>Préservation de la Santé Familiale</h3>
              <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Élimination systématique des gîtes larvaires de moustiques (paludisme) et des foyers bactériens (typhoïde, choléra) grâce à une évacuation rapide et hermétique.
              </p>
            </div>

            <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#0F172A', fontWeight: 700 }}>Flotte de Tricycles Dédiée</h3>
              <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Nos tricycles motorisés accèdent facilement aux ruelles étroites et avenues non goudronnées des communes de Kinshasa et des provinces.
              </p>
            </div>

            <div className="eco-card" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '16px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#0F172A', fontWeight: 700 }}>Traçabilité & Décharges Contrôlées</h3>
              <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>
                Zéro dépôt sauvage. Toutes les ordures ramassées sont transportées vers les centres d'enfouissement et décharges officielles agréées par les autorités.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* BOUQUETS & PRICING SECTION WITH WORKING BUTTONS */}
      <section id="tarifs" style={{ padding: '90px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#2E7D32', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              TARIFS MENSUELS ACCESSIBLES
            </span>
            <h2 style={{ fontSize: '2.4rem', color: '#0F172A', marginTop: '8px', marginBottom: '14px', fontWeight: 800 }}>
              Choisissez le Bouquet Adapté à votre Résidence
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto' }}>
              Des tarifs clairs et transparents en Francs Congolais (FC) garantissant la propreté continue de votre parcelle.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {BOUQUETS.map(b => (
              <div 
                key={b.id} 
                className="eco-card" 
                style={{ 
                  padding: '36px', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: b.recommended ? '2px solid #2E7D32' : '1px solid #E2E8F0',
                  boxShadow: b.recommended ? '0 20px 40px -10px rgba(46, 125, 50, 0.22)' : 'var(--shadow-md)',
                  position: 'relative',
                  backgroundColor: b.recommended ? '#FAFCFA' : '#FFFFFF'
                }}
              >
                {b.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#2E7D32',
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '30px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Formule la plus choisie en RDC
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '1.5rem', color: b.color, marginBottom: '8px', fontWeight: 800 }}>{b.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748B', minHeight: '44px', lineHeight: 1.5 }}>{b.description}</p>

                  <div style={{ margin: '28px 0' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A' }}>
                      {b.price.toLocaleString()} <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#64748B' }}>FC / mois</span>
                    </div>
                    {/* Badge bien visible du nombre de passages par semaine */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#E8F5E9',
                      color: '#1B5E20',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      marginTop: '10px',
                      border: '1px solid #C8E6C9'
                    }}>
                      📅 {b.passages}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '24px', marginBottom: '32px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '14px', letterSpacing: '0.5px' }}>
                      Avantages inclus :
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {b.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.92rem', color: '#334155' }}>
                          <CheckCircle2 size={18} color={b.color} style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: i === 0 ? 700 : 500 }}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button 
                  className={`btn ${b.recommended ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
                  onClick={() => handleSelectBouquet(b.id)}
                >
                  S'abonner au {b.name}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="fonctionnement" style={{ padding: '90px 24px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: '#2E7D32', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              SIMPLICITÉ ET EFFICACITÉ
            </span>
            <h2 style={{ fontSize: '2.4rem', color: '#0F172A', marginTop: '8px', marginBottom: '14px', fontWeight: 800 }}>
              Comment Fonctionne Eco Clean RDC ?
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem' }}>
              Un processus en 4 étapes simples pour maintenir votre domicile propre toute l'année.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' }}>
            
            <div className="eco-card" style={{ padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Users size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1B5E20', fontWeight: 700 }}>1. Inscription Client</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                Créez votre compte gratuitement et saisissez l'adresse de votre parcelle (Ville, Commune, Quartier, Avenue, N°).
              </p>
            </div>

            <div className="eco-card" style={{ padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Smartphone size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1B5E20', fontWeight: 700 }}>2. Paiement Mobile Money</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                Payez votre abonnement via Airtel Money ou M-Pesa puis téléversez la capture de preuve sur votre espace.
              </p>
            </div>

            <div className="eco-card" style={{ padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Truck size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1B5E20', fontWeight: 700 }}>3. Collecte par Tricycle</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                L'agent affecté ramasse vos ordures selon le planning et confirme l'exécution de la tournée sur le web.
              </p>
            </div>

            <div className="eco-card" style={{ padding: '28px', borderRadius: '20px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <Star size={32} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#1B5E20', fontWeight: 700 }}>4. Avis & Photo Proof</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                Notez l'agent ou envoyez une photo d'état des lieux si le travail nécessite une re-intervention de l'Admin.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* PWA INSTALLATION SECTION */}
      <section style={{ backgroundColor: '#F0FDF4', padding: '60px 24px', borderTop: '1px solid #DCFCE7', borderBottom: '1px solid #DCFCE7' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#DCFCE7',
            color: '#166534',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            <Smartphone size={16} /> APPLICATION PWA UNIVERSELLE
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
            Installez Eco Clean sur tous vos appareils
          </h2>
          <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Accédez en 1 clic à vos abonnements, plannings de passage et signalements directement depuis l'écran d'accueil de votre téléphone ou votre bureau, sans passer par les stores.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px', textAlign: 'left' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Zap size={20} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', marginBottom: '4px' }}>Ultra Rapide</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Lancement instantané et interface fluide optimisée pour mobile et PC.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <WifiOff size={20} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', marginBottom: '4px' }}>Mode Hors-Ligne</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Consultez vos données et informations même sans réseau ou connexion faible.</p>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Laptop size={20} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0F172A', marginBottom: '4px' }}>Multi-Supports</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Compatible 100% avec Android, iPhone (iOS), iPad, Windows et Mac.</p>
            </div>
          </div>

          {canInstall && (
            <button
              onClick={onInstall}
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)',
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              Installer l'Application Eco Clean
            </button>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0F172A', color: '#94A3B8', padding: '60px 24px 28px 24px', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '40px', marginBottom: '48px' }}>
          
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', marginBottom: '14px' }}>
              ECO CLEAN RDC 🌿
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
              Plateforme nationale centrale d'assainissement et d'évacuation des ordures ménagères en République Démocratique du Congo.
            </p>
          </div>

          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
              Paiement Mobile Money
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Airtel Money : <strong>+243 983 850 447</strong></li>
              <li>Vodacom M-PESA : <strong>+243 81 42 00 462</strong></li>
              <li>Couverture : Toute la RDC</li>
            </ul>
          </div>

          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
              Accès Rapide
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <button onClick={() => onOpenAuth('login')} style={{ background: 'none', border: 'none', color: '#A5D6A7', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}>Se Connecter à mon Espace</button>
              <button onClick={() => onOpenAuth('register')} style={{ background: 'none', border: 'none', color: '#A5D6A7', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}>Créer un Compte Client Gratuit</button>
              <button onClick={() => scrollToSection('tarifs')} style={{ background: 'none', border: 'none', color: '#A5D6A7', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}>Bouquets & Tarifs</button>
            </div>
          </div>

        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1E293B', paddingTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          © 2026 Eco Clean RDC. Tous droits réservés. République Démocratique du Congo.
        </div>
      </footer>

    </div>
  );
}
