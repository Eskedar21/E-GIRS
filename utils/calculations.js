// Calculation Engine Utilities
// This module provides utilities for calculating scores, dimensions, and aggregations
// as per the E-GIRS SRS requirements

import { regionsAndCities } from '../data/mockData';
import { getDimensionsByYear } from '../data/assessmentFramework';

/**
 * Calculate National Index (arithmetic mean of all top-level unit scores)
 */
export const calculateNationalIndex = (yearId) => {
  const topLevelUnits = regionsAndCities;
  if (topLevelUnits.length === 0) return 0;
  
  const sum = topLevelUnits.reduce((acc, unit) => {
    return acc + (unit.scoresByYear[yearId] || 0);
  }, 0);
  
  return sum / topLevelUnits.length;
};

/**
 * Calculate national average for a specific dimension
 */
export const calculateNationalDimensionAverage = (yearId, dimensionId) => {
  const topLevelUnits = regionsAndCities;
  if (topLevelUnits.length === 0) return 0;
  
  const sum = topLevelUnits.reduce((acc, unit) => {
    const dimensionScore = unit.dimensionsScoresByYear?.[yearId]?.find(
      d => d.dimensionId === dimensionId
    )?.score || 0;
    return acc + dimensionScore;
  }, 0);
  
  return sum / topLevelUnits.length;
};

/**
 * Get all dimension scores for national average
 */
export const getNationalDimensionScores = (yearId) => {
  // Map year ID to assessment year ID
  const assessmentYearId = yearId === '2024' ? 1 : 2;
  const dimensions = getDimensionsByYear(assessmentYearId);
  if (!dimensions || dimensions.length === 0) return [];
  
  // Map dimension names to short codes used in mockData (IF, CP, SD, PCE, TE, DI)
  const dimensionNameMap = {
    'Institutional Framework': 'IF',
    'Content Provision': 'CP',
    'Service Delivery': 'SD',
    'Participation & Citizen Engagement': 'PCE',
    'Technology Enablement': 'TE',
    'Digital Inclusion': 'DI'
  };
  
  // Also map dimension IDs for backward compatibility (1-6 for year 1, 7-12 for year 2)
  const dimensionIdMap = {
    1: 'IF', 7: 'IF',   // Institutional Framework
    2: 'CP', 8: 'CP',   // Content Provision
    3: 'SD', 9: 'SD',   // Service Delivery
    4: 'PCE', 10: 'PCE', // Participation & Citizen Engagement
    5: 'TE', 11: 'TE',   // Technology Enablement
    6: 'DI', 12: 'DI'    // Digital Inclusion
  };
  
  return dimensions.map(dimension => {
    // Try to get mapped ID from name first, then from ID, otherwise use dimension name
    const mappedId = dimensionNameMap[dimension.dimensionName] || 
                     dimensionIdMap[dimension.dimensionId] || 
                     dimension.dimensionName;
    return {
      dimensionId: mappedId,
      dimensionName: dimension.dimensionName,
      nationalAverage: calculateNationalDimensionAverage(yearId, mappedId)
    };
  });
};

/**
 * Count units by maturity level
 */
export const countUnitsByMaturityLevel = (yearId) => {
  const counts = {
    'Very High': 0,
    'High': 0,
    'Medium': 0,
    'Low': 0
  };
  
  regionsAndCities.forEach(unit => {
    const score = unit.scoresByYear[yearId] || 0;
    let level = 'Low';
    if (score >= 0.75) level = 'Very High';
    else if (score >= 0.50) level = 'High';
    else if (score >= 0.25) level = 'Medium';
    
    counts[level]++;
  });
  
  return counts;
};

/**
 * Get trend data for national index and dimensions over time
 */
