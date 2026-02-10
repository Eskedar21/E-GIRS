import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import Sidebar from '../../../components/Sidebar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useAuth } from '../../../contexts/AuthContext';
import { useSidebar } from '../../../contexts/SidebarContext';
import {
  getSubmissionById,
  getSubjectiveResponsesForSubmission,
  getSubjectiveScoresByResponse,
  getFinalSubQuestionScore,
  assignSubjectiveScore,
  submitMyScoringToChairman,
  getScoringSubmissionsToChairman,
  SUBMISSION_STATUS
} from '../../../data/submissions';
import { getUnitById } from '../../../data/administrativeUnits';
import { getUsersByRole } from '../../../data/users';
import { getDimensionsByYear, getIndicatorsByDimension, getAssessmentYearById } from '../../../data/assessmentFramework';

const SCORE_OPTIONS = [
  { value: 1, label: 'Meets Expectations' },
  { value: 0.5, label: 'Partially Meets' },
  { value: 0, label: 'Does Not Meet' }
];

export default function ScoreSubjectiveSubmission() {
  const router = useRouter();
  const { submissionId } = router.query;
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  const userRole = user ? user.role : '';
  const isReadOnly = userRole === 'Secretary (CC)';

  const [submission, setSubmission] = useState(null);
  const [subjectiveResponses, setSubjectiveResponses] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [submittingToChairman, setSubmittingToChairman] = useState(false);
  const [showSubmitToChairmanModal, setShowSubmitToChairmanModal] = useState(false);
  const [showSubmitToChairmanSuccessModal, setShowSubmitToChairmanSuccessModal] = useState(false);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  useEffect(() => {
    if (!submissionId) return;
    const id = parseInt(submissionId, 10);
    const sub = getSubmissionById(id);
    if (!sub) return;
    setSubmission(sub);
    const list = getSubjectiveResponsesForSubmission(id);
    setSubjectiveResponses(list);
    const myScores = {};
    list.forEach(r => {
      const memberScores = getSubjectiveScoresByResponse(r.responseId);
      const mine = memberScores.find(s => s.committeeMemberId === user?.userId);
      if (mine != null) myScores[r.responseId] = mine.assignedScore;
    });
    setScores(myScores);
  }, [submissionId, user?.userId]);

  // Build grouped data by dimension for sidebar (only dimensions that have subjective responses)
  const groupedData = useMemo(() => {
    if (!submission || subjectiveResponses.length === 0) return [];
    const dimensions = getDimensionsByYear(submission.assessmentYearId) || [];
    const result = [];
    dimensions.forEach(dimension => {
      const indicators = getIndicatorsByDimension(dimension.dimensionId) || [];
      const indicatorsWithResponses = indicators.map(indicator => {
        const respList = subjectiveResponses.filter(
          r => r.subQuestion && r.subQuestion.parentIndicatorId === indicator.indicatorId
        );
        return respList.length > 0 ? { indicator, subjectiveResponses: respList } : null;
      }).filter(Boolean);
      if (indicatorsWithResponses.length > 0) {
        result.push({ dimension, indicators: indicatorsWithResponses });
      }
    });
    return result;
  }, [submission, subjectiveResponses]);

  const handleScoreChange = (responseId, value) => {
    if (isReadOnly) return;
    setScores(prev => ({ ...prev, [responseId]: value }));
  };

  const getUnitName = (unitId) => {
    const unit = getUnitById(unitId);
    return unit ? unit.officialUnitName : 'Unknown';
  };

  const committeeMembers = useMemo(() => getUsersByRole('Central Committee Member') || [], []);

  // Current user must have scored every response (in state or already saved)
  const allScoredByMe = subjectiveResponses.length > 0 && subjectiveResponses.every(r =>
    (scores[r.responseId] !== undefined && scores[r.responseId] !== null) ||
    getSubjectiveScoresByResponse(r.responseId).some(s => s.committeeMemberId === user?.userId)
  );

  // How many members have submitted their scoring to the Chairman (list grows as they submit)
  const submittedToChairmanCount = useMemo(() => {
    if (!submissionId) return 0;
    return getScoringSubmissionsToChairman(parseInt(submissionId, 10)).length;
  }, [submissionId, submission, scores]);

  const canSubmitToChairman = !isReadOnly && submission?.submissionStatus === SUBMISSION_STATUS.VALIDATED && allScoredByMe;

  const handleOpenSubmitToChairmanModal = () => {
    if (!user || !submissionId) return;
    setSaving(true);
    try {
      subjectiveResponses.forEach(r => {
        const val = scores[r.responseId];
        if (val !== undefined && val !== null) assignSubjectiveScore(r.responseId, user.userId, val);
      });
      const id = parseInt(submissionId, 10);
      setSubmission(getSubmissionById(id));
      const updatedList = getSubjectiveResponsesForSubmission(id);
      setSubjectiveResponses(updatedList);
      const nowAllScoredByMe = updatedList.every(r =>
        getSubjectiveScoresByResponse(r.responseId).some(s => s.committeeMemberId === user.userId)
      );
      if (!nowAllScoredByMe) {
        alert('Please score all answers before submitting. Go through each dimension and assign a score to every question.');
        return;
      }
      setShowSubmitToChairmanModal(true);
    } catch (err) {
      alert(err.message || 'Failed to save scores.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSubmitToChairman = () => {
    if (!submissionId || !user) return;
    setSubmittingToChairman(true);
    setShowSubmitToChairmanModal(false);
    try {
      submitMyScoringToChairman(parseInt(submissionId, 10), user.userId);
      setSubmission(getSubmissionById(parseInt(submissionId, 10)));
      setShowSubmitToChairmanSuccessModal(true);
    } catch (err) {
      alert(err.message || 'Failed to submit to Chairman.');
    } finally {
      setSubmittingToChairman(false);
    }
  };

  const goToDimension = (index) => {
    if (groupedData.length && index >= 0 && index < groupedData.length) {
      setCurrentDimensionIndex(index);
      setActiveSection(groupedData[index].dimension.dimensionId);
    }
  };

  useEffect(() => {
    if (groupedData.length > 0 && currentDimensionIndex >= 0 && currentDimensionIndex < groupedData.length) {
      setActiveSection(groupedData[currentDimensionIndex].dimension.dimensionId);
    }
  }, [currentDimensionIndex, groupedData]);

  if (!submission && submissionId) {
    return (
      <ProtectedRoute allowedRoles={['Central Committee Member', 'Secretary (CC)']}>
        <Layout title="Subjective Scoring">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-mint-light-gray min-h-screen flex items-center justify-center">
              <p className="text-mint-dark-text/70">Loading…</p>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!submission) {
    return (
      <ProtectedRoute allowedRoles={['Central Committee Member', 'Secretary (CC)']}>
        <Layout title="Subjective Scoring">
          <div className="flex">
            <Sidebar />
            <main className="flex-grow ml-64 p-8 bg-mint-light-gray min-h-screen flex items-center justify-center">
              <p className="text-mint-dark-text/70">Submission not found.</p>
            </main>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const isScoringComplete = submission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE;
  const isPendingChairman = submission.submissionStatus === SUBMISSION_STATUS.PENDING_CHAIRMAN_APPROVAL;

  return (
    <ProtectedRoute allowedRoles={['Central Committee Member', 'Secretary (CC)']}>
      <Layout title="Subjective Scoring">
        <div className="flex bg-mint-light-gray min-h-screen">
          <Sidebar />
          {/* Dimensions sidebar for subjective responses */}
          {groupedData.length > 0 && (
            <aside className={`w-80 bg-white border-r border-mint-medium-gray fixed top-16 bottom-0 overflow-y-auto z-40 pl-8 pr-4 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`}>
              <div className="p-4 pt-8">
                <h2 className="text-lg font-bold text-mint-dark-text mb-4">Assessment Dimensions</h2>
                <div className="space-y-1">
                  {groupedData.map(({ dimension }, index) => (
                    <div key={dimension.dimensionId}>
                      <button
                        type="button"
                        onClick={() => goToDimension(index)}
                        className={`w-full flex items-center text-left p-2 rounded-lg transition-all ${
                          activeSection === dimension.dimensionId
                            ? 'bg-mint-primary-blue/10 text-mint-primary-blue border-l-4 border-mint-primary-blue'
                            : 'text-mint-dark-text/80 hover:bg-mint-medium-gray/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3 ${
                          activeSection === dimension.dimensionId ? 'bg-mint-primary-blue text-white' : 'bg-mint-medium-gray text-mint-dark-text/70'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium flex-1">{dimension.dimensionName}</span>
                      </button>
                    </div>
                  ))}
                </div>
                {!isReadOnly && !isPendingChairman && submission?.submissionStatus === SUBMISSION_STATUS.VALIDATED && (
                  <div className="mt-6 pt-4 border-t border-mint-medium-gray">
                    <p className="text-xs text-mint-dark-text/70 mb-2">
                      {submittedToChairmanCount} of {committeeMembers.length} member{committeeMembers.length !== 1 ? 's' : ''} have submitted to the Chairman. You can submit your scores as soon as you finish.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenSubmitToChairmanModal}
                      disabled={submittingToChairman || saving || !allScoredByMe}
                      className="w-full px-4 py-3 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingToChairman || saving ? '…' : 'Submit to Chairman'}
                    </button>
                    {!allScoredByMe && subjectiveResponses.length > 0 && (
                      <p className="text-xs text-mint-dark-text/60 mt-2">Score all answers in every dimension before submitting.</p>
                    )}
                  </div>
                )}
              </div>
            </aside>
          )}
          <div
            className={`flex-grow transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}
            style={groupedData.length > 0 ? { marginLeft: isCollapsed ? 'calc(64px + 320px)' : 'calc(256px + 320px)' } : {}}
          >
            <main className="p-8 bg-mint-light-gray text-mint-dark-text min-h-screen overflow-y-auto">
              <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center space-x-3">
                  <Link
                    href="/scoring/queue"
                    className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors"
                  >
                    <span className="text-xl mr-2">←</span>
                    <span className="text-sm font-medium">Back to Pending Subjective Scoring</span>
                  </Link>
                </div>

                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-mint-primary-blue">
                    Subjective scoring: {getUnitName(submission.unitId)}
                  </h1>
                  <p className="text-sm text-mint-dark-text/70 mt-1">
                    Submission #{submission.submissionId}
                    {isScoringComplete && (
                      <span className="ml-2 px-2 py-0.5 bg-mint-accent-green/20 text-green-800 rounded text-xs font-semibold">Scoring Complete</span>
                    )}
                    {isPendingChairman && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-semibold">Pending Chairman Approval</span>
                    )}
                  </p>
                </div>

                {subjectiveResponses.length === 0 ? (
                  <div className="bg-white rounded-xl border border-mint-medium-gray p-8 text-center text-mint-dark-text/70 shadow-sm">
                    No text-based answers to score in this submission.
                  </div>
                ) : groupedData.length > 0 ? (
                  <>
                    {/* One dimension per page */}
                    {(() => {
                      const { dimension, indicators: dimIndicators } = groupedData[currentDimensionIndex] || {};
                      if (!dimension) return null;
                      return (
                        <div id={`dimension-${dimension.dimensionId}`} className="bg-white rounded-xl border border-mint-medium-gray shadow-sm overflow-hidden">
                          <div className="p-6 pb-4 border-b border-mint-medium-gray">
                            <h3 className="text-xl font-bold text-mint-primary-blue">{dimension.dimensionName}</h3>
                            <p className="text-sm text-mint-dark-text/70 mt-1">Dimension weight: {dimension.dimensionWeight}%</p>
                          </div>
                          <div className="p-6 pt-4">
                            {dimIndicators.map(({ indicator, subjectiveResponses: indResponses }) => (
                              <div key={indicator.indicatorId} className="mb-8 last:mb-0">
                                <h4 className="text-lg font-semibold text-mint-dark-text mb-4">{indicator.indicatorName}</h4>
                                {indResponses.map((r, idx) => {
                                  const finalScore = getFinalSubQuestionScore(r.responseId);
                                  const memberScores = getSubjectiveScoresByResponse(r.responseId);
                                  return (
                                    <div key={r.responseId} className="mb-6 p-6 rounded-lg border border-mint-medium-gray bg-mint-light-gray/30">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-medium text-mint-dark-text/60 uppercase">Question</span>
                                        {finalScore != null && (
                                          <span className="text-sm font-semibold text-mint-dark-text">Average score: {Number(finalScore).toFixed(4)}</span>
                                        )}
                                      </div>
                                      <p className="text-lg font-semibold text-mint-dark-text mb-3">{r.subQuestion?.subQuestionText}</p>
                                      <div className="mb-4">
                                        <p className="text-sm font-semibold text-mint-dark-text mb-1">Validated answer</p>
                                        <div className="bg-white p-4 rounded-lg border border-mint-medium-gray">
                                          <p className="text-mint-dark-text whitespace-pre-wrap">{r.responseValue}</p>
                                        </div>
                                      </div>
                                      {r.evidenceLink && (
                                        <div className="mb-4">
                                          <p className="text-sm font-semibold text-mint-dark-text mb-1">Evidence</p>
                                          <a href={r.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-sm text-mint-primary-blue hover:underline break-all">{r.evidenceLink}</a>
                                        </div>
                                      )}
                                      <div className="border-t border-mint-medium-gray pt-4 mt-4">
                                        <p className="text-sm font-semibold text-mint-dark-text mb-2">Score (required)</p>
                                        <p className="text-xs text-mint-dark-text/60 mb-2">1 = Meets Expectations, 0.5 = Partially Meets, 0 = Does Not Meet.</p>
                                        <div className="flex flex-wrap items-center gap-4">
                                          {SCORE_OPTIONS.map(opt => (
                                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                              <input
                                                type="radio"
                                                name={`score_${r.responseId}`}
                                                value={opt.value}
                                                checked={scores[r.responseId] === opt.value}
                                                onChange={() => handleScoreChange(r.responseId, opt.value)}
                                                disabled={isReadOnly || isPendingChairman}
                                                className="rounded border-mint-medium-gray text-mint-primary-blue focus:ring-mint-primary-blue"
                                              />
                                              <span className="text-sm text-mint-dark-text">{opt.value} — {opt.label}</span>
                                            </label>
                                          ))}
                                        </div>
                                        {memberScores.length > 0 && (
                                          <p className="mt-2 text-xs text-mint-dark-text/60">{memberScores.length} committee member(s) have scored this response.</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Previous / Next (labels only) */}
                    {groupedData.length > 1 && (
                      <div className="mt-6 flex items-center justify-between p-4 bg-white rounded-xl border border-mint-medium-gray">
                        <button
                          type="button"
                          onClick={() => goToDimension(currentDimensionIndex - 1)}
                          disabled={currentDimensionIndex <= 0}
                          className="px-4 py-2 border border-mint-medium-gray rounded-lg text-mint-dark-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mint-light-gray"
                        >
                          Previous
                        </button>
                        <span className="text-sm font-medium text-mint-dark-text/80">
                          {currentDimensionIndex + 1} of {groupedData.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => goToDimension(currentDimensionIndex + 1)}
                          disabled={currentDimensionIndex >= groupedData.length - 1}
                          className="px-4 py-2 border border-mint-medium-gray rounded-lg text-mint-dark-text font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mint-light-gray"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </main>
          </div>
        </div>

        {/* Submit to Chairman confirm modal */}
        {showSubmitToChairmanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSubmitToChairmanModal(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-mint-primary-blue/10 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-mint-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Submit to Chairman</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base text-gray-700 mb-4">Submit your scores to the Chairman? The Chairman's list will show this unit and how many members have submitted; they will finalize approval when ready.</p>
                <p className="text-sm text-gray-600"><strong>Note:</strong> Other members can still submit their scores. The Chairman sees each member's scores and the average, and submits to the system when ready.</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button onClick={() => setShowSubmitToChairmanModal(false)} className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-mint-primary-blue font-semibold rounded-lg">Cancel</button>
                <button onClick={handleConfirmSubmitToChairman} disabled={submittingToChairman} className="px-5 py-2.5 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-semibold rounded-lg disabled:opacity-50">Confirm submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Submit to Chairman success modal */}
        {showSubmitToChairmanSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowSubmitToChairmanSuccessModal(false); }} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Submitted to Chairman</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base text-gray-700">Your scores have been submitted to the Chairman. The Chairman's list will update with the new count and they will finalize approval when ready.</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onClick={() => setShowSubmitToChairmanSuccessModal(false)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">OK</button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
