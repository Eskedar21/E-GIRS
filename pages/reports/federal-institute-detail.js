import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionById, 
  getResponsesBySubmission
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
  const { year, unit } = router.query;

  const [submission, setSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  // Find submission for the given year and unit
  useEffect(() => {
    if (!year || !unit) return;

    const assessmentYearId = parseInt(year);
    const unitId = parseInt(unit);

    // Get all submissions and find matching one
    const { getAllSubmissions } = require('../../data/submissions');
    const allSubmissions = getAllSubmissions();
    const matchingSubmission = allSubmissions.find(s => 
      s.assessmentYearId === assessmentYearId && s.unitId === unitId
    );

    if (matchingSubmission) {
      // Check access
      if (user && !canPerformAction(user, 'view_submission', matchingSubmission)) {
        return;
      }

      setSubmission(matchingSubmission);
      loadSubmissionDetails(matchingSubmission.submissionId);
    }
  }, [year, unit, user]);

  const loadSubmissionDetails = (submissionId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      const responses = getResponsesBySubmission(submissionId);
      
      // Get assessment framework data
      const assessmentYear = getAssessmentYearById(submission.assessmentYearId);
      const dimensions = assessmentYear ? getDimensionsByYear(submission.assessmentYearId) : [];
      
      // Group responses by dimension and indicator
      const groupedData = dimensions.map(dimension => {
        const indicators = getIndicatorsByDimension(dimension.dimensionId);
        return {
          dimension,
          indicators: indicators.map(indicator => {
            const subQuestions = getSubQuestionsByIndicator(indicator.indicatorId);
            return {
              indicator,
              subQuestions: subQuestions.map(sq => {
                const response = responses.find(r => r.subQuestionId === sq.subQuestionId);
                return {
                  subQuestion: sq,
                  response: response || null
                };
              }).filter(item => item.response !== null) // Only show answered questions
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

  if (!submission || !submissionDetails) {
    return (
      <ProtectedRoute allowedRoles={['MInT Admin', 'Central Committee Member', 'Chairman (CC)', 'Secretary (CC)', 'Institute Admin', 'Institute Data Contributor', 'Federal Data Contributor']}>
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
                    <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                      Federal Institute Detailed Submission
                    </h1>
                    <p className="text-mint-dark-text/70">
                      {getUnitName(submission.unitId)}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Institute Name</p>
                      <p className="text-lg font-bold text-mint-primary-blue">{getUnitName(submission.unitId)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-mint-dark-text/70 mb-1">Submission Status</p>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${
                        submission.submissionStatus === 'Validated' ? 'bg-green-100 text-green-800' :
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
                </div>
              </div>

              {/* Question & Answer Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-mint-primary-blue">Questions & Answers</h2>
                
                {submissionDetails.groupedData.length > 0 ? (
                  submissionDetails.groupedData.map(({ dimension, indicators: dimIndicators }) => (
                    <div key={dimension.dimensionId} className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                      <div className="mb-6 pb-4 border-b border-mint-medium-gray">
                        <h3 className="text-xl font-bold text-mint-primary-blue mb-2">
                          {dimension.dimensionName}
                        </h3>
                        <p className="text-sm text-mint-dark-text/70">
                          Dimension Weight: {dimension.dimensionWeight}%
                        </p>
                      </div>

                      {dimIndicators.map(({ indicator, subQuestions: indicatorSubQuestions }) => (
                        <div key={indicator.indicatorId} className="mb-8 pb-8 border-b border-mint-medium-gray last:border-b-0 last:mb-0 last:pb-0">
                          <div className="mb-4">
                            <h4 className="text-lg font-semibold text-mint-dark-text mb-2">
                              {indicator.indicatorName}
                            </h4>
                            <p className="text-sm text-mint-dark-text/70">
                              Indicator Weight: {indicator.indicatorWeight}%
                            </p>
                          </div>

                          <div className="space-y-4">
                            {indicatorSubQuestions.map(({ subQuestion, response }) => (
                              <div key={subQuestion.subQuestionId} className="p-5 bg-white rounded-lg border-2 border-mint-medium-gray shadow-sm hover:shadow-md transition-shadow">
                                <div className="mb-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-semibold text-mint-dark-text text-base leading-relaxed">
                                      {subQuestion.subQuestionText}
                                    </p>
                                    <span className="ml-3 px-2 py-1 bg-mint-primary-blue/10 text-mint-primary-blue text-xs font-semibold rounded whitespace-nowrap">
                                      {subQuestion.responseType}
                                    </span>
                                  </div>
                                  <p className="text-xs text-mint-dark-text/60">Weight: {subQuestion.subWeightPercentage}%</p>
                                </div>
                                
                                <div className="mb-4 p-4 bg-mint-light-gray rounded-lg border border-mint-medium-gray">
                                  <p className="text-sm font-semibold text-mint-dark-text/70 mb-2">Submitted Answer:</p>
                                  <p className="text-mint-dark-text bg-white p-3 rounded border border-mint-medium-gray whitespace-pre-wrap">
                                    {response?.responseValue || 'N/A'}
                                  </p>
                                </div>

                                {response?.evidenceLink && (
                                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-800 mb-2">Evidence Link:</p>
                                    <a
                                      href={response.evidenceLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-mint-primary-blue hover:underline break-all flex items-center space-x-2"
                                    >
                                      <span>{response.evidenceLink}</span>
                                      <span className="text-xs">↗</span>
                                    </a>
                                  </div>
                                )}

                                {response?.generalNote && (
                                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-lg">✓</span>
                                      <p className="text-sm font-semibold text-green-800">Central Committee Note:</p>
                                    </div>
                                    <p className="text-sm text-green-700 whitespace-pre-wrap">{response.generalNote}</p>
                                  </div>
                                )}

                                {response?.centralRejectionReason && (
                                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-lg">✗</span>
                                      <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                                    </div>
                                    <p className="text-sm text-red-700 whitespace-pre-wrap">{response.centralRejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-8 border border-mint-medium-gray text-center">
                    <p className="text-mint-dark-text/70">No responses found for this submission.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

