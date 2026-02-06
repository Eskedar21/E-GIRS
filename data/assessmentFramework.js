// Assessment Framework Data Store with localStorage persistence
// This will be replaced with a database in production

const STORAGE_KEYS = {
  ASSESSMENT_YEARS: 'egirs_assessment_years',
  DIMENSIONS: 'egirs_dimensions',
  INDICATORS: 'egirs_indicators',
  SUB_QUESTIONS: 'egirs_sub_questions'
};

// No default data: frameworks are created by admin and flow to contributors in real time
const defaultAssessmentYears = [];
const defaultDimensions = [];
const defaultIndicators = [];
const defaultSubQuestions = [];

// Load functions for localStorage
const loadAssessmentYears = () => {
  if (typeof window === 'undefined') return [...defaultAssessmentYears];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_YEARS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading assessment years from localStorage:', error);
  }
  saveAssessmentYears(defaultAssessmentYears);
  return [...defaultAssessmentYears];
};

const loadDimensions = () => {
  if (typeof window === 'undefined') return [...defaultDimensions];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIMENSIONS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading dimensions from localStorage:', error);
  }
  saveDimensions(defaultDimensions);
  return [...defaultDimensions];
};

const loadIndicators = () => {
  if (typeof window === 'undefined') return [...defaultIndicators];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INDICATORS);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading indicators from localStorage:', error);
  }
  saveIndicators(defaultIndicators);
  return [...defaultIndicators];
};

const loadSubQuestions = () => {
  if (typeof window === 'undefined') return [...defaultSubQuestions];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUB_QUESTIONS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Normalize: ensure parentSubQuestionId exists (backward compatibility)
      return parsed.map(sq => ({ ...sq, parentSubQuestionId: sq.parentSubQuestionId ?? null }));
    }
  } catch (error) {
    console.error('Error loading sub questions from localStorage:', error);
  }
  saveSubQuestions(defaultSubQuestions);
  return [...defaultSubQuestions];
};

// Save functions for localStorage
const saveAssessmentYears = (yearsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_YEARS, JSON.stringify(yearsToSave));
  } catch (error) {
    console.error('Error saving assessment years to localStorage:', error);
  }
};

const saveDimensions = (dimensionsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DIMENSIONS, JSON.stringify(dimensionsToSave));
  } catch (error) {
    console.error('Error saving dimensions to localStorage:', error);
  }
};

const saveIndicators = (indicatorsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicatorsToSave));
  } catch (error) {
    console.error('Error saving indicators to localStorage:', error);
  }
};

const saveSubQuestions = (subQuestionsToSave) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUB_QUESTIONS, JSON.stringify(subQuestionsToSave));
  } catch (error) {
    console.error('Error saving sub questions to localStorage:', error);
  }
};

// Initialize arrays from localStorage
let assessmentYears = loadAssessmentYears();
let dimensions = loadDimensions();
let indicators = loadIndicators();
let subQuestions = loadSubQuestions();

// Assessment Year Status
export const ASSESSMENT_STATUS = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
};

// Response Types
export const RESPONSE_TYPES = {
  YES_NO: 'Yes/No',
  MULTIPLE_SELECT_CHECKBOX: 'MultipleSelectCheckbox',
  TEXT_EXPLANATION: 'TextExplanation'
};

// Unit Types for ApplicableUnitType
export const APPLICABLE_UNIT_TYPES = [
  'Federal Institute',
  'Region',
  'City Administration',
  'Zone',
  'Sub-city',
  'Woreda'
];

// Assessment Years
export const getAllAssessmentYears = () => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  return [...assessmentYears];
};
/** Returns only assessment years with status Active (for data contributor selection, surveys, etc.). */
export const getActiveAssessmentYears = () => {
  assessmentYears = loadAssessmentYears();
  return assessmentYears.filter(y => y.status === ASSESSMENT_STATUS.ACTIVE);
};
export const getAssessmentYearById = (id) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  return assessmentYears.find(y => y.assessmentYearId === id);
};
export const createAssessmentYear = (yearData) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  const newYear = {
    assessmentYearId: assessmentYears.length > 0 
      ? Math.max(...assessmentYears.map(y => y.assessmentYearId)) + 1 
      : 1,
    yearName: yearData.yearName,
    status: yearData.status || ASSESSMENT_STATUS.DRAFT,
    startDate: yearData.startDate || null,
    endDate: yearData.endDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  assessmentYears.push(newYear);
  saveAssessmentYears(assessmentYears);
  return newYear;
};
export const updateAssessmentYear = (id, yearData) => {
  assessmentYears = loadAssessmentYears(); // Reload to ensure latest data
  const index = assessmentYears.findIndex(y => y.assessmentYearId === id);
  if (index !== -1) {
    assessmentYears[index] = {
      ...assessmentYears[index],
      ...yearData,
      updatedAt: new Date().toISOString()
    };
    saveAssessmentYears(assessmentYears);
    return assessmentYears[index];
  }
  return null;
};

