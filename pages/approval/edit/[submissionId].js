import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import { getSubmissionById, getResponsesBySubmission, saveResponse, resubmitToCentralCommittee, SUBMISSION_STATUS } from '../../../data/submissions';
import { getUnitById } from '../../../data/administrativeUnits';
import { canPerformAction } from '../../../utils/permissions';
import { getSubQuestionsByIndicator, getIndicatorsByDimension, RESPONSE_TYPES } from '../../../data/assessmentFramework';
import { getDimensionsByYear, getAssessmentYearById } from '../../../data/assessmentFramework';

export default function EditSubmission() {
  const router = useRouter();
  const { submissionId } = router.query;
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});
  const [editedEvidenceLinks, setEditedEvidenceLinks] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      // Check if submission can be edited (must be rejected by central committee)
      if (submission.submissionStatus !== SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) {
        alert('This submission cannot be edited. Only submissions rejected by Central Committee can be edited.');
        router.push('/approval/rejected-submissions');
        return;
      }

      // Check permissions
      if (!canPerformAction(user, 'approve_submission', submission)) {
        alert('You do not have permission to edit this submission.');
        router.push('/approval/rejected-submissions');
        return;
      }

      const responses = getResponsesBySubmission(submissionId);
      
      // Get the unit to determine its type
      const unit = getUnitById(submission.unitId);
      const unitType = unit ? unit.unitType : null;
      
      // Map unit type to applicable unit types
      const getApplicableUnitTypes = (ut) => {
        if (!ut) return [];
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
      
      // Initialize edited responses and evidence links
      const responseMap = {};
      const evidenceMap = {};
      if (responses && Array.isArray(responses)) {
        responses.forEach(r => {
          if (r && r.subQuestionId) {
            responseMap[r.subQuestionId] = r.responseValue || '';
            evidenceMap[r.subQuestionId] = r.evidenceLink || '';
          }
        });
      }
      setEditedResponses(responseMap);
      setEditedEvidenceLinks(evidenceMap);
      
      setSubmissionDetails({
        submission,
        responses,
        groupedData
      });
    }
  };

  const handleResponseChange = (subQuestionId, value) => {
    setEditedResponses(prev => ({
      ...prev,
      [subQuestionId]: value
    }));
    
    // Auto-save to database
    if (submissionDetails && submissionDetails.submission && submissionDetails.submission.submissionId) {
      try {
        saveResponse({
          submissionId: submissionDetails.submission.submissionId,
          subQuestionId: subQuestionId,
          responseValue: value,
          evidenceLink: editedEvidenceLinks[subQuestionId] || null
        });
      } catch (error) {
        console.error('Error saving response:', error);
      }
    }
  };

  const renderQuestionInput = (subQuestion, response) => {
    const responseValue = editedResponses[subQuestion.subQuestionId] || '';
    const evidenceLink = editedEvidenceLinks[subQuestion.subQuestionId] || '';

    switch (subQuestion.responseType) {
      case RESPONSE_TYPES.YES_NO:
      case 'Yes/No': // Fallback for backward compatibility
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
              />
            </div>
          </div>
        );

      case RESPONSE_TYPES.MULTIPLE_SELECT_CHECKBOX:
      case 'MultipleSelectCheckbox': // Fallback for backward compatibility
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
              />
            </div>
          </div>
        );

      case RESPONSE_TYPES.TEXT_EXPLANATION:
      case 'TextExplanation': // Fallback for backward compatibility
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
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer <span className="text-red-500">*</span>
              </label>
              <textarea
                value={responseValue}
                onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d6670] focus:border-[#0d6670] bg-white resize-y"
                placeholder="Enter your answer..."
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
              />
            </div>
          </div>
        );
    }
  };

  const handleEvidenceChange = (subQuestionId, link) => {
    setEditedEvidenceLinks(prev => ({
      ...prev,
      [subQuestionId]: link
    }));
    
    // Auto-save to database
    if (submissionDetails && submissionDetails.submission && submissionDetails.submission.submissionId) {
      try {
        saveResponse({
          submissionId: submissionDetails.submission.submissionId,
          subQuestionId: subQuestionId,
          responseValue: editedResponses[subQuestionId] || '',
          evidenceLink: link || null
        });
      } catch (error) {
        console.error('Error saving evidence link:', error);
      }
    }
  };

  const handleResubmit = () => {
    if (!submissionDetails || !submissionDetails.submission || !submissionDetails.submission.submissionId) {
      alert('Submission details are not loaded. Please refresh the page.');
      return;
    }
    
    if (confirm('Are you sure you want to resubmit this submission to the Central Committee? All changes will be saved.')) {
      setIsSubmitting(true);
      try {
        // Save all responses first
        Object.keys(editedResponses).forEach(subQuestionId => {
          try {
            saveResponse({
              submissionId: submissionDetails.submission.submissionId,
              subQuestionId: parseInt(subQuestionId),
              responseValue: editedResponses[subQuestionId],
              evidenceLink: editedEvidenceLinks[subQuestionId] || null
            });
          } catch (error) {
            console.error(`Error saving response for question ${subQuestionId}:`, error);
          }
        });
        
        // Resubmit to Central Committee
        const result = resubmitToCentralCommittee(submissionDetails.submission.submissionId);
        
        if (result) {
          setSuccessMessage('✅ Submission edited and resubmitted to Central Committee successfully!');
          setTimeout(() => {
            router.push('/approval/queue');
          }, 2000);
        } else {
          alert('Error resubmitting submission. Please try again.');
        }
      } catch (error) {
        alert(error.message || 'Error resubmitting submission. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
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

  // Set active section when dimension index changes
  useEffect(() => {
    if (submissionDetails?.groupedData && submissionDetails.groupedData.length > 0 && currentDimensionIndex >= 0 && currentDimensionIndex < submissionDetails.groupedData.length) {
      const dimension = submissionDetails.groupedData[currentDimensionIndex].dimension;
      setActiveSection(dimension.dimensionId);
    }
  }, [currentDimensionIndex, submissionDetails]);

  // Navigate to dimension by index
  const goToDimension = (index) => {
    if (submissionDetails?.groupedData && index >= 0 && index < submissionDetails.groupedData.length) {
      setCurrentDimensionIndex(index);
      const dimension = submissionDetails.groupedData[index].dimension;
      setActiveSection(dimension.dimensionId);
      // Scroll to top of main content
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

  if (!submissionDetails) {
    return (
      <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
        <Layout title="Edit Submission">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
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

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
      <Layout title="Edit Submission">
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
          <div className="flex flex-grow ml-64">
            {/* Main Content */}
            <main className={`flex-1 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto transition-all duration-300 ${submissionDetails?.groupedData && submissionDetails.groupedData.length > 0 ? (isCollapsed ? 'ml-16' : 'ml-80') : (isCollapsed ? 'ml-16' : 'ml-64')}`}>
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300">
                    <p className="font-semibold text-green-800">
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                        Edit Submission: {submissionDetails.submission.submissionName || getUnitName(submissionDetails.submission.unitId)}
                      </h1>
                      {submissionDetails.submission.submissionName && (
                        <p className="text-sm text-mint-dark-text/60">
                          {getUnitName(submissionDetails.submission.unitId)}
                        </p>
                      )}
                      <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
                        ⚠️ This submission was rejected by the Central Committee. Edit the responses below and resubmit.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/approval/queue')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                      ← Back to Queue
                    </button>
                  </div>
                </div>

                {/* Questions and Answers - Editable */}
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
                                  const currentValue = editedResponses[subQuestion.subQuestionId] || '';
                                  const currentEvidence = editedEvidenceLinks[subQuestion.subQuestionId] || '';
                                  
                                  return (
                                    <div 
                                      key={subQuestion.subQuestionId} 
                                      className="p-6 rounded-lg border-2 border-gray-200 bg-white transition-all shadow-md mb-6"
                                    >
                                      {/* Question Header with Answer Display */}
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
                                            {/* Always show current answer below question - all submitted submissions must have answers */}
                                            <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                              <p className="text-xs font-semibold text-gray-600 mb-1">Current Answer:</p>
                                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentValue || ''}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Show Central Committee comments if exists - Above the input */}
                                      {response && response.centralRejectionReason && (
                                        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                          <div className="flex items-start space-x-2">
                                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            <div className="flex-1">
                                              <p className="text-sm font-semibold text-blue-800 mb-1">
                                                Comments:
                                              </p>
                                              <p className="text-sm text-blue-700 whitespace-pre-wrap">{response.centralRejectionReason}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Editable Answer Section */}
                                      <div className="bg-white p-4 rounded-lg border border-gray-300">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                          Edit Answer:
                                        </label>
                                        {renderQuestionInput(subQuestion, response)}
                                      </div>
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

                {/* Navigation Buttons and Resubmit */}
                {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 && (
                  <div className="mt-6">
                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between bg-white border-2 border-mint-medium-gray rounded-xl p-6 shadow-sm mb-6">
                      <button
                        onClick={goToPreviousDimension}
                        disabled={currentDimensionIndex === 0}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          currentDimensionIndex === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#0d6670] hover:bg-[#0a4f57] text-white'
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
                            : 'bg-[#0d6670] hover:bg-[#0a4f57] text-white'
                        }`}
                      >
                        Next →
                      </button>
                    </div>

                    {/* Resubmit Button - Show on last dimension */}
                    {currentDimensionIndex === submissionDetails.groupedData.length - 1 && (
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-mint-dark-text mb-1">
                              Ready to Resubmit?
                            </h3>
                            <p className="text-sm text-mint-dark-text/70">
                              After editing, click the button below to resubmit this submission to the Central Committee.
                            </p>
                          </div>
                          <button
                            onClick={handleResubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                          >
                            {isSubmitting ? 'Resubmitting...' : 'Resubmit to Central Committee'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

