// Notifications Data Store
// This will be replaced with a database in production

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
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Get unread notification count for a user
export const getUnreadNotificationCount = (userId) => {
  // Reload from storage to ensure we have the latest data
  if (typeof window !== 'undefined') {
    inAppNotifications = loadNotificationsFromStorage();
  }
  return inAppNotifications.filter(n => n.userId === userId && !n.isRead).length;
};

// Create a new in-app notification
export const createInAppNotification = (userId, message, linkURL = null) => {
  const notification = {
    inAppNotificationId: inAppNotifications.length > 0 
      ? Math.max(...inAppNotifications.map(n => n.inAppNotificationId)) + 1 
      : 1,
    userId: userId,
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
  const notification = inAppNotifications.find(n => n.inAppNotificationId === notificationId);
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
  const updated = inAppNotifications
    .filter(n => n.userId === userId && !n.isRead)
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

export const notifySubmissionValidated = (submissionId, approverUserId, unitName) => {
  const message = `Submission for ${unitName} has been validated by the Central Committee.`;
  const linkURL = `/approval/validated-submissions`;
  createInAppNotification(approverUserId, message, linkURL);
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

// Initialize real notifications based on existing submissions
export const initializeRealNotifications = () => {
  if (typeof window === 'undefined') return;
  
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
      if (user.role === 'Regional Approver' || user.role === 'Federal Approver' || user.role === 'Initial Approver') {
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

