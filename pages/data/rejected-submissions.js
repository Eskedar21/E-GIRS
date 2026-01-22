import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionsByUser,
  getSubmissionById, 
  getResponsesBySubmission,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getUnitById } from '../../data/administrativeUnits';
import { getAssessmentYearById } from '../../data/assessmentFramework';
import { getSubQuestionById } from '../../data/assessmentFramework';

export default function RejectedSubmissions() {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Get all submissions for this user
    const allSubmissions = getSubmissionsByUser(user.userId);
    
    // Filter for rejected submissions
    const rejected = allSubmissions.filter(s => 
      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
    );
    
    // Sort by updated date (most recent first)
    rejected.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
    
    setSubmissions(rejected);
  }, [user]);

  const loadSubmissionDetails = (submissionId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      setSelectedSubmission(submission);
      const responses = getResponsesBySubmission(submissionId);
      setSubmissionDetails({
        submission,
        responses
      });
    }
  };

  const handleEditSubmission = (submissionId) => {
    // Navigate to data submission page with the submission ID
    router.push(`/data/submission?submissionId=${submissionId}`);
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const getYearName = (yearId) => {
    const year = getAssessmentYearById(yearId);
    return year ? year.yearName : 'Unknown Year';
  };

  const getRejectedResponses = (responses, rejectionType) => {
    if (rejectionType === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER) {
      return responses.filter(r => r.regionalApprovalStatus === 'Rejected' && r.regionalRejectionReason);
    } else if (rejectionType === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) {
      return responses.filter(r => r.validationStatus === 'Rejected' && r.centralRejectionReason);
    }
    return [];
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

  return (
    <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
      <Layout title="Rejected Submissions">
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
                  Rejected Submissions
                </h1>
                <p className="text-mint-dark-text/70">
                  Review and fix issues with your rejected submissions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                    <h2 className="text-xl font-semibold text-mint-primary-blue mb-4">
                      Rejected Submissions ({submissions.length})
                    </h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {submissions.length === 0 ? (
                        <div className="text-center py-8">
                          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-mint-dark-text/70 text-sm">No rejected submissions</p>
                          <p className="text-mint-dark-text/50 text-xs mt-2">All your submissions are in good standing</p>
                        </div>
                      ) : (
                        submissions.map((submission) => {
                          const isRejectedByInitial = submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER;
                          const isRejectedByCentral = submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
                          
                          return (
                            <div
                              key={submission.submissionId}
                              onClick={() => loadSubmissionDetails(submission.submissionId)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedSubmission?.submissionId === submission.submissionId
                                  ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                                  : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                              }`}
                            >
                              <h3 className="font-semibold text-mint-dark-text mb-1">
                                {submission.submissionName || `Submission #${submission.submissionId}`}
                              </h3>
                              <p className="text-xs text-mint-dark-text/70 mb-2">
                                {getYearName(submission.assessmentYearId)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  isRejectedByInitial
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isRejectedByInitial ? 'Rejected by Approver' : 'Rejected by Central Committee'}
                                </span>
                                <span className="text-xs text-mint-dark-text/50">
                                  {formatDate(submission.updatedAt)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="lg:col-span-2">
                  {submissionDetails ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-mint-primary-blue mb-2">
                          {submissionDetails.submission.submissionName || `Submission #${submissionDetails.submission.submissionId}`}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm text-mint-dark-text/70">
                          <span>
                            <strong>Year:</strong> {getYearName(submissionDetails.submission.assessmentYearId)}
                          </span>
                          <span>
                            <strong>Unit:</strong> {getUnitName(submissionDetails.submission.unitId)}
                          </span>
                          <span>
                            <strong>Status:</strong> {submissionDetails.submission.submissionStatus}
                          </span>
                        </div>
                        <p className="text-xs text-mint-dark-text/50 mt-2">
                          Rejected on: {formatDate(submissionDetails.submission.updatedAt)}
                        </p>
                      </div>

                      {/* Rejection Reasons */}
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-3">
                          {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER
                            ? 'Regional Approver Rejection Reasons:'
                            : 'Central Committee Rejection Reasons:'}
                        </h3>
                        
                        {submissionDetails.submission.rejectionReason && (
                          <div className="mb-4 p-3 bg-white border border-red-200 rounded">
                            <p className="text-sm text-red-700 whitespace-pre-line">
                              {submissionDetails.submission.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          {getRejectedResponses(
                            submissionDetails.responses,
                            submissionDetails.submission.submissionStatus
                          ).map((response) => {
                            const subQuestion = getSubQuestionById(response.subQuestionId);
                            const rejectionReason = submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER
                              ? response.regionalRejectionReason
                              : response.centralRejectionReason;
                            
                            return (
                              <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded">
                                <p className="text-sm font-semibold text-red-800 mb-1">
                                  {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                </p>
                                <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mb-6">
                        <button
                          onClick={() => handleEditSubmission(submissionDetails.submission.submissionId)}
                          className="w-full px-4 py-3 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg"
                        >
                          <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit & Fix Submission
                          </div>
                        </button>
                        <p className="text-xs text-mint-dark-text/60 mt-2 text-center">
                          Click to open the submission form and make corrections
                        </p>
                      </div>

                      {/* Current Responses Summary */}
                      <div className="mt-6 pt-6 border-t border-mint-medium-gray">
                        <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Current Submission Responses</h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                          {submissionDetails.responses.map((response) => {
                            const subQuestion = getSubQuestionById(response.subQuestionId);
                            const isRejected = submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER
                              ? response.regionalApprovalStatus === 'Rejected'
                              : response.validationStatus === 'Rejected';
                            
                            return (
                              <div 
                                key={response.responseId} 
                                className={`p-4 border rounded-lg ${
                                  isRejected ? 'border-red-200 bg-red-50' : 'border-mint-medium-gray'
                                }`}
                              >
                                <p className="font-semibold text-mint-dark-text mb-2">
                                  {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                  {isRejected && (
                                    <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                      Rejected
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-mint-dark-text/70 mb-2">
                                  <strong>Answer:</strong> {response.responseValue || 'Not answered'}
                                </p>
                                {response.evidenceLink && (
                                  <p className="text-sm">
                                    <strong>Evidence: </strong>
                                    <a 
                                      href={response.evidenceLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-mint-primary-blue hover:underline"
                                    >
                                      {response.evidenceLink}
                                    </a>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray text-center">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-mint-dark-text/70">Select a submission from the list to review rejection details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
