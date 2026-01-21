import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionsByUser,
  getSubmissionById, 
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getUnitById } from '../../data/administrativeUnits';
import { getAssessmentYearById, getDimensionsByYear, getIndicatorsByDimension, getSubQuestionsByIndicator } from '../../data/assessmentFramework';
import { getResponsesBySubmission } from '../../data/submissions';

export default function SubmissionsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Get all submissions for this user
    const submissions = getSubmissionsByUser(user.userId);
    
    // Sort by updated date (most recent first)
    submissions.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
    
    setAllSubmissions(submissions);
  }, [user]);

  // Filter submissions based on selected status
  const filteredSubmissions = useMemo(() => {
    if (filterStatus === 'all') return allSubmissions;
    
    if (filterStatus === 'draft') {
      return allSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.DRAFT);
    }
    
    if (filterStatus === 'completed') {
      // Completed = all questions answered but not yet submitted (Draft status)
      return allSubmissions.filter(s => {
        if (s.submissionStatus !== SUBMISSION_STATUS.DRAFT) return false;
        
        // Get all questions for this assessment year
        const year = getAssessmentYearById(s.assessmentYearId);
        if (!year) return false;
        
        const dimensions = getDimensionsByYear(s.assessmentYearId);
        const allSubQuestions = [];
        
        dimensions.forEach(dim => {
          const indicators = getIndicatorsByDimension(dim.dimensionId);
          indicators.forEach(ind => {
            const subQuestions = getSubQuestionsByIndicator(ind.indicatorId);
            allSubQuestions.push(...subQuestions);
          });
        });
        
        if (allSubQuestions.length === 0) return false;
        
        // Get all responses
        const responses = getResponsesBySubmission(s.submissionId);
        const responseMap = {};
        responses.forEach(r => {
          responseMap[r.subQuestionId] = r;
        });
        
        // Check if all questions are answered
        const allAnswered = allSubQuestions.every(sq => {
          const response = responseMap[sq.subQuestionId];
          return response && response.responseValue && response.responseValue.trim() !== '';
        });
        
        return allAnswered;
      });
    }
    
    if (filterStatus === 'rejected_by_regional') {
      return allSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER);
    }
    
    if (filterStatus === 'rejected_by_central') {
      return allSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
    }
    
    if (filterStatus === 'approved') {
      return allSubmissions.filter(s => 
        s.submissionStatus === SUBMISSION_STATUS.VALIDATED || 
        s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE ||
        s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
      );
    }
    
    return allSubmissions;
  }, [allSubmissions, filterStatus]);

  const handleViewSubmission = (submissionId) => {
    router.push(`/data/submission?submissionId=${submissionId}&view=detail`);
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const getYearName = (yearId) => {
    const year = getAssessmentYearById(yearId);
    return year ? year.yearName : 'Unknown Year';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      [SUBMISSION_STATUS.DRAFT]: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' },
      [SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pending Approval' },
      [SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION]: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending Central Validation' },
      [SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER]: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Rejected by Regional Approver' },
      [SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected by Central Committee' },
      [SUBMISSION_STATUS.VALIDATED]: { bg: 'bg-green-100', text: 'text-green-800', label: 'Validated' },
      [SUBMISSION_STATUS.SCORING_COMPLETE]: { bg: 'bg-green-100', text: 'text-green-800', label: 'Scoring Complete' },
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Submissions' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed (All Answered)' },
    { value: 'rejected_by_regional', label: 'Rejected by Regional Approver' },
    { value: 'rejected_by_central', label: 'Rejected by Central Committee' },
    { value: 'approved', label: 'Approved/Validated' },
  ];

  return (
    <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor', 'Federal Data Contributor']}>
      <Layout title="My Submissions">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-gray-50 text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <a
                    href="/data/submission"
                    className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                  >
                    <span className="text-xl mr-2">←</span>
                    <span className="text-sm font-medium">Back to Data Submission</span>
                  </a>
                </div>
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  My Submissions
                </h1>
                <p className="text-mint-dark-text/70">
                  View and manage all your submissions
                </p>
              </div>

              {/* Filter Section */}
              <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-lg font-semibold text-mint-primary-blue">Filter by Status</h2>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterStatus(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          filterStatus === option.value
                            ? 'bg-mint-primary-blue text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-mint-dark-text/60 mt-4">
                  Showing {filteredSubmissions.length} of {allSubmissions.length} submissions
                </p>
              </div>

              {/* Submissions List */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h2 className="text-xl font-semibold text-mint-primary-blue mb-4">
                  {filterStatus === 'all' ? 'All Submissions' : filterOptions.find(o => o.value === filterStatus)?.label} ({filteredSubmissions.length})
                </h2>
                
                {filteredSubmissions.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-mint-dark-text/70 text-sm">No submissions found</p>
                    <p className="text-mint-dark-text/50 text-xs mt-2">
                      {filterStatus === 'all' 
                        ? 'You haven\'t created any submissions yet'
                        : `No submissions match the "${filterOptions.find(o => o.value === filterStatus)?.label}" filter`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubmissions.map((submission) => {
                      const isSelected = selectedSubmission?.submissionId === submission.submissionId;
                      
                      return (
                        <div
                          key={submission.submissionId}
                          onClick={() => handleViewSubmission(submission.submissionId)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                              : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-mint-dark-text mb-2">
                                {submission.submissionName || `Submission #${submission.submissionId}`}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-mint-dark-text/70 mb-2">
                                <span>
                                  <strong>Year:</strong> {getYearName(submission.assessmentYearId)}
                                </span>
                                <span>
                                  <strong>Unit:</strong> {getUnitName(submission.unitId)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                {getStatusBadge(submission.submissionStatus)}
                                <span className="text-xs text-mint-dark-text/50">
                                  Updated: {formatDate(submission.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewSubmission(submission.submissionId);
                              }}
                              className="ml-4 px-4 py-2 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
