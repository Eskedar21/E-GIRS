// Per–assessment-year contributor picks by scoped admin (localStorage; prototype)

const STORAGE_KEY = 'egirs_framework_contributor_assignments';

const loadRows = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('frameworkContributorAssignments load', e);
  }
  return [];
};

const normYearId = (assessmentYearId) => {
  const n = Number(assessmentYearId);
  return Number.isNaN(n) ? null : n;
};

const normAdminId = (adminUserId) => {
  const n = Number(adminUserId);
  return Number.isNaN(n) ? null : n;
};

const saveRows = (rows) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {
    console.error('frameworkContributorAssignments save', e);
  }
};

/** @returns {number[]} contributor user IDs assigned by this admin for this year */
export const getContributorAssignmentsForYear = (assessmentYearId, adminUserId) => {
  const yid = normYearId(assessmentYearId);
  const aid = normAdminId(adminUserId);
  if (yid == null || aid == null) return [];
  const rows = loadRows();
  const row = rows.find(
    (r) => normYearId(r.assessmentYearId) === yid && normAdminId(r.adminUserId) === aid
  );
  if (!row || !Array.isArray(row.contributorUserIds)) return [];
  return [...row.contributorUserIds];
};

/** Union of contributor IDs assigned to this assessment year by any scoped admin (localStorage). */
export const getAllContributorUserIdsAssignedForAssessmentYear = (assessmentYearId) => {
  const yid = normYearId(assessmentYearId);
  if (yid == null) return [];
  const rows = loadRows();
  const set = new Set();
  rows.forEach((r) => {
    if (normYearId(r.assessmentYearId) !== yid || !Array.isArray(r.contributorUserIds)) return;
    r.contributorUserIds.forEach((id) => {
      const n = Number(id);
      if (!Number.isNaN(n)) set.add(n);
    });
  });
  return [...set];
};

/** @param {number[]} contributorUserIds */
export const setContributorAssignmentsForYear = (assessmentYearId, adminUserId, contributorUserIds) => {
  const yid = normYearId(assessmentYearId);
  const aid = normAdminId(adminUserId);
  if (yid == null || aid == null) return null;
  const rows = loadRows().filter(
    (r) => !(normYearId(r.assessmentYearId) === yid && normAdminId(r.adminUserId) === aid)
  );
  const unique = [...new Set((contributorUserIds || []).map(Number).filter((n) => !Number.isNaN(n)))];
  rows.push({
    assessmentYearId: yid,
    adminUserId: aid,
    contributorUserIds: unique,
    updatedAt: new Date().toISOString()
  });
  saveRows(rows);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('frameworkContributorAssignmentsUpdated'));
  }
  return unique;
};
