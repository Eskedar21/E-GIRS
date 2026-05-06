import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  getWorkbenchAssessmentYearsForScopedAdmin,
  getDimensionsByYear,
  getIndicatorsByDimension,
  buildSubQuestionTree,
  getFrameworkScopeForYear,
  ASSESSMENT_FRAMEWORK_SCOPE,
  ASSESSMENT_STATUS
} from '../../data/assessmentFramework';
import { addFrameworkAdminFeedback } from '../../data/frameworkAdminFeedback';
import { getAllUsers, getUserById } from '../../data/users';
import { notifyContributorTiedToAssessmentYear } from '../../data/notifications';
import { getAllUnits, getUnitById } from '../../data/administrativeUnits';
import { filterUsersByScope } from '../../utils/permissions';
import {
  getContributorAssignmentsForYear,
  setContributorAssignmentsForYear
} from '../../data/frameworkContributorAssignments';

const ALLOWED_ROLES = ['Regional Admin', 'Federal Admin', 'Institutional Admin'];

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

function displayInitials(username) {
  if (!username || !String(username).trim()) return '?';
  const s = String(username).trim();
  return s.length <= 2 ? s.toUpperCase() : (s[0] + s[1]).toUpperCase();
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

export default function ActiveFrameworks() {
  const { user } = useAuth();
  const [activeForMe, setActiveForMe] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [collapsedIds, setCollapsedIds] = useState({});
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [assignedContributorIds, setAssignedContributorIds] = useState([]);
  const [assignSaveMessage, setAssignSaveMessage] = useState('');
  const [contributorSearch, setContributorSearch] = useState('');

  const contributorsInScope = useMemo(() => {
    if (!user || !selectedYear) return [];
    const scope = getFrameworkScopeForYear(selectedYear);
    const role =
      scope === ASSESSMENT_FRAMEWORK_SCOPE.FEDERAL_INSTITUTE
        ? 'Institute Data Contributor'
        : 'Data Contributor';
    const allUsers = getAllUsers();
    const units = getAllUnits();
    const byRole = allUsers.filter((u) => u.role === role);
    const scoped = filterUsersByScope(user, byRole, units);
    return scoped
      .filter((u) => !u.isAccountLocked)
      .sort((a, b) => (a.username || '').localeCompare(b.username || '', undefined, { sensitivity: 'base' }));
  }, [user, selectedYear]);

  const filteredContributors = useMemo(() => {
    const q = contributorSearch.trim().toLowerCase();
    if (!q) return contributorsInScope;
    return contributorsInScope.filter((u) => {
      const unit = u.officialUnitId != null ? getUnitById(u.officialUnitId) : null;
      const unitLabel = (unit?.unitName || '').toLowerCase();
      const un = (u.username || '').toLowerCase();
      const em = (u.email || '').toLowerCase();
      return un.includes(q) || em.includes(q) || unitLabel.includes(q);
    });
  }, [contributorsInScope, contributorSearch]);

  useEffect(() => {
    setContributorSearch('');
  }, [selectedYear?.assessmentYearId]);

  useEffect(() => {
    if (!user?.userId || !selectedYear?.assessmentYearId) {
      setAssignedContributorIds([]);
      return;
    }
    const saved = getContributorAssignmentsForYear(selectedYear.assessmentYearId, user.userId);
    const allowed = new Set(contributorsInScope.map((u) => u.userId));
    setAssignedContributorIds(saved.filter((id) => allowed.has(id)));
  }, [user?.userId, selectedYear?.assessmentYearId, contributorsInScope]);

  useEffect(() => {
    if (!user) return undefined;
    const load = () => setActiveForMe(getWorkbenchAssessmentYearsForScopedAdmin(user));
    load();
    if (typeof window !== 'undefined') {
      window.addEventListener('assessmentFrameworkUpdated', load);
      window.addEventListener('frameworkAdminFeedbackUpdated', load);
      return () => {
        window.removeEventListener('assessmentFrameworkUpdated', load);
        window.removeEventListener('frameworkAdminFeedbackUpdated', load);
      };
    }
    return undefined;
  }, [user]);

  useEffect(() => {
    if (!selectedYear) setCollapsedIds({});
  }, [selectedYear]);

  const toggleCollapsed = (key) => {
    setCollapsedIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dimensions = selectedYear ? getDimensionsByYear(selectedYear.assessmentYearId) : [];

  const handleSendFeedback = (e) => {
    e.preventDefault();
    if (!user || !selectedYear) return;
    const comment = feedbackText.trim();
    if (!comment) {
      setFeedbackStatus('Please enter a comment.');
      return;
    }
    addFrameworkAdminFeedback({
      assessmentYearId: selectedYear.assessmentYearId,
      yearName: selectedYear.yearName,
      fromUserId: user.userId,
      fromUsername: user.username || user.email || `User ${user.userId}`,
      fromRole: user.role,
      comment
    });
    setFeedbackText('');
    setFeedbackStatus('Your feedback was sent to MInT Admin.');
    setTimeout(() => setFeedbackStatus(''), 5000);
  };

  const toggleContributorId = (userId) => {
    setAssignedContributorIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveAssignments = () => {
    if (!user?.userId || !selectedYear?.assessmentYearId) return;
    const prev = getContributorAssignmentsForYear(selectedYear.assessmentYearId, user.userId);
    const prevSet = new Set((prev || []).map((id) => Number(id)));
    setContributorAssignmentsForYear(
      selectedYear.assessmentYearId,
      user.userId,
      assignedContributorIds
    );
    const added = (assignedContributorIds || []).filter((id) => !prevSet.has(Number(id)));
    added.forEach((cid) => {
      const u = getUserById(Number(cid));
      if (!u) return;
      const unit = u.officialUnitId ? getUnitById(u.officialUnitId) : null;
      notifyContributorTiedToAssessmentYear(
        Number(cid),
        selectedYear.yearName,
        unit?.officialUnitName || 'your unit'
      );
    });
    setAssignSaveMessage('Contributor selection saved.');
    setTimeout(() => setAssignSaveMessage(''), 4000);
  };

  const contributorRoleLabel = !selectedYear
    ? ''
    : getFrameworkScopeForYear(selectedYear) === ASSESSMENT_FRAMEWORK_SCOPE.FEDERAL_INSTITUTE
      ? 'Institute Data Contributors'
      : 'Data Contributors';

  return (
    <ProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <Layout title="Active assessment frameworks">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-6 sm:p-8 bg-white text-mint-dark-text min-h-screen w-full min-w-0">
            <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">Frameworks for your scope</h1>
                <p className="text-mint-dark-text/70 max-w-4xl">
                  MInT creates assessments by scope: <strong>Regional</strong> for Regional Admins;{' '}
                  <strong>Federal Institute</strong> for Federal and Institutional Admins. Draft years appear here so
                  you can review structure and assign contributors before activation. For each
                  framework, select contributors in your scope below, or open{' '}
                  <Link href="/admin/users" className="text-mint-primary-blue hover:underline font-medium">
                    User Management
                  </Link>{' '}
                  to create accounts. Use feedback to reach MInT if something needs to change.
                </p>
              </div>

              <Card className="shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-mint-primary-blue">Your frameworks (Draft and Active)</CardTitle>
                  <CardDescription>
                    Select a year to view structure (read-only), assign contributors, or send feedback to MInT. Data
                    contributors only see a year on the submission page after it is Active.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeForMe.length === 0 ? (
                    <p className="text-mint-dark-text/70 py-4">
                      There is no Draft or Active assessment in your scope yet. When MInT creates one for your scope, it
                      will appear here.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-3 font-semibold text-mint-primary-blue">Year</th>
                            <th className="py-3 px-3 font-semibold text-mint-primary-blue">Status</th>
                            <th className="py-3 px-3 font-semibold text-mint-primary-blue">Scope</th>
                            <th className="py-3 px-3 font-semibold text-mint-primary-blue">Deadline</th>
                            <th className="py-3 px-3 font-semibold text-mint-primary-blue">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeForMe.map((year) => {
                            const isSelected = selectedYear?.assessmentYearId === year.assessmentYearId;
                            return (
                              <tr key={year.assessmentYearId} className={`border-b border-gray-100 ${isSelected ? 'bg-mint-primary-blue/5' : ''}`}>
                                <td className="py-3 px-3 font-semibold text-mint-primary-blue">{year.yearName}</td>
                                <td className="py-3 px-3 text-sm">
                                  {year.status === ASSESSMENT_STATUS.ACTIVE ? (
                                    <span className="text-green-700 font-medium">Active</span>
                                  ) : (
                                    <span className="text-amber-800 font-medium">Draft</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-sm">{getFrameworkScopeForYear(year)}</td>
                                <td className="py-3 px-3 text-sm text-mint-dark-text/70">{formatDate(year.endDate)}</td>
                                <td className="py-3 px-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedYear(isSelected ? null : year)}
                                  >
                                    {isSelected ? 'Hide' : 'View & feedback'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedYear && (
                <div className="space-y-6 w-full">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedYear(null)}>
                      Close framework
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
                    <Card className="shadow-lg xl:col-span-8 min-w-0">
                      <CardHeader>
                        <CardTitle className="text-lg text-mint-primary-blue">Framework: {selectedYear.yearName}</CardTitle>
                        <CardDescription>
                          Read-only · {getFrameworkScopeForYear(selectedYear)} · Status{' '}
                          {selectedYear.status || ASSESSMENT_STATUS.ACTIVE}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      {dimensions.length === 0 ? (
                        <p className="text-mint-dark-text/70">No dimensions in this framework.</p>
                      ) : (
                        <div className="border-l-2 border-gray-300 pl-2 space-y-0">
                          {dimensions.map((dim) => {
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
                      </CardContent>
                    </Card>

                    <div className="space-y-6 xl:col-span-4 min-w-0 w-full">
                      <Card className="shadow-lg border border-gray-200 overflow-hidden">
                        <CardHeader className="space-y-0 border-b border-gray-100 bg-gradient-to-r from-mint-primary-blue/[0.07] to-transparent pb-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <CardTitle className="text-lg text-mint-primary-blue">Assign contributors</CardTitle>
                              <CardDescription className="mt-1.5">
                                Choose which unlocked {contributorRoleLabel.toLowerCase()} in your scope are tied to this
                                assessment. Search to narrow the list, then save.
                              </CardDescription>
                            </div>
                            {contributorsInScope.length > 0 && (
                              <span className="inline-flex shrink-0 items-center rounded-full border border-mint-primary-blue/20 bg-white px-3 py-1 text-xs font-semibold text-mint-primary-blue shadow-sm">
                                {assignedContributorIds.length} / {contributorsInScope.length} selected
                              </span>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          {contributorsInScope.length === 0 ? (
                            <p className="text-sm text-mint-dark-text/70">
                              No unlocked {contributorRoleLabel.toLowerCase()} in your scope. Add users under{' '}
                              <Link href="/admin/users" className="text-mint-primary-blue hover:underline font-medium">
                                User Management
                              </Link>
                              .
                            </p>
                          ) : (
                            <>
                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mint-dark-text/40" aria-hidden>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </span>
                                <Input
                                  type="search"
                                  id="contributor-search"
                                  placeholder="Search username, email, or unit…"
                                  value={contributorSearch}
                                  onChange={(e) => setContributorSearch(e.target.value)}
                                  className="pl-9 border-gray-200 bg-white"
                                  autoComplete="off"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssignedContributorIds(contributorsInScope.map((u) => u.userId))}
                                >
                                  Select all
                                </Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => setAssignedContributorIds([])}>
                                  Clear all
                                </Button>
                              </div>
                              <div
                                className="rounded-xl border border-gray-200 bg-gray-50/90 max-h-[min(22rem,45vh)] overflow-y-auto shadow-inner"
                                role="list"
                                aria-label="Contributors in scope"
                              >
                                {filteredContributors.length === 0 ? (
                                  <p className="p-4 text-center text-sm text-mint-dark-text/60">No contributors match your search.</p>
                                ) : (
                                  filteredContributors.map((u) => {
                                    const unit = u.officialUnitId != null ? getUnitById(u.officialUnitId) : null;
                                    const unitLabel = unit ? unit.unitName : 'No unit';
                                    const checked = assignedContributorIds.includes(u.userId);
                                    return (
                                      <label
                                        key={u.userId}
                                        className={`flex cursor-pointer items-center gap-3 border-b border-gray-100/90 px-3 py-3 transition-colors last:border-b-0 ${
                                          checked ? 'bg-mint-primary-blue/[0.06]' : 'hover:bg-white'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 shrink-0 rounded border-gray-300 text-mint-primary-blue focus:ring-mint-primary-blue focus:ring-offset-0"
                                          checked={checked}
                                          onChange={() => toggleContributorId(u.userId)}
                                        />
                                        <div
                                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-primary-blue/15 text-xs font-bold text-mint-primary-blue"
                                          aria-hidden
                                        >
                                          {displayInitials(u.username)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="truncate text-sm font-medium text-mint-dark-text">{u.username}</div>
                                          <div className="truncate text-xs text-mint-dark-text/55">{unitLabel}</div>
                                          {u.email && (
                                            <div className="truncate text-xs text-mint-dark-text/45">{u.email}</div>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2">
                                <Button
                                  type="button"
                                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue"
                                  onClick={handleSaveAssignments}
                                >
                                  Save selection
                                </Button>
                                {assignSaveMessage && (
                                  <span className="text-sm font-medium text-green-700">{assignSaveMessage}</span>
                                )}
                                <Link
                                  href="/admin/users"
                                  className="ml-auto text-sm font-medium text-mint-primary-blue hover:underline"
                                >
                                  Open user management →
                                </Link>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>

                  <Card className="shadow-lg border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-mint-primary-blue">Feedback to MInT</CardTitle>
                      <CardDescription>
                        If something in this framework does not work for your region or institute, describe it here. MInT Admin will see it on the Assessment Framework page.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSendFeedback} className="space-y-3">
                        <div>
                          <Label htmlFor="fw-feedback">Your comment</Label>
                          <textarea
                            id="fw-feedback"
                            rows={4}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-primary-blue"
                            placeholder="e.g. We need an additional indicator for …"
                          />
                        </div>
                        {feedbackStatus && (
                          <p className={`text-sm ${feedbackStatus.startsWith('Please') ? 'text-red-600' : 'text-green-700'}`}>
                            {feedbackStatus}
                          </p>
                        )}
                        <Button type="submit" className="bg-mint-secondary-blue hover:bg-mint-primary-blue">
                          Send to MInT Admin
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
