import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { getSubmissionById, getResponsesBySubmission, saveResponse, resubmitToCentralCommittee, SUBMISSION_STATUS } from '../../../data/submissions';
import { getUnitById } from '../../../data/administrativeUnits';
import { canPerformAction } from '../../../utils/permissions';
import { getSubQuestionsByIndicator, getIndicatorsByDimension } from '../../../data/assessmentFramework';
import { getDimensionsByYear, getAssessmentYearById } from '../../../data/assessmentFramework';

export default function EditSubmission() {
  const router = useRouter();
  const { submissionId } = router.query;
  const { user } = useAuth();
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [editedResponses, setEditedResponses] = useState({});
  const [editedEvidenceLinks, setEditedEvidenceLinks] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      responses.forEach(r => {
        responseMap[r.subQuestionId] = r.responseValue || '';
        evidenceMap[r.subQuestionId] = r.evidenceLink || '';
      });
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
    if (submissionDetails) {
      saveResponse({
        submissionId: submissionDetails.submission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: value,
        evidenceLink: editedEvidenceLinks[subQuestionId] || null
      });
    }
  };

  const handleEvidenceChange = (subQuestionId, link) => {
    setEditedEvidenceLinks(prev => ({
      ...prev,
      [subQuestionId]: link
    }));
    
    // Auto-save to database
    if (submissionDetails) {
      saveResponse({
        submissionId: submissionDetails.submission.submissionId,
        subQuestionId: subQuestionId,
        responseValue: editedResponses[subQuestionId] || '',
        evidenceLink: link || null
      });
    }
  };

  const handleResubmit = () => {
    if (!submissionDetails) return;
    
    if (confirm('Are you sure you want to resubmit this submission to the Central Committee? All changes will be saved.')) {
      setIsSubmitting(true);
      try {
        // Save all responses first
        Object.keys(editedResponses).forEach(subQuestionId => {
          saveResponse({
            submissionId: submissionDetails.submission.submissionId,
            subQuestionId: parseInt(subQuestionId),
            responseValue: editedResponses[subQuestionId],
            evidenceLink: editedEvidenceLinks[subQuestionId] || null
          });
        });
        
        // Resubmit to Central Committee
        const result = resubmitToCentralCommittee(submissionDetails.submission.submissionId);
        
        if (result) {
          setSuccessMessage('✅ Submission edited and resubmitted to Central Committee successfully!');
          setTimeout(() => {
            router.push('/approval/rejected-submissions');
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
        <div className="flex">
          <Sidebar />
          <div className="flex flex-grow ml-64">
            {/* Main Content */}
            <main className="flex-1 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
              <div className="w-full max-w-5xl mx-auto">
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
                      onClick={() => router.push('/approval/rejected-submissions')}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                      ← Back to Rejected Submissions
                    </button>
                  </div>
                </div>

                {/* Questions and Answers - Editable */}
                {submissionDetails.groupedData && submissionDetails.groupedData.length > 0 ? (
                  <div className="space-y-6">
                    {submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }, dimIdx) => {
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
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Editable Answer Section */}
                                      <div className="space-y-3">
                                        <div className="bg-white p-4 rounded-lg border border-gray-300">
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Answer
                                          </label>
                                          <textarea
                                            value={currentValue}
                                            onChange={(e) => handleResponseChange(subQuestion.subQuestionId, e.target.value)}
                                            rows="4"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue resize-none"
                                            placeholder="Enter your answer here..."
                                          />
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-gray-300">
                                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Evidence Link (Optional)
                                          </label>
                                          <input
                                            type="url"
                                            value={currentEvidence}
                                            onChange={(e) => handleEvidenceChange(subQuestion.subQuestionId, e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                                            placeholder="https://example.com/evidence"
                                          />
                                        </div>
                                        
                                        {/* Show Central Committee rejection reason if exists */}
                                        {response && response.centralRejectionReason && (
                                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                            <p className="text-sm font-semibold text-red-800 mb-1">
                                              Central Committee Rejection Reason:
                                            </p>
                                            <p className="text-sm text-red-700">{response.centralRejectionReason}</p>
                                          </div>
                                        )}
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

                {/* Resubmit Button */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-300">
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
                      className="px-6 py-3 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Resubmitting...' : 'Resubmit to Central Committee'}
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

