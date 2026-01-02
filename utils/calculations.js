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
  
  // Use dimension IDs from mockData (IF, CP, SD, PCE, TE, DI)
  const dimensionIdMap = {
    1: 'IF', // Institutional Framework
    2: 'CP', // Content Provision
    3: 'SD', // Service Delivery
    4: 'PCE', // Participation & Citizen Engagement
    5: 'TE', // Technology Enablement
    6: 'DI' // Digital Inclusion
  };
  
  return dimensions.map(dimension => {
    const mappedId = dimensionIdMap[dimension.dimensionId] || dimension.dimensionId;
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

