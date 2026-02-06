import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubmissions, getSubmissionsByStatus, getSubmissionById, SUBMISSION_STATUS } from '../../data/submissions';
import { getAllUnits, getUnitById, getChildUnits } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess } from '../../utils/permissions';
import { getAssessmentYearById } from '../../data/assessmentFramework';
import { getUserById, updateUser } from '../../data/users';

export default function ApprovalQueue() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  
  // Sync user's officialUnitId from users data store (in case it was updated)
  useEffect(() => {
    if (user && user.userId) {
      const userFromStore = getUserById(user.userId);
      // For approver1 (userId: 3), ensure officialUnitId is 10 (Addis Ababa)
      if (user.userId === 3 && user.officialUnitId !== 10) {
        console.log('Fixing approver1 officialUnitId:', {
          old: user.officialUnitId,
          new: 10
        });
        // Update localStorage session
        const updatedUser = {
          ...user,
          officialUnitId: 10
        };
        localStorage.setItem('egirs_user', JSON.stringify(updatedUser));
        // Also update in users data store
        try {
          updateUser(3, { officialUnitId: 10 });
        } catch (e) {
          console.error('Error updating user in store:', e);
        }
        // Reload page to apply changes
        window.location.reload();
        return;
      }
      if (userFromStore && userFromStore.officialUnitId !== user.officialUnitId) {
        console.log('Updating user officialUnitId:', {
          old: user.officialUnitId,
          new: userFromStore.officialUnitId
        });
        // Update localStorage session
        const updatedUser = {
          ...user,
          officialUnitId: userFromStore.officialUnitId
        };
        localStorage.setItem('egirs_user', JSON.stringify(updatedUser));
        // Reload page to apply changes
        window.location.reload();
      }
    }
  }, [user]);
  
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('submittedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get descendant units grouped by type for regional approvers
  const descendantUnitsByType = useMemo(() => {
    if (!user || !user.officialUnitId || !['Regional Approver', 'Federal Approver'].includes(userRole)) {
      return { zones: [], woredas: [], subCities: [] };
    }
    
    const allUnits = getAllUnits();
    const userUnit = getUnitById(user.officialUnitId);
    if (!userUnit) return { zones: [], woredas: [], subCities: [] };
    
    // Get all descendant units recursively
    const getDescendantUnits = (parentId) => {
      const children = getChildUnits(parentId);
      const allDescendants = [...children];
      children.forEach(child => {
        allDescendants.push(...getDescendantUnits(child.unitId));
      });
      return allDescendants;
    };
    
    const allDescendants = getDescendantUnits(user.officialUnitId);
    return {
      zones: allDescendants.filter(u => u.unitType === 'Zone'),
      woredas: allDescendants.filter(u => u.unitType === 'Woreda'),
      subCities: allDescendants.filter(u => u.unitType === 'Sub-city')
    };
  }, [user, userRole]);

  // Determine available statuses based on user role
  const availableStatuses = useMemo(() => {
    if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)) {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION, label: 'Pending Approval' },
        { value: SUBMISSION_STATUS.VALIDATED, label: 'Verified' },
      ];
    } else if (['Regional Approver', 'Federal Approver'].includes(userRole)) {
      return [
        { value: 'all', label: 'All Statuses' },
        { value: SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL, label: 'Pending Initial Approval' },
        { value: SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE, label: 'Rejected by Central Committee' },
        { value: SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION, label: 'Pending Central Validation' },
        { value: SUBMISSION_STATUS.VALIDATED, label: 'Validated' },
      ];
    }
    return [{ value: 'all', label: 'All Statuses' }];
  }, [userRole]);

  // Load submissions based on role
  useEffect(() => {
    if (!user) return;
    
    const loadSubmissions = () => {
      let submissions = [];
      const allUnits = getAllUnits();
      
      if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)) {
        // Central Committee sees all submissions with Pending Approval and Verified statuses
        const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
        const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
        submissions = [...pending, ...validated];
      } else if (['Regional Approver', 'Federal Approver'].includes(userRole)) {
        // Regional Approvers see submissions in their scope
        const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
        const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
        const approvedPendingCentral = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
        const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
        const allBeforeFilter = [...pending, ...rejected, ...approvedPendingCentral, ...validated];
        
        // Filter by scope
        submissions = filterSubmissionsByAccess(allBeforeFilter, user, allUnits);
        
        // Debug logging
        const userUnit = getUnitById(user.officialUnitId);
        console.log('Regional Approver - Submission Loading Debug:', {
          userRole,
          userUnitId: user.officialUnitId,
          userUnitType: userUnit?.unitType,
          userUnitName: userUnit?.officialUnitName,
          pendingCount: pending.length,
          rejectedCount: rejected.length,
          approvedPendingCentralCount: approvedPendingCentral.length,
          totalBeforeFilter: allBeforeFilter.length,
          totalAfterFilter: submissions.length,
          sampleSubmissions: allBeforeFilter.slice(0, 5).map(s => {
            const sUnit = getUnitById(s.unitId);
            return {
              id: s.submissionId,
              name: s.submissionName,
              unitId: s.unitId,
              unitName: sUnit?.officialUnitName,
              unitType: sUnit?.unitType,
              status: s.submissionStatus,
              canAccess: filterSubmissionsByAccess([s], user, allUnits).length > 0
            };
          }),
          filteredSubmissions: submissions.map(s => {
            const sUnit = getUnitById(s.unitId);
            return {
              id: s.submissionId,
              name: s.submissionName,
              unitId: s.unitId,
              unitName: sUnit?.officialUnitName,
              unitType: sUnit?.unitType,
              status: s.submissionStatus
            };
          })
        });
      }
      
      setAllSubmissions(submissions);
    };
    
    loadSubmissions();
    
    // Listen for real-time updates
    const handleSubmissionUpdate = () => {
      loadSubmissions();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('submissionUpdated', handleSubmissionUpdate);
      const interval = setInterval(loadSubmissions, 2000);
      
      return () => {
        window.removeEventListener('submissionUpdated', handleSubmissionUpdate);
        clearInterval(interval);
      };
    }
  }, [user, userRole]);

  // Filter and search submissions - separate effect for filter changes (resets page) vs data updates (keeps page)
  const applyFilters = useCallback((submissions, resetPage = false) => {
    let filtered = [...submissions];
    const allUnits = getAllUnits();

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.submissionStatus === statusFilter);
    }

    // Scope filter (by unit) - For regional approvers, filter by Region, Zone, or Woreda
    // For Addis Ababa approver, filter by Addis Ababa, Sub-city, or Woreda
    if (scopeFilter !== 'all') {
      filtered = filtered.filter(s => {
        const unit = getUnitById(s.unitId);
        if (!unit) return false;
        
        if (['Regional Approver', 'Federal Approver'].includes(userRole)) {
          // Federal Approvers filter by Federal Institute
          if (userRole === 'Federal Approver') {
            if (scopeFilter === 'federal') {
              // Show submissions from Federal Institutes in their scope
              return unit.unitType === 'Federal Institute';
            }
          } else {
            // Check if this is Addis Ababa approver (unitId: 10)
            const isAddisAbabaApprover = user?.officialUnitId === 10;
            
            if (isAddisAbabaApprover) {
              // Addis Ababa approvers filter by Addis Ababa, Sub-city, or Woreda
              if (scopeFilter === 'city') {
                // Show submissions from Addis Ababa City Administration itself
                return unit.unitType === 'City Administration' && unit.unitId === user?.officialUnitId;
              } else if (scopeFilter === 'subcity') {
                // Show submissions from all sub-cities under Addis Ababa
                return unit.unitType === 'Sub-city' && descendantUnitsByType.subCities.some(sc => sc.unitId === unit.unitId);
              } else if (scopeFilter === 'woreda') {
                // Show submissions from all woredas under Addis Ababa (through sub-cities)
                return unit.unitType === 'Woreda' && descendantUnitsByType.woredas.some(w => w.unitId === unit.unitId);
              }
            } else {
              // Regional approvers filter by Region, Zone, or Woreda
              if (scopeFilter === 'region') {
                // Show submissions from the region itself
                return unit.unitType === 'Region' && unit.unitId === user?.officialUnitId;
              } else if (scopeFilter === 'zone') {
                // Show submissions from all zones under the region
                return unit.unitType === 'Zone' && descendantUnitsByType.zones.some(z => z.unitId === unit.unitId);
              } else if (scopeFilter === 'woreda') {
                // Show submissions from all woredas under the region
                return unit.unitType === 'Woreda' && descendantUnitsByType.woredas.some(w => w.unitId === unit.unitId);
              }
            }
          }
        } else {
          // Central Committee filters - can filter by all unit types
          if (scopeFilter === 'federal') {
            return unit.unitType === 'Federal Institute';
          } else if (scopeFilter === 'region') {
            return unit.unitType === 'Region';
          } else if (scopeFilter === 'city') {
            return unit.unitType === 'City Administration';
          } else if (scopeFilter === 'zone') {
            return unit.unitType === 'Zone';
          } else if (scopeFilter === 'subcity') {
            return unit.unitType === 'Sub-city';
          } else if (scopeFilter === 'woreda') {
            return unit.unitType === 'Woreda';
          }
        }
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const unit = getUnitById(s.unitId);
        const unitName = unit ? unit.officialUnitName.toLowerCase() : '';
        const submissionName = (s.submissionName || '').toLowerCase();
        const submissionId = s.submissionId.toString();
        return unitName.includes(query) || submissionName.includes(query) || submissionId.includes(query);
      });
    }

    setFilteredSubmissions(filtered);
    if (resetPage) {
      setCurrentPage(1);
    }
  }, [statusFilter, scopeFilter, searchQuery, user, userRole, descendantUnitsByType]);

  // When filters/search change, reset page to 1
  useEffect(() => {
    applyFilters(allSubmissions, true);
  }, [statusFilter, scopeFilter, searchQuery, user, userRole, descendantUnitsByType]);

  // When allSubmissions updates (but filters haven't changed), keep current page
  useEffect(() => {
    if (allSubmissions.length > 0) {
      applyFilters(allSubmissions, false);
    }
  }, [allSubmissions]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      total: allSubmissions.length,
      pending: 0,
      verified: 0,
      rejected: 0,
      approved: 0,
    };

    allSubmissions.forEach(sub => {
      if (sub.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL || 
          sub.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
        stats.pending++;
      } else if (sub.submissionStatus === SUBMISSION_STATUS.VALIDATED) {
        stats.verified++;
      } else if (sub.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE ||
                 sub.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER) {
        stats.rejected++;
      } else if (sub.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
        stats.approved++;
      }
    });

    return stats;
  }, [allSubmissions]);

  // Sort submissions
  const sortedSubmissions = useMemo(() => {
    const sorted = [...filteredSubmissions];
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      if (sortColumn === 'submittedDate') {
        aValue = new Date(a.submittedDate || a.createdAt || 0);
        bValue = new Date(b.submittedDate || b.createdAt || 0);
      } else if (sortColumn === 'unitName') {
        const unitA = getUnitById(a.unitId);
        const unitB = getUnitById(b.unitId);
        aValue = unitA ? unitA.officialUnitName : '';
        bValue = unitB ? unitB.officialUnitName : '';
      } else if (sortColumn === 'status') {
        aValue = a.submissionStatus;
        bValue = b.submissionStatus;
      } else {
        aValue = a[sortColumn] || '';
        bValue = b[sortColumn] || '';
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSubmissions, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedSubmissions.slice(start, start + itemsPerPage);
  }, [sortedSubmissions, currentPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown Unit';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    } else if (status === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    } else if (status === SUBMISSION_STATUS.VALIDATED) {
      return 'bg-green-100 text-green-800 border border-green-300';
    } else if (status === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) {
      return 'bg-gradient-to-r from-red-100 to-red-50 text-red-900 border-2 border-red-400 shadow-md font-semibold';
    } else if (status === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER) {
      return 'bg-red-100 text-red-800 border border-red-300';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const handleReview = (submissionId) => {
    // Secretary has read-only access; Chairman has full approve/reject like Central Committee Member
    if (userRole === 'Secretary (CC)') {
      router.push(`/validation/evaluate/${submissionId}`);
    } else if (['Chairman (CC)', 'Central Committee Member'].includes(userRole)) {
      router.push(`/validation/evaluate/${submissionId}`);
    } else {
      router.push(`/approval/evaluate/${submissionId}`);
    }
  };

  const isReadOnly = userRole === 'Secretary (CC)';

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)']}>
      <Layout title="Approval Queue">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-gray-50 text-gray-900 min-h-screen">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole) 
                    ? 'Central Validation Queue' 
                    : userRole === 'Federal Approver'
                    ? 'Federal Approval Queue'
                    : 'Approval Queue'}
                  </h1>
                <p className="text-gray-600">
                  {['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)
                    ? 'Monitor and manage all submissions pending central validation. Track total number of submissions that are pending, verified, and rejected.'
                    : userRole === 'Federal Approver'
                    ? 'Monitor and manage all Federal Institute submissions in your scope. Review and approve data submissions from Federal Institutes under your jurisdiction.'
                    : 'Monitor and manage all submissions in your scope. Track total number of submissions that are pending, verified, and rejected.'}
                    </p>
                  {userRole === 'Federal Approver' && user?.officialUnitId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Your Scope:</strong> You have access to review and approve submissions from Federal Institutes assigned to your administrative unit.
                        {(() => {
                          const userUnit = getUnitById(user.officialUnitId);
                          return userUnit ? ` (${userUnit.officialUnitName})` : '';
                        })()}
                      </p>
                    </div>
                  )}
                  </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Total Submissions</p>
                      <p className="text-3xl font-bold text-gray-900">{summaryStats.total}</p>
                            </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                              </div>
                </div>
              </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                      <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{summaryStats.pending}</p>
                      <p className="text-xs text-gray-500 mt-1">Pending review</p>
                          </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                        </div>
                      </div>
                    </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                        <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Verified</p>
                      <p className="text-3xl font-bold text-green-600">{summaryStats.verified}</p>
                      <p className="text-xs text-gray-500 mt-1">Verified submissions</p>
                        </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                        </div>
                      </div>
                    </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                        <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                      <p className="text-3xl font-bold text-red-600">{summaryStats.rejected}</p>
                      <p className="text-xs text-gray-500 mt-1">Rejected submissions</p>
                        </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      </div>
                                  </div>
                                </div>
                              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                  <div className="space-y-4">
                  {/* Search Bar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                                                  </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by company name, TIN number, or contact person..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                                          </div>

                  {/* Filter Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approval Status
                                                  </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {availableStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                                              </div>
                                              
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scope
                                                  </label>
                      <select
                        value={scopeFilter}
                        onChange={(e) => setScopeFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="all">All Scopes</option>
                        {['Regional Approver', 'Federal Approver'].includes(userRole) ? (
                          userRole === 'Federal Approver' ? (
                            <>
                              <option value="federal">Federal Institute</option>
                            </>
                          ) : user?.officialUnitId === 10 ? (
                            <>
                              <option value="city">Addis Ababa</option>
                              <option value="subcity">Sub-city</option>
                              <option value="woreda">Woreda</option>
                            </>
                          ) : (
                            <>
                              <option value="region">Region</option>
                              <option value="zone">Zone</option>
                              <option value="woreda">Woreda</option>
                            </>
                          )
                        ) : (
                          <>
                            <option value="federal">Federal Institute</option>
                            <option value="region">Region</option>
                            <option value="city">City Administration</option>
                            <option value="zone">Zone</option>
                            <option value="subcity">Sub-city</option>
                            <option value="woreda">Woreda</option>
                                  </>
                                )}
                      </select>
                                                    </div>
                                                    
                                                            </div>
                                                          </div>
                                                        </div>
                          
              {/* Submissions Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''} found 
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                                  </p>
                                                    </div>

                {paginatedSubmissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">No submissions found matching your criteria.</p>
                                </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Submission Information
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('unitName')}>
                              Unit
                              {sortColumn === 'unitName' && (
                                <span className="ml-1">{sortDirection === 'asc' ? ' ▲' : ' ▼'}</span>
                              )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assessment Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort('submittedDate')}>
                              Submitted Date
                              {sortColumn === 'submittedDate' && (
                                <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                              )}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedSubmissions.map((submission) => {
                            const unit = getUnitById(submission.unitId);
                            const assessmentYear = getAssessmentYearById(submission.assessmentYearId);
                            return (
                              <tr key={submission.submissionId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {submission.submissionName || `Submission #${submission.submissionId}`}
                                </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {submission.submissionId}
                                </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {unit ? unit.officialUnitName : 'Unknown Unit'}
                              </div>
                                  {unit && (
                                    <div className="text-sm text-gray-500">
                                      {unit.unitType}
                        </div>
                      )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {assessmentYear ? assessmentYear.yearName : 'N/A'}
                        </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm ${getStatusBadgeClass(submission.submissionStatus)}`}>
                                    {submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE ? (
                                      <span className="tracking-wide">{submission.submissionStatus}</span>
                                    ) : (
                                      submission.submissionStatus
                                    )}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {formatDate(submission.submittedDate)}
                                  </div>
                                  {submission.approvalDate && (
                                    <div className="text-xs text-gray-500">
                                      Reviewed: {formatDate(submission.approvalDate)}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                                    onClick={() => handleReview(submission.submissionId)}
                                    className={isReadOnly 
                                      ? "text-mint-primary-blue hover:text-mint-secondary-blue font-semibold opacity-75 cursor-pointer" 
                                      : "text-blue-600 hover:text-blue-900 font-semibold"}
                                    title={isReadOnly ? "View only (Read-only access)" : "Review and take action"}
                >
                                    {isReadOnly ? 'View' : 'Review'}
                </button>
                                </td>
                              </tr>
        );
      })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          {sortedSubmissions.length > 0 ? (
                            <>
                              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedSubmissions.length)} of {sortedSubmissions.length} result{sortedSubmissions.length !== 1 ? 's' : ''}
                            </>
                          ) : (
                            'No results to display'
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2 text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
              )}
            </div>
            </div>
          </main>
          </div>
    </Layout>
    </ProtectedRoute>
  );
}
