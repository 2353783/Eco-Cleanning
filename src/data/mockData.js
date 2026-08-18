// Données de démonstration pour Eco Clean RDC (République Démocratique du Congo)

export const VILLES_RDC = [
  {
    name: 'Kinshasa',
    communes: ['Gombe', 'Limete', 'Matete', 'Lemba', 'Ngaliema', 'Bandalungwa', 'Kalamu', 'Kintambo', 'N\'djili', 'Lingwala', 'Barumbu', 'Mont-Ngafula']
  },
  {
    name: 'Lubumbashi',
    communes: ['Lubumbashi', 'Kampemba', 'Kamalondo', 'Katuba', 'Kenya', 'Ruashi', 'Annexes']
  },
  {
    name: 'Goma',
    communes: ['Goma', 'Karisimbi']
  },
  {
    name: 'Bukavu',
    communes: ['Ibanda', 'Kadutu', 'Bagira']
  },
  {
    name: 'Kisangani',
    communes: ['Makiso', 'Tshopo', 'Mangobo', 'Kabondo', 'Kisangani', 'Lubunga']
  },
  {
    name: 'Matadi',
    communes: ['Matadi', 'Mvuzi', 'Nzanza']
  }
];

export const BOUQUETS = [
  {
    id: 'petit',
    name: 'Petit Bouquet',
    price: 15000,
    priceFormatted: '15 000 FC / mois',
    passages: '2 passages par semaine',
    description: 'Idéal pour les petits ménages résidant en RDC (1 à 4 personnes).',
    features: [
      '2 enlèvements par semaine à domicile',
      'Sacs poubelles écologiques fournis',
      'Suivi SMS & Web du passage des tricycles',
      'Support client & réclamations 6j/7'
    ],
    recommended: false,
    color: '#4CAF50'
  },
  {
    id: 'moyen',
    name: 'Moyen Bouquet',
    price: 25000,
    priceFormatted: '25 000 FC / mois',
    passages: '3 passages par semaine',
    description: 'La formule privilégiée par la majorité des familles en RDC.',
    features: [
      '3 enlèvements par semaine',
      'Collecte prioritaire par tricycle dédié',
      'Notification en temps réel de passage',
      'Support réclamation prioritaire 24h/24',
      'Attribution d\'un agent de secteur'
    ],
    recommended: true,
    color: '#2E7D32'
  },
  {
    id: 'grand',
    name: 'Grand Bouquet',
    price: 40000,
    priceFormatted: '40 000 FC / mois',
    passages: 'Passages quotidiens (6j/7)',
    description: 'Pour grandes parcelles multifamiliales, entreprises et résidences.',
    features: [
      'Passages quotidiens du Lundi au Samedi',
      'Enlèvement de grands volumes & encombrants',
      'Agent référent dédié dans le quartier',
      'Garantie propreté zéro résidu 24/7',
      'Rapports d\'assainissement mensuels'
    ],
    recommended: false,
    color: '#1B5E20'
  }
];

export const MOBILE_MONEY_NUMBERS = [
  {
    operator: 'AIRTEL MONEY',
    number: '+243 983 850 447',
    code: '*501#',
    color: '#E50914',
    logoText: 'Airtel'
  },
  {
    operator: 'VODACOM M-PESA',
    number: '+243 81 42 00 462',
    code: '*1122#',
    color: '#E60000',
    logoText: 'M-Pesa'
  }
];

export const INITIAL_ADMINS = [
  {
    id: 'adm-1',
    name: 'Aubin Muzola',
    phone: '+243983850447',
    password: '12345678'
  }
];

export const INITIAL_AGENTS = [
  {
    id: 'agt-1',
    name: 'KAPUKU Alain',
    phone: '+243820000001',
    password: '12345678',
    tricycleNo: 'Tricycle EcoClean #01',
    quartiersAssigned: ['Matete', 'Limete', 'Lemba'],
    ratingAvg: 4.9,
    ratingsCount: 18,
    status: 'Sur le terrain'
  },
  {
    id: 'agt-2',
    name: 'MBUYI Patrick',
    phone: '+243820000002',
    password: '12345678',
    tricycleNo: 'Tricycle EcoClean #02',
    quartiersAssigned: ['Gombe', 'Kintambo', 'Lingwala'],
    ratingAvg: 4.8,
    ratingsCount: 12,
    status: 'Sur le terrain'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    name: 'KABAMBA Joseph',
    phone: '+243810000001',
    password: '12345678',
    ville: 'Kinshasa',
    commune: 'Matete',
    quartier: 'Batandu',
    avenue: 'Avenue de la Paix',
    parcelleNo: 'N° 14',
    bouquetId: 'moyen',
    bouquetName: 'Moyen Bouquet',
    status: 'Actif',
    subscriptionStartDate: '2026-08-01',
    subscriptionExpires: '2026-09-01',
    paymentHistory: [
      {
        id: 'pay-1',
        date: '2026-08-01',
        startDate: '2026-08-01',
        endDate: '2026-09-01',
        bouquetId: 'moyen',
        bouquetName: 'Moyen Bouquet',
        amount: 25000,
        provider: 'AIRTEL MONEY',
        serialNumber: 'TX-AIRTEL-889102',
        proofUrl: '',
        status: 'Validé'
      }
    ]
  }
];

export const INITIAL_PASSAGES = [
  {
    id: 'pas-1',
    clientId: 'cli-1',
    clientName: 'KABAMBA Joseph',
    ville: 'Kinshasa',
    commune: 'Matete',
    quartier: 'Batandu',
    avenue: 'Avenue de la Paix',
    parcelleNo: 'N° 14',
    agentId: 'agt-1',
    agentName: 'KAPUKU Alain',
    tricycleNo: 'Tricycle EcoClean #01',
    date: '2026-08-18',
    timeSlot: '08:00 - 11:30',
    status: 'Planifié',
    completedAt: null,
    agentNote: null,
    clientRating: null,
    clientFeedback: null
  }
];

export const INITIAL_COMPLAINTS = [];
