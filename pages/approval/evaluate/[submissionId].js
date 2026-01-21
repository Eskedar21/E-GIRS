import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import { getSubmissionById, approveResponseByRegionalApprover, rejectResponseByRegionalApprover, submitRegionalApproval, resubmitToCentralCommittee, rejectToContributor, SUBMISSION_STATUS, VALIDATION_STATUS } from '../../../data/submissions';
import { getResponsesBySubmission } from '../../../data/submissions';
import { getUnitById } from '../../../data/administrativeUnits';
import { canPerformAction } from '../../../utils/permissions';
import { getSubQuestionById, getSubQuestionsByIndicator, getIndicatorsByDimension } from '../../../data/assessmentFramework';
import { getDimensionsByYear, getAssessmentYearById } from '../../../data/assessmentFramework';
import { getUserById } from '../../../data/users';

export default function EvaluateSubmission() {
  const router = useRouter();
  const { submissionId } = router.query;
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  
  // Force sidebar to be collapsed on this page
  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [regionalNotes, setRegionalNotes] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectToContributorModal, setShowRejectToContributorModal] = useState(false);
  const [rejectToContributorComment, setRejectToContributorComment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openCommentSections, setOpenCommentSections] = useState({});
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    if (submissionId) {
      loadSubmissionDetails(parseInt(submissionId));
    }
  }, [submissionId]);

  const loadSubmissionDetails = (submissionId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      const responses = getResponsesBySubmission(submissionId);
      
      // Get the unit to determine its type
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
      
      // Group responses by dimension and indicator
      const groupedData = dimensions.map(dimension => {
        const indicators = getIndicatorsByDimension(dimension.dimensionId);
        const applicableIndicators = indicators.filter(ind => 
          !unitType || applicableUnitTypes.includes(ind.applicableUnitType)
        );
        return {
          dimension,
          indicators: applicableIndicators.map(indicator => {
            const subQuestions = getSubQuestionsByIndicator(indicator.indicatorId);
            return {
              indicator,
              subQuestions: subQuestions.map(sq => {
                const response = responses.find(r => r.subQuestionId === sq.subQuestionId);
                return {
                  subQuestion: sq,
                  response: response || null
                };
              })
            };
          }).filter(ind => ind.subQuestions.length > 0)
        };
      }).filter(dim => dim.indicators.length > 0);
      
      setSubmissionDetails({
        submission,
        responses,
        groupedData
      });
      
      // Initialize rejection reasons
      const reasons = {};
      responses.forEach(r => {
        if (r.regionalRejectionReason) reasons[r.responseId] = r.regionalRejectionReason;
      });
      setRejectionReasons(reasons);
      
      // Initialize Central Committee rejection reasons if submission is rejected
      if (submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) {
        const rejectedResponses = responses.filter(r => r.validationStatus === VALIDATION_STATUS.REJECTED && r.centralRejectionReason);
        // Store rejection reasons for display
        rejectedResponses.forEach(r => {
          reasons[`central_${r.responseId}`] = r.centralRejectionReason;
        });
      }
    }
  };

  const handleApproveSubmission = () => {
    if (!user || !submissionDetails || !submissionDetails.submission) {
      alert('Submission details are not loaded. Please refresh the page.');
      return;
    }
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to approve submissions.');
      return;
    }
    
    try {
      // Approve all answered questions
      const responses = submissionDetails?.responses || [];
      const answeredResponses = responses.filter(r => r && r.responseId && r.responseValue && r.responseValue.trim() !== '');
      answeredResponses.forEach(response => {
        if (response && response.responseId && (!response.regionalApprovalStatus || response.regionalApprovalStatus === VALIDATION_STATUS.PENDING)) {
          approveResponseByRegionalApprover(response.responseId, user.userId, null);
        }
      });
      
      // Submit approval
      const result = submitRegionalApproval(submissionDetails.submission.submissionId, user.userId);
      
      if (result) {
        setShowApproveModal(false);
        loadSubmissionDetails(parseInt(submissionId));
        
        if (result.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
          setSuccessMessage('✅ Approval submitted successfully! The submission has been sent to the Central Committee for final validation. You will be redirected to the approval queue.');
          setTimeout(() => {
            router.push('/approval/queue');
          }, 3000);
        } else {
          setSuccessMessage('⚠️ Approval submitted. The submission has been sent back to the Data Contributor with rejection reasons. You will be redirected to the approval queue.');
          setTimeout(() => {
            router.push('/approval/queue');
          }, 3000);
        }
        setTimeout(() => setSuccessMessage(''), 8000);
      }
    } catch (error) {
      console.error('Approve submission error:', error);
      setShowApproveModal(false);
      alert(error.message || 'Error submitting approval. Please try again.');
    }
  };

  const handleRejectSubmission = () => {
    const reason = rejectionReasons['submission'];
    if (!reason || !reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    
    if (!user || !submissionDetails || !submissionDetails.submission) {
      alert('Submission details are not loaded. Please refresh the page.');
      return;
    }
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to reject submissions.');
      return;
    }
    
    try {
      // Reject all answered questions
      const responses = submissionDetails?.responses || [];
      const answeredResponses = responses.filter(r => r && r.responseId && r.responseValue && r.responseValue.trim() !== '');
      answeredResponses.forEach(response => {
        if (response && response.responseId) {
          rejectResponseByRegionalApprover(response.responseId, user.userId, reason);
        }
      });
      
      // Submit rejection
      const result = submitRegionalApproval(submissionDetails.submission.submissionId, user.userId);
      
      if (result) {
        loadSubmissionDetails(parseInt(submissionId));
        setShowRejectModal(false);
        setRejectionReasons(prev => ({ ...prev, ['submission']: '' }));
        setSuccessMessage('⚠️ Submission rejected. The submission has been sent back to the Data Contributor for revision. You will be redirected to the approval queue.');
        setTimeout(() => {
          router.push('/approval/queue');
        }, 3000);
        setTimeout(() => setSuccessMessage(''), 8000);
      }
    } catch (error) {
      console.error('Reject submission error:', error);
      alert(error.message || 'Error submitting rejection. Please try again.');
    }
  };

  const handleSaveComment = (responseId) => {
    if (!user) return;
    
    const note = regionalNotes[responseId] || '';
    if (!note.trim()) {
      return;
    }
    
    const response = submissionDetails?.responses.find(r => r.responseId === responseId);
    if (response) {
      response.regionalNote = note;
      response.updatedAt = new Date().toISOString();
      
      setRegionalNotes(prev => ({ ...prev, [responseId]: '' }));
      loadSubmissionDetails(parseInt(submissionId));
      setSuccessMessage('💬 Comment saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEditAndResubmit = () => {
    if (!submissionDetails) return;
    router.push(`/approval/edit/${submissionId}`);
  };

  const handleRejectToContributor = () => {
    if (!user || !submissionDetails) return;
    
    if (!rejectToContributorComment.trim()) {
      alert('Please provide additional comments before rejecting to contributor.');
      return;
    }
    
    if (!canPerformAction(user, 'approve_submission')) {
      alert('You do not have permission to reject submissions.');
      return;
    }
    
    try {
      const result = rejectToContributor(submissionDetails.submission.submissionId, rejectToContributorComment);
      
      if (result) {
        setShowRejectToContributorModal(false);
        setRejectToContributorComment('');
        setSuccessMessage('⚠️ Submission sent back to Data Contributor with your comments. You will be redirected to the approval queue.');
        setTimeout(() => {
          router.push('/approval/queue');
        }, 3000);
        setTimeout(() => setSuccessMessage(''), 8000);
      }
    } catch (error) {
      alert(error.message || 'Error rejecting submission. Please try again.');
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

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  // Calculate global question numbers
  const questionNumberMap = useMemo(() => {
    if (!submissionDetails || !submissionDetails.groupedData) return {};
    const map = {};
    let counter = 1;
    submissionDetails.groupedData.forEach(({ indicators: dimIndicators }) => {
      dimIndicators.forEach(({ subQuestions }) => {
        subQuestions.forEach(({ subQuestion }) => {
          map[subQuestion.subQuestionId] = counter++;
        });
      });
    });
    return map;
  }, [submissionDetails]);

  // Navigate to dimension by index
  const goToDimension = (index) => {
    if (submissionDetails?.groupedData && index >= 0 && index < submissionDetails.groupedData.length) {
      setCurrentDimensionIndex(index);
      const dimension = submissionDetails.groupedData[index].dimension;
      setActiveSection(dimension.dimensionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to next dimension
  const goToNextDimension = () => {
    if (submissionDetails?.groupedData && currentDimensionIndex < submissionDetails.groupedData.length - 1) {
      goToDimension(currentDimensionIndex + 1);
    }
  };

  // Navigate to previous dimension
  const goToPreviousDimension = () => {
    if (currentDimensionIndex > 0) {
      goToDimension(currentDimensionIndex - 1);
    }
  };

  // Update active section when dimension index changes
  useEffect(() => {
    if (submissionDetails?.groupedData && submissionDetails.groupedData.length > 0 && 
        currentDimensionIndex >= 0 && currentDimensionIndex < submissionDetails.groupedData.length) {
      const dimension = submissionDetails.groupedData[currentDimensionIndex].dimension;
      setActiveSection(dimension.dimensionId);
    }
  }, [currentDimensionIndex, submissionDetails]);

  // Reset to first dimension when submission changes
  useEffect(() => {
    if (submissionDetails?.groupedData && submissionDetails.groupedData.length > 0) {
      setCurrentDimensionIndex(0);
    }
  }, [submissionId]);

  if (!submissionDetails) {
    return (
      <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
        <Layout title="Evaluate Submission">
          <div className="flex">
            <Sidebar />
            <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70">Loading submission details...</p>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const isSubmitted = submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
                      submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;
  
  const isRejectedByCentralCommittee = submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
      <Layout title="Evaluate Submission">
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          {/* Assessment Dimensions Navigation Sidebar */}
          {submissionDetails?.groupedData && submissionDetails.groupedData.length > 0 && (
            <aside className={`w-80 bg-transparent fixed top-16 bottom-0 overflow-y-auto z-40 pl-8 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`}>
              <div className="p-4 pt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Assessment Dimensions</h2>
                <div className="space-y-1">
                  {submissionDetails.groupedData.map(({ dimension }, index) => (
                    <div key={dimension.dimensionId}>
                      <button
                        onClick={() => goToDimension(index)}
                        className={`w-full flex items-center text-left p-2 rounded-lg transition-all ${
                          activeSection === dimension.dimensionId
                            ? 'bg-[#0d6670]/10 text-[#0d6670] border-l-4 border-[#0d6670]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                          activeSection === dimension.dimensionId
                            ? 'bg-[#0d6670] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1">{dimension.dimensionName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
          <div className={`flex flex-grow transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`} style={submissionDetails?.groupedData && submissionDetails.groupedData.length > 0 ? { marginLeft: isCollapsed ? 'calc(64px + 320px)' : 'calc(256px + 320px)' } : {}}>
            {/* Main Content */}
            <main className="flex-1 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Message */}
                {successMessage && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    successMessage.includes('✅') ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'
                  }`}>
                    <p className={`font-semibold ${
                      successMessage.includes('✅') ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                        {submissionDetails.submission.submissionName || getUnitName(submissionDetails.submission.unitId)}
                      </h1>
                      {submissionDetails.submission.submissionName && (
                        <p className="text-sm text-mint-dark-text/60">
                          {getUnitName(submissionDetails.submission.unitId)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => router.push('/approval/queue')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                      ← Back to Queue
                    </button>
                  </div>
                  
                  {/* Central Committee Rejection Notice */}
                  {isRejectedByCentralCommittee && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-red-50 via-red-50 to-red-100 border-2 border-red-400 rounded-xl shadow-lg">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-red-900 mb-2 tracking-tight">
                            Rejected by Central Committee
                          </h3>
                          <p className="text-sm text-red-800 mb-4 leading-relaxed">
                            This submission has been rejected by the Central Committee. Review the rejection reasons below and choose an action.
                          </p>
                          {submissionDetails.submission.rejectionReason && (
                            <div className="mt-4 p-4 bg-white border-2 border-red-200 rounded-lg shadow-sm">
                              <p className="text-sm font-bold text-red-900 mb-2 uppercase tracking-wide">Comments:</p>
                              <div className="text-sm text-red-800 whitespace-pre-wrap leading-relaxed">
                                {submissionDetails.submission.rejectionReason}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {/* Questions and Answers */}
              {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 ? (
                <div className="space-y-6">
                  {submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }, dimIdx) => {
                    // Only show the current dimension
                    if (dimIdx !== currentDimensionIndex) return null;
                    
                    return (
                      <div key={dimension.dimensionId} className="bg-white rounded-xl p-6 border-2 border-mint-medium-gray shadow-sm">
                        <div className="mb-6 pb-4 border-b-2 border-mint-primary-blue">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xl">
                              {dimIdx + 1}
                            </div>
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
                          <div key={indicator.indicatorId} className="mb-6 last:mb-0">
                            <div className="mb-4 pb-3 border-b border-mint-medium-gray">
                              <div className="flex items-center space-x-2">
                                <h5 className="text-lg font-bold text-mint-dark-text">
                                  {indicator.indicatorName}
                                </h5>
                              </div>
                              <p className="text-xs text-mint-dark-text/60 mt-1">
                                Indicator Weight: {indicator.indicatorWeight}%
                              </p>
                            </div>

                            <div className="space-y-4">
                              {indicatorSubQuestions.map(({ subQuestion, response }, sqIdx) => {
                                const globalQuestionNumber = questionNumberMap[subQuestion.subQuestionId] || 0;
                                // For submitted submissions, all questions must have answers
                                // Find response from the responses array if not in groupedData
                                const actualResponse = response || submissionDetails?.responses?.find(r => r && r.subQuestionId === subQuestion.subQuestionId) || null;
                                const answerText = actualResponse?.responseValue || '';
                                const hasAnswer = answerText && answerText.trim() !== '';
                                
                                return (
                                  <div 
                                    key={subQuestion.subQuestionId} 
                                    className="p-6 rounded-lg border-2 border-gray-200 bg-white transition-all shadow-md mb-6"
                                  >
                                    {/* Question Header with Answer */}
                                    <div className="mb-5 pb-4 border-b-2 border-mint-medium-gray">
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0d6670] text-white flex items-center justify-center font-bold text-lg">
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
                                          </div>
                                          {/* Always show Answer inline with question - all submitted submissions must have answers */}
                                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Answer:</p>
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                                              {answerText || ''}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                        {/* Additional Details Section */}
                                    {actualResponse ? (
                                      <div className="space-y-3">
                                        
                                        {/* Central Committee Comments for this specific response */}
                                        {isRejectedByCentralCommittee && actualResponse.centralRejectionReason && (
                                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start space-x-2">
                                              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                              </svg>
                                              <div className="flex-1">
                                                <p className="text-sm font-semibold text-blue-800 mb-1">
                                                  Comments:
                                                </p>
                                                <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                                  {actualResponse.centralRejectionReason}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        
                                        {actualResponse.evidenceLink && (
                                          <div className="bg-white p-4 rounded-lg border border-gray-300">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                              Evidence Link
                                            </label>
                                            <a
                                              href={actualResponse.evidenceLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm text-mint-primary-blue hover:underline break-all inline-flex items-center space-x-2"
                                            >
                                              <span>{actualResponse.evidenceLink}</span>
                                              <span className="text-xs">↗</span>
                                            </a>
                                          </div>
                                        )}
                                        
                                        {/* Comments Section */}
                                        {isSubmitted && actualResponse && (
                                          <div className="mt-3 bg-gray-50 rounded-lg border border-gray-300 p-4">
                                            <div className="mb-3">
                                              <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-gray-900">Comments</h4>
                                                <button
                                                  onClick={() => {
                                                    if (actualResponse && actualResponse.responseId) {
                                                      setOpenCommentSections(prev => ({ 
                                                        ...prev, 
                                                        [actualResponse.responseId]: !prev[actualResponse.responseId] 
                                                      }));
                                                    }
                                                  }}
                                                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors text-xs"
                                                >
                                                  Add Comment
                                                </button>
                                              </div>
                                              
                                              {/* Existing Comments - Always visible */}
                                              {actualResponse.regionalNote && (
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
                                                          {formatDate(actualResponse.updatedAt)}
                                                        </span>
                                                      </div>
                                                      <p className="text-xs text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                                        {actualResponse.regionalNote}
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Comment Input - Toggleable */}
                                              {actualResponse && actualResponse.responseId && openCommentSections[actualResponse.responseId] && (
                                                <div className="space-y-2">
                                                  <textarea
                                                    value={regionalNotes[actualResponse.responseId] || ''}
                                                    onChange={(e) => {
                                                      if (actualResponse && actualResponse.responseId) {
                                                        setRegionalNotes(prev => ({ ...prev, [actualResponse.responseId]: e.target.value }));
                                                      }
                                                    }}
                                                    rows="3"
                                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue resize-none"
                                                    placeholder="Add your comment here..."
                                                  />
                                                  <div className="flex justify-end space-x-2">
                                                    <button
                                                      onClick={() => {
                                                        if (actualResponse && actualResponse.responseId) {
                                                          setOpenCommentSections(prev => ({ ...prev, [actualResponse.responseId]: false }));
                                                        }
                                                      }}
                                                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors text-xs"
                                                    >
                                                      Cancel
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        if (actualResponse && actualResponse.responseId) {
                                                          handleSaveComment(actualResponse.responseId);
                                                          setOpenCommentSections(prev => ({ ...prev, [actualResponse.responseId]: false }));
                                                        }
                                                      }}
                                                      disabled={!actualResponse || !actualResponse.responseId || !regionalNotes[actualResponse.responseId]?.trim()}
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
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70">No questions available for this submission.</p>
                </div>
              )}
              
              {/* Navigation Buttons */}
              {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 && (
                <div className="flex items-center justify-between bg-white border-2 border-mint-medium-gray rounded-xl p-6 shadow-sm mt-6">
                  <button
                    onClick={goToPreviousDimension}
                    disabled={currentDimensionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      currentDimensionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-mint-primary-blue hover:bg-mint-secondary-blue text-white'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-sm text-mint-dark-text">
                    Dimension {currentDimensionIndex + 1} of {submissionDetails.groupedData.length}
                  </div>
                  
                  <button
                    onClick={goToNextDimension}
                    disabled={currentDimensionIndex === submissionDetails.groupedData.length - 1}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      currentDimensionIndex === submissionDetails.groupedData.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-mint-primary-blue hover:bg-mint-secondary-blue text-white'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              )}
              </div>
            </main>

            {/* Right Sidebar - Application Status */}
            {isSubmitted && (
              <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 h-screen sticky top-0 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-900">Application Status</h4>
                      <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                        submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL 
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                          : submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL && (
                          <span>Pending</span>
                        )}
                        {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER && (
                          <span>Rejected</span>
                        )}
                        {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE && (
                          <span>Rejected</span>
                        )}
                        {submissionDetails.submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION && (
                          <span>Pending</span>
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
                    {isRejectedByCentralCommittee ? (
                      <p className="mt-4 text-sm text-red-700 font-medium">This submission was rejected by the Central Committee. Choose an action below.</p>
                    ) : (
                      <p className="mt-4 text-sm text-gray-700 font-medium">Review and take necessary action.</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {isRejectedByCentralCommittee ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleEditAndResubmit}
                        className="w-full px-6 py-3 bg-white border-2 border-blue-500 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg transition-colors"
                      >
                        Edit and Resubmit
                      </button>
                      <button
                        onClick={() => setShowRejectToContributorModal(true)}
                        className="w-full px-6 py-3 bg-white border-2 border-red-500 hover:bg-red-50 text-red-700 font-semibold rounded-lg transition-colors"
                      >
                        Reject to Contributor
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowApproveModal(true)}
                        className="w-full px-6 py-3 bg-white border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 font-semibold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="w-full px-6 py-3 bg-white border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-700 font-semibold rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowApproveModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Approve Submission</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base leading-relaxed text-gray-700 mb-4">
                  Are you sure you want to approve this submission? Once approved, it will be sent to the Central Committee for final validation.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Next Step:</strong> The submission will be forwarded to the Central Committee for review and validation.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveSubmission}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Confirm Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowRejectModal(false)}
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
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Next Step:</strong> The submission will be returned to the Data Contributor with your feedback for revision.
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
                  onClick={() => setShowRejectModal(false)}
                  className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmission}
                  disabled={!rejectionReasons['submission']?.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject to Contributor Modal */}
        {showRejectToContributorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowRejectToContributorModal(false)}
            ></div>
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Reject to Contributor</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base leading-relaxed text-gray-700 mb-4">
                  This will send the submission back to the Data Contributor with the Central Committee's rejection reasons and your additional comments.
                </p>
                {submissionDetails?.submission.rejectionReason && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Comments:</p>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{submissionDetails.submission.rejectionReason}</p>
                  </div>
                )}
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Comments <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(Your comments will be appended to the Central Committee's feedback)</span>
                </label>
                <textarea
                  value={rejectToContributorComment}
                  onChange={(e) => setRejectToContributorComment(e.target.value)}
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Add your comments here. These will be sent along with the Central Committee's rejection reasons..."
                  required
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectToContributorModal(false);
                    setRejectToContributorComment('');
                  }}
                  className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectToContributor}
                  disabled={!rejectToContributorComment.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send to Contributor
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}

