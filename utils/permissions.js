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
  if (['Regional Approver', 'Federal Approver'].includes(user.role)) {
    // Federal Approvers can access all Federal Institute units (institutes have no parent in hierarchy)
    if (user.role === 'Federal Approver' && allUnits && allUnits.length > 0) {
      const targetUnit = allUnits.find(u => u.unitId === targetUnitId);
      if (targetUnit && targetUnit.unitType === 'Federal Institute') return true;
    }
    return isUnitInHierarchy(user.officialUnitId, targetUnitId, allUnits);
  }

  // Data Contributors can only access their own unit
  if (['Data Contributor', 'Institute Data Contributor'].includes(user.role)) {
    return user.officialUnitId === targetUnitId;
  }

  // Regional Admin and Federal Admin: access within their scope
  if (['Regional Admin', 'Federal Admin'].includes(user.role)) {
    const accessible = getAccessibleUnitIds(user, allUnits);
    return accessible.includes(targetUnitId);
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
  if (['Data Contributor', 'Institute Data Contributor'].includes(user.role)) {
    return submissions.filter(s => s.unitId === user.officialUnitId);
  }

  // Approvers can see submissions from units in their hierarchy
  if (['Regional Approver', 'Federal Approver'].includes(user.role)) {
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
      return ['Super Admin', 'MInT Admin', 'Regional Admin', 'Federal Admin', 'Chairman (CC)'].includes(role);
    
    case 'manage_framework':
      return ['Super Admin', 'MInT Admin'].includes(role);
    
    case 'submit_data':
      return ['Data Contributor', 'Institute Data Contributor'].includes(role);
    
    case 'approve_submission':
      return ['Regional Approver', 'Federal Approver'].includes(role);
    
    case 'validate_submission':
      return ['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(role);
    
    case 'edit_submission':
      if (['Data Contributor', 'Institute Data Contributor'].includes(role)) {
        // Can only edit their own unit's submissions in Draft or Rejected status
        if (resource && resource.unitId === user.officialUnitId && resource.contributorUserId === user.userId) {
          return ['Draft', 'Rejected by Regional Approver', 'Rejected by Central Committee'].includes(resource.submissionStatus);
        }
      }
      return false;
    
    case 'delete_submission':
      // Only Data Contributors can delete their own draft submissions
      if (['Data Contributor', 'Institute Data Contributor'].includes(role)) {
        if (resource && resource.unitId === user.officialUnitId) {
          return resource.submissionStatus === 'Draft';
        }
      }
      return false;
    
    case 'view_all_submissions':
      return ['Super Admin', 'MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(role);
    
    case 'view_submission':
      // Same roles that can access Federal Institute report / submission details (read-only)
      return ['Super Admin', 'MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Federal Admin', 'Institute Data Contributor', 'Federal Approver', 'Regional Approver'].includes(role);
    
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
  if (['Data Contributor', 'Institute Data Contributor'].includes(user.role)) {
    return [user.officialUnitId];
  }

  // Approvers can access their unit and all child units
  if (['Regional Approver', 'Federal Approver'].includes(user.role)) {
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

  // Regional Admin: own unit (region/city) and all descendants
  if (user.role === 'Regional Admin') {
    const getChildUnitIds = (unitId) => {
      const directChildren = (allUnits || []).filter(u => u.parentUnitId === unitId);
      const childIds = directChildren.map(u => u.unitId);
      directChildren.forEach(child => {
        childIds.push(...getChildUnitIds(child.unitId));
      });
      return childIds;
    };
    return [user.officialUnitId, ...getChildUnitIds(user.officialUnitId)];
  }

  // Federal Admin: all federal institutions
  if (user.role === 'Federal Admin') {
    return (allUnits || []).filter(u => u.unitType === 'Federal Institute').map(u => u.unitId);
  }

  return [];
};

/**
 * Check if user can create a unit (optionally under a given parent)
 * @param {Object} user - Current user
 * @param {number|null} parentUnitId - Parent unit for the new unit (null for root-level Region/City/Federal Institute)
 * @param {Array} allUnits - All administrative units
 * @returns {boolean}
 */
export const canCreateUnit = (user, parentUnitId, allUnits) => {
  if (!user || !allUnits) return false;
  if (user.role === 'Super Admin' || user.role === 'MInT Admin') return true;
  if (user.role === 'Regional Admin' && user.officialUnitId) {
    const accessible = getAccessibleUnitIds(user, allUnits);
    return parentUnitId === null || accessible.includes(parentUnitId);
  }
  // Federal Admin cannot create new federal institutes (only edit existing)
  if (user.role === 'Federal Admin') return false;
  return false;
};

/**
 * Check if user can edit a specific unit
 * @param {Object} user - Current user
 * @param {number} unitId - Unit to edit
 * @param {Array} allUnits - All administrative units
 * @returns {boolean}
 */
export const canEditUnit = (user, unitId, allUnits) => {
  if (!user || !allUnits) return false;
  if (user.role === 'Super Admin' || user.role === 'MInT Admin') return true;
  const accessible = getAccessibleUnitIds(user, allUnits);
  return accessible.includes(unitId);
};

/**
 * Filter users to those the given admin can manage (scoped by unit)
 * @param {Object} adminUser - Current user (admin)
 * @param {Array} users - All users
 * @param {Array} allUnits - All administrative units
 * @returns {Array} - Filtered users
 */
export const filterUsersByScope = (adminUser, users, allUnits) => {
  if (!adminUser || !users || users.length === 0) return [];
  if (adminUser.role === 'Super Admin' || adminUser.role === 'MInT Admin' || adminUser.role === 'Chairman (CC)') {
    return users;
  }
  const accessibleUnitIds = getAccessibleUnitIds(adminUser, allUnits);
  return users.filter(u => u.officialUnitId != null && accessibleUnitIds.includes(u.officialUnitId));
};

