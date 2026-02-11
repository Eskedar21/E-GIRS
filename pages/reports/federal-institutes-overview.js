import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllAssessmentYears } from '../../data/assessmentFramework';
import { getAllSubmissions, SUBMISSION_STATUS } from '../../data/submissions';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { getAllUsers } from '../../data/users';
import { filterSubmissionsByAccess } from '../../utils/permissions';
import { useRouter } from 'next/router';

export default function FederalInstitutesOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortColumn, setSortColumn] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const assessmentYears = getAllAssessmentYears();
  const allUnits = getAllUnits();
  const allUsers = getAllUsers();

  // Initialize with active year, or first available year so the list is not empty
  useEffect(() => {
    const activeYear = assessmentYears.find(y => y.status === 'Active');
    if (activeYear) {
      setSelectedYearId(activeYear.assessmentYearId);
    } else if (assessmentYears.length > 0) {
      setSelectedYearId(assessmentYears[0].assessmentYearId);
    }
  }, []);

  // Get Federal Institute submissions
  const federalInstituteSubmissions = useMemo(() => {
    const allSubmissions = getAllSubmissions();
    
    // Filter for Federal Institutes
    const federalUnits = allUnits.filter(u => u.unitType === 'Federal Institute');
    const federalUnitIds = federalUnits.map(u => u.unitId);
    
    let filtered = allSubmissions.filter(s => 
      federalUnitIds.includes(s.unitId) &&
      (selectedYearId == null || s.assessmentYearId === selectedYearId)
    );

    // Filter by status if selected
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(s => selectedStatuses.includes(s.submissionStatus));
    }

    // Apply access control
    filtered = filterSubmissionsByAccess(filtered, user, allUnits);

    // Show all submissions (sample submissions per institute), not just latest
    const allSubmissionsSorted = [...filtered].sort((a, b) => {
      let aVal, bVal;
      switch (sortColumn) {
        case 'unitName':
          aVal = getUnitById(a.unitId)?.officialUnitName || '';
          bVal = getUnitById(b.unitId)?.officialUnitName || '';
          break;
        case 'submissionStatus':
          aVal = a.submissionStatus;
          bVal = b.submissionStatus;
          break;
        case 'submissionDate':
          aVal = a.submittedDate || a.createdAt;
          bVal = b.submittedDate || b.createdAt;
          break;
        case 'lastUpdated':
          aVal = a.updatedAt;
          bVal = b.updatedAt;
          break;
        case 'approverName':
          const aApprover = a.approverUserId ? allUsers.find(u => u.userId === a.approverUserId) : null;
          const bApprover = b.approverUserId ? allUsers.find(u => u.userId === b.approverUserId) : null;
          aVal = aApprover ? `${aApprover.firstName} ${aApprover.lastName}` : '';
          bVal = bApprover ? `${bApprover.firstName} ${bApprover.lastName}` : '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return allSubmissionsSorted.map(submission => {
      const unit = getUnitById(submission.unitId);
      const approver = submission.approverUserId 
        ? allUsers.find(u => u.userId === submission.approverUserId)
        : null;
      
      return {
        ...submission,
        unitName: unit?.officialUnitName || 'Unknown',
        approverName: approver ? `${approver.firstName} ${approver.lastName}` : 'N/A',
        rejectionReason: submission.rejectionReason || null
      };
    });
  }, [selectedYearId, selectedStatuses, sortColumn, sortDirection, user, allUnits, allUsers]);

  const totalPages = Math.max(1, Math.ceil(federalInstituteSubmissions.length / PAGE_SIZE));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return federalInstituteSubmissions.slice(start, start + PAGE_SIZE);
  }, [federalInstituteSubmissions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYearId, selectedStatuses]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleReview = (submission) => {
    router.push(`/reports/federal-institute-detail?submissionId=${submission.submissionId}&year=${submission.assessmentYearId}&unit=${submission.unitId}`);
  };

  const exportToCSV = () => {
    const assessmentYears = getAllAssessmentYears();
    const headers = ['Institute Name', 'Assessment Year', 'Submission Status', 'Submission Date', 'Last Updated', 'Approved By'];
    const rows = federalInstituteSubmissions.map(sub => {
      const year = assessmentYears.find(y => y.assessmentYearId === sub.assessmentYearId);
      return [
        sub.unitName,
        year?.yearName || `Year ${sub.assessmentYearId}`,
        sub.submissionStatus,
        sub.submittedDate || sub.createdAt || 'N/A',
        sub.updatedAt || 'N/A',
        sub.approverName
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `federal-institutes-overview-${selectedYearId || 'all'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const getStatusColor = (status) => {
    const statusConfig = {
      [SUBMISSION_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL]: 'bg-blue-100 text-blue-800 border-blue-300',
      [SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION]: 'bg-orange-100 text-orange-800 border-orange-300',
      [SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER]: 'bg-red-100 text-red-800 border-red-300',
      [SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE]: 'bg-red-100 text-red-800 border-red-300',
      [SUBMISSION_STATUS.VALIDATED]: 'bg-green-100 text-green-800 border-green-300',
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Summary stats derived from the same filtered list as the table (concurrent with listed submissions)
  const summaryStats = useMemo(() => {
    const list = federalInstituteSubmissions;
    return {
      total: list.length,
      draft: list.filter(s => s.submissionStatus === SUBMISSION_STATUS.DRAFT).length,
      pendingApproval: list.filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL).length,
      pendingValidation: list.filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION).length,
      rejected: list.filter(s =>
        s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
        s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
      ).length,
      validated: list.filter(s => s.submissionStatus === SUBMISSION_STATUS.VALIDATED).length,
    };
  }, [federalInstituteSubmissions]);

  return (
    <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor', 'Federal Approver']}>
      <Layout title="Federal Institute Submissions Overview">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Federal Institute Submissions Overview
                </h1>
                <p className="text-mint-dark-text/70">
                  Consolidated view of submission status across all Federal Institutes
                </p>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-4 border border-mint-medium-gray">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Total</p>
                  <p className="text-2xl font-bold text-mint-primary-blue">{summaryStats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl shadow-lg p-4 border border-yellow-200">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Draft</p>
                  <p className="text-2xl font-bold text-yellow-700">{summaryStats.draft}</p>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-lg p-4 border border-blue-200">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-blue-700">{summaryStats.pendingApproval}</p>
                </div>
                <div className="bg-orange-50 rounded-xl shadow-lg p-4 border border-orange-200">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Pending Validation</p>
                  <p className="text-2xl font-bold text-orange-700">{summaryStats.pendingValidation}</p>
                </div>
                <div className="bg-red-50 rounded-xl shadow-lg p-4 border border-red-200">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-700">{summaryStats.rejected}</p>
                </div>
                <div className="bg-green-50 rounded-xl shadow-lg p-4 border border-green-200">
                  <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Validated</p>
                  <p className="text-2xl font-bold text-green-700">{summaryStats.validated}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Assessment Year
                    </label>
                    <select
                      value={selectedYearId || ''}
                      onChange={(e) => setSelectedYearId(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                    >
                      <option value="">All Years</option>
                      {assessmentYears.map((year) => (
                        <option key={year.assessmentYearId} value={year.assessmentYearId}>
                          {year.yearName} ({year.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Submission Status
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue flex items-center justify-between"
                      >
                        <span>
                          {selectedStatuses.length === 0
                            ? 'All Statuses'
                            : `${selectedStatuses.length} status${selectedStatuses.length !== 1 ? 'es' : ''} selected`}
                        </span>
                        <svg
                          className={`w-5 h-5 text-mint-dark-text transition-transform ${isStatusDropdownOpen ? 'transform rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isStatusDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsStatusDropdownOpen(false)}
                          ></div>
                          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-mint-medium-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div className="p-2">
                              <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedStatuses.length === 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStatuses([]);
                                    }
                                  }}
                                  className="mr-2 w-4 h-4 text-mint-primary-blue focus:ring-mint-primary-blue border-mint-medium-gray rounded"
                                />
                                <span className="text-sm text-mint-dark-text">All Statuses</span>
                              </label>
                              {Object.values(SUBMISSION_STATUS)
                                .filter(status => status !== SUBMISSION_STATUS.SCORING_COMPLETE)
                                .map((status) => {
                                const isSelected = selectedStatuses.includes(status);
                                return (
                                  <label
                                    key={status}
                                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStatuses([...selectedStatuses, status]);
                                        } else {
                                          setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                                        }
                                      }}
                                      className="mr-2 w-4 h-4 text-mint-primary-blue focus:ring-mint-primary-blue border-mint-medium-gray rounded"
                                    />
                                    <span className={`text-sm ${isSelected ? 'font-semibold text-mint-primary-blue' : 'text-mint-dark-text'}`}>
                                      {status}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {selectedStatuses.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedStatuses.map((status) => (
                          <span
                            key={status}
                            className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(status)}`}
                          >
                            {status}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                              }}
                              className="ml-1 text-xs hover:font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedStatuses([])}
                          className="px-2 py-1 text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                  <h2 className="text-xl font-bold text-mint-primary-blue">
                    Federal Institutes ({federalInstituteSubmissions.length})
                  </h2>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                  >
                    Export to CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-mint-medium-gray">
                    <thead className="bg-mint-primary-blue">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue"
                          onClick={() => handleSort('unitName')}
                        >
                          Institute Name {sortColumn === 'unitName' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue"
                          onClick={() => handleSort('submissionStatus')}
                        >
                          Submission Status {sortColumn === 'submissionStatus' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue"
                          onClick={() => handleSort('submissionDate')}
                        >
                          Submission Date {sortColumn === 'submissionDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue"
                          onClick={() => handleSort('lastUpdated')}
                        >
                          Last Updated {sortColumn === 'lastUpdated' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th
                          className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-mint-secondary-blue"
                          onClick={() => handleSort('approverName')}
                        >
                          Approved By {sortColumn === 'approverName' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Assessment Year
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-mint-medium-gray">
                      {paginatedSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl mb-3">📋</span>
                              <p className="text-mint-dark-text/70 text-lg font-medium mb-1">No submissions found</p>
                              <p className="text-mint-dark-text/50 text-sm">Try adjusting your filters to see more results</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedSubmissions.map((submission) => {
                          const assessmentYear = assessmentYears.find(y => y.assessmentYearId === submission.assessmentYearId);
                          return (
                            <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-mint-dark-text">
                                  {submission.unitName}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(submission.submissionStatus)}`}>
                                  {submission.submissionStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                {formatDate(submission.submittedDate || submission.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                {formatDate(submission.updatedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                {submission.approverName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                {assessmentYear?.yearName || `Year ${submission.assessmentYearId}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleReview(submission)}
                                  className="px-4 py-2 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white text-xs font-semibold rounded-lg transition-colors"
                                >
                                  Review
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {federalInstituteSubmissions.length > 0 && (
                  <div className="px-6 py-4 border-t border-mint-medium-gray bg-mint-light-gray flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm font-medium text-mint-dark-text">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, federalInstituteSubmissions.length)} of {federalInstituteSubmissions.length} submissions
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-mint-medium-gray bg-white text-mint-dark-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-mint-dark-text px-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-mint-medium-gray bg-white text-mint-dark-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

