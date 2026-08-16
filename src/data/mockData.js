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

export const INITIAL_CLIENTS = [
  {
    id: 'cli-1',
    name: 'KABAMBA MUKENDI Joseph',
    phone: '+243 82 55 44 112',
    ville: 'Kinshasa',
    commune: 'Matete',
    quartier: 'Batandu',
    avenue: 'Avenue Maziya',
    parcelleNo: 'N° 45B',
    bouquetId: 'moyen',
    bouquetName: 'Moyen Bouquet',
    status: 'Actif',
    subscriptionExpires: '2026-08-30',
    paymentHistory: [
      {
        id: 'pay-101',
        date: '2026-08-01',
        amount: 25000,
        provider: 'VODACOM M-PESA',
        serialNumber: 'MP-8924019238',
        proofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
        status: 'Validé'
      }
    ]
  },
  {
    id: 'cli-2',
    name: 'MBALA BAKAMBANA Thérèse',
    phone: '+243 99 12 34 567',
    ville: 'Kinshasa',
    commune: 'Gombe',
    quartier: 'Golf',
    avenue: 'Avenue de la Justice',
    parcelleNo: 'N° 12',
    bouquetId: 'grand',
    bouquetName: 'Grand Bouquet',
    status: 'Actif',
    subscriptionExpires: '2026-09-05',
    paymentHistory: [
      {
        id: 'pay-102',
        date: '2026-08-02',
        amount: 40000,
        provider: 'AIRTEL MONEY',
        serialNumber: 'AM-771029481',
        proofUrl: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=600&q=80',
        status: 'Validé'
      }
    ]
  },
  {
    id: 'cli-3',
    name: 'TSHILOMBO Patrick',
    phone: '+243 85 99 88 111',
    ville: 'Lubumbashi',
    commune: 'Kampemba',
    quartier: 'Bel-Air',
    avenue: 'Avenue des Huileries',
    parcelleNo: 'N° 88',
    bouquetId: 'petit',
    bouquetName: 'Petit Bouquet',
    status: 'En attente',
    subscriptionExpires: '2026-08-03',
    paymentHistory: [
      {
        id: 'pay-103',
        date: '2026-08-03',
        amount: 15000,
        provider: 'AIRTEL MONEY',
        serialNumber: 'AM-998822019',
        proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
        status: 'En attente'
      }
    ]
  }
];

export const INITIAL_AGENTS = [
  {
    id: 'agt-1',
    name: 'KAPUKU Alain',
    phone: '+243 81 20 30 405',
    tricycleNo: 'Tricycle EcoClean #04',
    quartiersAssigned: ['Matete', 'Lemba', 'Limete'],
    ratingAvg: 4.9,
    ratingsCount: 42,
    status: 'Sur le terrain'
  },
  {
    id: 'agt-2',
    name: 'ILUNGA Christian',
    phone: '+243 89 50 60 708',
    tricycleNo: 'Tricycle EcoClean #09',
    quartiersAssigned: ['Gombe', 'Lingwala', 'Ngaliema'],
    ratingAvg: 4.7,
    ratingsCount: 31,
    status: 'Sur le terrain'
  }
];

export const INITIAL_PASSAGES = [
  {
    id: 'pas-1',
    clientId: 'cli-1',
    clientName: 'KABAMBA MUKENDI Joseph',
    ville: 'Kinshasa',
    commune: 'Matete',
    quartier: 'Batandu',
    avenue: 'Avenue Maziya',
    parcelleNo: 'N° 45B',
    agentId: 'agt-1',
    agentName: 'KAPUKU Alain',
    scheduledDate: '2026-08-03',
    timeSlot: '08:00 - 10:00',
    status: 'Ramassé',
    completedAt: '2026-08-03 09:15',
    agentNote: 'Poubelle bien triée et déposée à la porte.',
    clientRating: 5,
    clientFeedback: 'Très propre et ponctuel comme toujours. Bravo à l\'agent Alain !'
  },
  {
    id: 'pas-2',
    clientId: 'cli-2',
    clientName: 'MBALA BAKAMBANA Thérèse',
    ville: 'Kinshasa',
    commune: 'Gombe',
    quartier: 'Golf',
    avenue: 'Avenue de la Justice',
    parcelleNo: 'N° 12',
    agentId: 'agt-2',
    agentName: 'ILUNGA Christian',
    scheduledDate: '2026-08-03',
    timeSlot: '10:30 - 12:00',
    status: 'Ramassé',
    completedAt: '2026-08-03 11:05',
    agentNote: 'Grand sac enlevé.',
    clientRating: 5,
    clientFeedback: 'Excellent service à Gombe.'
  },
  {
    id: 'pas-3',
    clientId: 'cli-3',
    clientName: 'TSHILOMBO Patrick',
    ville: 'Lubumbashi',
    commune: 'Kampemba',
    quartier: 'Bel-Air',
    avenue: 'Avenue des Huileries',
    parcelleNo: 'N° 88',
    agentId: 'agt-1',
    agentName: 'KAPUKU Alain',
    scheduledDate: '2026-08-03',
    timeSlot: '14:00 - 16:00',
    status: 'Planifié',
    completedAt: null,
    agentNote: null,
    clientRating: null,
    clientFeedback: null
  }
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'rec-501',
    clientId: 'cli-1',
    clientName: 'KABAMBA MUKENDI Joseph',
    phone: '+243 82 55 44 112',
    ville: 'Kinshasa',
    commune: 'Matete',
    quartier: 'Batandu',
    avenue: 'Avenue Maziya N° 45B',
    agentAssigned: 'KAPUKU Alain',
    date: '2026-07-28',
    subject: 'Passage manqué le mardi après-midi',
    description: 'Le tricycle n\'est pas passé à notre parcelle mardi malgré les sacs prêts devant la porte.',
    photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    status: 'Résolu',
    adminNotes: 'Intervention spéciale effectuée mercredi à 07h30. Client satisfait.'
  }
];
