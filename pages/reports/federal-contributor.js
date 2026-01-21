import { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { assessmentYears } from '../../data/mockData';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { getAllSubmissions, getSubmissionsByUser, SUBMISSION_STATUS } from '../../data/submissions';
import Link from 'next/link';

export default function FederalContributorReport() {
  const { user } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState(assessmentYears[assessmentYears.length - 1].id);

  const allUnits = useMemo(() => getAllUnits(), []);
  const userUnit = useMemo(() => {
    if (!user?.officialUnitId) return null;
    return getUnitById(user.officialUnitId);
  }, [user]);

  // Get user's submissions
  const submissions = useMemo(() => {
    if (!user) return [];
    const allUserSubmissions = getSubmissionsByUser(user.userId);
    // Filter by year
    return allUserSubmissions.filter(s => {
      const yearId = s.assessmentYearId === 1 ? '2024' : '2025';
      return yearId === selectedYearId;
    });
  }, [user, selectedYearId]);

  const getStatusColor = (status) => {
    switch (status) {
      case SUBMISSION_STATUS.VALIDATED:
      case SUBMISSION_STATUS.SCORING_COMPLETE:
        return 'bg-green-100 text-green-800';
      case SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION:
      case SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL:
        return 'bg-yellow-100 text-yellow-800';
      case SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER:
      case SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE:
        return 'bg-red-100 text-red-800';
      case SUBMISSION_STATUS.DRAFT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['Submission Name', 'Status', 'Submitted Date', 'Unit Name'];
    const rows = submissions.map(s => {
      const unit = getUnitById(s.unitId);
      return [
        s.submissionName,
        s.submissionStatus,
        new Date(s.submittedDate).toLocaleDateString(),
        unit?.officialUnitName || 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `federal-submissions-${selectedYearId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || user.role !== 'Federal Data Contributor') {
    return (
      <ProtectedRoute allowedRoles={['Federal Data Contributor']}>
        <Layout title="My Submissions Report">
          <div className="p-8 text-center">
            <p className="text-red-600">Access Denied. This report is only available for Federal Data Contributors.</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['Federal Data Contributor']}>
      <Layout title="My Submissions Report">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                      My Submissions Report
                    </h1>
                    <p className="text-mint-dark-text/70 text-lg">
                      {userUnit?.officialUnitName || userUnit?.name || 'Federal Institute'}
                    </p>
                    <p className="text-sm text-mint-dark-text/60 mt-2">
                      Note: Federal Institutes do not have index calculations. This report shows your submission history and status.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                      Assessment Year
                    </label>
                    <select
                      value={selectedYearId}
                      onChange={(e) => setSelectedYearId(e.target.value)}
                      className="px-4 py-2.5 border-2 border-mint-medium-gray rounded-lg bg-white text-mint-dark-text font-medium focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                    >
                      {assessmentYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                  <p className="text-white/90 text-sm font-medium uppercase tracking-wide mb-2">Total Submissions</p>
                  <p className="text-5xl font-bold mb-2">{submissions.length}</p>
                  <p className="text-sm text-white/80">For {selectedYearId}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Validated</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {submissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.VALIDATED || s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE).length}
                  </p>
                  <p className="text-xs text-mint-dark-text/60">Completed</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Pending</p>
                  <p className="text-4xl font-bold text-yellow-600 mb-1">
                    {submissions.filter(s => 
                      s.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL || 
                      s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                    ).length}
                  </p>
                  <p className="text-xs text-mint-dark-text/60">In Review</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <p className="text-mint-dark-text/70 text-sm font-medium uppercase tracking-wide mb-2">Rejected</p>
                  <p className="text-4xl font-bold text-red-600 mb-1">
                    {submissions.filter(s => 
                      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER || 
                      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
                    ).length}
                  </p>
                  <p className="text-xs text-mint-dark-text/60">Needs Revision</p>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-mint-medium-gray">
                <div className="px-6 py-4 border-b border-mint-medium-gray bg-mint-light-gray flex justify-between items-center">
                  <h3 className="text-xl font-bold text-mint-primary-blue">Submission History</h3>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-mint-dark-text/70">
                    <p>No submissions found for {selectedYearId}.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-mint-medium-gray">
                      <thead className="bg-mint-primary-blue">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Submission Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Submitted Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-mint-medium-gray">
                        {submissions.map((submission) => {
                          const unit = getUnitById(submission.unitId);
                          return (
                            <tr key={submission.submissionId} className="hover:bg-mint-light-gray">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{submission.submissionName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.submissionStatus)}`}>
                                  {submission.submissionStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(submission.submittedDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <Link
                                  href={`/reports/federal-institute-detail?submissionId=${submission.submissionId}`}
                                  className="text-mint-primary-blue hover:underline"
                                >
                                  View Details
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
