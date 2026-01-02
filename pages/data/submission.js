import { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { getAllAssessmentYears, getAssessmentYearById } from '../../data/assessmentFramework';
import { getDimensionsByYear } from '../../data/assessmentFramework';
import { getIndicatorsByDimension } from '../../data/assessmentFramework';
import { getSubQuestionsByIndicator } from '../../data/assessmentFramework';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { canPerformAction } from '../../utils/permissions';
import {
  createSubmission,
  getSubmissionById,
  getSubmissionsByUnit,
  getResponsesBySubmission,
  saveResponse,
  submitForApproval,
  updateSubmission,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getSubQuestionById } from '../../data/assessmentFramework';

export default function DataSubmission() {
  const { user } = useAuth();
  
  // Early return if no user - ProtectedRoute will handle redirect
  if (!user) {
    return (
      <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
        <div></div>
      </ProtectedRoute>
    );
  }
  
  const currentUser = {
    userId: user.userId,
    unitId: user.officialUnitId,
    unitType: user.unitType,
    role: user.role
  };
  const userRole = user.role;
  
  const [assessmentYears, setAssessmentYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [dimensions, setDimensions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [subQuestions, setSubQuestions] = useState([]);
  const [submission, setSubmission] = useState(null);
  const [responses, setResponses] = useState({});
  const [evidenceLinks, setEvidenceLinks] = useState({});
  const [submissionName, setSubmissionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Check if user has unit assigned
  if (!user.officialUnitId) {
    return (
      <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
        <Layout title="Data Submission">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
              <div className="w-full">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold">No Unit Assigned</p>
                  <p className="text-sm mt-1">Your account is not assigned to an administrative unit. Please contact your administrator.</p>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const currentUnit = getUnitById(currentUser.unitId);

  // Memoize loadSubmission to avoid infinite loops
  const loadSubmission = useCallback(() => {
    if (!selectedYear || !user) return;
    
    // Ensure user can only access their own unit's submissions
    if (currentUser.unitId !== user.officialUnitId) {
      alert('You can only access submissions for your assigned unit.');
      return;
    }
    
    // Check if submission exists for this unit and year
    const existingSubmissions = getSubmissionsByUnit(currentUser.unitId);
    const existingSubmission = existingSubmissions.find(s => 
      s.assessmentYearId === selectedYear.assessmentYearId &&
      (s.submissionStatus === SUBMISSION_STATUS.DRAFT || 
       s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER ||
       s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE)
    );
    
    if (existingSubmission) {
      // Verify user can edit this submission
      if (!canPerformAction(user, 'edit_submission', existingSubmission)) {
        alert('You do not have permission to edit this submission.');
        return;
      }
      
      setSubmission(existingSubmission);
      setSubmissionName(existingSubmission.submissionName || '');
      // Load existing responses
      const existingResponses = getResponsesBySubmission(existingSubmission.submissionId);
      const responseMap = {};
      const evidenceMap = {};
      existingResponses.forEach(r => {
        responseMap[r.subQuestionId] = r.responseValue;
        if (r.evidenceLink) {
          evidenceMap[r.subQuestionId] = r.evidenceLink;
        }
      });
      setResponses(responseMap);
      setEvidenceLinks(evidenceMap);
    } else {
      // Check if user can create submissions
      if (!canPerformAction(user, 'submit_data')) {
        alert('You do not have permission to create submissions.');
        return;
      }
      
      // Create new submission
      const newSubmission = createSubmission({
        unitId: currentUser.unitId,
        assessmentYearId: selectedYear.assessmentYearId,
        contributorUserId: currentUser.userId,
        submissionName: submissionName || null
      });
      setSubmission(newSubmission);
    }
  }, [selectedYear, user, currentUser.unitId, currentUser.userId]);

  useEffect(() => {
    setAssessmentYears(getAllAssessmentYears());
    // Auto-select active year
    const activeYear = getAllAssessmentYears().find(y => y.status === 'Active');
    if (activeYear) {
      setSelectedYear(activeYear);
    }
  }, []);

  useEffect(() => {
    if (selectedYear && currentUser.unitType) {
      try {
        const yearDimensions = getDimensionsByYear(selectedYear.assessmentYearId);
        if (!yearDimensions || yearDimensions.length === 0) {
          setDimensions([]);
          setIndicators([]);
          setSubQuestions([]);
          return;
        }
        
        setDimensions(yearDimensions);
        
        // Load all indicators and sub-questions for this year
        const allIndicators = [];
        const allSubQuestions = [];
        
        yearDimensions.forEach(dim => {
          const dimIndicators = getIndicatorsByDimension(dim.dimensionId);
          // Map unit type to applicable unit types
          // Federal Institute and City Administration use Region indicators, Sub-city uses Woreda indicators
          const getApplicableUnitTypes = (ut) => {
            if (!ut) return [];
            if (ut === 'Federal Institute') return ['Region'];
            if (ut === 'City Administration') return ['Region'];
            if (ut === 'Sub-city') return ['Woreda'];
            return [ut];
          };
          const applicableUnitTypes = getApplicableUnitTypes(currentUser.unitType);
          // Filter indicators by applicable unit type
          const applicableIndicators = dimIndicators.filter(ind => 
            applicableUnitTypes.includes(ind.applicableUnitType)
          );
          allIndicators.push(...applicableIndicators);
          
          applicableIndicators.forEach(ind => {
            const sqs = getSubQuestionsByIndicator(ind.indicatorId);
            if (sqs && sqs.length > 0) {
              allSubQuestions.push(...sqs);
            }
          });
        });
        
        setIndicators(allIndicators);
        setSubQuestions(allSubQuestions);
        
        // Load existing submission if any
        loadSubmission();
      } catch (error) {
        console.error('Error loading assessment framework:', error);
        setSuccessMessage('Error loading assessment framework. Please refresh the page.');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } else if (selectedYear && !currentUser.unitType) {
      setDimensions([]);
      setIndicators([]);
      setSubQuestions([]);
    }
  }, [selectedYear, currentUser.unitId, currentUser.unitType, loadSubmission]);

  const handleResponseChange = (subQuestionId, value) => {
    setResponses(prev => ({
      ...prev,
      [subQuestionId]: value
    }));
    
    // Auto-save to database in real-time
    if (submission) {
      const evidenceLink = evidenceLinks[subQuestionId] || null;
      saveResponse({
        submissionId: submission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: value,
        evidenceLink: evidenceLink
      });
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: submission.submissionId }
        }));
      }
    }
  };

  const handleEvidenceChange = (subQuestionId, link) => {
    setEvidenceLinks(prev => ({
      ...prev,
      [subQuestionId]: link
    }));
    
    // Auto-save to database in real-time
    if (submission) {
      const responseValue = responses[subQuestionId] || '';
      saveResponse({
        submissionId: submission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: responseValue,
        evidenceLink: link
      });
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: submission.submissionId }
        }));
      }
    }
  };

  const handleSaveDraft = async () => {
    if (!submission) {
      setErrorMessage('No submission found. Please select an assessment year first.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Save all responses (including empty ones to clear previous answers)
      if (subQuestions && subQuestions.length > 0) {
        subQuestions.forEach(sq => {
          saveResponse({
            submissionId: submission.submissionId,
            subQuestionId: sq.subQuestionId,
            responseValue: responses[sq.subQuestionId] || '',
            evidenceLink: evidenceLinks[sq.subQuestionId] || null
          });
        });
      } else {
        // Fallback: save any responses that exist
        Object.keys(responses).forEach(subQuestionId => {
          saveResponse({
            submissionId: submission.submissionId,
            subQuestionId: parseInt(subQuestionId),
            responseValue: responses[subQuestionId] || '',
            evidenceLink: evidenceLinks[subQuestionId] || null
          });
        });
        
        // Also save any evidence links that don't have responses yet
        Object.keys(evidenceLinks).forEach(subQuestionId => {
          if (!responses[subQuestionId] && evidenceLinks[subQuestionId]) {
            saveResponse({
              submissionId: submission.submissionId,
              subQuestionId: parseInt(subQuestionId),
              responseValue: '',
              evidenceLink: evidenceLinks[subQuestionId]
            });
          }
        });
      }
      
      setSuccessMessage('✅ Draft saved successfully! Your progress has been saved. You can continue editing and submit when ready.');
      setTimeout(() => setSuccessMessage(''), 7000);
    } catch (error) {
      setErrorMessage('❌ Error saving draft. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForApproval = () => {
    if (!submission) {
      setErrorMessage('No submission found. Please select an assessment year first.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    if (!subQuestions || subQuestions.length === 0) {
      setErrorMessage('Please wait for the form to load completely before submitting.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate that all required questions are answered - STRICT: no submission without all answers
    const unanswered = subQuestions.filter(sq => {
      const response = responses[sq.subQuestionId];
      return !response || response === '' || response.trim() === '';
    });
    
    if (unanswered.length > 0) {
      // Show clear error message - do not allow submission
      setErrorMessage(
        `⚠️ Cannot submit: You have ${unanswered.length} unanswered question(s) out of ${subQuestions.length} total. ` +
        `Please answer ALL required questions before submitting.`
      );
      // Scroll to first unanswered question
      if (unanswered.length > 0 && dimensions.length > 0) {
        const firstUnanswered = unanswered[0];
        const firstUnansweredSubQ = subQuestions.find(sq => sq.subQuestionId === firstUnanswered.subQuestionId);
        if (firstUnansweredSubQ) {
          const relatedIndicator = indicators.find(ind => ind.indicatorId === firstUnansweredSubQ.parentIndicatorId);
          if (relatedIndicator) {
            const relatedDimension = dimensions.find(d => d.dimensionId === relatedIndicator.dimensionId);
            if (relatedDimension) {
              const element = document.getElementById(`dimension-${relatedDimension.dimensionId}`);
              if (element) {
                setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }
            }
          }
        }
      }
      return;
    }
    
    // All required fields are filled - show confirmation modal
    setShowSubmitModal(true);
  };

  const confirmSubmitForApproval = async () => {
    setShowSubmitModal(false);
    
    try {
      setIsSaving(true);
      
      // Final validation - ensure ALL required questions are answered
      const unanswered = subQuestions.filter(sq => {
        const response = responses[sq.subQuestionId];
        return !response || response === '' || response.trim() === '';
      });
      
      if (unanswered.length > 0) {
        setErrorMessage(
          `⚠️ Cannot submit: You still have ${unanswered.length} unanswered question(s). ` +
          `Please answer ALL required questions before submitting.`
        );
        setIsSaving(false);
        return;
      }
      
      // Save all responses first
      subQuestions.forEach(sq => {
        saveResponse({
          submissionId: submission.submissionId,
          subQuestionId: sq.subQuestionId,
          responseValue: responses[sq.subQuestionId] || '',
          evidenceLink: evidenceLinks[sq.subQuestionId] || null
        });
      });
      
      // Submit for approval - this changes status to PENDING_INITIAL_APPROVAL
      submitForApproval(submission.submissionId);
      
      // Trigger real-time update event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissionUpdated', {
          detail: { submissionId: submission.submissionId }
        }));
      }
      
      const updatedSubmission = getSubmissionById(submission.submissionId);
      if (updatedSubmission) {
        setSubmission(updatedSubmission);
        setSuccessMessage(
          '✅ Submission sent for approval successfully!\n\n' +
          'Your submission has been sent to the Regional Approver for review.\n\n' +
          'After regional approval, it will proceed to the Central Committee for final validation.\n\n' +
          'You will be notified of any changes or rejections.'
        );
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        throw new Error('Failed to update submission status');
      }
    } catch (error) {
      setErrorMessage('❌ Error submitting for approval. Please try again or contact support if the problem persists.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderQuestionInput = (subQuestion) => {
    const responseValue = responses[subQuestion.subQuestionId] || '';
    const evidenceLink = evidenceLinks[subQuestion.subQuestionId] || '';
    const isSubmissionLocked = submission && 
      submission.submissionStatus !== SUBMISSION_STATUS.DRAFT && 
      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER &&
      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE;

    switch (subQuestion.responseType) {
      case 'Yes/No':
        return (
          <div className="space-y-2">
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`sq_${subQuestion.subQuestionId}`}
                  value="Yes"
                  checked={responseValue === 'Yes'}
                  onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                  className="mr-2 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300"
                  disabled={isSubmissionLocked}
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={`sq_${subQuestion.subQuestionId}`}
                  value="No"
                  checked={responseValue === 'No'}
                  onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                  className="mr-2 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300"
                  disabled={isSubmissionLocked}
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evidence Link
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                placeholder="Enter Evidence Link"
                disabled={isSubmissionLocked}
              />
            </div>
          </div>
        );

      case 'MultipleSelectCheckbox':
        const options = subQuestion.checkboxOptions ? subQuestion.checkboxOptions.split(',').map(o => o.trim()) : [];
        const selectedOptions = responseValue ? responseValue.split(',').map(v => v.trim()).filter(v => v) : [];
        return (
          <div className="space-y-3">
            <div className="space-y-2 p-4 bg-white rounded-lg border border-gray-200">
              {options.map((option, idx) => (
                <label key={idx} className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selectedOptions, option]
                        : selectedOptions.filter(v => v !== option);
                      handleResponseChange(subQuestion.subQuestionId, updated.join(', '));
                    }}
                    className="mr-3 w-4 h-4 text-[#0d6670] focus:ring-[#0d6670] border-gray-300 rounded"
                    disabled={isSubmissionLocked}
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evidence Link
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                placeholder="Enter Evidence Link"
                disabled={isSubmissionLocked}
              />
            </div>
          </div>
        );

      case 'TextExplanation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Explanation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={responseValue}
                onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white resize-y"
                placeholder="Enter your explanation..."
                disabled={isSubmissionLocked}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evidence Link
                <span className="text-gray-500 font-normal ml-1">(Optional)</span>
              </label>
              <input
                type="url"
                value={evidenceLink}
                onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                placeholder="Enter Evidence Link"
                disabled={isSubmissionLocked}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Group sub-questions by dimension and indicator
  const groupedQuestions = dimensions.map(dimension => {
    const dimIndicators = indicators.filter(ind => ind.dimensionId === dimension.dimensionId);
    return {
      dimension,
      indicators: dimIndicators.map(indicator => ({
        indicator,
        subQuestions: subQuestions.filter(sq => sq.parentIndicatorId === indicator.indicatorId)
      }))
    };
  }).filter(group => group.indicators.length > 0);

  // Calculate progress
  const totalAnsweredQuestions = Object.keys(responses).filter(k => responses[k] && responses[k] !== '').length;
  const totalQuestions = subQuestions.length;
  const progressPercentage = totalQuestions > 0 ? (totalAnsweredQuestions / totalQuestions) * 100 : 0;

  // Scroll to section when clicked
  const scrollToSection = (dimensionId) => {
    setActiveSection(dimensionId);
    const element = document.getElementById(`dimension-${dimensionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['Data Contributor', 'Institute Data Contributor']}>
      <Layout title="Data Submission">
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          {/* Assessment Dimensions Navigation Sidebar */}
          <aside className="w-80 bg-transparent fixed left-64 top-16 bottom-0 overflow-y-auto z-40 pl-8">
            <div className="p-4 pt-8">
              {/* Progress Header */}
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Assessment Dimensions</h2>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#0d6670] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {totalAnsweredQuestions} of {totalQuestions} questions answered ({Math.round(progressPercentage)}%)
                </p>
              </div>

              {/* Dimensions Navigation */}
              {selectedYear && groupedQuestions.length > 0 ? (
                <div className="space-y-1">
                  {groupedQuestions.map((group, index) => (
                    <div key={group.dimension.dimensionId}>
                      <button
                        onClick={() => scrollToSection(group.dimension.dimensionId)}
                        className={`w-full flex items-center text-left p-2 rounded-lg transition-all ${
                          activeSection === group.dimension.dimensionId
                            ? 'bg-[#0d6670]/10 text-[#0d6670] border-l-4 border-[#0d6670]'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                          activeSection === group.dimension.dimensionId
                            ? 'bg-[#0d6670] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1">{group.dimension.dimensionName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">Select an assessment year to view dimensions</p>
                </div>
              )}

              {/* Action Button */}
              {submission && (submission.submissionStatus === SUBMISSION_STATUS.DRAFT || 
                submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER ||
                submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                <div className="pt-4 mt-4">
                  {totalAnsweredQuestions === totalQuestions && totalQuestions > 0 ? (
                    <button
                      onClick={handleSubmitForApproval}
                      disabled={isSaving}
                      className="w-full bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '⏳ Submitting...' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="w-full bg-transparent border-2 border-[#0d6670] text-[#0d6670] hover:bg-[#0d6670]/10 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '⏳ Saving...' : 'Save as Draft'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          <main className="flex-grow ml-[calc(256px+320px)] pl-4 pr-8 py-8 bg-gray-50 text-gray-900 min-h-screen">
          <div className="w-full">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Data Submission Form
              </h1>
              <p className="text-gray-600">
                Complete the assessment form for <span className="font-semibold">{currentUnit?.officialUnitName || currentUser.unitId || 'Your Unit'}</span>. 
                Only questions applicable to your unit type ({currentUser.unitType || 'N/A'}) are displayed.
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg whitespace-pre-line">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg whitespace-pre-line">
                {errorMessage}
              </div>
            )}

            {/* Assessment Year Selection */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assessment Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedYear?.assessmentYearId || ''}
                    onChange={(e) => {
                      const year = getAllAssessmentYears().find(y => y.assessmentYearId === parseInt(e.target.value));
                      setSelectedYear(year);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    disabled={submission && submission.submissionStatus !== SUBMISSION_STATUS.DRAFT && 
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER &&
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE}
                  >
                    <option value="">Select Assessment Year</option>
                    {assessmentYears.map((year) => (
                      <option key={year.assessmentYearId} value={year.assessmentYearId}>
                        {year.yearName} ({year.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Submission Name <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={submissionName}
                    onChange={(e) => {
                      setSubmissionName(e.target.value);
                      // Auto-save submission name
                      if (submission) {
                        updateSubmission(submission.submissionId, { submissionName: e.target.value });
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('submissionUpdated', {
                            detail: { submissionId: submission.submissionId }
                          }));
                        }
                      }
                    }}
                    placeholder="e.g., Q1 2024 Assessment, Annual Review 2024"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white"
                    disabled={submission && submission.submissionStatus !== SUBMISSION_STATUS.DRAFT && 
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER &&
                      submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE}
                  />
                  <p className="text-xs text-gray-500 mt-1">Give your submission a name to easily identify it later</p>
                </div>
              </div>
              
              {/* Show rejected submissions list for this year */}
              {selectedYear && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Submissions for {selectedYear.yearName}:</h3>
                  {(() => {
                    const allSubmissions = getSubmissionsByUnit(currentUser.unitId);
                    const yearSubmissions = allSubmissions.filter(s => s.assessmentYearId === selectedYear.assessmentYearId);
                    const rejectedSubmissions = yearSubmissions.filter(s => 
                      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER ||
                      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
                    );
                    
                    if (rejectedSubmissions.length > 0) {
                      return (
                        <div className="space-y-2">
                          {rejectedSubmissions.map(sub => (
                            <div key={sub.submissionId} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-red-800">
                                    {sub.submissionName || `Submission #${sub.submissionId}`}
                                  </p>
                                  <p className="text-xs text-red-600 mt-1">
                                    Status: {sub.submissionStatus} | 
                                    Rejected: {sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    // Load this submission
                                    setSubmission(sub);
                                    setSubmissionName(sub.submissionName || '');
                                    const existingResponses = getResponsesBySubmission(sub.submissionId);
                                    const responseMap = {};
                                    const evidenceMap = {};
                                    existingResponses.forEach(r => {
                                      responseMap[r.subQuestionId] = r.responseValue;
                                      if (r.evidenceLink) {
                                        evidenceMap[r.subQuestionId] = r.evidenceLink;
                                      }
                                    });
                                    setResponses(responseMap);
                                    setEvidenceLinks(evidenceMap);
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
                                >
                                  View & Update
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p className="text-xs text-gray-500 italic">No rejected submissions for this year</p>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Submission Status */}
            {submission && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Submission Status: </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      submission.submissionStatus === SUBMISSION_STATUS.DRAFT
                        ? 'bg-yellow-100 text-yellow-800'
                        : submission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL
                        ? 'bg-[#0d6670]/10 text-[#0d6670]'
                        : submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                        ? 'bg-orange-100 text-orange-800'
                        : submission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.submissionStatus}
                    </span>
                  </div>
                  {(submission.submissionStatus === SUBMISSION_STATUS.DRAFT || 
                    submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER ||
                    submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                        className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '⏳ Saving...' : 'Save Draft'}
                      </button>
                      <button
                        onClick={handleSubmitForApproval}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit for Approval
                      </button>
                    </div>
                  )}
                </div>
                {/* Rejection Reasons Display */}
                {(submission.rejectionReason || submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                  <div className="mt-4 p-5 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-2">⚠️</span>
                      <h3 className="text-lg font-bold text-red-800">Submission Rejected - Action Required</h3>
                    </div>
                    
                    {submission.rejectionReason && (
                      <div className="mb-4 p-3 bg-white border border-red-200 rounded">
                        <p className="font-semibold text-red-800 mb-2">Regional Approver Rejection Reasons:</p>
                        <p className="text-sm text-red-700 whitespace-pre-line">{submission.rejectionReason}</p>
                      </div>
                    )}
                    
                    {/* Show per-question rejection reasons from Regional Approver */}
                    {submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER && (
                      <div className="mb-4">
                        <p className="font-semibold text-red-800 mb-2">Question-Specific Rejection Reasons:</p>
                        <div className="space-y-2">
                          {(() => {
                            const submissionResponses = getResponsesBySubmission(submission.submissionId);
                            const rejectedResponses = submissionResponses.filter(r => 
                              r.regionalApprovalStatus === 'Rejected' && r.regionalRejectionReason
                            );
                            
                            if (rejectedResponses.length === 0) {
                              return null;
                            }
                            
                            return rejectedResponses.map((response) => {
                              const subQuestion = subQuestions.find(sq => sq.subQuestionId === response.subQuestionId);
                              const indicator = indicators.find(ind => 
                                subQuestions.some(sq => sq.subQuestionId === response.subQuestionId && sq.parentIndicatorId === ind.indicatorId)
                              );
                              return (
                                <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded mb-2">
                                  <p className="text-sm font-semibold text-red-800 mb-1">
                                    {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                                    {indicator && (
                                      <span className="text-xs text-red-600 font-normal ml-2">
                                        ({indicator.indicatorName})
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-red-700 mt-1">{response.regionalRejectionReason}</p>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {submission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE && (
                      <div className="mb-4">
                        <p className="font-semibold text-red-800 mb-2">Central Committee Rejection Reasons:</p>
                        <div className="space-y-2">
                          {(() => {
                            const submissionResponses = getResponsesBySubmission(submission.submissionId);
                            const rejectedResponses = submissionResponses.filter(r => 
                              r.validationStatus === 'Rejected' && r.centralRejectionReason
                            );
                            
                            if (rejectedResponses.length === 0) {
                              return (
                                <p className="text-sm text-red-700 italic">
                                  The Central Committee has rejected this submission. Please review and amend your responses.
                                </p>
                              );
                            }
                            
                   return rejectedResponses.map((response) => {
                     const subQuestion = subQuestions.find(sq => sq.subQuestionId === response.subQuestionId);
                     const indicator = indicators.find(ind => 
                       subQuestions.some(sq => sq.subQuestionId === response.subQuestionId && sq.parentIndicatorId === ind.indicatorId)
                     );
                     return (
                       <div key={response.responseId} className="p-3 bg-white border border-red-200 rounded mb-2">
                         <p className="text-sm font-semibold text-red-800 mb-1">
                           {subQuestion?.subQuestionText || `Question ID: ${response.subQuestionId}`}
                           {indicator && (
                             <span className="text-xs text-red-600 font-normal ml-2">
                               ({indicator.indicatorName})
                             </span>
                           )}
                         </p>
                         <p className="text-sm text-red-700 mt-1">{response.centralRejectionReason}</p>
                       </div>
                     );
                   });
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">📝 Next Steps:</p>
                      <p className="text-sm text-yellow-700">
                        Please review the rejection reasons above, amend your submission accordingly, and resubmit for approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Questions Form - Dimensions as Sections */}
            {selectedYear && groupedQuestions.length > 0 ? (
              <div className="space-y-6">
                {groupedQuestions.map(({ dimension, indicators: dimIndicators }, dimIndex) => (
                  <div key={dimension.dimensionId} id={`dimension-${dimension.dimensionId}`} className="scroll-mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#0d6670] text-white flex items-center justify-center font-bold text-sm mr-3">
                          {dimIndex + 1}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {dimension.dimensionName}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        Dimension Weight: {dimension.dimensionWeight}%
                      </p>
                    </div>

                    {dimIndicators.map(({ indicator, subQuestions: indicatorSubQuestions }) => (
                      <div key={indicator.indicatorId} className="mb-8 pb-8 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                        <div className="mb-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {indicator.indicatorName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Indicator Weight: {indicator.indicatorWeight}% | Applicable to: <span className="font-semibold">{indicator.applicableUnitType}</span>
                          </p>
                        </div>

                        <div className="space-y-6">
                          {indicatorSubQuestions.map((subQuestion) => {
                            const hasResponse = responses[subQuestion.subQuestionId] && responses[subQuestion.subQuestionId] !== '';
                            return (
                              <div key={subQuestion.subQuestionId} className="p-6 rounded-lg border border-gray-200 bg-white transition-all">
                                <div className="mb-4">
                                  <label className="block text-base font-semibold text-gray-900 mb-3">
                                    {subQuestion.subQuestionText}
                                    <span className="text-red-500 ml-1">*</span>
                                    <span className="ml-2 text-xs text-gray-500 font-normal">
                                      (Weight: {subQuestion.subWeightPercentage}%)
                                    </span>
                                    {hasResponse && (
                                      <span className="ml-2 text-xs text-[#0d6670] font-semibold">✓ Answered</span>
                                    )}
                                  </label>
                                </div>
                                {renderQuestionInput(subQuestion)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

              </div>
            ) : selectedYear ? (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-300 text-center">
                <p className="text-gray-700">No questions available for your unit type in this assessment year.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 border border-gray-300 text-center">
                <p className="text-gray-700">Please select an assessment year to begin.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowSubmitModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#0d6670]/10 flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-[#0d6670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submit for Approval</h3>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="space-y-4 text-gray-700">
                <p className="text-base leading-relaxed">
                  Your submission will be sent to the Initial Approver for review.
                </p>
                <p className="text-base leading-relaxed">
                  After approval, it will proceed to the Central Committee for final validation.
                </p>
                <p className="text-base leading-relaxed font-semibold text-gray-900">
                  Once submitted, you will NOT be able to edit until it is returned for revision.
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-[#0d6670] font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitForApproval}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Submitting...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    </ProtectedRoute>
  );
}

