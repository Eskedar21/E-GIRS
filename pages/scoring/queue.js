import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSubmissionsForSubjectiveScoring,
  getSubjectiveResponsesForSubmission,
} from '../../data/submissions';
import { getUnitById, getAllUnits } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess } from '../../utils/permissions';
import { getAssessmentYearById } from '../../data/assessmentFramework';

const ITEMS_PER_PAGE = 10;

export default function PendingSubjectiveScoringQueue() {
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
    // Committee members and Secretary only (Chairman only has Final Approval)
    if (!['Central Committee Member', 'Secretary (CC)'].includes(userRole)) return;

    const allUnits = getAllUnits();
    let list = getSubmissionsForSubjectiveScoring();
    list = filterSubmissionsByAccess(list, user, allUnits);
    setSubmissions(list);
  }, [user, userRole]);

  const filteredSubmissions = useMemo(() => {
    let filtered = [...submissions];
    if (scopeFilter !== 'all') {
      const map = {
        federal: 'Federal Institute',
        region: 'Region',
        city: 'City Administration',
        zone: 'Zone',
        subcity: 'Sub-city',
        woreda: 'Woreda'
      };
      filtered = filtered.filter(s => {
        const unit = getUnitById(s.unitId);
        return unit && unit.unitType === map[scopeFilter];
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

  const handleScoreSubmission = (submissionId) => {
    router.push(`/scoring/evaluate/${submissionId}`);
  };

  const isReadOnly = userRole === 'Secretary (CC)';

  return (
    <ProtectedRoute allowedRoles={['Central Committee Member', 'Secretary (CC)']}>
      <Layout title="Pending Subjective Scoring">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-mint-light-gray text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center space-x-3">
                <Link
                  href="/approval/queue"
                  className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                >
                  <span className="text-xl mr-2">←</span>
                  <span className="text-sm font-medium">Back to Approval Queue</span>
                </Link>
              </div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Pending Subjective Scoring
                </h1>
                <p className="text-mint-dark-text/70">
                  Validated submissions that contain text-based answers requiring a quantitative score. Assign scores (Meets / Partially Meets / Does Not Meet), then submit to the Chairman for final approval.
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
                      <option value="federal">Federal Institute</option>
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
                    {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''} found
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                  </p>
                </div>
                {paginatedSubmissions.length === 0 ? (
                  <div className="px-6 py-12 text-center text-mint-dark-text/70">
                    No submissions pending subjective scoring. Submissions must be Validated and contain at least one Text Explanation response.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-mint-medium-gray">
                        <thead className="bg-mint-light-gray">
                          <tr>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider cursor-pointer hover:bg-mint-medium-gray/50"
                              onClick={() => handleSort('submissionId')}
                            >
                              Submission {sortColumn === 'submissionId' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th
                              className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider cursor-pointer hover:bg-mint-medium-gray/50"
                              onClick={() => handleSort('unitName')}
                            >
                              Unit {sortColumn === 'unitName' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Assessment Year</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Subjective questions</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-mint-dark-text/70 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-mint-medium-gray">
                          {paginatedSubmissions.map((sub, index) => {
                            const subjectiveCount = getSubjectiveResponsesForSubmission(sub.submissionId).length;
                            return (
                              <tr key={`sub-${sub.submissionId}-${sub.unitId}-${index}`} className="hover:bg-mint-light-gray/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-mint-dark-text">#{sub.submissionId}</span>
                                  <p className="text-xs text-mint-dark-text/60 truncate max-w-[200px]">{sub.submissionName || '—'}</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">{getUnitName(sub.unitId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                  {getAssessmentYearById(sub.assessmentYearId)?.yearName || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                                  {subjectiveCount} text explanation(s)
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                  <button
                                    type="button"
                                    onClick={() => handleScoreSubmission(sub.submissionId)}
                                    className="text-mint-primary-blue hover:text-mint-secondary-blue font-semibold"
                                  >
                                    {isReadOnly ? 'View' : 'Score'}
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
