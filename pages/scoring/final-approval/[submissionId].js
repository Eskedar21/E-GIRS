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
  getComputedAverageScore,
  getScoringSubmissionsToChairman,
  submitChairmanScoringApproval,
  SUBMISSION_STATUS
} from '../../../data/submissions';
import { getUnitById } from '../../../data/administrativeUnits';
import { getUserById, getUsersByRole } from '../../../data/users';
import { getDimensionsByYear, getIndicatorsByDimension } from '../../../data/assessmentFramework';

export default function ChairmanFinalApprovalEvaluate() {
  const router = useRouter();
  const { submissionId } = router.query;
  const { user } = useAuth();
  const { isCollapsed, setCollapsed } = useSidebar();
  const userRole = user ? user.role : '';
  const isChairman = userRole === 'Chairman (CC)';
  const isReadOnly = userRole === 'Secretary (CC)';

  const [submission, setSubmission] = useState(null);
  const [subjectiveResponses, setSubjectiveResponses] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);
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
    const initial = {};
    list.forEach(r => {
      const avg = getComputedAverageScore(r.responseId);
      if (avg != null) initial[r.responseId] = avg;
    });
    setOverrides(initial);
  }, [submissionId]);

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
      if (indicatorsWithResponses.length > 0) result.push({ dimension, indicators: indicatorsWithResponses });
    });
    return result;
  }, [submission, subjectiveResponses]);

  /** All committee members who can score (Central Committee Member). Used to list every committee and their score per answer. */
  const allCommitteeMembers = useMemo(() => getUsersByRole('Central Committee Member'), []);

  const handleOverrideChange = (responseId, value) => {
    if (isReadOnly) return;
    const num = value === '' ? null : parseFloat(value);
    setOverrides(prev => ({
      ...prev,
      [responseId]: num !== null && !Number.isNaN(num) ? num : ''
    }));
  };

  const handleConfirmSubmitToSystem = () => {
    if (!isChairman || !submissionId) return;
    const id = parseInt(submissionId, 10);
    const payload = {};
    subjectiveResponses.forEach(r => {
      const val = overrides[r.responseId];
      if (val != null && val !== '' && !Number.isNaN(Number(val))) {
        const n = Number(val);
        if (n >= 0 && n <= 1) payload[r.responseId] = n;
      }
    });
    setSubmitting(true);
    setShowSubmitModal(false);
    try {
      submitChairmanScoringApproval(id, payload);
      setSubmission(getSubmissionById(id));
      setShowSubmitSuccessModal(true);
    } catch (err) {
      alert(err.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSubmitSuccessModal(false);
    router.push('/scoring/final-approval');
  };

  const getUnitName = (unitId) => getUnitById(unitId)?.officialUnitName || 'Unknown';

  const goToDimension = (index) => {
    if (groupedData.length && index >= 0 && index < groupedData.length) {
      setCurrentDimensionIndex(index);
      setActiveSection(groupedData[index].dimension.dimensionId);
      const el = document.getElementById(`chair-dimension-${groupedData[index].dimension.dimensionId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (groupedData.length > 0 && currentDimensionIndex >= 0 && currentDimensionIndex < groupedData.length) {
      setActiveSection(groupedData[currentDimensionIndex].dimension.dimensionId);
    }
  }, [currentDimensionIndex, groupedData]);

  if (!submission && submissionId) {
    return (
      <ProtectedRoute allowedRoles={['Chairman (CC)', 'Secretary (CC)']}>
        <Layout title="Final Approval">
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
      <ProtectedRoute allowedRoles={['Chairman (CC)', 'Secretary (CC)']}>
        <Layout title="Final Approval">
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

  const submittedCount = getScoringSubmissionsToChairman(submission.submissionId).length;
  const isPending = submission.submissionStatus === SUBMISSION_STATUS.PENDING_CHAIRMAN_APPROVAL ||
    (submission.submissionStatus === SUBMISSION_STATUS.VALIDATED && submittedCount > 0);

  return (
    <ProtectedRoute allowedRoles={['Chairman (CC)', 'Secretary (CC)']}>
      <Layout title="Final Approval – Scores">
        <div className="flex bg-mint-light-gray min-h-screen">
          <Sidebar />
          {groupedData.length > 0 && (
            <aside className={`w-80 bg-white border-r border-mint-medium-gray fixed top-16 bottom-0 overflow-y-auto z-40 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-64'}`}>
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
                {isChairman && isPending && subjectiveResponses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-mint-medium-gray">
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-semibold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Submit to system
                    </button>
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
                  <Link href="/scoring/final-approval" className="flex items-center text-mint-primary-blue hover:text-mint-secondary-blue transition-colors">
                    <span className="text-xl mr-2">←</span>
                    <span className="text-sm font-medium">Back to Scores for Final Approval</span>
                  </Link>
                </div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-mint-primary-blue">Scoring summary: {getUnitName(submission.unitId)}</h1>
                  <p className="text-sm text-mint-dark-text/70 mt-1">
                    One aggregated scoring per unit. Submission #{submission.submissionId}
                    {submittedCount > 0 && (
                      <span className="ml-2 text-mint-primary-blue font-medium">
                        — {submittedCount} of {allCommitteeMembers.length} committee member{submittedCount !== 1 ? 's' : ''} have submitted. Finalize when ready.
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-6">
                  {groupedData.map(({ dimension, indicators: dimIndicators }) => (
                    <div key={dimension.dimensionId} id={`chair-dimension-${dimension.dimensionId}`} className="bg-white rounded-xl border border-mint-medium-gray shadow-sm overflow-hidden">
                      <div className="p-6 pb-4 border-b border-mint-medium-gray">
                        <h3 className="text-xl font-bold text-mint-primary-blue">{dimension.dimensionName}</h3>
                        <p className="text-sm text-mint-dark-text/70 mt-1">Dimension weight: {dimension.dimensionWeight}%</p>
                      </div>
                      <div className="p-6 pt-4">
                        {dimIndicators.map(({ indicator, subjectiveResponses: indResponses }) => (
                          <div key={indicator.indicatorId} className="mb-8 last:mb-0">
                            <h4 className="text-lg font-semibold text-mint-dark-text mb-4">{indicator.indicatorName}</h4>
                            {indResponses.map((r, idx) => {
                              const memberScores = getSubjectiveScoresByResponse(r.responseId);
                              const avg = getComputedAverageScore(r.responseId);
                              const overrideVal = overrides[r.responseId];
                              const displayAvg = avg != null ? Number(avg).toFixed(4) : '—';
                              return (
                                <div key={r.responseId} className="mb-6 p-6 rounded-lg border border-mint-medium-gray bg-mint-light-gray/30">
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-mint-dark-text/60 uppercase">Question {idx + 1}</span>
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
                                    <p className="text-sm font-semibold text-mint-dark-text mb-2">Committee score results for this answer</p>
                                    {allCommitteeMembers.length === 0 ? (
                                      <p className="text-sm text-mint-dark-text/60 mb-3">No committee members in system.</p>
                                    ) : (
                                      <ul className="space-y-1.5 mb-4">
                                        {allCommitteeMembers.map((member) => {
                                          const scoreEntry = memberScores.find(s => Number(s.committeeMemberId) === Number(member.userId));
                                          const name = member.fullName || member.username || `User ${member.userId}`;
                                          const hasScore = scoreEntry != null;
                                          const scoreValue = hasScore ? Number(scoreEntry.assignedScore).toFixed(2) : '—';
                                          return (
                                            <li key={`${r.responseId}-${member.userId}`} className="text-sm text-mint-dark-text flex justify-between items-center gap-4">
                                              <span className="font-medium">{name}</span>
                                              <span className="tabular-nums min-w-[4rem] text-right font-medium" title={hasScore ? `Score: ${scoreValue}` : 'Not scored yet'}>
                                                {hasScore ? scoreValue : <span className="text-mint-dark-text/60">Not scored</span>}
                                              </span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    )}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                      <span className="text-sm text-mint-dark-text"><span className="font-semibold">Average:</span> {displayAvg}</span>
                                      <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-mint-dark-text whitespace-nowrap">Final score (0–1){isChairman ? ' — you can change' : ''}</label>
                                        <input
                                          type="number"
                                          min={0}
                                          max={1}
                                          step={0.0001}
                                          value={overrideVal === undefined || overrideVal === null ? (avg != null ? avg : '') : overrideVal}
                                          onChange={(e) => handleOverrideChange(r.responseId, e.target.value)}
                                          disabled={isReadOnly}
                                          className="w-28 px-3 py-2 border border-mint-medium-gray rounded-lg focus:ring-2 focus:ring-mint-primary-blue text-mint-dark-text disabled:bg-mint-light-gray"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {isChairman && isPending && subjectiveResponses.length > 0 && (
                  <div className="mt-8 p-6 bg-white rounded-xl border border-mint-medium-gray">
                    <p className="text-sm text-mint-dark-text mb-4">Submit these scores to the system. The final score for each response will be used with other non-subjective responses to calculate the index.</p>
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting}
                      className="px-6 py-3 bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-medium rounded-lg disabled:opacity-50"
                    >
                      Submit to system
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>

        {/* Submit to system confirm modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Submit to system</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base text-gray-700 mb-4">Submit final scores to the system? This submission will be marked as Scoring Complete and included in index calculation.</p>
                <p className="text-sm text-gray-600"><strong>Next step:</strong> Final scores (your overrides or committee average) will be combined with other non-subjective responses to compute the index.</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button onClick={() => setShowSubmitModal(false)} className="px-5 py-2.5 bg-[#E0F2F7] hover:bg-[#B8E6F0] text-mint-primary-blue font-semibold rounded-lg">Cancel</button>
                <button onClick={handleConfirmSubmitToSystem} disabled={submitting} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50">Confirm submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Submit success modal */}
        {showSubmitSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleCloseSuccessModal} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Submitted to system</h3>
                </div>
              </div>
              <div className="px-6 py-5">
                <p className="text-base text-gray-700">This submission is now Scoring Complete. Final scores have been recorded and will be used with other responses to calculate the index.</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onClick={handleCloseSuccessModal} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg">OK</button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}
