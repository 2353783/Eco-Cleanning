import React from 'react';

export default function Logo({ size = 42, showText = true, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {/* SVG Icon matching the logo: House frame with green leaf inside */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* House Contour */}
        <path
          d="M 50 12 L 18 38 L 18 78 C 18 84 22 88 28 88 L 72 88 C 78 88 82 84 82 78 L 82 38 Z"
          fill="none"
          stroke="#2E7D32"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Window grid in top right of house */}
        <rect x="52" y="44" width="7" height="7" rx="1" fill="#2E7D32" />
        <rect x="62" y="44" width="7" height="7" rx="1" fill="#2E7D32" />
        <rect x="52" y="54" width="7" height="7" rx="1" fill="#2E7D32" />
        <rect x="62" y="54" width="7" height="7" rx="1" fill="#2E7D32" />

        {/* Leaf 1 (Left) */}
        <path
          d="M 38 78 C 30 68 32 50 44 42 C 44 58 36 72 38 78 Z"
          fill="#2E7D32"
        />
        {/* Leaf 2 (Right stem curving up) */}
        <path
          d="M 40 82 C 42 66 54 50 68 46 C 62 62 50 76 40 82 Z"
          fill="#4CAF50"
        />
        {/* Leaf Vein */}
        <path
          d="M 41 80 Q 48 65 60 52"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', leading: 1 }}>
          <span style={{
            color: '#2E7D32',
            fontWeight: 800,
            fontSize: size > 40 ? '1.4rem' : '1.1rem',
            letterSpacing: '-0.5px',
            fontFamily: 'serif',
            textTransform: 'uppercase'
          }}>
            ECO CLEAN
          </span>
          <span style={{
            color: '#64748B',
            fontWeight: 700,
            fontSize: '0.65rem',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            RÉPUBLIQUE DÉMOCRATIQUE DU CONGO
          </span>
        </div>
      )}
    </div>
  );
}