/**
 * Closes (sets to Archived) any Active assessment years whose endDate has passed.
 * Call on app load or periodically so deadlines auto-close.
 * @returns {number[]} IDs of years that were closed
 */
export const closeAssessmentYearsPastDeadline = () => {
  assessmentYears = loadAssessmentYears();
  const now = new Date().toISOString();
  const toClose = assessmentYears.filter(
    y => y.status === ASSESSMENT_STATUS.ACTIVE && y.endDate && y.endDate < now
  );
  toClose.forEach(y => {
    y.status = ASSESSMENT_STATUS.ARCHIVED;
    y.updatedAt = new Date().toISOString();
  });
  if (toClose.length > 0) {
    saveAssessmentYears(assessmentYears);
  }
  return toClose.map(y => y.assessmentYearId);
};

/**
 * Get time remaining until assessment end date (for countdown display).
 * @param {{ endDate?: string | null }} year - Assessment year with optional endDate (ISO string)
 * @returns {{ days: number, hours: number, isOverdue: boolean } | null} null if no endDate
 */
export const getAssessmentYearTimeRemaining = (year) => {
  if (!year || !year.endDate) return null;
  const end = new Date(year.endDate);
  const now = new Date();
  const ms = end.getTime() - now.getTime();
  if (Number.isNaN(ms)) return null;
  const isOverdue = ms <= 0;
  const absMs = Math.abs(ms);
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((absMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return { days, hours, isOverdue };
};

// Dimensions
export const getDimensionsByYear = (yearId) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions.filter(d => d.assessmentYearId === yearId);
};
export const getDimensionById = (id) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions.find(d => d.dimensionId === id);
};
export const getTotalDimensionWeight = (yearId) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  return dimensions
    .filter(d => d.assessmentYearId === yearId)
    .reduce((sum, d) => sum + d.dimensionWeight, 0);
};
export const createDimension = (dimensionData) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const newDimension = {
    dimensionId: dimensions.length > 0 
      ? Math.max(...dimensions.map(d => d.dimensionId)) + 1 
      : 1,
    assessmentYearId: dimensionData.assessmentYearId,
    dimensionName: dimensionData.dimensionName,
    dimensionWeight: parseFloat(dimensionData.dimensionWeight),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  dimensions.push(newDimension);
  saveDimensions(dimensions);
  return newDimension;
};
export const updateDimension = (id, dimensionData) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const index = dimensions.findIndex(d => d.dimensionId === id);
  if (index !== -1) {
    dimensions[index] = {
      ...dimensions[index],
      ...dimensionData,
      dimensionWeight: parseFloat(dimensionData.dimensionWeight || dimensions[index].dimensionWeight),
      updatedAt: new Date().toISOString()
    };
    saveDimensions(dimensions);
    return dimensions[index];
  }
  return null;
};
export const deleteDimension = (id) => {
  dimensions = loadDimensions(); // Reload to ensure latest data
  const index = dimensions.findIndex(d => d.dimensionId === id);
  if (index !== -1) {
    const deleted = dimensions.splice(index, 1)[0];
    saveDimensions(dimensions);
    return deleted;
  }
  return null;
};

// Indicators
export const getIndicatorsByDimension = (dimensionId) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators.filter(i => i.dimensionId === dimensionId);
};
export const getIndicatorById = (id) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators.find(i => i.indicatorId === id);
};
export const getTotalIndicatorWeight = (dimensionId) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  return indicators
    .filter(i => i.dimensionId === dimensionId)
    .reduce((sum, i) => sum + i.indicatorWeight, 0);
};
export const createIndicator = (indicatorData) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const newIndicator = {
    indicatorId: indicators.length > 0 
      ? Math.max(...indicators.map(i => i.indicatorId)) + 1 
      : 1,
    dimensionId: indicatorData.dimensionId,
    indicatorName: indicatorData.indicatorName,
    indicatorWeight: parseFloat(indicatorData.indicatorWeight),
    applicableUnitType: indicatorData.applicableUnitType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  indicators.push(newIndicator);
  saveIndicators(indicators);
  return newIndicator;
};
export const updateIndicator = (id, indicatorData) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const index = indicators.findIndex(i => i.indicatorId === id);
  if (index !== -1) {
    indicators[index] = {
      ...indicators[index],
      ...indicatorData,
      indicatorWeight: parseFloat(indicatorData.indicatorWeight || indicators[index].indicatorWeight),
      updatedAt: new Date().toISOString()
    };
    saveIndicators(indicators);
    return indicators[index];
  }
  return null;
};
export const deleteIndicator = (id) => {
  indicators = loadIndicators(); // Reload to ensure latest data
  const index = indicators.findIndex(i => i.indicatorId === id);
  if (index !== -1) {
    const deleted = indicators.splice(index, 1)[0];
    saveIndicators(indicators);
    return deleted;
  }
  return null;
};

