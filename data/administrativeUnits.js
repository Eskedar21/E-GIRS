// Administrative Units Data Store
// This will be replaced with a database in production

let administrativeUnits = [
  // Federal Institutes
  {
    unitId: 1,
    officialUnitName: 'Ministry of Innovation and Technology',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 2,
    officialUnitName: 'Ministry of Health',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 3,
    officialUnitName: 'Ministry of Education',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 4,
    officialUnitName: 'Ministry of Finance',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 5,
    officialUnitName: 'Ministry of Agriculture',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // City Administrations
  {
    unitId: 10,
    officialUnitName: 'Addis Ababa City Administration',
    unitType: 'City Administration',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 11,
    officialUnitName: 'Dire Dawa City Administration',
    unitType: 'City Administration',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Regions
  {
    unitId: 20,
    officialUnitName: 'Oromia Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 21,
    officialUnitName: 'Amhara Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 22,
    officialUnitName: 'Tigray Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 23,
    officialUnitName: 'Somali Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 24,
    officialUnitName: 'Southern Nations, Nationalities, and Peoples\' Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 25,
    officialUnitName: 'Afar Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 26,
    officialUnitName: 'Benishangul-Gumuz Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 27,
    officialUnitName: 'Gambela Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 28,
    officialUnitName: 'Harari Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 29,
    officialUnitName: 'Sidama Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 30,
    officialUnitName: 'South West Ethiopia Peoples\' Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Addis Ababa Sub-cities
  {
    unitId: 100,
    officialUnitName: 'Addis Ketema',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 101,
    officialUnitName: 'Akaki Kality',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 102,
    officialUnitName: 'Arada',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 103,
    officialUnitName: 'Bole',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 104,
    officialUnitName: 'Gullele',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 105,
    officialUnitName: 'Kirkos',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 106,
    officialUnitName: 'Kolfe Keranio',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 107,
    officialUnitName: 'Lideta',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 108,
    officialUnitName: 'Nifas Silk-Lafto',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 109,
    officialUnitName: 'Yeka',
    unitType: 'Sub-city',
    parentUnitId: 10, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Oromia Zones
  {
    unitId: 200,
    officialUnitName: 'West Arsi Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 201,
    officialUnitName: 'East Shewa Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 202,
    officialUnitName: 'North Shewa Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 203,
    officialUnitName: 'West Shewa Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 204,
    officialUnitName: 'Jimma Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 205,
    officialUnitName: 'Bale Zone',
    unitType: 'Zone',
    parentUnitId: 20, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Amhara Zones
  {
    unitId: 300,
    officialUnitName: 'North Gondar Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 301,
    officialUnitName: 'South Gondar Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 302,
    officialUnitName: 'North Wollo Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 303,
    officialUnitName: 'South Wollo Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 304,
    officialUnitName: 'East Gojjam Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 305,
    officialUnitName: 'West Gojjam Zone',
    unitType: 'Zone',
    parentUnitId: 21, // Amhara
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Sample Woredas from Oromia - West Arsi Zone
  {
    unitId: 2000,
    officialUnitName: 'Shashemene',
    unitType: 'Woreda',
    parentUnitId: 200, // West Arsi Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 2001,
    officialUnitName: 'Kofele',
    unitType: 'Woreda',
    parentUnitId: 200, // West Arsi Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 2002,
    officialUnitName: 'Kokosa',
    unitType: 'Woreda',
    parentUnitId: 200, // West Arsi Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Sample Woredas from Oromia - East Shewa Zone
  {
    unitId: 2010,
    officialUnitName: 'Bishoftu',
    unitType: 'Woreda',
    parentUnitId: 201, // East Shewa Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 2011,
    officialUnitName: 'Adama',
    unitType: 'Woreda',
    parentUnitId: 201, // East Shewa Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Sample Woredas from Amhara - North Gondar Zone
  {
    unitId: 3000,
    officialUnitName: 'Gondar',
    unitType: 'Woreda',
    parentUnitId: 300, // North Gondar Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 3001,
    officialUnitName: 'Debark',
    unitType: 'Woreda',
    parentUnitId: 300, // North Gondar Zone
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Sample Woredas from Addis Ababa - Bole Sub-city
  {
    unitId: 1030,
    officialUnitName: 'Bole Sub-city Woreda 1',
    unitType: 'Woreda',
    parentUnitId: 103, // Bole Sub-city
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 1031,
    officialUnitName: 'Bole Sub-city Woreda 2',
    unitType: 'Woreda',
    parentUnitId: 103, // Bole Sub-city
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  
  // Sample Woredas from Addis Ababa - Kirkos Sub-city
  {
    unitId: 1050,
    officialUnitName: 'Kirkos Sub-city Woreda 1',
    unitType: 'Woreda',
    parentUnitId: 105, // Kirkos Sub-city
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 1051,
    officialUnitName: 'Kirkos Sub-city Woreda 2',
    unitType: 'Woreda',
    parentUnitId: 105, // Kirkos Sub-city
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
];

// Unit Types
export const UNIT_TYPES = {
  FEDERAL_INSTITUTE: 'Federal Institute',
  REGION: 'Region',
  CITY_ADMINISTRATION: 'City Administration',
  ZONE: 'Zone',
  SUB_CITY: 'Sub-city',
  WOREDA: 'Woreda'
};

// Get all units
export const getAllUnits = () => {
  return [...administrativeUnits];
};

// Get units by type
export const getUnitsByType = (unitType) => {
  return administrativeUnits.filter(unit => unit.unitType === unitType);
};

// Get units that can be parents for a given child type
export const getValidParents = (childUnitType) => {
  if (childUnitType === UNIT_TYPES.ZONE || childUnitType === UNIT_TYPES.SUB_CITY) {
    return administrativeUnits.filter(unit => 
      unit.unitType === UNIT_TYPES.REGION || unit.unitType === UNIT_TYPES.CITY_ADMINISTRATION
    );
  }
  if (childUnitType === UNIT_TYPES.WOREDA) {
    return administrativeUnits.filter(unit => 
      unit.unitType === UNIT_TYPES.ZONE || unit.unitType === UNIT_TYPES.SUB_CITY
    );
  }
  return [];
};

// Get unit by ID
export const getUnitById = (unitId) => {
  return administrativeUnits.find(unit => unit.unitId === unitId);
};

// Create a new unit
export const createUnit = (unitData) => {
  const newUnit = {
    unitId: administrativeUnits.length > 0 
      ? Math.max(...administrativeUnits.map(u => u.unitId)) + 1 
      : 1,
    officialUnitName: unitData.officialUnitName,
    unitType: unitData.unitType,
    parentUnitId: unitData.parentUnitId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  administrativeUnits.push(newUnit);
  return newUnit;
};

// Update a unit
export const updateUnit = (unitId, unitData) => {
  const index = administrativeUnits.findIndex(unit => unit.unitId === unitId);
  if (index !== -1) {
    administrativeUnits[index] = {
      ...administrativeUnits[index],
      ...unitData,
      updatedAt: new Date().toISOString()
    };
    return administrativeUnits[index];
  }
  return null;
};

// Delete a unit
export const deleteUnit = (unitId) => {
  const index = administrativeUnits.findIndex(unit => unit.unitId === unitId);
  if (index !== -1) {
    const deleted = administrativeUnits.splice(index, 1)[0];
    return deleted;
  }
  return null;
};

// Check if unit name is unique (within parent for child units)
export const isUnitNameUnique = (unitName, unitType, parentUnitId = null, excludeUnitId = null) => {
  const existing = administrativeUnits.find(unit => 
    unit.officialUnitName === unitName && 
    unit.unitType === unitType &&
    unit.parentUnitId === parentUnitId &&
    (excludeUnitId === null || unit.unitId !== excludeUnitId)
  );
  return !existing;
};

// Get child units
export const getChildUnits = (parentUnitId) => {
  return administrativeUnits.filter(unit => unit.parentUnitId === parentUnitId);
};

