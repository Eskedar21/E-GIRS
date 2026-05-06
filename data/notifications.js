// Notifications Data Store
// This will be replaced with a database in production

import { getUsersByRole, getUserById } from './users';
import { ASSESSMENT_FRAMEWORK_SCOPE } from './assessmentFramework';
import { getAllContributorUserIdsAssignedForAssessmentYear } from './frameworkContributorAssignments';

// Load notifications from localStorage or initialize empty array
const loadNotificationsFromStorage = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('egirs_notifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading notifications from storage:', e);
        return [];
      }
    }
  }
  return [];
};

// Save notifications to localStorage
const saveNotificationsToStorage = (notifications) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('egirs_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error('Error saving notifications to storage:', e);
    }
  }
};

// Initialize notifications - load from storage if available
// Also add some sample notifications for testing if storage is empty
let inAppNotifications = [];
if (typeof window !== 'undefined') {
  inAppNotifications = loadNotificationsFromStorage();
  
  // If no notifications exist, create sample notifications for testing
  // This helps demonstrate the notification system
  if (inAppNotifications.length === 0) {
    // Sample notifications for different users (these will be created on first load)
    // User ID 3 is approver1 (Regional Approver for Addis Ababa)
    // User ID 2 is contributor1 (Data Contributor)
    // User ID 4 is committee1 (Central Committee Member)
    
    // Note: We'll create these dynamically when needed, not on module load
    // to avoid issues with SSR
  }
} else {
  inAppNotifications = [];
}

let emailNotificationLogs = [
  // Example email logs
];

// Get all in-app notifications for a user
export const getNotificationsByUser = (userId) => {
  // Reload from storage to ensure we have the latest data
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  return inAppNotifications
    .filter(n => Number(n.userId) === Number(userId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Get unread notification count for a user
export const getUnreadNotificationCount = (userId) => {
  // Reload from storage to ensure we have the latest data
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  return inAppNotifications.filter(n => Number(n.userId) === Number(userId) && !n.isRead).length;
};

// Create a new in-app notification
export const createInAppNotification = (userId, message, linkURL = null) => {
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  const uid = Number(userId);
  if (Number.isNaN(uid)) return null;
  const existing = inAppNotifications.find(n =>
    Number(n.userId) === uid &&
    n.message === message &&
    (n.linkURL || null) === (linkURL || null)
  );
  if (existing) return existing;
  const notification = {
    inAppNotificationId: inAppNotifications.length > 0 
      ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
      : 1,
    userId: uid,
    message: message,
    linkURL: linkURL,
    isRead: false,
    timestamp: new Date().toISOString()
  };
  inAppNotifications.push(notification);
  saveNotificationsToStorage(inAppNotifications);
  
  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('notificationCreated', {
      detail: { notification }
    }));
  }
  
  return notification;
};

// Mark notification as read
export const markNotificationAsRead = (notificationId) => {
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  const notification = inAppNotifications.find(n => Number(n.inAppNotificationId) === Number(notificationId));
  if (notification) {
    notification.isRead = true;
    notification.updatedAt = new Date().toISOString();
    saveNotificationsToStorage(inAppNotifications);
    
    // Dispatch event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationUpdated', {
        detail: { notification }
      }));
    }
    
    return notification;
  }
  return null;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = (userId) => {
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  const updated = inAppNotifications
    .filter(n => Number(n.userId) === Number(userId) && !n.isRead)
    .map(n => {
      n.isRead = true;
      n.updatedAt = new Date().toISOString();
      return n;
    });
  
  if (updated.length > 0) {
    saveNotificationsToStorage(inAppNotifications);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notificationsUpdated', {
        detail: { userId }
      }));
    }
  }
  
  return updated;
};

// Log email notification (for auditing)
export const logEmailNotification = (recipientEmail, subject, status = 'Sent') => {
  const log = {
    notificationLogId: emailNotificationLogs.length > 0 
      ? Math.max(...emailNotificationLogs.map(l => l.notificationLogId)) + 1 
      : 1,
    recipientEmail: recipientEmail,
    subject: subject,
    timestamp: new Date().toISOString(),
    status: status
  };
  emailNotificationLogs.push(log);
  return log;
};