// Sub-Questions (up to 3 levels: Level 1 under indicator, Level 2 under Level 1, Level 3 under Level 2)
export const MAX_SUB_QUESTION_DEPTH = 3;

export const getSubQuestionsByIndicator = (indicatorId) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  return subQuestions.filter(sq => sq.parentIndicatorId === indicatorId);
};
/** Returns direct children of a parent. parentSubQuestionId null = Level 1 under indicator. */
export const getSubQuestionsByParentSubQuestion = (parentSubQuestionId, indicatorId) => {
  subQuestions = loadSubQuestions();
  return subQuestions.filter(sq =>
    sq.parentIndicatorId === indicatorId && (sq.parentSubQuestionId ?? null) === parentSubQuestionId
  );
};

/** Total weight of direct children under a parent. Siblings at each level should sum to 100%. */
export const getTotalSubQuestionWeightUnderParent = (parentSubQuestionId, indicatorId) => {
  subQuestions = loadSubQuestions();
  const children = parentSubQuestionId == null
    ? subQuestions.filter(sq => sq.parentIndicatorId === indicatorId && (sq.parentSubQuestionId ?? null) === null)
    : subQuestions.filter(sq => sq.parentSubQuestionId === parentSubQuestionId);
  return children.reduce((sum, sq) => sum + sq.subWeightPercentage, 0);
};

/** Builds a tree with up to 3 levels; each node has { ...sq, depth, children }. */
function buildSubQuestionTreeRecursive(indicatorId, parentSubQuestionId, depth) {
  if (depth > MAX_SUB_QUESTION_DEPTH) return [];
  subQuestions = loadSubQuestions();
  const all = subQuestions.filter(sq => sq.parentIndicatorId === indicatorId);
  const direct = all.filter(sq => (sq.parentSubQuestionId ?? null) === parentSubQuestionId);
  return direct.map(sq => ({
    ...sq,
    depth,
    children: buildSubQuestionTreeRecursive(indicatorId, sq.subQuestionId, depth + 1)
  }));
}

export const buildSubQuestionTree = (indicatorId) => {
  return buildSubQuestionTreeRecursive(indicatorId, null, 1);
};

/** Flattens tree in display order (parent then its children, depth-first). */
function flattenTree(nodes) {
  const out = [];
  function walk(list) {
    if (!list || !list.length) return;
    list.forEach(node => {
      out.push(node);
      walk(node.children);
    });
  }
  walk(nodes);
  return out;
}

