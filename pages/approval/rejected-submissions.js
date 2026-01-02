import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionsByStatus, 
  getSubmissionById, 
  getResponsesBySubmission,
  resubmitToCentralCommittee,
  rejectToContributor,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess, canPerformAction } from '../../utils/permissions';
import { getSubQuestionById } from '../../data/assessmentFramework';

export default function RejectedSubmissions() {
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [additionalComment, setAdditionalComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const allUnits = getAllUnits();
    // Load submissions rejected by central committee
    const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
    // Filter based on user's access scope
    const filtered = filterSubmissionsByAccess(rejected, user, allUnits);
    setSubmissions(filtered);
  }, [successMessage, user]);

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

  const handleEditAndResubmit = (submissionId) => {
    if (!user) return;
    
    const submission = getSubmissionById(submissionId);
    if (!submission) return;
    
    // Check if user can approve (resubmit) this submission
    if (!canPerformAction(user, 'approve_submission', submission)) {
      alert('You do not have permission to resubmit this submission.');
      return;
    }
    
    // Navigate to edit page with submission ID
    window.location.href = `/approval/edit/${submissionId}`;
  };

  const handleRejectToContributor = (submissionId) => {
    if (!user) return;
    
    if (!additionalComment.trim()) {
      alert('Please provide additional comments');
      return;
    }
    
    const submission = getSubmissionById(submissionId);
    if (!submission) return;
    
    // Check if user can approve (reject) this submission
    if (!canPerformAction(user, 'approve_submission', submission)) {
      alert('You do not have permission to reject this submission.');
      return;
    }
    
    if (confirm('Send this submission back to the Data Contributor?')) {
      rejectToContributor(submissionId, additionalComment);
      const allUnits = getAllUnits();
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      const filtered = filterSubmissionsByAccess(rejected, user, allUnits);
      setSubmissions(filtered);
      setSelectedSubmission(null);
      setSubmissionDetails(null);
      setAdditionalComment('');
      setShowRejectForm(false);
      setSuccessMessage('Submission sent back to Data Contributor!');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const getRejectedResponses = (responses) => {
    return responses.filter(r => r.validationStatus === 'Rejected');
  };

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
      <Layout title="Rejected Submissions">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="w-full">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <a
                  href="/approval/queue"
                  className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                >
                  <span className="text-xl mr-2">←</span>
                  <span className="text-sm font-medium">Back to Approval Queue</span>
                </a>
              </div>
              <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                Rejected Submissions
              </h1>
              <p className="text-mint-dark-text/70">Manage submissions rejected by the Central Committee</p>
            </div>

            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Submissions List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h2 className="text-xl font-semibold text-mint-primary-blue mb-4">
                    Rejected by Central Committee ({submissions.length})
                  </h2>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {submissions.length === 0 ? (
                      <p className="text-mint-dark-text/70 text-sm">No rejected submissions</p>
                    ) : (
                      submissions.map((submission) => (
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
                            {getUnitName(submission.unitId)}
                          </h3>
                          <p className="text-xs text-mint-dark-text/70">
                            Submission ID: {submission.submissionId}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                            Rejected
                          </span>
                        </div>
                      ))
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
                        {getUnitName(submissionDetails.submission.unitId)}
                      </h2>
                      <p className="text-sm text-mint-dark-text/70">
                        Submission ID: {submissionDetails.submission.submissionId} | 
                        Status: {submissionDetails.submission.submissionStatus}
                      </p>
                    </div>

                    {/* Central Committee Rejection Reasons */}
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-semibold text-red-800 mb-3">Central Committee Rejection Reasons:</h3>
                      <div className="space-y-3">
                        {getRejectedResponses(submissionDetails.responses).map((response) => {
                          const subQuestion = getSubQuestionById(response.subQuestionId);
                          return (
                            <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded">
                              <p className="text-sm font-semibold text-red-800 mb-1">
                                {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                              </p>
                              <p className="text-sm text-red-700">{response.centralRejectionReason}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <button
                        onClick={() => handleEditAndResubmit(submissionDetails.submission.submissionId)}
                        className="w-full px-4 py-3 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold rounded-lg transition-colors"
                      >
                        Edit and Resubmit to Central Committee
                      </button>

                      <button
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        className="w-full px-4 py-3 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        {showRejectForm ? 'Cancel' : 'Reject to Contributor'}
                      </button>

                      {showRejectForm && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                            Additional Comments <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={additionalComment}
                            onChange={(e) => setAdditionalComment(e.target.value)}
                            rows="4"
                            className="w-full p-3 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Add your comments along with the Central Committee's feedback..."
                          />
                          <button
                            onClick={() => handleRejectToContributor(submissionDetails.submission.submissionId)}
                            className="mt-3 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                          >
                            Confirm Reject to Contributor
                          </button>
                        </div>
                      )}
                    </div>

                    {/* All Responses */}
                    <div className="mt-6 pt-6 border-t border-mint-medium-gray">
                      <h3 className="text-lg font-semibold text-mint-dark-text mb-4">All Submission Responses</h3>
                      <div className="space-y-3">
                        {submissionDetails.responses.map((response) => {
                          const subQuestion = getSubQuestionById(response.subQuestionId);
                          return (
                            <div key={response.responseId} className="p-4 border border-mint-medium-gray rounded-lg">
                              <p className="font-semibold text-mint-dark-text mb-2">
                                {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                              </p>
                              <p className="text-sm text-mint-dark-text/70 mb-2">
                                Answer: {response.responseValue}
                              </p>
                              {response.evidenceLink && (
                                <p className="text-sm">
                                  <span className="font-semibold">Evidence: </span>
                                  <a href={response.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-mint-primary-blue hover:underline">
                                    {response.evidenceLink}
                                  </a>
                                </p>
                              )}
                              {response.regionalNote && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                  <p className="text-sm font-semibold text-blue-800 mb-1">
                                    Regional Approver Comment:
                                  </p>
                                  <p className="text-sm text-blue-700">{response.regionalNote}</p>
                                </div>
                              )}
                              {response.generalNote && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                  <p className="text-sm font-semibold text-green-800 mb-1">
                                    Central Committee Note:
                                  </p>
                                  <p className="text-sm text-green-700">{response.generalNote}</p>
                                </div>
                              )}
                              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                                response.validationStatus === 'Approved'
                                  ? 'bg-green-100 text-green-800'
                                  : response.validationStatus === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {response.validationStatus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray text-center">
                    <p className="text-mint-dark-text/70">Select a submission from the list to review</p>
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

