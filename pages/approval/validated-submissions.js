import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmissionsByStatus, 
  getSubmissionById, 
  getResponsesBySubmission,
  SUBMISSION_STATUS
} from '../../data/submissions';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { filterSubmissionsByAccess } from '../../utils/permissions';
import { getSubQuestionById, getSubQuestionsByIndicator } from '../../data/assessmentFramework';
import { getDimensionsByYear, getIndicatorsByDimension, getAssessmentYearById } from '../../data/assessmentFramework';

export default function ValidatedSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const allUnits = getAllUnits();
    // Load validated submissions
    const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
    // Filter based on user's access scope
    const filtered = filterSubmissionsByAccess(validated, user, allUnits);
    setSubmissions(filtered);
  }, [user]);

  const loadSubmissionDetails = (submissionId) => {
    const submission = getSubmissionById(submissionId);
    if (submission) {
      setSelectedSubmission(submission);
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
              }).filter(item => item.response !== null || item.subQuestion)
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

  return (
    <ProtectedRoute allowedRoles={['Regional Approver', 'Federal Approver', 'Initial Approver']}>
      <Layout title="Validated Submissions">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
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
                <div>
                  <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                    Validated Submissions Report
                  </h1>
                  <p className="text-mint-dark-text/70">View validated submissions with Central Committee notes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                    <h2 className="text-xl font-semibold text-mint-primary-blue mb-4">
                      Validated Submissions ({submissions.length})
                    </h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {submissions.length === 0 ? (
                        <p className="text-mint-dark-text/70 text-sm">No validated submissions</p>
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
                            <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                              Validated
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
                        <p className="text-xs text-mint-dark-text/60 mt-2">
                          This is a read-only view of validated submissions. Central Committee notes are displayed alongside approved answers.
                        </p>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-mint-dark-text">Validated Responses</h3>
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
                                      {indicatorSubQuestions.map(({ subQuestion, response }) => (
                                        <div key={subQuestion.subQuestionId} className="bg-white p-4 rounded-lg border border-mint-medium-gray">
                                          <div className="mb-3">
                                            <p className="font-semibold text-mint-dark-text mb-2">
                                              {subQuestion.subQuestionText}
                                              <span className="ml-2 text-xs text-mint-dark-text/60 font-normal">
                                                (Weight: {subQuestion.subWeightPercentage}%)
                                              </span>
                                            </p>
                                          </div>
                                          {response ? (
                                            <>
                                              <div className="bg-mint-light-gray p-3 rounded mb-2">
                                                <p className="text-sm font-semibold text-mint-dark-text mb-1">Answer:</p>
                                                <p className="text-mint-dark-text">{response.responseValue}</p>
                                              </div>
                                              {response.evidenceLink && (
                                                <div className="mb-2">
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
                                              <div className="mt-2">
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                                  ✓ Approved
                                                </span>
                                              </div>
                                            </>
                                          ) : (
                                            <p className="text-sm text-mint-dark-text/70 italic">No response provided</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : submissionDetails.responses.length > 0 ? (
                          <div className="space-y-4">
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
                                    <div className="mb-2">
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
                                  <div className="mt-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                      ✓ Approved
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-mint-dark-text/70">No responses found for this submission.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray text-center">
                      <p className="text-mint-dark-text/70">Select a submission from the list to view details</p>
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

