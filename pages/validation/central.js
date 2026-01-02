import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionsByStatus, 
  getSubmissionById, 
  getResponsesBySubmission,
  validateResponse,
  submitCentralValidation,
  resubmitToCentralCommittee,
  rejectToContributor,
  SUBMISSION_STATUS,
  VALIDATION_STATUS
} from '../../data/submissions';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess, canPerformAction } from '../../utils/permissions';
import { getSubQuestionById, getSubQuestionsByIndicator, getIndicatorById } from '../../data/assessmentFramework';
import { getDimensionsByYear, getDimensionById, getIndicatorsByDimension, getAssessmentYearById } from '../../data/assessmentFramework';

export default function CentralValidation() {
  const { user } = useAuth();
  const userRole = user ? user.role : '';
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [validationNotes, setValidationNotes] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    
    const loadSubmissions = () => {
      // Central Committee sees ALL submissions pending central validation (no scope restriction)
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      setSubmissions(pending);
      
      // Reload selected submission details if it exists
      if (selectedSubmission) {
        loadSubmissionDetails(selectedSubmission.submissionId);
      }
    };
    
    loadSubmissions();
    
    // Listen for real-time updates
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

  const loadSubmissionDetails = (submissionId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      setSelectedSubmission(submission);
      const responses = getResponsesBySubmission(submissionId);
      
      // Initialize validation notes and rejection reasons
      const notes = {};
      const reasons = {};
      responses.forEach(r => {
        if (r.generalNote) notes[r.responseId] = r.generalNote;
        if (r.centralRejectionReason) reasons[r.responseId] = r.centralRejectionReason;
      });
      setValidationNotes(notes);
      setRejectionReasons(reasons);
      
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
                // Only show questions that have answers (all should be answered before submission)
                if (response && response.responseValue && response.responseValue.trim() !== '') {
                  return {
                    subQuestion: sq,
                    response: response
                  };
                }
                return null;
              }).filter(item => item !== null) // Filter out unanswered questions
            };
          }).filter(ind => ind.subQuestions.length > 0)
        };
      }).filter(dim => dim.indicators.length > 0);
      
      setSubmissionDetails({
        submission,
        responses,
        groupedData
      });
    }
  };

  const handleApproveResponse = (responseId) => {
    if (!user) return;
    
    if (!canPerformAction(user, 'validate_submission')) {
      alert('You do not have permission to validate submissions.');
      return;
    }
    
    const note = validationNotes[responseId] || '';
    const response = submissionDetails?.responses.find(r => r.responseId === responseId);
    
    // Check if all responses will be approved after this
    const allResponses = submissionDetails?.responses || [];
    const willBeAllApproved = allResponses.every(r => 
      r.responseId === responseId ? true : r.validationStatus === VALIDATION_STATUS.APPROVED
    );
    
    validateResponse(responseId, VALIDATION_STATUS.APPROVED, null, note);
    
    // Refresh submission details
    if (selectedSubmission) {
      loadSubmissionDetails(selectedSubmission.submissionId);
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      setSubmissions(pending);
    }
    
    if (willBeAllApproved) {
      setSuccessMessage('✅ All responses approved! The submission has been validated and will proceed to the calculation engine.');
      setTimeout(() => setSuccessMessage(''), 7000);
    } else {
      setSuccessMessage('✅ Response approved successfully! Continue reviewing remaining responses.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleRejectResponse = (responseId) => {
    if (!user) return;
    
    if (!canPerformAction(user, 'validate_submission')) {
      alert('You do not have permission to validate submissions.');
      return;
    }
    
    const reason = rejectionReasons[responseId];
    if (!reason || !reason.trim()) {
      alert('Please provide a rejection reason. This is required when rejecting a response.');
      return;
    }
    
    const note = validationNotes[responseId] || '';
    validateResponse(responseId, VALIDATION_STATUS.REJECTED, reason, note);
    
    // Refresh submission details
    if (selectedSubmission) {
      loadSubmissionDetails(selectedSubmission.submissionId);
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      setSubmissions(pending);
    }
    
    setSuccessMessage('⚠️ Response rejected. Continue reviewing remaining responses, then click "Submit Validation" when done.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleSubmitValidation = () => {
    if (!user || !selectedSubmission) return;
    
    if (!canPerformAction(user, 'validate_submission')) {
      alert('You do not have permission to submit validations.');
      return;
    }
    
    try {
      const result = submitCentralValidation(selectedSubmission.submissionId, user.userId);
      
      if (result) {
        // Refresh submission details
        loadSubmissionDetails(selectedSubmission.submissionId);
        const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
        setSubmissions(pending);
        
        // Dispatch event for real-time update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('submissionUpdated', { detail: { submissionId: selectedSubmission.submissionId } }));
        }
        
        if (result.submissionStatus === SUBMISSION_STATUS.VALIDATED) {
          setSuccessMessage('✅ Validation submitted successfully! The submission has been validated and will proceed to the calculation engine.');
        } else {
          setSuccessMessage('⚠️ Validation submitted. The submission has been sent back to the Regional Approver with rejection reasons.');
        }
        setTimeout(() => setSuccessMessage(''), 8000);
      }
    } catch (error) {
      alert(error.message || 'Error submitting validation. Please try again.');
    }
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const getSubQuestion = (subQuestionId) => {
    return getSubQuestionById(subQuestionId);
  };

  return (
    <ProtectedRoute allowedRoles={['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)']}>
      <Layout title="Central Validation">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                Central Validation Queue
              </h1>
              <p className="text-mint-dark-text/70">Review and validate data submissions for final approval</p>
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
                    Pending Validation ({submissions.length})
                  </h2>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {submissions.length === 0 ? (
                      <p className="text-mint-dark-text/70 text-sm">No submissions pending validation</p>
                    ) : (
                      submissions.map((submission) => (
                        <div
                          key={submission.submissionId}
                          onClick={() => window.location.href = `/validation/evaluate/${submission.submissionId}`}
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/validation/evaluate/${submission.submissionId}`;
                            }}
                            className="mt-2 w-full px-3 py-1.5 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-semibold rounded-lg transition-colors text-sm"
                          >
                            Review & Validate
                          </button>
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

                    {/* Validation Progress Summary */}
                    {(() => {
                      const allResponses = submissionDetails.responses || [];
                      const totalResponses = allResponses.length;
                      const approvedCount = allResponses.filter(r => r.validationStatus === VALIDATION_STATUS.APPROVED).length;
                      const rejectedCount = allResponses.filter(r => r.validationStatus === VALIDATION_STATUS.REJECTED).length;
                      const pendingCount = allResponses.filter(r => r.validationStatus === VALIDATION_STATUS.PENDING).length;
                      const allValidated = pendingCount === 0;
                      
                      // Calculate dimension-level validation status
                      const dimensionStatus = submissionDetails.groupedData?.map(({ dimension, indicators: dimIndicators }) => {
                        const dimResponses = dimIndicators.flatMap(ind => 
                          ind.subQuestions
                            .map(sq => sq.response)
                            .filter(r => r !== null)
                        );
                        const dimPending = dimResponses.filter(r => r.validationStatus === VALIDATION_STATUS.PENDING).length;
                        const dimApproved = dimResponses.filter(r => r.validationStatus === VALIDATION_STATUS.APPROVED).length;
                        const dimRejected = dimResponses.filter(r => r.validationStatus === VALIDATION_STATUS.REJECTED).length;
                        const dimComplete = dimPending === 0;
                        return {
                          dimension,
                          total: dimResponses.length,
                          approved: dimApproved,
                          rejected: dimRejected,
                          pending: dimPending,
                          complete: dimComplete
                        };
                      }) || [];
                      
                      return (
                        <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-mint-primary-blue">Validation Progress</h3>
                            {allValidated ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                                ✓ All Dimensions Complete
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                                ⚠️ {pendingCount} Response(s) Pending
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Total Responses</p>
                              <p className="text-lg font-bold text-mint-primary-blue">{totalResponses}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Approved</p>
                              <p className="text-lg font-bold text-green-600">{approvedCount}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Rejected</p>
                              <p className="text-lg font-bold text-red-600">{rejectedCount}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-mint-dark-text/70 mb-1">Pending</p>
                              <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
                            </div>
                          </div>
                          {dimensionStatus.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-blue-300">
                              <p className="text-sm font-semibold text-mint-dark-text mb-2">Dimension Status:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {dimensionStatus.map(({ dimension, total, approved, rejected, pending, complete }) => (
                                  <div key={dimension.dimensionId} className={`p-2 rounded border ${
                                    complete ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
                                  }`}>
                                    <p className="text-xs font-semibold text-mint-dark-text mb-1">
                                      {dimension.dimensionName}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className={complete ? 'text-green-700' : 'text-yellow-700'}>
                                        {complete ? '✓' : '⚠️'} {approved + rejected}/{total}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {!allValidated && (
                            <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
                              <p className="text-sm font-semibold text-yellow-800">
                                ⚠️ Please review and validate all responses in all dimensions before the submission can be finalized.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-mint-dark-text">Review Responses</h3>
                        {(() => {
                          const allResponses = submissionDetails?.responses || [];
                          const allQuestions = submissionDetails?.groupedData?.flatMap(d => 
                            d.indicators.flatMap(ind => ind.subQuestions)
                          ) || [];
                          const reviewedCount = allResponses.filter(r => r.validationStatus !== VALIDATION_STATUS.PENDING).length;
                          const totalCount = allQuestions.length;
                          const allReviewed = reviewedCount === totalCount && totalCount > 0;
                          const isPending = submissionDetails?.submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION;
                          
                          return allReviewed && isPending ? (
                            <button
                              onClick={handleSubmitValidation}
                              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl text-sm"
                            >
                              ✓ Submit Validation
                            </button>
                          ) : null;
                        })()}
                      </div>
                      {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 ? (
                        <div className="space-y-6">
                          {submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }) => (
                            <div key={dimension.dimensionId} className="bg-mint-light-gray rounded-xl p-6 border border-mint-medium-gray">
                              <div className="mb-4 pb-3 border-b border-mint-medium-gray">
                                <h4 className="text-xl font-semibold text-mint-primary-blue">
                                  {dimension.dimensionName}
                                </h4>
                                <p className="text-sm text-mint-dark-text/70 mt-1">
                                  Dimension Weight: {dimension.dimensionWeight}%
                                </p>
                              </div>

                              {dimIndicators.map(({ indicator, subQuestions: indicatorSubQuestions }) => (
                                <div key={indicator.indicatorId} className="mb-6 pb-6 border-b border-mint-medium-gray last:border-b-0 last:mb-0 last:pb-0">
                                  <div className="mb-4">
                                    <h5 className="text-lg font-semibold text-mint-dark-text">
                                      {indicator.indicatorName}
                                    </h5>
                                    <p className="text-sm text-mint-dark-text/70">
                                      Indicator Weight: {indicator.indicatorWeight}%
                                    </p>
                                  </div>

                                  <div className="space-y-4">
                                    {indicatorSubQuestions.map(({ subQuestion, response }) => {
                                      const hasResponse = response !== null;
                                      const isApproved = hasResponse && response.validationStatus === VALIDATION_STATUS.APPROVED;
                                      const isRejected = hasResponse && response.validationStatus === VALIDATION_STATUS.REJECTED;
                                      const isPending = hasResponse && !isApproved && !isRejected;
                                      
                                      return (
                                        <div
                                          key={subQuestion.subQuestionId}
                                          className={`p-5 border-2 rounded-lg bg-white ${
                                            isApproved
                                              ? 'border-green-300'
                                              : isRejected
                                              ? 'border-red-300'
                                              : 'border-mint-medium-gray'
                                          }`}
                                        >
                                          <div className="mb-4">
                                            <div className="flex items-start justify-between mb-2">
                                              <h6 className="font-bold text-mint-dark-text text-base flex-1">
                                                {subQuestion.subQuestionText}
                                              </h6>
                                              {isPending && (
                                                <span className="ml-2 px-3 py-1 bg-yellow-200 text-yellow-900 rounded text-xs font-bold whitespace-nowrap">
                                                  ⚠️ Pending Validation
                                                </span>
                                              )}
                                              {isApproved && (
                                                <span className="ml-2 px-3 py-1 bg-green-200 text-green-900 rounded text-xs font-bold whitespace-nowrap">
                                                  ✓ Approved
                                                </span>
                                              )}
                                              {isRejected && (
                                                <span className="ml-2 px-3 py-1 bg-red-200 text-red-900 rounded text-xs font-bold whitespace-nowrap">
                                                  ✗ Rejected
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-xs text-mint-dark-text/60 font-normal">
                                              Weight: {subQuestion.subWeightPercentage}% | Response Type: {subQuestion.responseType}
                                            </span>
                                          </div>

                                          {hasResponse && response?.responseValue ? (
                                            <>
                                              <div className="bg-mint-light-gray p-4 rounded-lg border-2 border-mint-medium-gray mb-4">
                                                <p className="text-sm font-bold text-mint-dark-text mb-2">Submitted Answer:</p>
                                                <p className="text-mint-dark-text whitespace-pre-wrap">{response.responseValue}</p>
                                              </div>
                                              {response.evidenceLink && (
                                                <div className="mb-4 p-3 bg-mint-light-gray rounded-lg border border-mint-medium-gray">
                                                  <span className="text-sm font-bold text-mint-dark-text">Evidence: </span>
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
                                            </>
                                          ) : (
                                            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200 mb-4">
                                              <p className="text-sm text-yellow-800 font-semibold">
                                                ⚠️ This question should have been answered before submission. Please contact the Data Contributor.
                                              </p>
                                            </div>
                                          )}

                                          {/* Show current status if already validated */}
                                          {isApproved && (
                                            <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded">
                                              <p className="text-sm font-semibold text-green-800 mb-1">
                                                ✓ Current Status: Approved
                                              </p>
                                              {response.generalNote && (
                                                <p className="text-sm text-green-700 mt-1">
                                                  Note: {response.generalNote}
                                                </p>
                                              )}
                                            </div>
                                          )}

                                          {isRejected && (
                                            <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded">
                                              <p className="text-sm font-semibold text-red-800 mb-1">
                                                ✗ Current Status: Rejected
                                              </p>
                                              {response.centralRejectionReason && (
                                                <p className="text-sm text-red-700 mt-1">
                                                  Reason: {response.centralRejectionReason}
                                                </p>
                                              )}
                                            </div>
                                          )}

                                          {/* Action section - All questions should have responses */}
                                          {hasResponse && (
                                            <div className="space-y-3 mt-4 pt-4 border-t-2 border-mint-medium-gray">
                                              <div>
                                                <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                                                  General Note (Optional)
                                                  <span className="text-xs text-mint-dark-text/60 font-normal ml-2">
                                                    Add a note for historical context or future reference when approving
                                                  </span>
                                                </label>
                                                <textarea
                                                  value={validationNotes[response.responseId] || (isApproved ? response.generalNote || '' : '')}
                                                  onChange={(e) => setValidationNotes(prev => ({
                                                    ...prev,
                                                    [response.responseId]: e.target.value
                                                  }))}
                                                  rows="3"
                                                  className="w-full p-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                                                  placeholder="Add a note for future reference (e.g., 'Approved, but for the next cycle, please provide the direct policy document.')..."
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                                                  Rejection Reason (Required if rejecting)
                                                  <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <textarea
                                                  value={rejectionReasons[response.responseId] || (isRejected ? response.centralRejectionReason || '' : '')}
                                                  onChange={(e) => setRejectionReasons(prev => ({
                                                    ...prev,
                                                    [response.responseId]: e.target.value
                                                  }))}
                                                  rows="3"
                                                  className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                  placeholder="Enter detailed rejection reason (e.g., 'The evidence link is broken' or 'Insufficient documentation provided')..."
                                                  required
                                                />
                                              </div>
                                              <div className="flex space-x-3">
                                                <button
                                                  onClick={() => handleApproveResponse(response.responseId)}
                                                  className={`px-6 py-2.5 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg ${
                                                    isApproved 
                                                      ? 'bg-green-600 hover:bg-green-700' 
                                                      : 'bg-mint-secondary-blue hover:bg-mint-primary-blue'
                                                  }`}
                                                >
                                                  {isApproved ? '✓ Update Approval' : '✓ Approve'}
                                                </button>
                                                <button
                                                  onClick={() => handleRejectResponse(response.responseId)}
                                                  className={`px-6 py-2.5 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    isRejected 
                                                      ? 'bg-red-700 hover:bg-red-800' 
                                                      : 'bg-red-600 hover:bg-red-700'
                                                  }`}
                                                  disabled={!rejectionReasons[response.responseId] || !rejectionReasons[response.responseId].trim()}
                                                >
                                                  {isRejected ? '✗ Update Rejection' : '✗ Reject'}
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {submissionDetails.responses.map((response) => {
                            const subQuestion = getSubQuestion(response.subQuestionId);
                            const isApproved = response.validationStatus === VALIDATION_STATUS.APPROVED;
                            const isRejected = response.validationStatus === VALIDATION_STATUS.REJECTED;
                            
                            return (
                              <div
                                key={response.responseId}
                                className={`p-4 border rounded-lg ${
                                  isApproved
                                    ? 'bg-green-50 border-green-200'
                                    : isRejected
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-mint-light-gray border-mint-medium-gray'
                                }`}
                              >
                                <div className="mb-3">
                                  <h4 className="font-semibold text-mint-dark-text mb-2">
                                    {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                  </h4>
                                  <div className="bg-white p-3 rounded border border-mint-medium-gray mb-3">
                                    <p className="text-sm font-semibold text-mint-dark-text mb-1">Submitted Answer:</p>
                                    <p className="text-mint-dark-text">{response.responseValue}</p>
                                  </div>
                                  {response.evidenceLink && (
                                    <div className="mb-3">
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

                                {/* Show current status if already validated */}
                                {isApproved && (
                                  <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded">
                                    <p className="text-sm font-semibold text-green-800 mb-1">
                                      ✓ Current Status: Approved
                                    </p>
                                    {response.generalNote && (
                                      <p className="text-sm text-green-700 mt-1">
                                        Note: {response.generalNote}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {isRejected && (
                                  <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded">
                                    <p className="text-sm font-semibold text-red-800 mb-1">
                                      ✗ Current Status: Rejected
                                    </p>
                                    {response.centralRejectionReason && (
                                      <p className="text-sm text-red-700 mt-1">
                                        Reason: {response.centralRejectionReason}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Action section - Always visible for all questions */}
                                <div className="space-y-3 mt-4 pt-4 border-t-2 border-mint-medium-gray">
                                  <div>
                                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                                      General Note (Optional)
                                      <span className="text-xs text-mint-dark-text/60 font-normal ml-2">
                                        Add a note for historical context or future reference when approving
                                      </span>
                                    </label>
                                    <textarea
                                      value={validationNotes[response.responseId] || (isApproved ? response.generalNote || '' : '')}
                                      onChange={(e) => setValidationNotes(prev => ({
                                        ...prev,
                                        [response.responseId]: e.target.value
                                      }))}
                                      rows="3"
                                      className="w-full p-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                                      placeholder="Add a note for future reference (e.g., 'Approved, but for the next cycle, please provide the direct policy document.')..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold text-mint-dark-text mb-2">
                                      Rejection Reason (Required if rejecting)
                                      <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <textarea
                                      value={rejectionReasons[response.responseId] || (isRejected ? response.centralRejectionReason || '' : '')}
                                      onChange={(e) => setRejectionReasons(prev => ({
                                        ...prev,
                                        [response.responseId]: e.target.value
                                      }))}
                                      rows="3"
                                      className="w-full p-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                      placeholder="Enter detailed rejection reason (e.g., 'The evidence link is broken' or 'Insufficient documentation provided')..."
                                      required
                                    />
                                  </div>
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => handleApproveResponse(response.responseId)}
                                      className={`px-6 py-2.5 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg ${
                                        isApproved 
                                          ? 'bg-green-600 hover:bg-green-700' 
                                          : 'bg-mint-secondary-blue hover:bg-mint-primary-blue'
                                      }`}
                                    >
                                      {isApproved ? '✓ Update Approval' : '✓ Approve'}
                                    </button>
                                    <button
                                      onClick={() => handleRejectResponse(response.responseId)}
                                      className={`px-6 py-2.5 text-white font-bold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                                        isRejected 
                                          ? 'bg-red-700 hover:bg-red-800' 
                                          : 'bg-red-600 hover:bg-red-700'
                                      }`}
                                      disabled={!rejectionReasons[response.responseId] || !rejectionReasons[response.responseId].trim()}
                                    >
                                      {isRejected ? '✗ Update Rejection' : '✗ Reject'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
    </Layout>
    </ProtectedRoute>
  );
}