export const getNationalTrendData = () => {
  const years = ['2024', '2025'];
  const dimensions = getDimensionsByYear(1); // Using 2024 dimensions as base
  
  const dimensionIdMap = {
    1: 'IF',
    2: 'CP',
    3: 'SD',
    4: 'PCE',
    5: 'TE',
    6: 'DI'
  };
  
  const trendData = {
    nationalIndex: [],
    dimensions: dimensions.map(d => ({
      dimensionId: dimensionIdMap[d.dimensionId] || d.dimensionId,
      dimensionName: d.dimensionName,
      scores: []
    }))
  };
  
  years.forEach(yearId => {
    const nationalIndex = calculateNationalIndex(yearId);
    trendData.nationalIndex.push({
      year: yearId,
      score: nationalIndex
    });
    
    dimensions.forEach((dim, idx) => {
      const mappedId = dimensionIdMap[dim.dimensionId] || dim.dimensionId;
      const avg = calculateNationalDimensionAverage(yearId, mappedId);
      trendData.dimensions[idx].scores.push({
        year: yearId,
        score: avg
      });
    });
  });
  
  return trendData;
};

/**
 * Get ranked units for the selected year
 */
export const getRankedUnits = (yearId) => {
  return regionsAndCities
    .map(unit => ({
      ...unit,
      score: unit.scoresByYear[yearId] || 0,
      dimensionScores: unit.dimensionsScoresByYear?.[yearId] || []
    }))
    .sort((a, b) => b.score - a.score)
    .map((unit, index) => ({
      ...unit,
      rank: index + 1
    }));
};

/**
 * Get unit score for a specific year
 * Works with both mockData structure (id/name) and administrativeUnits structure (unitId/officialUnitName)
 */
export const getUnitScore = (unitId, yearId, allUnits) => {
  const unit = allUnits.find(u => 
    (u.unitId && u.unitId === unitId) || 
    (u.id && u.id === unitId) ||
    (u.id && String(u.id) === String(unitId))
  );
  if (!unit) return 0;
  
  // Try to get from scoresByYear (mockData structure)
  if (unit.scoresByYear && unit.scoresByYear[yearId] !== undefined) {
    return unit.scoresByYear[yearId];
  }
  
  // For administrative units, we might need to calculate from submissions
  // For now, return 0 if no score is available
  return 0;
};

/**
 * Get unit dimension scores for a specific year
 * Works with both mockData structure and administrativeUnits structure
 */
export const getUnitDimensionScores = (unitId, yearId, allUnits) => {
  const unit = allUnits.find(u => 
    (u.unitId && u.unitId === unitId) || 
    (u.id && u.id === unitId) ||
    (u.id && String(u.id) === String(unitId))
  );
  if (!unit) return [];
  
  // Try to get from dimensionsScoresByYear (mockData structure)
  if (unit.dimensionsScoresByYear && unit.dimensionsScoresByYear[yearId]) {
    return unit.dimensionsScoresByYear[yearId];
  }
  
  // For administrative units without mock data, return empty array
  // In production, this would calculate from submissions
  return [];
};

/**
 * Get child units for a given parent unit
 * Works with administrativeUnits structure (parentUnitId)
 */
export const getChildUnits = (parentUnitId, allUnits) => {
  return allUnits.filter(u => 
    u.parentUnitId === parentUnitId || 
    (u.parentUnitId && String(u.parentUnitId) === String(parentUnitId))
  );
};

/**
 * Get all descendant units (children, grandchildren, etc.)
 * Works with administrativeUnits structure
 */
export const getAllDescendantUnits = (parentUnitId, allUnits) => {
  const children = getChildUnits(parentUnitId, allUnits);
  const allDescendants = [...children];
  
  children.forEach(child => {
    const childId = child.unitId || child.id;
    if (childId) {
      allDescendants.push(...getAllDescendantUnits(childId, allUnits));
    }
  });
  
  return allDescendants;
};

/**
 * Get units by type within a hierarchy
 * Works with administrativeUnits structure
 */
export const getUnitsByTypeInHierarchy = (parentUnitId, unitType, allUnits) => {
  const descendants = getAllDescendantUnits(parentUnitId, allUnits);
  return descendants.filter(u => u.unitType === unitType);
};

/**
 * Get all units (for compatibility with mockData structure)
 */
export const getAllUnitsForCalculations = () => {
  // This will be replaced with actual data from administrativeUnits
  return [];
};

