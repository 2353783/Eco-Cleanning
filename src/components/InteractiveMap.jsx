import React, { useState } from 'react';
import { MapPin, Truck, CheckCircle2, Navigation, Globe } from 'lucide-react';
import { VILLES_RDC } from '../data/mockData';

export default function InteractiveMap({ passages = [], role = 'public' }) {
  const [selectedVille, setSelectedVille] = useState('Kinshasa');

  const villesMapData = [
    { name: 'Kinshasa', x: 25, y: 55, activeTricycles: 45, coverage: '100%' },
    { name: 'Lubumbashi', x: 75, y: 80, activeTricycles: 28, coverage: '95%' },
    { name: 'Goma', x: 85, y: 35, activeTricycles: 18, coverage: '90%' },
    { name: 'Bukavu', x: 82, y: 42, activeTricycles: 14, coverage: '88%' },
    { name: 'Kisangani', x: 55, y: 30, activeTricycles: 22, coverage: '92%' },
    { name: 'Matadi', x: 18, y: 65, activeTricycles: 12, coverage: '85%' }
  ];

  const currentVilleObj = villesMapData.find(v => v.name === selectedVille) || villesMapData[0];

  return (
    <div className="eco-card" style={{ padding: '24px', borderRadius: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.3rem', color: '#1B5E20' }}>
            <Globe size={24} color="#2E7D32" />
            Carte de Couverture Nationale - République Démocratique du Congo (RDC)
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Réseau opérationnel de collecte d'ordures et d'assainissement urbain à travers la RDC
          </p>
        </div>

        {/* City Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#475569' }}>Ville RDC:</span>
          <select 
            className="form-select"
            style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600 }}
            value={selectedVille}
            onChange={(e) => setSelectedVille(e.target.value)}
          >
            {VILLES_RDC.map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vector RDC Map Canvas */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '360px',
        backgroundColor: '#0F172A',
        borderRadius: '16px',
        border: '1px solid #1E293B',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}>
        {/* Background Image / Grid pattern for interactive map */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <pattern id="rdc-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(76, 175, 80, 0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rdc-grid)" />

          {/* Simulated Congo River Curve */}
          <path 
            d="M 15 70 Q 30 50, 50 30 T 80 20" 
            stroke="rgba(56, 189, 248, 0.3)" 
            strokeWidth="8" 
            fill="none" 
          />

          {/* RDC Cities Interactive Nodes */}
          {villesMapData.map((v) => {
            const isSelected = v.name === selectedVille;
            return (
              <g key={v.name} style={{ cursor: 'pointer' }} onClick={() => setSelectedVille(v.name)}>
                {/* Pulse wave */}
                {isSelected && (
                  <circle 
                    cx={`${v.x}%`} 
                    cy={`${v.y}%`} 
                    r="28" 
                    fill="rgba(76, 175, 80, 0.25)"
                  />
                )}
                <circle 
                  cx={`${v.x}%`} 
                  cy={`${v.y}%`} 
                  r={isSelected ? "14" : "9"} 
                  fill={isSelected ? '#4CAF50' : '#2E7D32'} 
                  stroke="#FFFFFF" 
                  strokeWidth="3"
                />
                <text 
                  x={`${v.x}%`} 
                  y={`${v.y - 4}%`} 
                  textAnchor="middle" 
                  fill="#FFFFFF" 
                  fontSize={isSelected ? "14" : "12"} 
                  fontWeight="800"
                >
                  {v.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected City Info Badge Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 20px',
          borderRadius: '14px',
          color: 'white',
          maxWidth: '320px'
        }}>
          <div style={{ fontSize: '0.78rem', color: '#4CAF50', fontWeight: 800, textTransform: 'uppercase' }}>
            Zone sélectionnée en RDC
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0 6px 0' }}>
            Ville de {currentVilleObj.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>🚚 Flotte Tricycles actifs: <strong>{currentVilleObj.activeTricycles} tricycles</strong></span>
            <span>📍 Taux de couverture: <strong style={{ color: '#4CAF50' }}>{currentVilleObj.coverage} des communes</strong></span>
          </div>
        </div>

        {/* Dynamic Tricycle Vehicle Animation Marker */}
        <div style={{
          position: 'absolute',
          left: `${currentVilleObj.x}%`,
          top: `${currentVilleObj.y + 8}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          backgroundColor: '#2E7D32',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          fontWeight: 800,
          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.6)',
          border: '2px solid #FFFFFF'
        }}>
          <Truck size={14} color="#A5D6A7" />
          Équipe EcoClean RDC #{currentVilleObj.name}
        </div>
      </div>

      {/* Footer Info Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px', fontSize: '0.85rem', color: '#64748B' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></span>
            Villes Couvertes (Kinshasa, Lubumbashi, Goma, Bukavu...)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2E7D32' }}></span>
            Collecte à domicile & tri sélectif
          </span>
        </div>
        <span style={{ fontWeight: 700, color: '#1B5E20' }}>Service National d'Assainissement RDC</span>
      </div>
    </div>
  );
}
