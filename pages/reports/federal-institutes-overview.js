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

export default function FederalInstitutesOverview() {
  const { user } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortColumn, setSortColumn] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');

  const assessmentYears = getAllAssessmentYears();
  const allUnits = getAllUnits();
  const allUsers = getAllUsers();

  // Initialize with active year
  useEffect(() => {
    const activeYear = assessmentYears.find(y => y.status === 'Active');
    if (activeYear) {
      setSelectedYearId(activeYear.assessmentYearId);
    }
  }, []);

  // Get Federal Institute submissions
  const federalInstituteSubmissions = useMemo(() => {
    if (!selectedYearId) return [];

    const allSubmissions = getAllSubmissions();
    
    // Filter for Federal Institutes
    const federalUnits = allUnits.filter(u => u.unitType === 'Federal Institute');
    const federalUnitIds = federalUnits.map(u => u.unitId);
    
    let filtered = allSubmissions.filter(s => 
      s.assessmentYearId === selectedYearId &&
      federalUnitIds.includes(s.unitId)
    );

    // Filter by status if selected
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(s => selectedStatuses.includes(s.submissionStatus));
    }

    // Apply access control
    filtered = filterSubmissionsByAccess(filtered, user, allUnits);

    // Sort
    filtered.sort((a, b) => {
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

    return filtered.map(submission => {
      const unit = getUnitById(submission.unitId);
      const approver = submission.approverUserId 
        ? allUsers.find(u => u.userId === submission.approverUserId)
        : null;
      
      return {
        ...submission,
        unitName: unit?.officialUnitName || 'Unknown',
        approverName: approver ? `${approver.firstName} ${approver.lastName}` : 'N/A'
      };
    });
  }, [selectedYearId, selectedStatuses, sortColumn, sortDirection, user, allUnits, allUsers]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Institute Name', 'Submission Status', 'Submission Date', 'Last Updated', 'Approved By'];
    const rows = federalInstituteSubmissions.map(sub => [
      sub.unitName,
      sub.submissionStatus,
      sub.submittedDate || sub.createdAt || 'N/A',
      sub.updatedAt || 'N/A',
      sub.approverName
    ]);

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
    switch (status) {
      case SUBMISSION_STATUS.VALIDATED:
        return 'bg-green-100 text-green-800';
      case SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION:
        return 'bg-orange-100 text-orange-800';
      case SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL:
        return 'bg-[#0d6670]/10 text-[#0d6670]';
      case SUBMISSION_STATUS.DRAFT:
        return 'bg-yellow-100 text-yellow-800';
      case SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER:
      case SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor']}>
      <Layout title="Federal Institute Submissions Overview">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Federal Institute Submissions Overview
                </h1>
                <p className="text-mint-dark-text/70">
                  Consolidated view of submission status across all Federal Institutes
                </p>
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
                  <div>
                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Submission Status
                    </label>
                    <select
                      multiple
                      value={selectedStatuses}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value);
                        setSelectedStatuses(values);
                      }}
                      className="w-full px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                      size="3"
                    >
                      {Object.values(SUBMISSION_STATUS).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-mint-dark-text/60 mt-1">Hold Ctrl/Cmd to select multiple</p>
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-mint-medium-gray">
                      {federalInstituteSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-4xl mb-3">📋</span>
                              <p className="text-mint-dark-text/70 text-lg font-medium mb-1">No submissions found</p>
                              <p className="text-mint-dark-text/50 text-sm">Try adjusting your filters to see more results</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        federalInstituteSubmissions.map((submission) => (
                          <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                href={`/reports/federal-institute-detail?year=${submission.assessmentYearId}&unit=${submission.unitId}`}
                                className="text-sm font-semibold text-mint-primary-blue hover:text-mint-secondary-blue hover:underline transition-colors"
                              >
                                {submission.unitName}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(submission.submissionStatus)}`}>
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

