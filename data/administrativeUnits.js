// Administrative Units Data Store
// This will be replaced with a database in production

let administrativeUnits = [
  // Example pre-populated units
  {
    unitId: 1,
    officialUnitName: 'Ministry of Health',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 2,
    officialUnitName: 'Ministry of Education',
    unitType: 'Federal Institute',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 3,
    officialUnitName: 'Addis Ababa City Administration',
    unitType: 'City Administration',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 4,
    officialUnitName: 'Oromia Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 5,
    officialUnitName: 'Amhara Region',
    unitType: 'Region',
    parentUnitId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 6,
    officialUnitName: 'Sub-city 1',
    unitType: 'Sub-city',
    parentUnitId: 3, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 7,
    officialUnitName: 'Sub-city 2',
    unitType: 'Sub-city',
    parentUnitId: 3, // Addis Ababa
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 8,
    officialUnitName: 'West Arsi Zone',
    unitType: 'Zone',
    parentUnitId: 4, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 9,
    officialUnitName: 'East Shewa Zone',
    unitType: 'Zone',
    parentUnitId: 4, // Oromia
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 10,
    officialUnitName: 'Woreda 1',
    unitType: 'Woreda',
    parentUnitId: 6, // Sub-city 1
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 11,
    officialUnitName: 'Woreda 2',
    unitType: 'Woreda',
    parentUnitId: 6, // Sub-city 1
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    unitId: 12,
    officialUnitName: 'Woreda 3',
    unitType: 'Woreda',
    parentUnitId: 8, // West Arsi Zone
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
export const isUnitNameUnique = (unitName, unitType, parentUnitId = null) => {
  const existing = administrativeUnits.find(unit => 
    unit.officialUnitName === unitName && 
    unit.unitType === unitType &&
    unit.parentUnitId === parentUnitId
  );
  return !existing;
};

// Get child units
export const getChildUnits = (parentUnitId) => {
  return administrativeUnits.filter(unit => unit.parentUnitId === parentUnitId);
};