// Send email notification (placeholder - requires external email server)
export const sendEmailNotification = async (recipientEmail, subject, message, linkURL = null) => {
  // In production, this would integrate with an external email server
  // For now, we'll just log the notification
  
  const emailBody = linkURL 
    ? `${message}\n\nView submission: ${linkURL}`
    : message;
  
  // Log the email notification
  logEmailNotification(recipientEmail, subject, 'Sent');
  
  // In a real implementation, you would call an email API here
  // Example: await emailService.send({ to: recipientEmail, subject, body: emailBody });
  
  console.log(`[Email Notification] To: ${recipientEmail}, Subject: ${subject}`);
  
  return { success: true };
};

/**
 * Notify contributors for the activated framework scope only (regional vs federal institute).
 * If frameworkScope is omitted, both contributor types are notified (legacy behaviour).
 * When assessmentYearId is set and at least one contributor is saved on Active Frameworks for that year,
 * only those assigned contributors are notified (plus role filter); otherwise all users in scope roles are notified.
 */
export const notifyDataContributorsAssessmentActivated = (
  yearName,
  endDateIso,
  frameworkScope = null,
  assessmentYearId = null
) => {
  const endDateStr = endDateIso ? new Date(endDateIso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'TBD';
  const message = `Assessment "${yearName}" is now active. Please complete your submission before the deadline: ${endDateStr}.`;
  const linkURL = '/data/submission';
  let roles;
  if (frameworkScope === ASSESSMENT_FRAMEWORK_SCOPE.FEDERAL_INSTITUTE) {
    roles = ['Institute Data Contributor'];
  } else if (frameworkScope === ASSESSMENT_FRAMEWORK_SCOPE.REGIONAL) {
    roles = ['Data Contributor'];
  } else {
    roles = ['Data Contributor', 'Institute Data Contributor'];
  }
  const roleSet = new Set(roles);
  const assignedIds =
    assessmentYearId != null
      ? getAllContributorUserIdsAssignedForAssessmentYear(assessmentYearId)
      : [];
  let recipients = [];
  if (assignedIds.length > 0) {
    recipients = assignedIds
      .map((id) => getUserById(Number(id)))
      .filter((u) => u && u.userId && roleSet.has(u.role));
  }
  if (recipients.length === 0) {
    recipients = roles.flatMap((r) => getUsersByRole(r) || []);
  }
  const seen = new Set();
  recipients.forEach((u) => {
    const uid = u.userId != null ? Number(u.userId) : NaN;
    if (!Number.isNaN(uid) && !seen.has(uid)) {
      seen.add(uid);
      createInAppNotification(uid, message, linkURL);
    }
  });
};

/** Notify Regional Admins or Federal/Institutional Admins that an active framework applies to their scope. */
export const notifyScopedAdminsAssessmentActivated = (yearName, endDateIso, frameworkScope) => {
  const endDateStr = endDateIso ? new Date(endDateIso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'TBD';
  const linkURL = '/admin/active-frameworks';
  const scopeLabel = frameworkScope === ASSESSMENT_FRAMEWORK_SCOPE.FEDERAL_INSTITUTE ? 'Federal Institute' : 'Regional';
  const message = `Active assessment "${yearName}" (${scopeLabel} scope). Review the framework, assign Data Contributors under your units, or send feedback to MInT if you disagree. Deadline: ${endDateStr}.`;
  let admins = [];
  if (frameworkScope === ASSESSMENT_FRAMEWORK_SCOPE.REGIONAL) {
    admins = getUsersByRole('Regional Admin') || [];
  } else if (frameworkScope === ASSESSMENT_FRAMEWORK_SCOPE.FEDERAL_INSTITUTE) {
    admins = [...(getUsersByRole('Federal Admin') || []), ...(getUsersByRole('Institutional Admin') || [])];
  }
  const seen = new Set();
  admins.forEach((u) => {
    if (u.userId && !seen.has(u.userId)) {
      seen.add(u.userId);
      createInAppNotification(u.userId, message, linkURL);
    }
  });
};

/** When an admin assigns/creates a Data or Institute Data Contributor account linked to a unit. */
export const notifyContributorUserAssignedToUnit = (contributorUserId, unitName) => {
  const uid = contributorUserId != null ? Number(contributorUserId) : NaN;
  if (Number.isNaN(uid)) return;
  const name = unitName && String(unitName).trim() ? String(unitName).trim() : 'your assigned unit';
  const message = `You have been assigned to submit assessment data for "${name}". After you sign in (and complete email verification if required), open Data Submission to start.`;
  createInAppNotification(uid, message, '/data/submission');
};

/** When a scoped admin ties a contributor to an active assessment year (Active Frameworks → Assign contributors). */
export const notifyContributorTiedToAssessmentYear = (contributorUserId, yearName, unitName) => {
  const uid = contributorUserId != null ? Number(contributorUserId) : NaN;
  if (Number.isNaN(uid)) return;
  const y = yearName && String(yearName).trim() ? String(yearName).trim() : 'the active assessment';
  const u = unitName && String(unitName).trim() ? String(unitName).trim() : 'your unit';
  const message = `Your administrator has assigned you to "${y}" for ${u}. Start your submission when ready.`;
  createInAppNotification(uid, message, '/data/submission');
};

// Notification helper functions for workflow events
export const notifySubmissionReceived = (submissionId, approverUserId, unitName) => {
  const message = `New submission received for ${unitName}. Please review and approve.`;
  const linkURL = `/approval/evaluate/${submissionId}`;
  createInAppNotification(approverUserId, message, linkURL);
  
  // Email notification would be sent here
  // const approver = getUserById(approverUserId);
  // if (approver && approver.email) {
  //   sendEmailNotification(
  //     approver.email,
  //     `New Submission Received: ${unitName}`,
  //     message,
  //     `${process.env.NEXT_PUBLIC_APP_URL}${linkURL}`
  //   );
  // }
};

export const notifySubmissionRejectedByApprover = (submissionId, contributorUserId, unitName, rejectionReason) => {
  const message = `Your submission for ${unitName} has been rejected. Reason: ${rejectionReason.substring(0, 100)}${rejectionReason.length > 100 ? '...' : ''}`;
  const linkURL = `/data/submission`;
  createInAppNotification(contributorUserId, message, linkURL);
  
  // Email notification would be sent here
  // const contributor = getUserById(contributorUserId);
  // if (contributor && contributor.email) {
  //   sendEmailNotification(
  //     contributor.email,
  //     `Submission Rejected: ${unitName}`,
  //     message,
  //     `${process.env.NEXT_PUBLIC_APP_URL}${linkURL}`
  //   );
  // }
};

export const notifySubmissionRejectedByCentralCommittee = (submissionId, approverUserId, unitName, rejectionReason) => {
  const message = `Submission for ${unitName} has been rejected by Central Committee. Reason: ${rejectionReason.substring(0, 100)}${rejectionReason.length > 100 ? '...' : ''}`;
  const linkURL = `/approval/rejected-submissions`;
  createInAppNotification(approverUserId, message, linkURL);
  
  // Email notification would be sent here
  // const approver = getUserById(approverUserId);
  // if (approver && approver.email) {
  //   sendEmailNotification(
  //     approver.email,
  //     `Submission Rejected by Central Committee: ${unitName}`,
  //     message,
  //     `${process.env.NEXT_PUBLIC_APP_URL}${linkURL}`
  //   );
  // }
};

export const notifySubmissionApproved = (submissionId, contributorUserId, unitName, approverName) => {
  const message = `Your submission for ${unitName} has been approved by ${approverName}.`;
  const linkURL = `/data/submission`;
  createInAppNotification(contributorUserId, message, linkURL);
};

/** Notify Central Committee that a submission is ready for per-question validation. */
export const notifySubmissionPendingCentralValidation = (submissionId, unitName) => {
  const name = unitName && String(unitName).trim() ? String(unitName).trim() : 'a unit';
  const linkURL = `/validation/evaluate/${submissionId}`;
  const message = `Submission for ${name} is pending Central Committee validation.`;
  const recipients = [
    ...(getUsersByRole('Central Committee Member') || []),
    ...(getUsersByRole('Chairman (CC)') || []),
    ...(getUsersByRole('Secretary (CC)') || [])
  ];
  const seen = new Set();
  recipients.forEach((u) => {
    const uid = u?.userId != null ? Number(u.userId) : NaN;
    if (!Number.isNaN(uid) && !seen.has(uid)) {
      seen.add(uid);
      createInAppNotification(uid, message, linkURL);
    }
  });
};

export const notifySubmissionValidated = (submissionId, approverUserId, unitName) => {
  const message = `Submission for ${unitName} has been validated by the Central Committee.`;
  const linkURL = `/approval/validated-submissions`;
  createInAppNotification(approverUserId, message, linkURL);
};

/** Notify committee scorers that validated text-explanation answers need subjective scoring. */
export const notifySubjectiveScoringAvailable = (submissionId, unitName, subjectiveCount = null) => {
  const name = unitName && String(unitName).trim() ? String(unitName).trim() : 'a unit';
  const countText = subjectiveCount != null && Number(subjectiveCount) > 0
    ? ` (${Number(subjectiveCount)} answer${Number(subjectiveCount) === 1 ? '' : 's'})`
    : '';
  const message = `Subjective scoring is waiting for ${name}${countText}.`;
  const linkURL = `/scoring/evaluate/${submissionId}`;
  const recipients = [
    ...(getUsersByRole('Central Committee Member') || []),
    ...(getUsersByRole('Secretary (CC)') || [])
  ];
  const seen = new Set();
  recipients.forEach((u) => {
    const uid = u?.userId != null ? Number(u.userId) : NaN;
    if (!Number.isNaN(uid) && !seen.has(uid)) {
      seen.add(uid);
      createInAppNotification(uid, message, linkURL);
    }
  });
};

export const notifyNewSubmissionsInQueue = (approverUserId, count) => {
  const message = `You have ${count} new submission${count > 1 ? 's' : ''} in your approval queue.`;
  const linkURL = `/approval/queue`;
  createInAppNotification(approverUserId, message, linkURL);
};

// Get all email notification logs (for admin)
export const getAllEmailNotificationLogs = () => {
  return [...emailNotificationLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const syncCurrentWorkflowNotifications = () => {
  if (typeof window === 'undefined') return;
  try {
    const { getAllSubmissions, SUBMISSION_STATUS, getSubjectiveResponsesForSubmission } = require('./submissions');
    const { getUnitById } = require('./administrativeUnits');
    const submissions = getAllSubmissions();

    submissions
      .filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION)
      .forEach((submission) => {
        const unit = getUnitById(submission.unitId);
        notifySubmissionPendingCentralValidation(
          submission.submissionId,
          unit?.officialUnitName || 'Unknown Unit'
        );
      });

    submissions
      .filter(s => s.submissionStatus === SUBMISSION_STATUS.VALIDATED)
      .forEach((submission) => {
        const subjective = getSubjectiveResponsesForSubmission(submission.submissionId);
        if (subjective.length === 0) return;
        const unit = getUnitById(submission.unitId);
        notifySubjectiveScoringAvailable(
          submission.submissionId,
          unit?.officialUnitName || 'Unknown Unit',
          subjective.length
        );
      });
  } catch (error) {
    console.error('Error syncing workflow notifications:', error);
  }
};

// Initialize real notifications based on existing submissions
export const initializeRealNotifications = () => {
  if (typeof window === 'undefined') return;
  syncCurrentWorkflowNotifications();
  
  // Check if notifications have already been initialized
  const initialized = localStorage.getItem('egirs_notifications_initialized');
  if (initialized === 'true') {
    return; // Already initialized
  }
  
  try {
    // Dynamically import to avoid circular dependencies
    const { getAllSubmissions, SUBMISSION_STATUS } = require('./submissions');
    const { getUnitById } = require('./administrativeUnits');
    const { getAllUsers } = require('./users');
    
    const allSubmissions = getAllSubmissions();
    const allUsers = getAllUsers();
    const allUnits = require('./administrativeUnits').getAllUnits();
    
    // Create notifications for each user based on their role and submissions
    allUsers.forEach(user => {
      if (user.role === 'Regional Approver' || user.role === 'Federal Approver') {
        // Notifications for pending submissions in their queue
        const pendingSubmissions = allSubmissions.filter(s => 
          s.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL
        );
        
        pendingSubmissions.forEach((submission, index) => {
          const unit = getUnitById(submission.unitId);
          const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
          const timestamp = new Date(Date.now() - (index + 1) * 3600000).toISOString(); // Staggered times
          
          const notification = {
            inAppNotificationId: inAppNotifications.length > 0 
              ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
              : 1,
            userId: user.userId,
            message: `New submission received for ${unitName}. Please review and approve.`,
            linkURL: `/approval/evaluate/${submission.submissionId}`,
            isRead: false,
            timestamp: timestamp
          };
          inAppNotifications.push(notification);
        });
        
        // Notification about queue count
        if (pendingSubmissions.length > 0) {
          const notification = {
            inAppNotificationId: inAppNotifications.length > 0 
              ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
              : 1,
            userId: user.userId,
            message: `You have ${pendingSubmissions.length} new submission${pendingSubmissions.length > 1 ? 's' : ''} in your approval queue.`,
            linkURL: '/approval/queue',
            isRead: false,
            timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          };
          inAppNotifications.push(notification);
        }
      } else if (user.role === 'Central Committee Member' || user.role === 'Chairman (CC)' || user.role === 'Secretary (CC)') {
        // Notifications for pending central validation
        const pendingValidations = allSubmissions.filter(s => 
          s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
        );
        
        pendingValidations.forEach((submission, index) => {
          const unit = getUnitById(submission.unitId);
          const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
          const timestamp = new Date(Date.now() - (index + 1) * 1800000).toISOString(); // Staggered times
          
          const notification = {
            inAppNotificationId: inAppNotifications.length > 0 
              ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
              : 1,
            userId: user.userId,
            message: `Submission for ${unitName} is pending final validation.`,
            linkURL: `/validation/evaluate/${submission.submissionId}`,
            isRead: false,
            timestamp: timestamp
          };
          inAppNotifications.push(notification);
        });
        if (user.role === 'Central Committee Member' || user.role === 'Secretary (CC)') {
          const subjectiveReady = allSubmissions.filter(s => {
            if (s.submissionStatus !== SUBMISSION_STATUS.VALIDATED) return false;
            try {
              const { getSubjectiveResponsesForSubmission } = require('./submissions');
              return getSubjectiveResponsesForSubmission(s.submissionId).length > 0;
            } catch {
              return false;
            }
          });

          subjectiveReady.forEach((submission, index) => {
            const unit = getUnitById(submission.unitId);
            const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
            const count = (() => {
              try {
                const { getSubjectiveResponsesForSubmission } = require('./submissions');
                return getSubjectiveResponsesForSubmission(submission.submissionId).length;
              } catch {
                return null;
              }
            })();
            const notification = {
              inAppNotificationId: inAppNotifications.length > 0
                ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1
                : 1,
              userId: user.userId,
              message: `Subjective scoring is waiting for ${unitName}${count ? ` (${count} answer${count === 1 ? '' : 's'})` : ''}.`,
              linkURL: `/scoring/evaluate/${submission.submissionId}`,
              isRead: false,
              timestamp: new Date(Date.now() - (index + 1) * 1200000).toISOString()
            };
            inAppNotifications.push(notification);
          });
        }
      } else if (user.role === 'Data Contributor' || user.role === 'Institute Data Contributor') {
        // Notifications for approved submissions
        const approvedSubmissions = allSubmissions.filter(s => 
          s.contributorUserId === user.userId && 
          s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
        );
        
        approvedSubmissions.forEach((submission, index) => {
          const unit = getUnitById(submission.unitId);
          const unitName = unit ? unit.officialUnitName : 'Unknown Unit';
          const timestamp = new Date(Date.now() - (index + 1) * 2400000).toISOString(); // Staggered times
          
          const notification = {
            inAppNotificationId: inAppNotifications.length > 0 
              ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
              : 1,
            userId: user.userId,
            message: `Your submission for ${unitName} has been approved and sent to Central Committee.`,
            linkURL: '/data/submission',
            isRead: false,
            timestamp: timestamp
          };
          inAppNotifications.push(notification);
        });
      }
    });
    
    // Save all notifications
    saveNotificationsToStorage(inAppNotifications);
    localStorage.setItem('egirs_notifications_initialized', 'true');
  } catch (error) {
    console.error('Error initializing real notifications:', error);
  }
};
