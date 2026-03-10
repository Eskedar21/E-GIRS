import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  getArchivedAssessmentYears,
  closeAssessmentYearsPastDeadline,
  getDimensionsByYear,
  getIndicatorsByDimension,
  buildSubQuestionTree,
  ASSESSMENT_STATUS
} from '../../data/assessmentFramework';

const ARCHIVED_ALLOWED_ROLES = [
  'Chairman (CC)',
  'Secretary (CC)',
  'Central Committee Member',
  'Regional Approver',
  'Federal Approver'
];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

function SubQuestionTreeReadOnly({ nodes, parentLine, collapsedIds, onToggle }) {
  if (!nodes || !nodes.length) return null;
  return (
    <div className={parentLine ? 'border-l-2 border-gray-300 ml-2 pl-3 mt-1 space-y-1' : 'mt-1 space-y-1'}>
      {nodes.map((sq) => {
        const hasChildren = sq.children && sq.children.length > 0;
        const key = `sq-${sq.subQuestionId}`;
        const isCollapsed = hasChildren && collapsedIds[key];
        return (
          <div key={sq.subQuestionId} className="relative flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold">
                Q
              </div>
              {hasChildren && !isCollapsed && (
                <div className="w-0.5 flex-1 min-h-[4px] bg-gray-300 mt-0.5 rounded-full" aria-hidden />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => onToggle(key)}
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-mint-dark-text/70"
                    aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                  >
                    <svg className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                <div className="text-sm text-mint-dark-text">{sq.subQuestionText}</div>
              </div>
              <div className="text-xs text-mint-dark-text/60 mt-0.5">
                {sq.subWeightPercentage}% · {sq.responseType}
                {sq.checkboxOptions && ` · ${sq.checkboxOptions}`}
              </div>
              {hasChildren && !isCollapsed && (
                <div className="border-l-2 border-gray-300 ml-0 pl-3 mt-2">
                  <SubQuestionTreeReadOnly nodes={sq.children} parentLine collapsedIds={collapsedIds} onToggle={onToggle} />
                </div>
              )}
              {hasChildren && isCollapsed && (
                <button
                  type="button"
                  onClick={() => onToggle(key)}
                  className="text-xs text-mint-primary-blue hover:underline mt-1"
                >
                  {sq.children.length} repl{sq.children.length === 1 ? 'y' : 'ies'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ArchivedFrameworks() {
  const [archived, setArchived] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState({});

  const toggleCollapsed = (key) => {
    setCollapsedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    closeAssessmentYearsPastDeadline();
    setArchived(getArchivedAssessmentYears());
  }, []);

  useEffect(() => {
    if (!selectedYear) setCollapsedIds({});
  }, [selectedYear]);

  const dimensions = selectedYear ? getDimensionsByYear(selectedYear.assessmentYearId) : [];

  return (
    <ProtectedRoute allowedRoles={ARCHIVED_ALLOWED_ROLES}>
      <Layout title="Archived Assessment Frameworks">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Archived Assessment Frameworks
                </h1>
                <p className="text-mint-dark-text/70">
                  View frameworks whose submission deadline has passed. Read-only.
                </p>
              </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">Archived frameworks</CardTitle>
                  <CardDescription>
                    Select a framework to view its dimensions, indicators, and sub-questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {archived.length === 0 ? (
                    <p className="text-mint-dark-text/70 py-6">No archived frameworks yet.</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="py-3 px-3 font-semibold text-mint-primary-blue">Year name</th>
                              <th className="py-3 px-3 font-semibold text-mint-primary-blue">Deadline</th>
                              <th className="py-3 px-3 font-semibold text-mint-primary-blue">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {archived.map((year) => {
                              const dimensionCount = getDimensionsByYear(year.assessmentYearId).length;
                              const isSelected = selectedYear?.assessmentYearId === year.assessmentYearId;
                              return (
                                <tr
                                  key={year.assessmentYearId}
                                  className={`border-b border-gray-100 ${isSelected ? 'bg-mint-primary-blue/5' : ''}`}
                                >
                                  <td className="py-3 px-3">
                                    <span className="font-semibold text-mint-primary-blue">{year.yearName}</span>
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                      {year.status || ASSESSMENT_STATUS.ARCHIVED}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-sm text-mint-dark-text/70">
                                    {formatDate(year.endDate)}
                                    {year.startDate && (
                                      <span className="ml-1"> · Started: {formatDate(year.startDate)}</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedYear(isSelected ? null : year)}
                                    >
                                      {isSelected ? 'Hide details' : 'View details'}
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {selectedYear && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-mint-primary-blue">
                              Framework: {selectedYear.yearName}
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => setSelectedYear(null)}>
                              Close details
                            </Button>
                          </div>
                          {dimensions.length === 0 ? (
                            <p className="text-mint-dark-text/70">No dimensions in this framework.</p>
                          ) : (
                            <div className="border-l-2 border-gray-300 pl-2 space-y-0">
                              {dimensions.map((dim, dimIndex) => {
                                const indicatorsList = getIndicatorsByDimension(dim.dimensionId);
                                const hasReplies = indicatorsList.length > 0;
                                const dimKey = `dim-${dim.dimensionId}`;
                                const dimCollapsed = hasReplies && collapsedIds[dimKey];
                                return (
                                  <div key={dim.dimensionId} className="relative">
                                    <div className="flex gap-3 py-2">
                                      <div className="flex flex-col items-center flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-mint-primary-blue/20 text-mint-primary-blue flex items-center justify-center text-sm font-bold">
                                          D
                                        </div>
                                        {hasReplies && !dimCollapsed && (
                                          <div className="w-0.5 flex-1 min-h-[4px] bg-gray-300 mt-1 rounded-full" aria-hidden />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          {hasReplies && (
                                            <button
                                              type="button"
                                              onClick={() => toggleCollapsed(dimKey)}
                                              className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-mint-dark-text/70"
                                              aria-label={dimCollapsed ? 'Expand dimension' : 'Collapse dimension'}
                                            >
                                              <svg className={`w-4 h-4 transition-transform ${dimCollapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                              </svg>
                                            </button>
                                          )}
                                          <div className="font-semibold text-mint-dark-text">{dim.dimensionName}</div>
                                        </div>
                                        <div className="text-sm text-mint-dark-text/60 mt-0.5">Weight: {dim.dimensionWeight}%</div>
                                        {hasReplies && !dimCollapsed && (
                                          <div className="border-l-2 border-gray-300 ml-1 pl-4 mt-3 space-y-0">
                                            {indicatorsList.map((ind) => {
                                              const tree = buildSubQuestionTree(ind.indicatorId);
                                              const hasSubReplies = tree && tree.length > 0;
                                              const indKey = `ind-${ind.indicatorId}`;
                                              const indCollapsed = hasSubReplies && collapsedIds[indKey];
                                              return (
                                                <div key={ind.indicatorId} className="relative py-2">
                                                  <div className="flex gap-3">
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                      <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                                                        I
                                                      </div>
                                                      {hasSubReplies && !indCollapsed && (
                                                        <div className="w-0.5 flex-1 min-h-[4px] bg-gray-300 mt-0.5 rounded-full" aria-hidden />
                                                      )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                        {hasSubReplies && (
                                                          <button
                                                            type="button"
                                                            onClick={() => toggleCollapsed(indKey)}
                                                            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-mint-dark-text/70"
                                                            aria-label={indCollapsed ? 'Expand indicator' : 'Collapse indicator'}
                                                          >
                                                            <svg className={`w-3.5 h-3.5 transition-transform ${indCollapsed ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                                                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                          </button>
                                                        )}
                                                        <div className="font-medium text-mint-dark-text text-sm">{ind.indicatorName}</div>
                                                      </div>
                                                      <div className="text-xs text-mint-dark-text/60 mt-0.5">
                                                        {ind.indicatorWeight}% · {ind.applicableUnitType || '—'}
                                                      </div>
                                                      {hasSubReplies && !indCollapsed && (
                                                        <div className="mt-2">
                                                          <SubQuestionTreeReadOnly nodes={tree} parentLine collapsedIds={collapsedIds} onToggle={toggleCollapsed} />
                                                        </div>
                                                      )}
                                                      {hasSubReplies && indCollapsed && (
                                                        <button
                                                          type="button"
                                                          onClick={() => toggleCollapsed(indKey)}
                                                          className="text-xs text-mint-primary-blue hover:underline mt-1"
                                                        >
                                                          {tree.length} question{tree.length === 1 ? '' : 's'}
                                                        </button>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                        {hasReplies && dimCollapsed && (
                                          <button
                                            type="button"
                                            onClick={() => toggleCollapsed(dimKey)}
                                            className="text-xs text-mint-primary-blue hover:underline mt-1"
                                          >
                                            {indicatorsList.length} indicator{indicatorsList.length === 1 ? '' : 's'}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
