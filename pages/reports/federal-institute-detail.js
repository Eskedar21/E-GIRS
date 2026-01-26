import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionById, 
  getResponsesBySubmission,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getUnitById } from '../../data/administrativeUnits';
import { canPerformAction } from '../../utils/permissions';
import { 
  getSubQuestionById, 
  getSubQuestionsByIndicator,
  getIndicatorsByDimension,
  getDimensionsByYear,
  getAssessmentYearById
} from '../../data/assessmentFramework';

export default function FederalInstituteDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { year, unit, submissionId } = router.query;

  const [submission, setSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Find submission - prefer submissionId if provided, otherwise find by year and unit
  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;
    
    let foundSubmission = null;
    let assessmentYearId = null;

    // If submissionId is provided, use it directly
    if (submissionId) {
      const submissionIdNum = parseInt(submissionId);
      if (!isNaN(submissionIdNum)) {
        foundSubmission = getSubmissionById(submissionIdNum);
        if (foundSubmission) {
          assessmentYearId = foundSubmission.assessmentYearId;
        }
      }
    } 
    // Otherwise, find by year and unit (get latest)
    else if (year && unit) {
      const assessmentYearIdNum = parseInt(year);
      const unitId = parseInt(unit);

      // Validate parsed values
      if (!isNaN(assessmentYearIdNum) && !isNaN(unitId)) {
        const { getAllSubmissions } = require('../../data/submissions');
        const allSubmissions = getAllSubmissions();
        const matchingSubmissions = allSubmissions.filter(s => 
          s.assessmentYearId === assessmentYearIdNum && s.unitId === unitId
        );

        if (matchingSubmissions.length > 0) {
          // Get the latest submission (most recent by updatedAt or submittedDate)
          foundSubmission = matchingSubmissions.sort((a, b) => {
            const aDate = new Date(b.updatedAt || b.submittedDate || b.createdAt);
            const bDate = new Date(a.updatedAt || a.submittedDate || a.createdAt);
            return aDate - bDate;
          })[0];
          assessmentYearId = assessmentYearIdNum;
        }
      }
    }

    if (!foundSubmission) {
      setIsLoading(false);
      return;
    }

    // Check access
    if (user && !canPerformAction(user, 'view_submission', foundSubmission)) {
      setIsLoading(false);
      return;
    }

    setSubmission(foundSubmission);
    loadSubmissionDetails(foundSubmission.submissionId, assessmentYearId || foundSubmission.assessmentYearId);
  }, [router.isReady, year, unit, submissionId, user]);

  const loadSubmissionDetails = (submissionId, assessmentYearId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      const responses = getResponsesBySubmission(submissionId);
      
      // Get the unit to determine its type
      const unit = getUnitById(submission.unitId);
      const unitType = unit ? unit.unitType : null;
      
      // Map unit type to applicable unit types - Federal Institute uses Region indicators
      const getApplicableUnitTypes = (ut) => {
        if (!ut) return [];
        if (ut === 'Federal Institute') return ['Region'];
        if (ut === 'City Administration') return ['Region'];
        if (ut === 'Sub-city') return ['Woreda'];
        return [ut];
      };
      const applicableUnitTypes = getApplicableUnitTypes(unitType);
      
      // Get assessment framework data - use the provided assessmentYearId to ensure consistency
      const assessmentYear = getAssessmentYearById(assessmentYearId || submission.assessmentYearId);
      const dimensions = assessmentYear ? getDimensionsByYear(assessmentYearId || submission.assessmentYearId) : [];
      
      // Determine if we should show all questions or only answered ones
      const isDraft = submission.submissionStatus === SUBMISSION_STATUS.DRAFT;
      
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
            const questionsWithResponses = subQuestions.map(sq => {
              const response = responses.find(r => r.subQuestionId === sq.subQuestionId);
              return {
                subQuestion: sq,
                response: response || null
              };
            });
            
            // For draft: show all questions (some may not be answered)
            // For other statuses: only show questions that have responses (all should be answered)
            const filteredQuestions = isDraft 
              ? questionsWithResponses 
              : questionsWithResponses.filter(q => q.response && q.response.responseValue);
            
            return {
              indicator,
              subQuestions: filteredQuestions
            };
          }).filter(ind => ind.subQuestions.length > 0)
        };
      }).filter(dim => dim.indicators.length > 0);
      
      setSubmissionDetails({
        submission,
        responses,
        groupedData
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const printToPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor']}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70">Loading submission details...</p>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!submission) {
    return (
      <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor']}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70 mb-4">Submission not found.</p>
                  <Link
                    href="/reports/federal-institutes-overview"
                    className="text-mint-primary-blue hover:text-mint-secondary-blue hover:underline"
                  >
                    ← Back to Federal Institutes Overview
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!submissionDetails) {
    return (
      <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor']}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
              <div className="w-full">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70 mb-4">Unable to load submission details.</p>
                  <Link
                    href="/reports/federal-institutes-overview"
                    className="text-mint-primary-blue hover:text-mint-secondary-blue hover:underline"
                  >
                    ← Back to Federal Institutes Overview
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor']}>
      <Layout title={`Federal Institute Submission - ${getUnitName(submission.unitId)}`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Link
                    href="/reports/federal-institutes-overview"
                    className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                  >
                    <span className="text-xl mr-2">←</span>
                    <span className="text-sm font-medium">Back to Federal Institutes Overview</span>
                  </Link>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-mint-primary-blue">
                        Federal Institute Detailed Submission
                      </h1>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Read-Only View
                      </span>
                    </div>
                    <p className="text-mint-dark-text/70">
                      {getUnitName(submission.unitId)}
                    </p>
                    <p className="text-sm text-mint-dark-text/60 mt-1">
                      Review submission details, status, and comments. This is a read-only view.
                    </p>
                  </div>
                  <button
                    onClick={printToPDF}
                    className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white font-semibold rounded-lg transition-colors"
                  >
                    Print to PDF
                  </button>
                </div>

                {/* Submission Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Institute Name</p>
                      <p className="text-lg font-bold text-mint-primary-blue">{getUnitName(submission.unitId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Assessment Year</p>
                      <p className="text-lg text-mint-dark-text">
                        {getAssessmentYearById(submission.assessmentYearId)?.yearName || `Year ${submission.assessmentYearId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Submission Status</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                        submission.submissionStatus === 'Validated' ? 'bg-green-100 text-green-800' :
                        submission.submissionStatus === 'Scoring Complete' ? 'bg-blue-100 text-blue-800' :
                        submission.submissionStatus === 'Pending Central Validation' ? 'bg-orange-100 text-orange-800' :
                        submission.submissionStatus === 'Pending Initial Approval' ? 'bg-[#0d6670]/10 text-[#0d6670]' :
                        submission.submissionStatus === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.submissionStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Submitted Date</p>
                      <p className="text-lg text-mint-dark-text">{formatDate(submission.submittedDate || submission.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Submission-Level Comments */}
                  {submission.rejectionReason && (
                    <div className="mt-4 pt-4 border-t border-mint-medium-gray">
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">⚠️</span>
                          <p className="text-sm font-semibold text-red-800">Submission-Level Rejection Reason:</p>
                        </div>
                        <p className="text-sm text-red-700 whitespace-pre-wrap">{submission.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Summary of Response-Level Comments */}
                  {submissionDetails && submissionDetails.responses && (() => {
                    const responsesWithComments = submissionDetails.responses.filter(r => 
                      (r.generalNote && r.generalNote.trim()) || 
                      (r.centralRejectionReason && r.centralRejectionReason.trim())
                    );
                    
                    if (responsesWithComments.length > 0) {
                      return (
                        <div className="mt-4 pt-4 border-t border-mint-medium-gray">
                          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <svg className="w-5 h-5 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              <p className="text-sm font-semibold text-blue-800">
                                Response-Level Comments Summary:
                              </p>
                            </div>
                            <p className="text-sm text-blue-700 mb-2">
                              This submission has <strong>{responsesWithComments.length}</strong> response{responsesWithComments.length !== 1 ? 's' : ''} with comments or rejection reasons. 
                              Scroll down to view detailed comments for each question.
                            </p>
                            <div className="space-y-2 mt-3">
                              {responsesWithComments.slice(0, 3).map((response, idx) => {
                                const hasNote = response.generalNote && response.generalNote.trim();
                                const hasRejection = response.centralRejectionReason && response.centralRejectionReason.trim();
                                return (
                                  <div key={idx} className="text-xs text-blue-600 bg-white p-2 rounded border border-blue-200">
                                    {hasRejection && (
                                      <span className="font-semibold">Rejection: </span>
                                    )}
                                    {hasNote && (
                                      <span className="font-semibold">Note: </span>
                                    )}
                                    {(hasRejection ? response.centralRejectionReason : response.generalNote).substring(0, 100)}
                                    {((hasRejection ? response.centralRejectionReason : response.generalNote).length > 100) && '...'}
                                  </div>
                                );
                              })}
                              {responsesWithComments.length > 3 && (
                                <p className="text-xs text-blue-600 italic">
                                  + {responsesWithComments.length - 3} more comment{responsesWithComments.length - 3 !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Question & Answer Section - Matching Approver Interface Style */}
              {submissionDetails.groupedData.length > 0 ? (
                <div className="space-y-6">
                  {submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }, dimIdx) => {
                    // Calculate question numbers
                    let questionNumber = 1;
                    submissionDetails.groupedData.slice(0, dimIdx).forEach(({ indicators: prevIndicators }) => {
                      prevIndicators.forEach(({ subQuestions }) => {
                        questionNumber += subQuestions.length;
                      });
                    });

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
                                const globalQuestionNumber = questionNumber + sqIdx;
                                const answerText = response?.responseValue || '';
                                
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
                                          {/* Answer inline with question */}
                                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Answer:</p>
                                            <p className={`text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed ${!answerText ? 'text-gray-400 italic' : ''}`}>
                                              {answerText || 'No response provided'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Additional Details Section */}
                                    {response && (
                                      <div className="space-y-3">
                                        {/* Evidence Link */}
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

                                        {/* Comments Section - Read-only view like approver interface */}
                                        {(response.regionalNote || response.generalNote || response.centralRejectionReason || response.regionalRejectionReason) && (
                                          <div className="mt-3 bg-gray-50 rounded-lg border border-gray-300 p-4">
                                            <div className="mb-3">
                                              <h4 className="text-sm font-bold text-gray-900">Comments</h4>
                                            </div>
                                    
                                            {/* Regional Approver Note */}
                                            {response.regionalNote && (
                                              <div className="mb-4 bg-white rounded-lg border border-gray-300 p-3">
                                                <div className="flex items-start space-x-2 mb-2">
                                                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                  </svg>
                                                  <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-1">
                                                      <span className="text-xs font-semibold text-gray-900">
                                                        Regional Approver
                                                      </span>
                                                      {response.updatedAt && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                          {formatDate(response.updatedAt)}
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                                                      {response.regionalNote}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Regional Rejection Reason */}
                                            {response.regionalRejectionReason && (
                                      <div className="mb-4 bg-red-50 rounded-lg border-2 border-red-200 p-3">
                                        <div className="flex items-start space-x-2 mb-2">
                                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                              <span className="text-xs font-semibold text-red-900">
                                                Regional Approver - Rejection Reason
                                              </span>
                                              {response.updatedAt && (
                                                <span className="text-xs text-red-600 ml-2">
                                                  {formatDate(response.updatedAt)}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-red-800 whitespace-pre-wrap break-words leading-relaxed">
                                              {response.regionalRejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                            )}

                                            {/* Central Committee General Note */}
                                            {response.generalNote && (
                                      <div className="mb-4 bg-green-50 rounded-lg border-2 border-green-200 p-3">
                                        <div className="flex items-start space-x-2 mb-2">
                                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                              <span className="text-xs font-semibold text-green-900">
                                                Central Committee - Note
                                              </span>
                                              {response.updatedAt && (
                                                <span className="text-xs text-green-600 ml-2">
                                                  {formatDate(response.updatedAt)}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-green-800 whitespace-pre-wrap break-words leading-relaxed">
                                              {response.generalNote}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                            )}

                                            {/* Central Committee Rejection Reason */}
                                            {response.centralRejectionReason && (
                                      <div className="mb-4 bg-red-50 rounded-lg border-2 border-red-200 p-3">
                                        <div className="flex items-start space-x-2 mb-2">
                                          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between mb-1">
                                              <span className="text-xs font-semibold text-red-900">
                                                Central Committee - Rejection Reason
                                              </span>
                                              {response.updatedAt && (
                                                <span className="text-xs text-red-600 ml-2">
                                                  {formatDate(response.updatedAt)}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-red-800 whitespace-pre-wrap break-words leading-relaxed">
                                              {response.centralRejectionReason}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                            )}
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
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70">No responses found for this submission.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

