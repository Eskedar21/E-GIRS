import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import {
  getSubmissionsPendingChairmanScoringApproval,
  getSubmissionById,
  getSubjectiveResponsesForSubmission,
  getScoringSubmissionsToChairman,
  SUBMISSION_STATUS
} from '../../../data/submissions';
import { getUnitById, getAllUnits } from '../../../data/administrativeUnits';
import { getUsersByRole } from '../../../data/users';
import { filterSubmissionsByAccess } from '../../../utils/permissions';
import { getAssessmentYearById } from '../../../data/assessmentFramework';

const ITEMS_PER_PAGE = 10;

export default function ChairmanFinalApprovalQueue() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  const [submissions, setSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('submittedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    if (userRole !== 'Chairman (CC)' && userRole !== 'Secretary (CC)') return;

    const allUnits = getAllUnits();
    let list = getSubmissionsPendingChairmanScoringApproval();
    list = filterSubmissionsByAccess(list, user, allUnits);
    setSubmissions(list);
  }, [user, userRole]);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];
    if (scopeFilter !== 'all') {
      filtered = filtered.filter(s => {
        const unit = getUnitById(s.unitId);
        if (!unit) return false;
        const map = {
          region: 'Region',
          city: 'City Administration',
          zone: 'Zone',
          subcity: 'Sub-city',
          woreda: 'Woreda'
        };
        return unit.unitType === map[scopeFilter];
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => {
        const unit = getUnitById(s.unitId);
        const unitName = unit ? unit.officialUnitName.toLowerCase() : '';
        const year = getAssessmentYearById(s.assessmentYearId);
        const yearName = year ? year.yearName.toLowerCase() : '';
        return unitName.includes(q) || yearName.includes(q) || String(s.submissionId).includes(q);
      });
    }
    return filtered;
  }, [submissions, scopeFilter, searchQuery]);

  const sortedSubmissions = useMemo(() => {
    const sorted = [...filteredSubmissions];
    sorted.sort((a, b) => {
      let aVal, bVal;
      if (sortColumn === 'submittedDate') {
        aVal = new Date(a.submittedDate || a.updatedAt || 0).getTime();
        bVal = new Date(b.submittedDate || b.updatedAt || 0).getTime();
      } else if (sortColumn === 'unitName') {
        aVal = (getUnitById(a.unitId)?.officialUnitName || '').toLowerCase();
        bVal = (getUnitById(b.unitId)?.officialUnitName || '').toLowerCase();
      } else if (sortColumn === 'submissionId') {
        aVal = a.submissionId;
        bVal = b.submissionId;
      } else {
        aVal = a[sortColumn] ?? '';
        bVal = b[sortColumn] ?? '';
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSubmissions, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedSubmissions.length / ITEMS_PER_PAGE));
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSubmissions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedSubmissions, currentPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getUnitName = (unitId) => getUnitById(unitId)?.officialUnitName || 'Unknown';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const isChairman = userRole === 'Chairman (CC)';
  const isReadOnly = userRole === 'Secretary (CC)';

  return (
    <ProtectedRoute allowedRoles={['Chairman (CC)', 'Secretary (CC)']}>
      <Layout title="Scores for Final Approval">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-mint-light-gray text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center space-x-3">
                <Link
                  href="/scoring/queue"
                  className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                >
                  <span className="text-xl mr-2">←</span>
                  <span className="text-sm font-medium">Back to Pending Subjective Scoring</span>
                </Link>
              </div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Scores for Final Approval
                </h1>
                <p className="text-mint-dark-text/70">
                  One aggregated scoring per unit/institution. Submissions sent by the committee for your review. View committee members’ scores and their average, override the final score if needed, and submit to the system so the index can be calculated.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-medium-gray p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mint-dark-text mb-2">Search</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      placeholder="Unit name, year, submission ID..."
                      className="w-full px-4 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue text-mint-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-mint-dark-text mb-2">Scope</label>
                    <select
                      value={scopeFilter}
                      onChange={(e) => { setScopeFilter(e.target.value); setCurrentPage(1); }}
                      className="w-full px-4 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue bg-white text-mint-dark-text"
                    >
                      <option value="all">All</option>
                      <option value="region">Region</option>
                      <option value="city">City Administration</option>
                      <option value="zone">Zone</option>
                      <option value="subcity">Sub-city</option>
                      <option value="woreda">Woreda</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-mint-medium-gray overflow-hidden">
                <div className="px-6 py-4 border-b border-mint-medium-gray">
                  <p className="text-sm text-mint-dark-text/70">
                    {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''} pending your approval
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </p>
                </div>
                {paginatedSubmissions.length === 0 ? (
                  <div className="p-12 text-center text-mint-dark-text/70">
                    No submissions pending Chairman approval. Committee members must score and submit to Chairman first.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-mint-medium-gray">
                        <thead className="bg-mint-light-gray">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Submission</th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider cursor-pointer hover:bg-mint-medium-gray/50"
                              onClick={() => handleSort('unitName')}
                            >
                              Unit {sortColumn === 'unitName' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Year</th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider cursor-pointer hover:bg-mint-medium-gray/50"
                              onClick={() => handleSort('submittedDate')}
                            >
                              Updated {sortColumn === 'submittedDate' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-mint-medium-gray">
                          {paginatedSubmissions.map((sub) => {
                            const subjectiveCount = getSubjectiveResponsesForSubmission(sub.submissionId).length;
                            const committeeMembers = getUsersByRole('Central Committee Member') || [];
                            const submittedCount = getScoringSubmissionsToChairman(sub.submissionId).length;
                            return (
                              <tr key={sub.submissionId} className="hover:bg-mint-light-gray/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-mint-dark-text">#{sub.submissionId}</span>
                                  <p className="text-xs text-mint-dark-text/60 truncate max-w-[180px]">{sub.submissionName || '—'}</p>
                                  <p className="text-xs text-mint-primary-blue mt-0.5">{submittedCount} of {committeeMembers.length} members have submitted</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">{getUnitName(sub.unitId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                  {getAssessmentYearById(sub.assessmentYearId)?.yearName || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">{formatDate(sub.updatedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/scoring/final-approval/${sub.submissionId}`)}
                                    className="text-mint-primary-blue hover:text-mint-secondary-blue font-semibold"
                                  >
                                    {isReadOnly ? 'View' : 'Review & submit'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-mint-medium-gray flex items-center justify-between">
                        <p className="text-sm text-mint-dark-text/70">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedSubmissions.length)} of {sortedSubmissions.length}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-mint-medium-gray rounded-lg text-sm font-medium text-mint-dark-text bg-white hover:bg-mint-light-gray disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2 text-sm text-mint-dark-text">Page {currentPage} of {totalPages}</span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-mint-medium-gray rounded-lg text-sm font-medium text-mint-dark-text bg-white hover:bg-mint-light-gray disabled:opacity-50"
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
