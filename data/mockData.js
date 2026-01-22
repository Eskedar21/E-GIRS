export const assessmentYears = [
  { id: '2024', name: '2024 Assessment' },
  { id: '2025', name: '2025 Assessment' },
];

export const maturityLevelThresholds = {
  low: 0.25,
  medium: 0.50,
  high: 0.75,
  veryHigh: 1.0
};

export const coreDimensions = [
  { id: 'IF', name: 'Institutional Framework' },
  { id: 'CP', name: 'Content Provision' },
  { id: 'SD', name: 'Service Delivery' },
  { id: 'PCE', name: 'Participation & Citizen Engagement' },
  { id: 'TE', name: 'Technology Enablement' },
  { id: 'DI', name: 'Digital Inclusion' },
];

export const regionsAndCities = [
  {
    id: 'addis-ababa',
    name: 'Addis Ababa City Administration',
    scoresByYear: {
      '2024': 0.78, // Very High
      '2025': 0.85  // Very High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.8 },
        { dimensionId: 'CP', score: 0.75 },
        { dimensionId: 'SD', score: 0.82 },
        { dimensionId: 'PCE', score: 0.7 },
        { dimensionId: 'TE', score: 0.85 },
        { dimensionId: 'DI', score: 0.65 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.85 },
        { dimensionId: 'CP', score: 0.80 },
        { dimensionId: 'SD', score: 0.88 },
        { dimensionId: 'PCE', score: 0.75 },
        { dimensionId: 'TE', score: 0.90 },
        { dimensionId: 'DI', score: 0.70 },
      ]
    },
    childUnits: [
      { id: 'addis-ketema', name: 'Addis Ketema', scoresByYear: { '2024': 0.75, '2025': 0.80 } },
      { id: 'akaki-kality', name: 'Akaki Kality', scoresByYear: { '2024': 0.68, '2025': 0.72 } },
      { id: 'arada', name: 'Arada', scoresByYear: { '2024': 0.82, '2025': 0.87 } },
      { id: 'bole', name: 'Bole', scoresByYear: { '2024': 0.88, '2025': 0.92 } },
      { id: 'gullele', name: 'Gullele', scoresByYear: { '2024': 0.70, '2025': 0.75 } },
      { id: 'kirkos', name: 'Kirkos', scoresByYear: { '2024': 0.72, '2025': 0.77 } },
      { id: 'kolfe-keranio', name: 'Kolfe Keranio', scoresByYear: { '2024': 0.65, '2025': 0.70 } },
      { id: 'lideta', name: 'Lideta', scoresByYear: { '2024': 0.78, '2025': 0.83 } },
      { id: 'nifas-silk', name: 'Nifas Silk-Lafto', scoresByYear: { '2024': 0.80, '2025': 0.85 } },
      { id: 'yeka', name: 'Yeka', scoresByYear: { '2024': 0.77, '2025': 0.82 } },
    ]
  },
  {
    id: 'oromia',
    name: 'Oromia Region',
    scoresByYear: {
      '2024': 0.62, // High
      '2025': 0.68  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.65 },
        { dimensionId: 'CP', score: 0.60 },
        { dimensionId: 'SD', score: 0.68 },
        { dimensionId: 'PCE', score: 0.55 },
        { dimensionId: 'TE', score: 0.70 },
        { dimensionId: 'DI', score: 0.50 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.70 },
        { dimensionId: 'CP', score: 0.65 },
        { dimensionId: 'SD', score: 0.72 },
        { dimensionId: 'PCE', score: 0.60 },
        { dimensionId: 'TE', score: 0.75 },
        { dimensionId: 'DI', score: 0.55 },
      ]
    },
    childUnits: [ // Placeholder for Zones
      { id: 'zone1_oromia', name: 'West Arsi Zone', scoresByYear: { '2024': 0.60, '2025': 0.65 } },
      { id: 'zone2_oromia', name: 'East Shewa Zone', scoresByYear: { '2024': 0.64, '2025': 0.70 } },
    ]
  },
  {
    id: 'amhara',
    name: 'Amhara Region',
    scoresByYear: {
      '2024': 0.55, // Medium
      '2025': 0.60  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.58 },
        { dimensionId: 'CP', score: 0.50 },
        { dimensionId: 'SD', score: 0.60 },
        { dimensionId: 'PCE', score: 0.45 },
        { dimensionId: 'TE', score: 0.62 },
        { dimensionId: 'DI', score: 0.48 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.62 },
        { dimensionId: 'CP', score: 0.55 },
        { dimensionId: 'SD', score: 0.65 },
        { dimensionId: 'PCE', score: 0.50 },
        { dimensionId: 'TE', score: 0.68 },
        { dimensionId: 'DI', score: 0.52 },
      ]
    },
    childUnits: [
      { id: 'zone1_amhara', name: 'North Gondar Zone', scoresByYear: { '2024': 0.58, '2025': 0.63 } },
      { id: 'zone2_amhara', name: 'South Wollo Zone', scoresByYear: { '2024': 0.52, '2025': 0.57 } },
    ]
  },
   {
    id: 'tigray',
    name: 'Tigray Region',
    scoresByYear: {
      '2024': 0.35, // Medium
      '2025': 0.40  // Medium
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.40 },
        { dimensionId: 'CP', score: 0.30 },
        { dimensionId: 'SD', score: 0.38 },
        { dimensionId: 'PCE', score: 0.28 },
        { dimensionId: 'TE', score: 0.42 },
        { dimensionId: 'DI', score: 0.32 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.45 },
        { dimensionId: 'CP', score: 0.35 },
        { dimensionId: 'SD', score: 0.42 },
        { dimensionId: 'PCE', score: 0.32 },
        { dimensionId: 'TE', score: 0.48 },
        { dimensionId: 'DI', score: 0.38 },
      ]
    },
    childUnits: [
      { id: 'zone1_tigray', name: 'Central Tigray Zone', scoresByYear: { '2024': 0.38, '2025': 0.43 } },
      { id: 'zone2_tigray', name: 'Eastern Tigray Zone', scoresByYear: { '2024': 0.32, '2025': 0.37 } },
    ]
  },
  {
    id: 'dire-dawa',
    name: 'Dire Dawa City Administration',
    scoresByYear: {
      '2024': 0.72, // High
      '2025': 0.75  // Very High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.75 },
        { dimensionId: 'CP', score: 0.70 },
        { dimensionId: 'SD', score: 0.75 },
        { dimensionId: 'PCE', score: 0.65 },
        { dimensionId: 'TE', score: 0.78 },
        { dimensionId: 'DI', score: 0.60 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.78 },
        { dimensionId: 'CP', score: 0.73 },
        { dimensionId: 'SD', score: 0.78 },
        { dimensionId: 'PCE', score: 0.70 },
        { dimensionId: 'TE', score: 0.82 },
        { dimensionId: 'DI', score: 0.65 },
      ]
    },
    childUnits: [
      { id: 'dire-dawa-sub1', name: 'Dire Dawa Sub-city 1', scoresByYear: { '2024': 0.70, '2025': 0.73 } },
      { id: 'dire-dawa-sub2', name: 'Dire Dawa Sub-city 2', scoresByYear: { '2024': 0.74, '2025': 0.77 } },
    ]
  },
  {
    id: 'somali',
    name: 'Somali Region',
    scoresByYear: {
      '2024': 0.48, // Medium
      '2025': 0.52  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.50 },
        { dimensionId: 'CP', score: 0.45 },
        { dimensionId: 'SD', score: 0.52 },
        { dimensionId: 'PCE', score: 0.40 },
        { dimensionId: 'TE', score: 0.55 },
        { dimensionId: 'DI', score: 0.38 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.55 },
        { dimensionId: 'CP', score: 0.50 },
        { dimensionId: 'SD', score: 0.57 },
        { dimensionId: 'PCE', score: 0.45 },
        { dimensionId: 'TE', score: 0.60 },
        { dimensionId: 'DI', score: 0.43 },
      ]
    },
    childUnits: []
  },
  {
    id: 'snnpr',
    name: 'Southern Nations, Nationalities, and Peoples\' Region',
    scoresByYear: {
      '2024': 0.58, // High
      '2025': 0.63  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.60 },
        { dimensionId: 'CP', score: 0.55 },
        { dimensionId: 'SD', score: 0.62 },
        { dimensionId: 'PCE', score: 0.50 },
        { dimensionId: 'TE', score: 0.65 },
        { dimensionId: 'DI', score: 0.48 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.65 },
        { dimensionId: 'CP', score: 0.60 },
        { dimensionId: 'SD', score: 0.67 },
        { dimensionId: 'PCE', score: 0.55 },
        { dimensionId: 'TE', score: 0.70 },
        { dimensionId: 'DI', score: 0.53 },
      ]
    },
    childUnits: []
  },
  {
    id: 'afar',
    name: 'Afar Region',
    scoresByYear: {
      '2024': 0.42, // Medium
      '2025': 0.47  // Medium
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.45 },
        { dimensionId: 'CP', score: 0.38 },
        { dimensionId: 'SD', score: 0.45 },
        { dimensionId: 'PCE', score: 0.35 },
        { dimensionId: 'TE', score: 0.48 },
        { dimensionId: 'DI', score: 0.32 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.50 },
        { dimensionId: 'CP', score: 0.43 },
        { dimensionId: 'SD', score: 0.50 },
        { dimensionId: 'PCE', score: 0.40 },
        { dimensionId: 'TE', score: 0.53 },
        { dimensionId: 'DI', score: 0.37 },
      ]
    },
    childUnits: []
  },
  {
    id: 'benishangul',
    name: 'Benishangul-Gumuz Region',
    scoresByYear: {
      '2024': 0.50, // High
      '2025': 0.55  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.52 },
        { dimensionId: 'CP', score: 0.48 },
        { dimensionId: 'SD', score: 0.55 },
        { dimensionId: 'PCE', score: 0.42 },
        { dimensionId: 'TE', score: 0.58 },
        { dimensionId: 'DI', score: 0.40 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.57 },
        { dimensionId: 'CP', score: 0.53 },
        { dimensionId: 'SD', score: 0.60 },
        { dimensionId: 'PCE', score: 0.47 },
        { dimensionId: 'TE', score: 0.63 },
        { dimensionId: 'DI', score: 0.45 },
      ]
    },
    childUnits: []
  },
  {
    id: 'gambela',
    name: 'Gambela Region',
    scoresByYear: {
      '2024': 0.45, // Medium
      '2025': 0.50  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.48 },
        { dimensionId: 'CP', score: 0.42 },
        { dimensionId: 'SD', score: 0.48 },
        { dimensionId: 'PCE', score: 0.38 },
        { dimensionId: 'TE', score: 0.52 },
        { dimensionId: 'DI', score: 0.35 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.53 },
        { dimensionId: 'CP', score: 0.47 },
        { dimensionId: 'SD', score: 0.53 },
        { dimensionId: 'PCE', score: 0.43 },
        { dimensionId: 'TE', score: 0.57 },
        { dimensionId: 'DI', score: 0.40 },
      ]
    },
    childUnits: []
  },
  {
    id: 'harari',
    name: 'Harari Region',
    scoresByYear: {
      '2024': 0.68, // High
      '2025': 0.72  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.70 },
        { dimensionId: 'CP', score: 0.65 },
        { dimensionId: 'SD', score: 0.72 },
        { dimensionId: 'PCE', score: 0.60 },
        { dimensionId: 'TE', score: 0.75 },
        { dimensionId: 'DI', score: 0.55 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.75 },
        { dimensionId: 'CP', score: 0.70 },
        { dimensionId: 'SD', score: 0.77 },
        { dimensionId: 'PCE', score: 0.65 },
        { dimensionId: 'TE', score: 0.80 },
        { dimensionId: 'DI', score: 0.60 },
      ]
    },
    childUnits: []
  },
  {
    id: 'sidama',
    name: 'Sidama Region',
    scoresByYear: {
      '2024': 0.60, // High
      '2025': 0.65  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.62 },
        { dimensionId: 'CP', score: 0.58 },
        { dimensionId: 'SD', score: 0.65 },
        { dimensionId: 'PCE', score: 0.52 },
        { dimensionId: 'TE', score: 0.68 },
        { dimensionId: 'DI', score: 0.48 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.67 },
        { dimensionId: 'CP', score: 0.63 },
        { dimensionId: 'SD', score: 0.70 },
        { dimensionId: 'PCE', score: 0.57 },
        { dimensionId: 'TE', score: 0.73 },
        { dimensionId: 'DI', score: 0.53 },
      ]
    },
    childUnits: []
  },
  {
    id: 'southwest',
    name: 'South West Ethiopia Peoples\' Region',
    scoresByYear: {
      '2024': 0.52, // High
      '2025': 0.57  // High
    },
    dimensionsScoresByYear: {
      '2024': [
        { dimensionId: 'IF', score: 0.55 },
        { dimensionId: 'CP', score: 0.50 },
        { dimensionId: 'SD', score: 0.57 },
        { dimensionId: 'PCE', score: 0.45 },
        { dimensionId: 'TE', score: 0.60 },
        { dimensionId: 'DI', score: 0.42 },
      ],
      '2025': [
        { dimensionId: 'IF', score: 0.60 },
        { dimensionId: 'CP', score: 0.55 },
        { dimensionId: 'SD', score: 0.62 },
        { dimensionId: 'PCE', score: 0.50 },
        { dimensionId: 'TE', score: 0.65 },
        { dimensionId: 'DI', score: 0.47 },
      ]
    },
    childUnits: []
  }
];

export const getMaturityLevel = (score) => {
  if (score >= maturityLevelThresholds.high) return 'Very High';
  if (score >= maturityLevelThresholds.medium) return 'High';
  if (score >= maturityLevelThresholds.low) return 'Medium';
  return 'Low';
};

