import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { getAllUnits, getUnitById } from '../data/administrativeUnits';
import { 
  getAllSubmissions, 
  getSubmissionsByStatus, 
  getSubmissionsByUser,
  getSubmissionsByUnit,
  SUBMISSION_STATUS 
} from '../data/submissions';
import { filterSubmissionsByAccess } from '../utils/permissions';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const userRole = user ? user.role : '';
  const [units] = useState(getAllUnits());
  const [submissions, setSubmissions] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load real-time submission data
  useEffect(() => {
    const loadData = () => {
      const allSubmissions = getAllSubmissions();
      setSubmissions(allSubmissions);
      setLastUpdate(new Date());
    };

    loadData();

    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(loadData, 5000);

    // Listen for submission updates
    if (typeof window !== 'undefined') {
      window.addEventListener('submissionUpdated', loadData);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('submissionUpdated', loadData);
      }
    };
  }, []);

  // Calculate real-time statistics based on user role - using same logic as approval queue
  const stats = useMemo(() => {
    if (!user) {
      return {
        totalUnits: units.length,
        totalSubmissions: 0,
        draftSubmissions: 0,
        pendingApproval: 0,
        pendingValidation: 0,
        validated: 0,
        completed: 0,
        rejected: 0,
        completionRate: 0
      };
    }

    const allUnits = getAllUnits();
    let relevantSubmissions = [];

    // Use the EXACT same logic as approval queue
    if (['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)) {
      // Central Committee sees all submissions with Pending Approval and Verified statuses
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
      relevantSubmissions = [...pending, ...validated];
    } else if (['Regional Approver', 'Federal Approver', 'Initial Approver'].includes(userRole)) {
      // Regional Approvers see submissions in their scope
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      const approvedPendingCentral = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
      const allBeforeFilter = [...pending, ...rejected, ...approvedPendingCentral, ...validated];
      
      // Filter by scope using the same function as approval queue
      relevantSubmissions = filterSubmissionsByAccess(allBeforeFilter, user, allUnits);
    } else if (userRole === 'Data Contributor' || userRole === 'Institute Data Contributor' || userRole === 'Federal Data Contributor') {
      // Data Contributors see their own submissions
      relevantSubmissions = getSubmissionsByUser(user?.userId || 0);
    } else if (userRole === 'MInT Admin' || userRole === 'Super Admin') {
      // Admins see all submissions - use the state that's kept in sync
      relevantSubmissions = submissions.length > 0 ? submissions : getAllSubmissions();
    }

    // Calculate counts from the filtered submissions (matching approval queue logic)
    const draftSubmissions = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.DRAFT);
    const pendingApproval = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
    const pendingValidation = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
    const validated = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.VALIDATED);
    const completed = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE);
    const rejected = relevantSubmissions.filter(s => 
      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_INITIAL_APPROVER ||
      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE
    );

    return {
      totalUnits: units.length,
      totalSubmissions: relevantSubmissions.length,
      draftSubmissions: draftSubmissions.length,
      pendingApproval: pendingApproval.length,
      pendingValidation: pendingValidation.length,
      validated: validated.length,
      completed: completed.length,
      rejected: rejected.length,
      completionRate: relevantSubmissions.length > 0 
        ? ((completed.length + validated.length) / relevantSubmissions.length * 100).toFixed(1)
        : 0
    };
  }, [submissions, units, user, userRole]);

  // Prepare chart data for admin dashboard
  const adminChartData = useMemo(() => {
    const statusData = [
      { name: 'Draft', value: stats.draftSubmissions, color: '#eab308' },
      { name: 'Pending Approval', value: stats.pendingApproval, color: '#0d6670' },
      { name: 'Pending Validation', value: stats.pendingValidation, color: '#f97316' },
      { name: 'Validated', value: stats.validated, color: '#10b981' },
      { name: 'Completed', value: stats.completed, color: '#059669' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ];
    return statusData;
  }, [stats]);

  // Prepare chart data for contributor dashboard (must be at top level)
  const contributorChartData = useMemo(() => [
    { name: 'Draft', value: stats.draftSubmissions, color: '#eab308' },
    { name: 'Pending', value: stats.pendingApproval, color: '#0d6670' },
    { name: 'Validated', value: stats.validated, color: '#10b981' },
    { name: 'Completed', value: stats.completed, color: '#059669' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ], [stats]);

  const renderRoleBasedContent = () => {
    switch (userRole) {
      case 'MInT Admin':
      case 'Super Admin':
        return (
          <div className="space-y-6">
            {/* Real-time indicator */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Administrative Overview</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Total Units</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.totalUnits}</p>
                <p className="text-xs text-white/80">Administrative units registered</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Draft Submissions</h3>
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-yellow-600 mb-1">{stats.draftSubmissions}</p>
                <p className="text-xs text-mint-dark-text/60">In progress</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${stats.totalSubmissions > 0 ? (stats.draftSubmissions / stats.totalSubmissions * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0d6670] hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Pending Approval</h3>
                  <svg className="w-6 h-6 text-[#0d6670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-[#0d6670] mb-1">{stats.pendingApproval}</p>
                <p className="text-xs text-mint-dark-text/60">Awaiting review</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-[#0d6670] h-1.5 rounded-full transition-all" 
                    style={{ width: `${stats.totalSubmissions > 0 ? (stats.pendingApproval / stats.totalSubmissions * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Pending Validation</h3>
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-orange-600 mb-1">{stats.pendingValidation}</p>
                <p className="text-xs text-mint-dark-text/60">Central committee</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full transition-all" 
                    style={{ width: `${stats.totalSubmissions > 0 ? (stats.pendingValidation / stats.totalSubmissions * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Additional KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Completion Rate</h3>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.completionRate}%</p>
                <p className="text-xs text-mint-dark-text/60">Validated & Completed</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Total Submissions</h3>
                  <svg className="w-6 h-6 text-mint-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-mint-primary-blue mb-1">{stats.totalSubmissions}</p>
                <p className="text-xs text-mint-dark-text/60">All submissions</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Rejected</h3>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-red-600 mb-1">{stats.rejected}</p>
                <p className="text-xs text-mint-dark-text/60">Requires revision</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Submission Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adminChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {adminChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Submission Status Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={adminChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#374151" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {adminChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/admin/administrative-units"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Manage Administrative Units</h4>
                  <p className="text-sm text-mint-dark-text/70">Register and manage administrative units</p>
                </a>
                <a
                  href="/admin/assessment-framework"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Assessment Framework</h4>
                  <p className="text-sm text-mint-dark-text/70">Configure assessment dimensions and indicators</p>
                </a>
                <a
                  href="/admin/users"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">User Management</h4>
                  <p className="text-sm text-mint-dark-text/70">Create and manage user accounts</p>
                </a>
              </div>
            </div>
          </div>
        );


      case 'Regional Approver':
      case 'Federal Approver':
      case 'Initial Approver':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Approval Dashboard</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#0d6670] to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Pending Approval</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.pendingApproval}</p>
                <p className="text-xs text-white/80">Awaiting your review</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Validated</h3>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.validated}</p>
                <p className="text-xs text-mint-dark-text/60">Approved submissions</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Rejected</h3>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-red-600 mb-1">{stats.rejected}</p>
                <p className="text-xs text-mint-dark-text/60">Requires revision</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Submissions Awaiting Your Approval</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">
                    {userRole === 'Federal Approver' 
                      ? 'Review and approve submissions from Federal Institutes in your scope'
                      : 'Review and approve submissions from your region'}
                  </p>
                </div>
                <a
                  href="/approval/queue"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  View Approval Queue →
                </a>
              </div>
              {stats.pendingApproval > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Action Required:</span> You have {stats.pendingApproval} submission{stats.pendingApproval !== 1 ? 's' : ''} waiting for your approval.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Central Committee Member':
      case 'Chairman (CC)':
      case 'Secretary (CC)':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Central Validation Dashboard</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Pending Validation</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.pendingValidation}</p>
                <p className="text-xs text-white/80">Awaiting final validation</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Validated</h3>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.validated}</p>
                <p className="text-xs text-mint-dark-text/60">Finalized submissions</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Rejected</h3>
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-red-600 mb-1">{stats.rejected}</p>
                <p className="text-xs text-mint-dark-text/60">Requires revision</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Submissions Awaiting Final Validation</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">Review and validate submissions approved by regional approvers</p>
                </div>
                <a
                  href="/approval/queue"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  View Validation Queue →
                </a>
              </div>
              {stats.pendingValidation > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <span className="font-semibold">Action Required:</span> You have {stats.pendingValidation} submission{stats.pendingValidation !== 1 ? 's' : ''} waiting for final validation.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Data Contributor':
      case 'Institute Data Contributor':
      case 'Federal Data Contributor':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Data Submission Dashboard</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Draft</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.draftSubmissions}</p>
                <p className="text-xs text-white/80">In progress</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0d6670]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Pending Approval</h3>
                  <svg className="w-6 h-6 text-[#0d6670]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-[#0d6670] mb-1">{stats.pendingApproval}</p>
                <p className="text-xs text-mint-dark-text/60">Under review</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Validated</h3>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.validated}</p>
                <p className="text-xs text-mint-dark-text/60">Approved</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Completed</h3>
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-emerald-600 mb-1">{stats.completed}</p>
                <p className="text-xs text-mint-dark-text/60">Scoring complete</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Your Submissions</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">Manage your data submissions for your assigned unit</p>
                </div>
                <a
                  href="/data/submission"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Start / Edit Submission →
                </a>
              </div>

              {stats.totalSubmissions > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-mint-dark-text mb-3">Submission Status</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={contributorChartData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {contributorChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                      <span className="text-sm text-mint-dark-text">Total Submissions</span>
                      <span className="text-lg font-bold text-mint-primary-blue">{stats.totalSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                      <span className="text-sm text-mint-dark-text">Completion Rate</span>
                      <span className="text-lg font-bold text-green-600">{stats.completionRate}%</span>
                    </div>
                    {stats.rejected > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="text-sm text-red-800">Rejected (Needs Revision)</span>
                        <span className="text-lg font-bold text-red-600">{stats.rejected}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/data/submission"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Submit Data</h4>
                  <p className="text-sm text-mint-dark-text/70">Create or edit your data submission</p>
                </a>
                <a
                  href="/public-dashboard"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">View Public Dashboard</h4>
                  <p className="text-sm text-mint-dark-text/70">View national e-government performance</p>
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Welcome Dashboard</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-2">Total Units</h3>
                <p className="text-4xl font-bold mb-1">{stats.totalUnits}</p>
                <p className="text-xs text-white/80">Administrative units</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide mb-2">Total Submissions</h3>
                <p className="text-4xl font-bold text-mint-primary-blue mb-1">{stats.totalSubmissions}</p>
                <p className="text-xs text-mint-dark-text/60">All submissions</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide mb-2">Completion Rate</h3>
                <p className="text-4xl font-bold text-green-600 mb-1">{stats.completionRate}%</p>
                <p className="text-xs text-mint-dark-text/60">Validated & Completed</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/public-dashboard"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">View Public Dashboard</h4>
                  <p className="text-sm text-mint-dark-text/70">View national e-government performance metrics</p>
                </a>
                <a
                  href="/reports"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">View Reports</h4>
                  <p className="text-sm text-mint-dark-text/70">Access detailed reports and analytics</p>
                </a>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['all']}>
      <Layout title="Dashboard">
        <div className="flex">
          <Sidebar />
        <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                Dashboard
              </h1>
              <p className="text-mint-dark-text/70">Welcome back! Here's an overview of your activities.</p>
            </div>
            {renderRoleBasedContent()}
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}

