import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { 
  getSubmissionById, 
  getResponsesBySubmission,
  getAllSubmissions,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getUnitById } from '../../data/administrativeUnits';
import { canPerformAction } from '../../utils/permissions';
import {
  getSubQuestionById,
  getSubQuestionsByIndicator,
  getSubQuestionsInTreeOrder,
  getIndicatorsByDimension,
  getDimensionsByYear,
  getAssessmentYearById
} from '../../data/assessmentFramework';

export default function FederalInstituteDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  const { year, unit, submissionId } = router.query;

  const [submission, setSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sampleSubmissions, setSampleSubmissions] = useState([]);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  // Find submission - prefer submissionId if provided, otherwise find by year and unit
  useEffect(() => {
    // Wait for router to be ready
    if (!router.isReady) return;
    
    let foundSubmission = null;
    let assessmentYearId = null;

    // If submissionId is provided, use it directly
    if (submissionId) {
      const submissionIdNum = parseInt(submissionId, 10);
      if (!isNaN(submissionIdNum)) {
        foundSubmission = getSubmissionById(submissionIdNum);
        if (!foundSubmission) {
          const allSubs = getAllSubmissions();
          foundSubmission = allSubs.find(s => s.submissionId === submissionIdNum);
        }
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
    
    // Load sample submissions for the same institute
    if (foundSubmission) {
      loadSampleSubmissions(foundSubmission.unitId, foundSubmission.assessmentYearId);
    }
  }, [router.isReady, year, unit, submissionId, user]);

  const loadSampleSubmissions = (unitId, assessmentYearId) => {
    const allSubmissions = getAllSubmissions();
    const instituteSubmissions = allSubmissions.filter(s => 
      s.unitId === unitId && s.assessmentYearId === assessmentYearId
    ).sort((a, b) => {
      const aDate = new Date(b.updatedAt || b.submittedDate || b.createdAt);
      const bDate = new Date(a.updatedAt || a.submittedDate || a.createdAt);
      return aDate - bDate;
    });
    
    // Show all existing submissions for this institute (these are the "sample" submissions)
    // They represent different statuses and can be viewed by clicking on them
    setSampleSubmissions(instituteSubmissions);
  };

  const handleSelectSubmission = (selectedSubmissionId) => {
    router.push(`/reports/federal-institute-detail?submissionId=${selectedSubmissionId}`);
  };

  const loadSubmissionDetails = (submissionId, assessmentYearId) => {
    const id = Number(submissionId);
    if (Number.isNaN(id)) {
      setIsLoading(false);
      return;
    }
    let submission = getSubmissionById(id);
    if (!submission) {
      const allSubs = getAllSubmissions();
      submission = allSubs.find(s => s.submissionId === id);
    }
    if (submission) {
      const yearId = Number(assessmentYearId ?? submission.assessmentYearId);
      const responses = getResponsesBySubmission(id);
      
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
      
      // Get assessment framework data - use numeric yearId for consistent lookup
      const assessmentYear = getAssessmentYearById(yearId);
      const dimensions = assessmentYear ? getDimensionsByYear(yearId) : [];
      
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
            const subQuestions = getSubQuestionsInTreeOrder(indicator.indicatorId);
            const questionsWithResponses = subQuestions.map(sq => {
              const response = responses.find(r => r.subQuestionId === sq.subQuestionId);
              return {
                subQuestion: sq,
                response: response || null
              };
            });
            
            // For draft: show all questions but only some have answers (partial completion)
            // For other statuses: only show questions that have responses (all should be answered)
            let filteredQuestions;
            if (isDraft) {
              // For draft, show all questions but only answer some (e.g., first 60% of questions)
              const totalQuestions = questionsWithResponses.length;
              const answeredCount = Math.floor(totalQuestions * 0.6); // 60% answered
              filteredQuestions = questionsWithResponses.map((q, idx) => {
                if (idx < answeredCount && q.response && q.response.responseValue) {
                  return q;
                } else if (idx >= answeredCount) {
                  return { ...q, response: null }; // No answer for remaining questions
                }
                return q;
              });
            } else {
              // For approved/validated/rejected: all questions must be answered
              filteredQuestions = questionsWithResponses.filter(q => q.response && q.response.responseValue);
            }
            
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

  const goToDimension = (index) => {
    setCurrentDimensionIndex(index);
  };

  useEffect(() => {
    if (submissionDetails?.groupedData?.length > 0 &&
        currentDimensionIndex >= 0 && currentDimensionIndex < submissionDetails.groupedData.length) {
      const dimension = submissionDetails.groupedData[currentDimensionIndex].dimension;
      setActiveSection(dimension.dimensionId);
    }
  }, [currentDimensionIndex, submissionDetails]);

  useEffect(() => {
    if (submissionDetails?.groupedData?.length > 0) {
      setCurrentDimensionIndex(0);
    }
  }, [submissionId]);

  const allowedDetailRoles = ['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor', 'Federal Approver'];
  const showNotFound = router.isReady && !isLoading && !submission;
  const showLoading = !router.isReady || (isLoading && !submission);

  const mainMarginClass = `transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`;

  if (showLoading) {
    return (
      <ProtectedRoute allowedRoles={allowedDetailRoles}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto ${mainMarginClass}`}>
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-sm text-mint-dark-text/70">Loading submission details...</p>
                </div>
              </div>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (showNotFound) {
    return (
      <ProtectedRoute allowedRoles={allowedDetailRoles}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto ${mainMarginClass}`}>
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-sm text-mint-dark-text/70 mb-4">Submission not found.</p>
                  <Link
                    href="/reports/federal-institutes-overview"
                    className="text-mint-primary-blue hover:text-mint-secondary-blue hover:underline text-sm font-medium"
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
      <ProtectedRoute allowedRoles={allowedDetailRoles}>
        <Layout title="Federal Institute Detailed Submission">
          <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto ${mainMarginClass}`}>
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-sm text-mint-dark-text/70 mb-4">Unable to load submission details.</p>
                  <Link
                    href="/reports/federal-institutes-overview"
                    className="text-mint-primary-blue hover:text-mint-secondary-blue hover:underline text-sm font-medium"
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

  const getStatusColor = (status) => {
    const statusConfig = {
      [SUBMISSION_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL]: 'bg-blue-100 text-blue-800 border-blue-300',
      [SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION]: 'bg-orange-100 text-orange-800 border-orange-300',
      [SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER]: 'bg-red-100 text-red-800 border-red-300',
      [SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE]: 'bg-red-100 text-red-800 border-red-300',
      [SUBMISSION_STATUS.VALIDATED]: 'bg-green-100 text-green-800 border-green-300',
      [SUBMISSION_STATUS.SCORING_COMPLETE]: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return statusConfig[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const hasDimensions = submissionDetails?.groupedData && submissionDetails.groupedData.length > 0;

  const renderSubQuestions = (indicatorSubQuestions) =>
    indicatorSubQuestions.map(({ subQuestion, response }, sqIdx) => {
      const globalQuestionNumber = questionNumberMap[subQuestion.subQuestionId] || 0;
      const answerText = response?.responseValue || '';
      const depth = subQuestion.depth ?? (subQuestion.parentSubQuestionId != null ? 2 : 1);
      const indentClass = depth === 2 ? 'ml-6 border-l-4 border-mint-primary-blue/40' : depth === 3 ? 'ml-10 border-l-4 border-mint-primary-blue/30' : '';
      return (
        <div
          key={subQuestion.subQuestionId}
          className={`p-6 rounded-lg border-2 border-gray-200 bg-white transition-all shadow-md mb-6 ${indentClass}`}
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
              {response.evidenceLink && (
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Evidence Link</label>
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

              {(response.regionalNote || response.generalNote || response.centralRejectionReason || response.regionalRejectionReason) && (
                <div className="mt-3 bg-gray-50 rounded-lg border border-gray-300 p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-gray-900">Comments</h4>
                  </div>
                  {response.regionalNote && (
                    <div className="mb-4 bg-white rounded-lg border border-gray-300 p-3">
                      <div className="flex items-start space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">Regional Approver</span>
                            {response.updatedAt && <span className="text-xs text-gray-500 ml-2">{formatDate(response.updatedAt)}</span>}
                          </div>
                          <p className="text-xs text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{response.regionalNote}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {response.regionalRejectionReason && (
                    <div className="mb-4 bg-red-50 rounded-lg border-2 border-red-200 p-3">
                      <div className="flex items-start space-x-2 mb-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-red-900">Regional Approver - Rejection Reason</span>
                            {response.updatedAt && <span className="text-xs text-red-600 ml-2">{formatDate(response.updatedAt)}</span>}
                          </div>
                          <p className="text-xs text-red-800 whitespace-pre-wrap break-words leading-relaxed">{response.regionalRejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {response.generalNote && (
                    <div className="mb-4 bg-green-50 rounded-lg border-2 border-green-200 p-3">
                      <div className="flex items-start space-x-2 mb-2">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-green-900">Central Committee - Note</span>
                            {response.updatedAt && <span className="text-xs text-green-600 ml-2">{formatDate(response.updatedAt)}</span>}
                          </div>
                          <p className="text-xs text-green-800 whitespace-pre-wrap break-words leading-relaxed">{response.generalNote}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {response.centralRejectionReason && (
                    <div className="mb-4 bg-red-50 rounded-lg border-2 border-red-200 p-3">
                      <div className="flex items-start space-x-2 mb-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-red-900">Central Committee - Rejection Reason</span>
                            {response.updatedAt && <span className="text-xs text-red-600 ml-2">{formatDate(response.updatedAt)}</span>}
                          </div>
                          <p className="text-xs text-red-800 whitespace-pre-wrap break-words leading-relaxed">{response.centralRejectionReason}</p>
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
    });

  return (
    <ProtectedRoute allowedRoles={allowedDetailRoles}>
      <Layout title={`Federal Institute Submission - ${getUnitName(submission.unitId)}`}>
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          {/* Assessment Dimensions Navigation - same as approval view */}
          {hasDimensions && (
            <aside className={`w-80 bg-transparent fixed top-16 bottom-0 overflow-y-auto z-40 pl-8 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`}>
              <div className="p-4 pt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Assessment Dimensions</h2>
                <div className="space-y-1">
                  {submissionDetails.groupedData.map(({ dimension }, index) => (
                    <div key={dimension.dimensionId}>
                      <button
                        type="button"
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
          <div
            className={`flex flex-grow ${mainMarginClass}`}
            style={hasDimensions ? { marginLeft: isCollapsed ? 'calc(64px + 320px)' : 'calc(256px + 320px)' } : {}}
          >
            <main className="flex-1 p-8 bg-white text-mint-dark-text min-h-screen overflow-y-auto">
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header - same structure as approval view */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                        {submission.submissionName || getUnitName(submission.unitId)}
                      </h1>
                      {submission.submissionName && (
                        <p className="text-sm text-mint-dark-text/60">
                          {getUnitName(submission.unitId)}
                        </p>
                      )}
                      {!submission.submissionName && (
                        <p className="text-sm text-mint-dark-text/60 mt-1">
                          Read-only view. Review submission details, status, and comments.
                        </p>
                      )}
                      <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        Read-Only View
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={printToPDF}
                        className="px-4 py-2 bg-[#0d6670] hover:bg-[#0a4f57] text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        Print to PDF
                      </button>
                      <Link
                        href="/reports/federal-institutes-overview"
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                      >
                        ← Back to Overview
                      </Link>
                    </div>
                  </div>

                {/* Submission Info */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Institute Name</p>
                      <p className="text-base font-normal text-mint-dark-text">{getUnitName(submission.unitId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Assessment Year</p>
                      <p className="text-base font-normal text-mint-dark-text">
                        {getAssessmentYearById(submission.assessmentYearId)?.yearName || `Year ${submission.assessmentYearId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Submission Status</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-base font-normal text-mint-dark-text ${
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
                      <p className="text-base font-normal text-mint-dark-text">{formatDate(submission.submittedDate || submission.createdAt)}</p>
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

              {/* Question & Answer Section - one dimension at a time, same as approval view */}
              {submissionDetails.groupedData.length > 0 && (
                <div className="space-y-6">
                  {(submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }, dimIdx) => {
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
                              {renderSubQuestions(indicatorSubQuestions)}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }) )}
                </div>
              )}
              {submissionDetails.groupedData.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                  <p className="text-mint-dark-text/70">No responses found for this submission.</p>
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

