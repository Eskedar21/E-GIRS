import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubmissions, getSubmissionsByStatus, getSubmissionById, approveResponseByRegionalApprover, rejectResponseByRegionalApprover, submitRegionalApproval, saveResponse, SUBMISSION_STATUS, VALIDATION_STATUS } from '../../data/submissions';
import { getResponsesBySubmission } from '../../data/submissions';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess, canPerformAction } from '../../utils/permissions';
import { getSubQuestionById, getSubQuestionsByIndicator, getIndicatorById, getIndicatorsByDimension } from '../../data/assessmentFramework';
import { getDimensionsByYear, getDimensionById, getAssessmentYearById } from '../../data/assessmentFramework';
import { getUserById } from '../../data/users';

export default function ApprovalQueue() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [regionalNotes, setRegionalNotes] = useState({});
  const [showRejectModal, setShowRejectModal] = useState({});
  const [showApproveModal, setShowApproveModal] = useState({});
  const [showSubmitApprovalModal, setShowSubmitApprovalModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [openCommentSections, setOpenCommentSections] = useState({});

  useEffect(() => {
    if (!user) return;
    
    const loadSubmissions = () => {
      // Regional Approvers ONLY see submissions that have been SUBMITTED (PENDING_INITIAL_APPROVAL)
      // Draft submissions are NOT visible to approvers - approval process begins only after submission
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      setSubmissions([...pending, ...rejected]);
      
      // Reload selected submission details if it exists (without scrolling)
      if (selectedSubmission) {
        loadSubmissionDetails(selectedSubmission.submissionId, false);
      }
    };
    
    loadSubmissions();
    
    // Listen for real-time updates from contributors
    const handleSubmissionUpdate = (event) => {
      loadSubmissions();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('submissionUpdated', handleSubmissionUpdate);
      // Also poll for updates every 2 seconds as backup
      const interval = setInterval(loadSubmissions, 2000);
      
      return () => {
        window.removeEventListener('submissionUpdated', handleSubmissionUpdate);
        clearInterval(interval);
      };
    }
  }, [successMessage, user, selectedSubmission]);

  const loadSubmissionDetails = (submissionId, shouldScroll = false) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      setSelectedSubmission(submission);
      const responses = getResponsesBySubmission(submissionId);
      
      // Get the unit to determine its type (same filtering as contributors)
      const unit = getUnitById(submission.unitId);
      const unitType = unit ? unit.unitType : null;
      
      // Map unit type to applicable unit types (same as data submission page)
      // Federal Institute and City Administration use Region indicators, Sub-city uses Woreda indicators
      const getApplicableUnitTypes = (ut) => {
        if (!ut) return [];
        if (ut === 'Federal Institute') return ['Region'];
        if (ut === 'City Administration') return ['Region'];
        if (ut === 'Sub-city') return ['Woreda'];
        return [ut];
      };
      const applicableUnitTypes = getApplicableUnitTypes(unitType);
      
      // Get assessment framework data
      const assessmentYear = getAssessmentYearById(submission.assessmentYearId);
      const dimensions = assessmentYear ? getDimensionsByYear(submission.assessmentYearId) : [];
      
      // Group responses by dimension and indicator - using SAME filtering as contributors
      const groupedData = dimensions.map(dimension => {
        const indicators = getIndicatorsByDimension(dimension.dimensionId);
        // Filter indicators by applicable unit type (same as contributors see)
        const applicableIndicators = indicators.filter(ind => 
          !unitType || applicableUnitTypes.includes(ind.applicableUnitType)
        );
        return {
          dimension,
          indicators: applicableIndicators.map(indicator => {
            const subQuestions = getSubQuestionsByIndicator(indicator.indicatorId);
            // Show ALL questions (same as contributors see), not just those with answers
            return {
              indicator,
              subQuestions: subQuestions.map(sq => {
                const response = responses.find(r => r.subQuestionId === sq.subQuestionId);
                // Show ALL questions (same as contributors see), even if they don't have answers yet
                return {
                  subQuestion: sq,
                  response: response || null
                };
              })
            };
          }).filter(ind => ind.subQuestions.length > 0) // Only show indicators that have sub-questions
        };
      }).filter(dim => dim.indicators.length > 0); // Only show dimensions that have indicators
      
      setSubmissionDetails({
        submission,
        responses,
        groupedData
      });
      
      // Only scroll if explicitly requested (e.g., when user clicks "Review & Approve")
      if (shouldScroll) {
        setTimeout(() => {
          const detailsSection = document.querySelector('[data-submission-details]');
          if (detailsSection) {
            detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 200);
      }
    }
  };

  const handleApproveResponse = (responseId) => {
    if (!user) return;
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to approve submissions.');
      return;
    }
    
    const note = regionalNotes[responseId] || '';
    approveResponseByRegionalApprover(responseId, user.userId, note);
    
    // Refresh submission details
    if (selectedSubmission) {
      loadSubmissionDetails(selectedSubmission.submissionId);
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      setSubmissions([...pending, ...rejected]);
    }
    
    // Close modal
    setShowApproveModal(prev => ({ ...prev, [responseId]: false }));
    
    setSuccessMessage('✅ Response approved successfully! Continue reviewing remaining responses, then click "Submit Approval" when done.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleRejectResponse = (responseId) => {
    if (!user) return;
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to reject submissions.');
      return;
    }
    
    const reason = rejectionReasons[responseId];
    if (!reason || !reason.trim()) {
      alert('Please provide a rejection reason. This is required when rejecting a response.');
      return;
    }
    
    // Also save the comment if provided
    const note = regionalNotes[responseId] || '';
    rejectResponseByRegionalApprover(responseId, user.userId, reason);
    if (note) {
      approveResponseByRegionalApprover(responseId, user.userId, note);
    }
    
    // Clear the comment field after saving
    setRegionalNotes(prev => ({ ...prev, [responseId]: '' }));
    
    // Refresh submission details
    if (selectedSubmission) {
      loadSubmissionDetails(selectedSubmission.submissionId);
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      setSubmissions([...pending, ...rejected]);
    }
    
    // Close modal
    setShowRejectModal(prev => ({ ...prev, [responseId]: false }));
    
    setSuccessMessage('⚠️ Response rejected. Continue reviewing remaining responses, then click "Submit Approval" when done.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleSaveComment = (responseId) => {
    if (!user) return;
    
    const note = regionalNotes[responseId] || '';
    if (!note.trim()) {
      return; // Don't save empty comments
    }
    
    // Update the response with the comment without changing approval status
    const response = submissionDetails?.responses.find(r => r.responseId === responseId);
    if (response) {
      // Directly update the note without changing approval status
      response.regionalNote = note;
      response.updatedAt = new Date().toISOString();
      
      // Clear the comment field after saving
      setRegionalNotes(prev => ({ ...prev, [responseId]: '' }));
      
      // Refresh submission details
      if (selectedSubmission) {
        loadSubmissionDetails(selectedSubmission.submissionId);
      }
      setSuccessMessage('💬 Comment saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const handleSubmitApproval = () => {
    if (!user || !selectedSubmission) return;
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to submit approvals.');
      return;
    }
    
    try {
      const result = submitRegionalApproval(selectedSubmission.submissionId, user.userId);
      
      if (result) {
        // Refresh submission details
        loadSubmissionDetails(selectedSubmission.submissionId);
        const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
        const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
        setSubmissions([...pending, ...rejected]);
        
        // Dispatch event for real-time update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('submissionUpdated', { detail: { submissionId: selectedSubmission.submissionId } }));
        }
        
        if (result.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
          setSuccessMessage('✅ Approval submitted successfully! The submission has been sent to the Central Committee for final validation.');
        } else {
          setSuccessMessage('⚠️ Approval submitted. The submission has been sent back to the Data Contributor with rejection reasons.');
        }
        setTimeout(() => setSuccessMessage(''), 8000);
      }
    } catch (error) {
      alert(error.message || 'Error submitting approval. Please try again.');
    }
  };

  // Note: Rejected submissions from Central Committee go directly back to contributors
  // Regional approvers only handle PENDING_INITIAL_APPROVAL submissions

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  // Calculate total questions for a submission
  const getTotalQuestions = (submissionId) => {
    const responses = getResponsesBySubmission(submissionId);
    return responses.filter(r => r.responseValue && r.responseValue.trim() !== '').length;
  };

  // Check if all questions are reviewed
  const allQuestionsReviewed = () => {
    if (!submissionDetails || !submissionDetails.groupedData) return false;
    
    // Get all questions that have answers (only these need to be reviewed)
    const questionsWithAnswers = submissionDetails.responses.filter(r => 
      r.responseValue && r.responseValue.trim() !== ''
    );
    
    if (questionsWithAnswers.length === 0) return false;
    
    // Check if all questions with answers have been reviewed (approved or rejected)
    return questionsWithAnswers.every(r => 
      r.regionalApprovalStatus !== null && 
      r.regionalApprovalStatus !== undefined &&
      (r.regionalApprovalStatus === VALIDATION_STATUS.APPROVED || 
       r.regionalApprovalStatus === VALIDATION_STATUS.REJECTED)
    );
  };
  
  // Calculate global question numbers across all dimensions and indicators
  const questionNumberMap = useMemo(() => {
    if (!submissionDetails || !submissionDetails.groupedData) return {};
    
    const map = {};
    let questionNumber = 1;
    
    submissionDetails.groupedData.forEach(({ indicators: dimIndicators }) => {
      dimIndicators.forEach(({ subQuestions }) => {
        subQuestions.forEach(({ subQuestion }) => {
          map[subQuestion.subQuestionId] = questionNumber;
          questionNumber++;
        });
      });
    });
    
    return map;
  }, [submissionDetails]);

  // Get review statistics
  const getReviewStats = () => {
    if (!submissionDetails || !submissionDetails.responses) {
      return { total: 0, reviewed: 0, approved: 0, rejected: 0, pending: 0 };
    }
    
    const questionsWithAnswers = submissionDetails.responses.filter(r => 
      r.responseValue && r.responseValue.trim() !== ''
    );
    
    const reviewed = questionsWithAnswers.filter(r => 
      r.regionalApprovalStatus !== null && r.regionalApprovalStatus !== undefined
    );
    
    const approved = reviewed.filter(r => r.regionalApprovalStatus === VALIDATION_STATUS.APPROVED);
    const rejected = reviewed.filter(r => r.regionalApprovalStatus === VALIDATION_STATUS.REJECTED);
    const pending = questionsWithAnswers.length - reviewed.length;
    
    return {
      total: questionsWithAnswers.length,
      reviewed: reviewed.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: pending
    };
  };

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
      <Layout title="Approval Queue">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
          <div className="w-full">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    Approval Queue
                  </h1>
                  <p className="text-mint-dark-text/70">Review and approve data submissions from units in your scope</p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href="/approval/rejected-submissions"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                  >
                    View Rejected Submissions
                  </a>
                  <a
                    href="/approval/validated-submissions"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                  >
                    View Validated Submissions
                  </a>
                </div>
              </div>
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
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-mint-primary-blue mb-2">
                      Submissions in Your Scope ({submissions.length})
                    </h2>
                    <p className="text-xs text-mint-dark-text/70">
                      Review and approve submissions from units in your scope
                    </p>
                  </div>
                  <div className="space-y-2">
                    {submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-mint-dark-text/70 text-sm mb-2">No submissions pending approval</p>
                        <p className="text-xs text-mint-dark-text/50">
                          Submissions from units in your scope will appear here
                        </p>
                      </div>
                    ) : (
                      submissions.map((submission) => {
                        const isRejected = submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
                        const isPending = submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL;
                        return (
                          <div
                            key={submission.submissionId}
                            onClick={() => {
                              if (submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL || 
                                  submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) {
                                router.push(`/approval/evaluate/${submission.submissionId}`);
                              }
                            }}
                            className={`p-4 border rounded-lg transition-all ${
                              selectedSubmission?.submissionId === submission.submissionId
                                ? 'border-mint-primary-blue bg-mint-primary-blue/5'
                                : 'border-mint-medium-gray hover:border-mint-primary-blue hover:bg-mint-light-gray'
                            } ${(submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL || 
                                 submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) ? 'cursor-pointer' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="font-semibold text-mint-dark-text">
                                  {submission.submissionName || getUnitName(submission.unitId)}
                                </h3>
                                {submission.submissionName && (
                                  <p className="text-xs text-mint-dark-text/60 mt-1">
                                    {getUnitName(submission.unitId)}
                                  </p>
                                )}
                              </div>
                              {isPending && (
                                <span className="ml-2 text-xs">⚠️</span>
                              )}
                            </div>
                            <p className="text-xs text-mint-dark-text/70 mb-2">
                              ID: {submission.submissionId} | Questions: {getTotalQuestions(submission.submissionId)}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                isRejected
                                  ? 'bg-red-100 text-red-800'
                                  : isPending
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-[#0d6670]/10 text-[#0d6670]'
                              }`}>
                                {submission.submissionStatus}
                              </span>
                              {submission.submittedDate && (
                                <span className="text-xs text-mint-dark-text/50">
                                  {new Date(submission.submittedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {isPending && (
                              <div className="mt-2 flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to dedicated evaluation page
                                    router.push(`/approval/evaluate/${submission.submissionId}`);
                                  }}
                                  className="flex-1 px-3 py-1.5 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white text-xs font-semibold rounded transition-colors shadow-sm"
                                >
                                  Review & Approve
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="lg:col-span-2" data-submission-details>
                {submissionDetails ? (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <h2 className="text-2xl font-semibold text-mint-primary-blue">
                              {submissionDetails.submission.submissionName || getUnitName(submissionDetails.submission.unitId)}
                            </h2>
                            {submissionDetails.submission.submissionName && (
                              <p className="text-sm text-mint-dark-text/60 mt-1">
                                {getUnitName(submissionDetails.submission.unitId)}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded animate-pulse">
                            🔄 Real-time
                          </span>
                        </div>
                        <p className="text-sm text-mint-dark-text/70">
                          Submission ID: {submissionDetails.submission.submissionId} | 
                          Questions: {submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '').length} |
                          Status: {submissionDetails.submission.submissionStatus} |
                          Last Updated: {submissionDetails.submission.updatedAt ? new Date(submissionDetails.submission.updatedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {submissionDetails.submission.rejectionReason && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h3 className="font-semibold text-yellow-800 mb-2">Rejection Reason:</h3>
                        <p className="text-sm text-yellow-700 whitespace-pre-line">{submissionDetails.submission.rejectionReason}</p>
                      </div>
                    )}

                    {/* Central Committee Rejection Reasons */}
                    {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-3">Central Committee Rejection Reasons:</h3>
                        <div className="space-y-3">
                          {submissionDetails.responses
                            .filter(r => r.validationStatus === 'Rejected' && r.centralRejectionReason)
                            .map((response) => {
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
                    )}

                    {/* Submission Summary */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Total Questions</p>
                          <p className="text-lg font-bold text-mint-primary-blue">
                            {submissionDetails.responses.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Answered</p>
                          <p className="text-lg font-bold text-green-600">
                            {submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">With Evidence</p>
                          <p className="text-lg font-bold text-mint-primary-blue">
                            {submissionDetails.responses.filter(r => r.evidenceLink).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Submitted Date</p>
                          <p className="text-sm font-semibold text-mint-dark-text">
                            {submissionDetails.submission.submittedDate 
                              ? new Date(submissionDetails.submission.submittedDate).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-mint-primary-blue">Review & Approve Submitted Answers</h3>
                          <p className="text-sm text-mint-dark-text/70 mt-1">
                            Review each question and answer below. Click "Approve" or "Reject" for each answer. After reviewing all questions, click "Submit Regional Approval" at the bottom.
                          </p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          📄 Print / Export PDF
                        </button>
                      </div>
                      {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 ? (
                        <div className="space-y-6">
                          {(() => {
                            // Check if submission is submitted (defined at this level for use throughout)
                            const isSubmitted = submissionDetails?.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
                                                submissionDetails?.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
                            return submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }, dimIdx) => (
                            <div key={dimension.dimensionId} className="bg-white rounded-xl p-6 border-2 border-mint-medium-gray shadow-sm">
                              <div className="mb-6 pb-4 border-b-2 border-mint-primary-blue">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl font-bold text-mint-primary-blue">{dimIdx + 1}</span>
                                  <div>
                                    <h4 className="text-xl font-bold text-mint-primary-blue">
                                      {dimension.dimensionName}
                                    </h4>
                                    <p className="text-sm text-mint-dark-text/70 mt-1">
                                      Dimension Weight: {dimension.dimensionWeight}%
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {dimIndicators.map(({ indicator, subQuestions: indicatorSubQuestions }, indIdx) => (
                                <div key={indicator.indicatorId} className="mb-8 pb-8 border-b border-mint-medium-gray last:border-b-0 last:mb-0 last:pb-0">
                                  <div className="mb-4 p-3 bg-mint-light-gray rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm font-bold text-mint-primary-blue">
                                        {dimIdx + 1}.{indIdx + 1}
                                      </span>
                                      <h5 className="text-lg font-semibold text-mint-dark-text">
                                        {indicator.indicatorName}
                                      </h5>
                                    </div>
                                    <p className="text-sm text-mint-dark-text/70">
                                      Indicator Weight: {indicator.indicatorWeight}%
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    {indicatorSubQuestions.map(({ subQuestion, response }, sqIdx) => {
                                      const globalQuestionNumber = questionNumberMap[subQuestion.subQuestionId] || 0;
                                      const hasAnswer = response && response.responseValue && response.responseValue.trim() !== '';
                                      const approvalStatus = response?.regionalApprovalStatus;
                                      // Only show approval actions for SUBMITTED submissions (not drafts)
                                      const isSubmitted = submissionDetails?.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
                                                          submissionDetails?.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
                                      return (
                                        <div 
                                          key={subQuestion.subQuestionId} 
                                          className="p-6 rounded-lg border-2 border-gray-200 bg-white transition-all shadow-md mb-6"
                                        >
                                          {/* Question Header */}
                                          <div className="mb-5 pb-4 border-b-2 border-mint-medium-gray">
                                            <div className="flex items-start space-x-3">
                                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-mint-primary-blue text-white flex items-center justify-center font-bold text-lg">
                                                {globalQuestionNumber}
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-3">
                                                  <p className="text-lg font-bold text-mint-dark-text">
                                                    Question {globalQuestionNumber}: {subQuestion.subQuestionText}
                                                  </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-mint-dark-text/60">
                                                  <span className="px-2 py-1 bg-white rounded border border-mint-medium-gray">
                                                    Type: {subQuestion.responseType}
                                                  </span>
                                                  <span className="px-2 py-1 bg-white rounded border border-mint-medium-gray">
                                                    Weight: {subQuestion.subWeightPercentage}%
                                                  </span>
                                                  {hasAnswer && (
                                                    <span className="px-2 py-1 bg-[#0d6670]/10 text-[#0d6670] rounded font-semibold">
                                                      ✓ Answered
                                                    </span>
                                                  )}
                                                  {approvalStatus === VALIDATION_STATUS.APPROVED && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                                                      ✓ Approved
                                                    </span>
                                                  )}
                                                  {approvalStatus === VALIDATION_STATUS.REJECTED && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded font-semibold">
                                                      ✗ Rejected
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Answer Section - Always show submitted answers */}
                                          {response && hasAnswer ? (
                                            <div className="space-y-3">
                                              {/* Answer Display - Clean form style */}
                                              <div className="bg-white p-4 rounded-lg border border-gray-300">
                                                <div className="flex items-start justify-between mb-2">
                                                  <label className="block text-sm font-semibold text-gray-700">
                                                    Answer
                                                  </label>
                                                  {/* Comment Button */}
                                                  <button
                                                    onClick={() => setOpenCommentSections(prev => ({ 
                                                      ...prev, 
                                                      [response.responseId]: !prev[response.responseId] 
                                                    }))}
                                                    className="flex items-center space-x-1 text-gray-600 hover:text-mint-primary-blue transition-colors"
                                                    title="Add comment"
                                                  >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    <span className="text-xs">+</span>
                                                  </button>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                                  <p className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed text-sm">
                                                    {response.responseValue}
                                                  </p>
                                                </div>
                                              </div>
                                              
                                              {response.evidenceLink && (
                                                <div className="bg-white p-4 rounded-lg border border-gray-300">
                                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Evidence Link
                                                  </label>
                                                  <a
                                                    href={response.evidenceLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-mint-primary-blue hover:underline break-all inline-flex items-center space-x-2"
                                                  >
                                                    <span>{response.evidenceLink}</span>
                                                    <span className="text-xs">↗</span>
                                                  </a>
                                                </div>
                                              )}
                                              
                                              {/* Comments Section - Always show existing comments, toggle input */}
                                              {isSubmitted && hasAnswer && (
                                                <div className="mt-3 bg-gray-50 rounded-lg border border-gray-300 p-4">
                                                  <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-3">
                                                      <h4 className="text-sm font-bold text-gray-900">Comments</h4>
                                                      <button
                                                        onClick={() => setOpenCommentSections(prev => ({ 
                                                          ...prev, 
                                                          [response.responseId]: !prev[response.responseId] 
                                                        }))}
                                                        className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors text-xs"
                                                      >
                                                        Add Comment
                                                      </button>
                                                    </div>
                                                    
                                                    {/* Existing Comments - Always visible */}
                                                    {response.regionalNote && (
                                                      <div className="mb-4 bg-white rounded-lg border border-gray-300 p-3">
                                                        <div className="flex items-start space-x-2 mb-2">
                                                          <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                          </svg>
                                                          <div className="flex-1">
                                                            <div className="flex items-start justify-between mb-1">
                                                              <span className="text-xs font-semibold text-gray-900">
                                                                {(() => {
                                                                  const approverId = submissionDetails?.submission?.approverUserId;
                                                                  if (approverId) {
                                                                    const approver = getUserById(approverId);
                                                                    if (approver) {
                                                                      return `${approver.fullName} (${approver.role})`;
                                                                    }
                                                                  }
                                                                  if (user) {
                                                                    return `${user.fullName || user.username} (${user.role})`;
                                                                  }
                                                                  return 'Regional Approver';
                                                                })()}
                                                              </span>
                                                              <span className="text-xs text-gray-500 ml-2">
                                                                {formatDate(response.updatedAt)}
                                                              </span>
                                                            </div>
                                                            <p className="text-xs text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                                              {response.regionalNote}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    
                                                    {/* Comment Input - Toggleable */}
                                                    {openCommentSections[response.responseId] && (
                                                      <div className="space-y-2">
                                                        <textarea
                                                          value={regionalNotes[response.responseId] || ''}
                                                          onChange={(e) => setRegionalNotes(prev => ({ ...prev, [response.responseId]: e.target.value }))}
                                                          rows="3"
                                                          className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue resize-none"
                                                          placeholder="Add your comment here..."
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                          <button
                                                            onClick={() => setOpenCommentSections(prev => ({ ...prev, [response.responseId]: false }))}
                                                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-xs"
                                                          >
                                                            Cancel
                                                          </button>
                                                          <button
                                                            onClick={() => {
                                                              handleSaveComment(response.responseId);
                                                              setOpenCommentSections(prev => ({ ...prev, [response.responseId]: false }));
                                                            }}
                                                            disabled={!regionalNotes[response.responseId]?.trim()}
                                                            className="px-3 py-1.5 bg-mint-primary-blue hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                                          >
                                                            Add Comment
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                              <p className="text-yellow-800 text-sm font-semibold mb-2">
                                                ⚠️ No answer provided for this question yet.
                                              </p>
                                              <p className="text-xs text-yellow-700">
                                                This question should be answered by the Data Contributor. If the submission was already submitted, please contact the contributor to complete this question.
                                              </p>
                                              {/* Show action for unanswered questions */}
                                              {isSubmitted && (
                                                <div className="mt-4 pt-4 border-t-2 border-yellow-300 bg-yellow-100 rounded-lg p-4">
                                                  <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-sm font-bold text-mint-dark-text">Status:</span>
                                                      <span className="text-sm text-yellow-800 font-semibold bg-yellow-200 px-3 py-1 rounded border border-yellow-400">⏳ No Answer - Cannot Review</span>
                                                    </div>
                                                  </div>
                                                  <p className="text-xs text-yellow-800 mb-3">
                                                    This question must be answered before it can be reviewed. The submission cannot proceed to Central Committee until all questions are answered.
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ));
                          })()}
                        </div>
                      ) : null}
                      
                      {/* Application Status and Action Buttons */}
                      {submissionDetails && submissionDetails.submission && 
                       (submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
                        submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-300 p-6">
                          <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-bold text-gray-900">Application Status</h4>
                              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${
                                submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL && (
                                  <>
                                    <span>⏳</span>
                                    <span>Pending</span>
                                  </>
                                )}
                                {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER && (
                                  <>
                                    <span>✗</span>
                                    <span>Rejected</span>
                                  </>
                                )}
                                {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION && (
                                  <>
                                    <span>✓</span>
                                    <span>Approved</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <p><span className="font-semibold">Submission Date:</span> {submissionDetails.submission.submittedDate ? formatDate(submissionDetails.submission.submittedDate) : 'N/A'}</p>
                              {submissionDetails.submission.approvalDate && (
                                <p><span className="font-semibold">Reviewed Date:</span> {formatDate(submissionDetails.submission.approvalDate)}</p>
                              )}
                              {submissionDetails.submission.approverUserId && (
                                <p><span className="font-semibold">Reviewer:</span> {(() => {
                                  const approver = getUserById(submissionDetails.submission.approverUserId);
                                  return approver ? `${approver.fullName} (${approver.role})` : 'Regional Approver';
                                })()}</p>
                              )}
                            </div>
                            <p className="mt-4 text-sm text-gray-700 font-medium">Review and take necessary action.</p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => router.push(`/approval/evaluate/${submissionDetails.submission.submissionId}`)}
                              className="flex-1 px-6 py-3 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-semibold rounded-lg transition-colors"
                            >
                              Review & Approve
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {submissionDetails && submissionDetails.responses.length > 0 && !submissionDetails.groupedData && (
                        <div className="space-y-4">
                          {submissionDetails.responses.map((response, idx) => {
                            const subQuestion = getSubQuestionById(response.subQuestionId);
                            return (
                              <div key={response.responseId} className="p-5 bg-white border-2 border-mint-medium-gray rounded-lg">
                                <div className="mb-3">
                                  <span className="text-sm font-bold text-mint-primary-blue mr-2">Q{idx + 1}:</span>
                                  <p className="font-semibold text-mint-dark-text inline">
                                    {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                  </p>
                                </div>
                                <div className="bg-mint-light-gray p-3 rounded border border-mint-medium-gray mb-2">
                                  <p className="text-sm font-semibold text-mint-dark-text mb-1">Answer:</p>
                                  <p className="text-mint-dark-text">{response.responseValue}</p>
                                </div>
                                {response.evidenceLink && (
                                  <div className="mt-2">
                                    <span className="text-sm font-semibold text-mint-dark-text">Evidence: </span>
                                    <a
                                      href={response.evidenceLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-mint-primary-blue hover:underline break-all"
                                    >
                                      {response.evidenceLink}
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {submissionDetails && submissionDetails.responses.length === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                          <p className="text-mint-dark-text/70">No responses found for this submission.</p>
                        </div>
                      )}
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

      {/* Approve Modal */}
      {Object.keys(showApproveModal).map(responseId => {
        if (!showApproveModal[responseId]) return null;
        const response = submissionDetails?.responses.find(r => r.responseId === parseInt(responseId));
        return (
          <div key={responseId} className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowApproveModal(prev => ({ ...prev, [responseId]: false }))}
            ></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Approve Response</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base leading-relaxed text-gray-700 mb-4">
                  Approve this response? Once all responses are approved, the submission will be sent to the Central Committee for final validation.
                </p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={regionalNotes[responseId] || ''}
                  onChange={(e) => setRegionalNotes(prev => ({ ...prev, [responseId]: e.target.value }))}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670]"
                  placeholder="Add any notes about this approval..."
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowApproveModal(prev => ({ ...prev, [responseId]: false }))}
                  className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveResponse(parseInt(responseId))}
                  className="px-5 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Reject Modal - For Submission Level */}
      {showRejectModal['submission'] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowRejectModal(prev => ({ ...prev, ['submission']: false }))}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reject Submission</h3>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-base leading-relaxed text-gray-700 mb-4">
                Rejecting this submission will send it back to the Data Contributor for revision.
              </p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReasons['submission'] || ''}
                onChange={(e) => setRejectionReasons(prev => ({ ...prev, ['submission']: e.target.value }))}
                rows="4"
                className="w-full p-3 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter detailed feedback for the Data Contributor..."
                required
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(prev => ({ ...prev, ['submission']: false }))}
                className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const reason = rejectionReasons['submission'];
                  if (!reason || !reason.trim()) {
                    alert('Please provide a rejection reason.');
                    return;
                  }
                  
                  // Reject all answered questions
                  const answeredResponses = submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '');
                  answeredResponses.forEach(response => {
                    rejectResponseByRegionalApprover(response.responseId, user.userId, reason);
                  });
                  
                  // Submit rejection
                  handleSubmitApproval();
                  
                  setShowRejectModal(prev => ({ ...prev, ['submission']: false }));
                  setRejectionReasons(prev => ({ ...prev, ['submission']: '' }));
                }}
                disabled={!rejectionReasons['submission']?.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Approval Modal */}
      {showSubmitApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSubmitApprovalModal(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-mint-primary-blue flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submit Regional Approval</h3>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-base leading-relaxed text-gray-700 mb-4">
                You are about to submit your approval decision for this submission. Once submitted:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-2">
                <li>If all questions are approved, the submission will be sent to the Central Committee</li>
                <li>If any questions are rejected, the submission will be sent back to the Data Contributor</li>
                <li>This action cannot be undone</li>
              </ul>
              {submissionDetails && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Review Summary:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Total Questions: {submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '').length}</p>
                    <p>Approved: {submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '' && r.regionalApprovalStatus === VALIDATION_STATUS.APPROVED).length}</p>
                    <p>Rejected: {submissionDetails.responses.filter(r => r.responseValue && r.responseValue.trim() !== '' && r.regionalApprovalStatus === VALIDATION_STATUS.REJECTED).length}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitApprovalModal(false)}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitApprovalModal(false);
                  handleSubmitApproval();
                }}
                className="px-5 py-2.5 bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-semibold rounded-lg transition-colors"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </ProtectedRoute>
  );
}

