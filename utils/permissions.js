// Permission and Access Control Utilities

/**
 * Check if a user can access a specific unit based on their role and assigned unit
 * @param {Object} user - Current user object
 * @param {number} targetUnitId - Unit ID to check access for
 * @param {Array} allUnits - All administrative units
 * @returns {boolean} - True if user can access the unit
 */
export const canAccessUnit = (user, targetUnitId, allUnits) => {
  if (!user || !targetUnitId) return false;

  // Super Admin and MInT Admin can access all units
  if (user.role === 'Super Admin' || user.role === 'MInT Admin') {
    return true;
  }

  // Central Committee roles can access all units
  if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(user.role)) {
    return true;
  }

  // If user has no unit assigned, they can't access any unit
  if (!user.officialUnitId) {
    return false;
  }

  // User can always access their own unit
  if (user.officialUnitId === targetUnitId) {
    return true;
  }

  // For approvers, check if target unit is within their hierarchy
  if (['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(user.role)) {
    return isUnitInHierarchy(user.officialUnitId, targetUnitId, allUnits);
  }

  // Data Contributors can only access their own unit
  if (['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(user.role)) {
    return user.officialUnitId === targetUnitId;
  }

  return false;
};

/**
 * Check if a target unit is within the hierarchy of a parent unit
 * @param {number} parentUnitId - Parent unit ID
 * @param {number} targetUnitId - Target unit ID to check
 * @param {Array} allUnits - All administrative units
 * @returns {boolean} - True if target is within parent's hierarchy
 */
export const isUnitInHierarchy = (parentUnitId, targetUnitId, allUnits) => {
  if (parentUnitId === targetUnitId) return true;

  const parentUnit = allUnits.find(u => u.unitId === parentUnitId);
  if (!parentUnit) return false;

  // Get all child units recursively
  const getChildUnits = (unitId) => {
    const directChildren = allUnits.filter(u => u.parentUnitId === unitId);
    const allChildren = [...directChildren];
    directChildren.forEach(child => {
      allChildren.push(...getChildUnits(child.unitId));
    });
    return allChildren;
  };

  const childUnits = getChildUnits(parentUnitId);
  return childUnits.some(u => u.unitId === targetUnitId);
};

/**
 * Filter submissions based on user's access scope
 * @param {Array} submissions - All submissions
 * @param {Object} user - Current user
 * @param {Array} allUnits - All administrative units
 * @returns {Array} - Filtered submissions user can access
 */
export const filterSubmissionsByAccess = (submissions, user, allUnits) => {
  if (!user || !submissions || submissions.length === 0) return [];

  // Super Admin and MInT Admin can see all
  if (user.role === 'Super Admin' || user.role === 'MInT Admin') {
    return submissions;
  }

  // Central Committee can see all
  if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(user.role)) {
    return submissions;
  }

  // Data Contributors can only see their own unit's submissions
  if (['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(user.role)) {
    return submissions.filter(s => s.unitId === user.officialUnitId);
  }

  // Approvers can see submissions from units in their hierarchy
  if (['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(user.role)) {
    if (!user.officialUnitId) return [];
    return submissions.filter(s => 
      canAccessUnit(user, s.unitId, allUnits)
    );
  }

  return [];
};

/**
 * Check if user can perform a specific action
 * @param {Object} user - Current user
 * @param {string} action - Action to check (e.g., 'create', 'edit', 'delete', 'approve', 'validate')
 * @param {Object} resource - Resource object (optional, for scoped checks)
 * @returns {boolean} - True if user can perform the action
 */
export const canPerformAction = (user, action, resource = null) => {
  if (!user) return false;

  const role = user.role;

  switch (action) {
    case 'create_user':
      return ['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)'].includes(role);
    
    case 'manage_framework':
      return ['Super Admin', 'MInT Admin'].includes(role);
    
    case 'submit_data':
      return ['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(role);
    
    case 'approve_submission':
      return ['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(role);
    
    case 'validate_submission':
      return ['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(role);
    
    case 'edit_submission':
      if (['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(role)) {
        // Can only edit their own unit's submissions in Draft or Rejected status
        if (resource && resource.unitId === user.officialUnitId && resource.contributorUserId === user.userId) {
          return ['Draft', 'Rejected by Initial Approver', 'Rejected by Central Committee'].includes(resource.submissionStatus);
        }
      }
      return false;
    
    case 'delete_submission':
      // Only Data Contributors can delete their own draft submissions
      if (['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(role)) {
        if (resource && resource.unitId === user.officialUnitId) {
          return resource.submissionStatus === 'Draft';
        }
      }
      return false;
    
    case 'view_all_submissions':
      return ['Super Admin', 'MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(role);
    
    default:
      return false;
  }
};

/**
 * Get user's accessible unit IDs (including their own and children if approver)
 * @param {Object} user - Current user
 * @param {Array} allUnits - All administrative units
 * @returns {Array} - Array of accessible unit IDs
 */
export const getAccessibleUnitIds = (user, allUnits) => {
  if (!user) return [];

  // Super Admin and MInT Admin can access all
  if (user.role === 'Super Admin' || user.role === 'MInT Admin') {
    return allUnits.map(u => u.unitId);
  }

  // Central Committee can access all
  if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(user.role)) {
    return allUnits.map(u => u.unitId);
  }

  // If user has no unit, return empty
  if (!user.officialUnitId) {
    return [];
  }

  // Data Contributors can only access their own unit
  if (['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor'].includes(user.role)) {
    return [user.officialUnitId];
  }

  // Approvers can access their unit and all child units
  if (['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(user.role)) {
    const getChildUnitIds = (unitId) => {
      const directChildren = allUnits.filter(u => u.parentUnitId === unitId);
      const childIds = directChildren.map(u => u.unitId);
      directChildren.forEach(child => {
        childIds.push(...getChildUnitIds(child.unitId));
      });
      return childIds;
    };

    return [user.officialUnitId, ...getChildUnitIds(user.officialUnitId)];
  }

  return [];
};

