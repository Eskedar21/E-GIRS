// Feedback from Regional / Federal / Institutional admins to MInT about an active framework (localStorage)

import { createInAppNotification } from './notifications';
import { getUsersByRole } from './users';

const STORAGE_KEY = 'egirs_framework_admin_feedback';

const loadAll = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('frameworkAdminFeedback load', e);
  }
  return [];
};

const saveAll = (rows) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {
    console.error('frameworkAdminFeedback save', e);
  }
};

/**
 * @param {{ assessmentYearId: number, yearName: string, fromUserId: number, fromUsername: string, fromRole: string, comment: string }} payload
 */
export const addFrameworkAdminFeedback = (payload) => {
  const list = loadAll();
  const row = {
    frameworkFeedbackId: list.length ? Math.max(...list.map((r) => r.frameworkFeedbackId)) + 1 : 1,
    assessmentYearId: payload.assessmentYearId,
    yearName: payload.yearName,
    fromUserId: payload.fromUserId,
    fromUsername: payload.fromUsername || '',
    fromRole: payload.fromRole || '',
    comment: (payload.comment || '').trim(),
    status: 'open',
    createdAt: new Date().toISOString()
  };
  if (!row.comment) return null;
  list.push(row);
  saveAll(list);

  const preview = row.comment.length > 100 ? `${row.comment.slice(0, 100)}…` : row.comment;
  const message = `Framework feedback: "${row.yearName}" — ${row.fromUsername} (${row.fromRole}): ${preview}`;
  const linkURL = '/admin/assessment-framework';
  const mint = [...(getUsersByRole('MInT Admin') || []), ...(getUsersByRole('Super Admin') || [])];
  const seen = new Set();
  mint.forEach((u) => {
    if (u.userId && !seen.has(u.userId)) {
      seen.add(u.userId);
      createInAppNotification(u.userId, message, linkURL);
    }
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('frameworkAdminFeedbackUpdated'));
  }
  return row;
};

export const getOpenFrameworkFeedback = () =>
  loadAll()
    .filter((r) => r.status === 'open')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const getAllFrameworkFeedback = () =>
  loadAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const acknowledgeFrameworkFeedback = (frameworkFeedbackId) => {
  const list = loadAll();
  const i = list.findIndex((r) => r.frameworkFeedbackId === frameworkFeedbackId);
  if (i === -1) return null;
  const row = list[i];
  list[i] = {
    ...list[i],
    status: 'acknowledged',
    acknowledgedAt: new Date().toISOString()
  };
  saveAll(list);
  if (row.fromUserId) {
    createInAppNotification(
      row.fromUserId,
      `MInT acknowledged your feedback on "${row.yearName}".`,
      '/admin/active-frameworks'
    );
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('frameworkAdminFeedbackUpdated'));
  }
  return list[i];
};

/** Notify admins who still have open feedback on this year that MInT moved it back to Draft for edits. */
export const notifyOpenFeedbackAuthorsYearRevertedToDraft = (assessmentYearId, yearName) => {
  const open = loadAll().filter(
    (r) => r.status === 'open' && Number(r.assessmentYearId) === Number(assessmentYearId)
  );
  const seen = new Set();
  open.forEach((r) => {
    if (r.fromUserId != null && !seen.has(r.fromUserId)) {
      seen.add(r.fromUserId);
      createInAppNotification(
        r.fromUserId,
        `MInT moved "${yearName}" back to Draft so the framework can be edited in response to feedback.`,
        '/admin/active-frameworks'
      );
    }
  });
};