/** Returns all sub-questions for an indicator in tree order (Level 1, then each Level 2, then each Level 3). */
export const getSubQuestionsInTreeOrder = (indicatorId) => {
  return flattenTree(buildSubQuestionTree(indicatorId));
};
export const getSubQuestionById = (id) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  return subQuestions.find(sq => sq.subQuestionId === id);
};
/** Total weight of Level 1 sub-questions under indicator (should sum to 100%). */
export const getTotalSubQuestionWeight = (indicatorId) => {
  return getTotalSubQuestionWeightUnderParent(null, indicatorId);
};
export const createSubQuestion = (subQuestionData) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const parentSubQuestionId = subQuestionData.parentSubQuestionId ?? null;
  let parentIndicatorId = subQuestionData.parentIndicatorId;
  if (parentSubQuestionId != null) {
    const parent = subQuestions.find(sq => sq.subQuestionId === parentSubQuestionId);
    if (parent) parentIndicatorId = parent.parentIndicatorId;
  }
  const newSubQuestion = {
    subQuestionId: subQuestions.length > 0
      ? Math.max(...subQuestions.map(sq => sq.subQuestionId)) + 1
      : 1,
    parentIndicatorId,
    parentSubQuestionId,
    subQuestionText: subQuestionData.subQuestionText,
    subWeightPercentage: parseFloat(subQuestionData.subWeightPercentage),
    responseType: subQuestionData.responseType,
    checkboxOptions: subQuestionData.checkboxOptions || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  subQuestions.push(newSubQuestion);
  saveSubQuestions(subQuestions);
  return newSubQuestion;
};
export const updateSubQuestion = (id, subQuestionData) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const index = subQuestions.findIndex(sq => sq.subQuestionId === id);
  if (index !== -1) {
    const existing = subQuestions[index];
    const payload = { ...subQuestionData };
    if (payload.parentIndicatorId === undefined) payload.parentIndicatorId = existing.parentIndicatorId;
    if (payload.parentSubQuestionId === undefined) payload.parentSubQuestionId = existing.parentSubQuestionId ?? null;
    if (payload.checkboxOptions !== undefined && Array.isArray(payload.checkboxOptions)) {
      payload.checkboxOptions = payload.checkboxOptions.join(',');
    }
    subQuestions[index] = {
      ...existing,
      ...payload,
      subWeightPercentage: parseFloat(payload.subWeightPercentage ?? existing.subWeightPercentage),
      updatedAt: new Date().toISOString()
    };
    saveSubQuestions(subQuestions);
    return subQuestions[index];
  }
  return null;
};
/**
 * Validates that an assessment year is ready to be activated: dimensions, indicators,
 * and all levels of sub-questions must have weights summing to 100%.
 * @param {number} yearId - Assessment year ID
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateAssessmentYearForActivation = (yearId) => {
  const errors = [];
  dimensions = loadDimensions();
  indicators = loadIndicators();
  subQuestions = loadSubQuestions();

  const dims = dimensions.filter(d => d.assessmentYearId === yearId);
  if (dims.length === 0) {
    errors.push('Add at least one dimension. Dimension weights must total 100%.');
    return { valid: false, errors };
  }

  const dimTotal = dims.reduce((sum, d) => sum + d.dimensionWeight, 0);
  if (Math.abs(dimTotal - 100) > 0.01) {
    errors.push(`Dimension weights total ${dimTotal.toFixed(2)}%. They must total 100% for the assessment year to be active.`);
  }

  dims.forEach(dim => {
    const inds = indicators.filter(i => i.dimensionId === dim.dimensionId);
    if (inds.length === 0) {
      errors.push(`Dimension "${dim.dimensionName}" has no indicators. Add indicators and set their weights to total 100%.`);
    } else {
      const indTotal = inds.reduce((sum, i) => sum + i.indicatorWeight, 0);
      if (Math.abs(indTotal - 100) > 0.01) {
        errors.push(`Dimension "${dim.dimensionName}": indicator weights total ${indTotal.toFixed(2)}%. They must total 100%.`);
      }
    }

    inds.forEach(ind => {
      const tree = buildSubQuestionTreeRecursive(ind.indicatorId, null, 1);
      const level1Total = getTotalSubQuestionWeightUnderParent(null, ind.indicatorId);
      if (tree.length > 0 && Math.abs(level1Total - 100) > 0.01) {
        errors.push(`Indicator "${ind.indicatorName}": Level 1 question weights total ${level1Total.toFixed(2)}%. They must total 100%.`);
      }
      tree.forEach(l1 => {
        if (l1.children && l1.children.length > 0) {
          const level2Total = getTotalSubQuestionWeightUnderParent(l1.subQuestionId, ind.indicatorId);
          if (Math.abs(level2Total - 100) > 0.01) {
            const label = (l1.subQuestionText && l1.subQuestionText.length > 45) ? l1.subQuestionText.slice(0, 45) + '…' : (l1.subQuestionText || 'Level 1');
            errors.push(`Indicator "${ind.indicatorName}" (${label}): Level 2 weights total ${level2Total.toFixed(2)}%. They must total 100%.`);
          }
          l1.children.forEach(l2 => {
            if (l2.children && l2.children.length > 0) {
              const level3Total = getTotalSubQuestionWeightUnderParent(l2.subQuestionId, ind.indicatorId);
              if (Math.abs(level3Total - 100) > 0.01) {
                errors.push(`Indicator "${ind.indicatorName}": Level 3 question weights total ${level3Total.toFixed(2)}%. They must total 100%.`);
              }
            }
          });
        }
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/** Collect id and all descendant ids (recursive). */
function collectDescendantIds(subQuestionsList, parentId, outSet) {
  subQuestionsList.filter(sq => sq.parentSubQuestionId === parentId).forEach(sq => {
    outSet.add(sq.subQuestionId);
    collectDescendantIds(subQuestionsList, sq.subQuestionId, outSet);
  });
}

export const deleteSubQuestion = (id) => {
  subQuestions = loadSubQuestions(); // Reload to ensure latest data
  const idsToRemove = new Set([id]);
  collectDescendantIds(subQuestions, id, idsToRemove);
  const deleted = subQuestions.find(sq => sq.subQuestionId === id) || null;
  const remaining = subQuestions.filter(sq => !idsToRemove.has(sq.subQuestionId));
  saveSubQuestions(remaining);
  return deleted;
};

