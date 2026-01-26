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
  getSubmissionById,
  updateSubmission,
  SUBMISSION_STATUS 
} from '../data/submissions';
import { getAllAssessmentYears, getAssessmentYearById } from '../data/assessmentFramework';
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
  const [selectedYear, setSelectedYear] = useState(null);
  const [assessmentYears, setAssessmentYears] = useState([]);

  // Demo status rotation for showing different submission statuses (same as submission page)
  const DEMO_STATUSES = [
    SUBMISSION_STATUS.DRAFT,
    SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER,
    SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL,
    SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE,
    SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION,
    SUBMISSION_STATUS.VALIDATED
  ];

  const rotateSubmissionStatusForDemo = (submission, userRole) => {
    if (!submission) return null;
    
    // Only rotate for data contributor roles (demo purposes)
    const isDataContributor = ['Data Contributor', 'Institute Data Contributor'].includes(userRole);
    
    if (!isDataContributor) return submission;
    
    // Get current rotation index from localStorage
    const storageKey = `demo_status_index_${submission.submissionId}`;
    const visitKey = `demo_visit_count_${submission.submissionId}`;
    
    let currentIndex = 0;
    const storedIndex = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const visitCount = typeof window !== 'undefined' ? parseInt(localStorage.getItem(visitKey) || '0') : 0;
    
    // Increment visit count
    const newVisitCount = visitCount + 1;
    
    // Rotate to next status on every visit
    if (storedIndex !== null) {
      currentIndex = (parseInt(storedIndex) + 1) % DEMO_STATUSES.length;
    } else {
      // First visit - start with current status or first in rotation
      const currentStatusIndex = DEMO_STATUSES.indexOf(submission.submissionStatus);
      currentIndex = currentStatusIndex >= 0 ? (currentStatusIndex + 1) % DEMO_STATUSES.length : 0;
    }
    
    // Get the status for this rotation
    const newStatus = DEMO_STATUSES[currentIndex];
    
    // Always update to the next status in rotation
    updateSubmission(submission.submissionId, { 
      submissionStatus: newStatus,
      updatedAt: new Date().toISOString()
    });
    
    // Update the stored index and visit count
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, currentIndex.toString());
      localStorage.setItem(visitKey, newVisitCount.toString());
    }
    
    // Return updated submission
    return getSubmissionById(submission.submissionId);
  };

  // Load assessment years
  useEffect(() => {
    const years = getAllAssessmentYears();
    setAssessmentYears(years);
    
    // Auto-select active year if available
    if (!selectedYear && years.length > 0) {
      const activeYear = years.find(y => y.status === 'Active');
      if (activeYear) {
        setSelectedYear(activeYear);
      } else if (years.length > 0) {
        // If no active year, select the most recent one
        setSelectedYear(years[years.length - 1]);
      }
    }
  }, []);

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
    } else if (['Regional Approver', 'Federal Approver'].includes(userRole)) {
      // Regional Approvers see submissions in their scope
      const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL);
      const rejected = getSubmissionsByStatus(SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE);
      const approvedPendingCentral = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
      const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
      const allBeforeFilter = [...pending, ...rejected, ...approvedPendingCentral, ...validated];
      
      // Filter by scope using the same function as approval queue
      relevantSubmissions = filterSubmissionsByAccess(allBeforeFilter, user, allUnits);
    } else if (userRole === 'Data Contributor' || userRole === 'Institute Data Contributor') {
      // Data Contributors see their own submissions, filtered by selected year
      const userSubmissions = getSubmissionsByUser(user?.userId || 0);
      if (selectedYear) {
        relevantSubmissions = userSubmissions.filter(s => s.assessmentYearId === selectedYear.assessmentYearId);
      } else {
        relevantSubmissions = userSubmissions;
      }
    } else if (userRole === 'MInT Admin' || userRole === 'Super Admin') {
      // Admins see all submissions - use the state that's kept in sync
      relevantSubmissions = submissions.length > 0 ? submissions : getAllSubmissions();
    }

    // Calculate counts from the filtered submissions (matching approval queue logic)
    const draftSubmissions = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.DRAFT);
    const pendingApproval = relevantSubmissions.filter(s => 
      s.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL ||
      s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
    );
    const pendingValidation = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
    const validated = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.VALIDATED);
    const completed = relevantSubmissions.filter(s => s.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE);
    const rejected = relevantSubmissions.filter(s => 
      s.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
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
  }, [submissions, units, user, userRole, selectedYear]);

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
    { name: 'Pending Approval', value: stats.pendingApproval, color: '#0d6670' },
    { name: 'Validated', value: stats.validated, color: '#10b981' },
    { name: 'Completed', value: stats.completed, color: '#059669' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ], [stats]);

  // Prepare chart data for Regional Approver dashboard
  const approverChartData = useMemo(() => {
    if (userRole !== 'Regional Approver') return [];
    
    return [
      { name: 'Pending Approval', value: stats.pendingApproval, color: '#0d6670' },
      { name: 'Validated', value: stats.validated, color: '#10b981' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stats, userRole]);

  // Prepare chart data for Central Committee dashboard
  const centralChartData = useMemo(() => {
    if (!['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)) return [];
    
    return [
      { name: 'Pending Validation', value: stats.pendingValidation, color: '#0d6670' },
      { name: 'Validated', value: stats.validated, color: '#4CAF50' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [stats, userRole]);

  // Prepare submissions by region/unit type for Central Committee
  const centralSubmissionsByRegionData = useMemo(() => {
    if (!['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)'].includes(userRole)) return [];
    
    const allUnits = getAllUnits();
    const pending = getSubmissionsByStatus(SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION);
    const validated = getSubmissionsByStatus(SUBMISSION_STATUS.VALIDATED);
    const allSubmissions = [...pending, ...validated];
    
    // Group by region/unit type
    const regionMap = new Map();
    allSubmissions.forEach(submission => {
      const unit = getUnitById(submission.unitId);
      if (unit) {
        // Get region name (for regions) or unit type (for federal institutes/cities)
        let regionName = unit.unitType === 'Region' ? unit.officialUnitName : 
                        unit.unitType === 'City Administration' ? unit.officialUnitName :
                        unit.unitType === 'Federal Institute' ? 'Federal Institutes' :
                        unit.unitType || 'Other';
        
        // For sub-cities, get parent city
        if (unit.unitType === 'Sub-city') {
          const parentUnit = allUnits.find(u => u.unitId === unit.parentUnitId);
          regionName = parentUnit ? parentUnit.officialUnitName : 'Other Cities';
        }
        
        if (!regionMap.has(regionName)) {
          regionMap.set(regionName, {
            name: regionName.length > 20 ? regionName.substring(0, 20) + '...' : regionName,
            fullName: regionName,
            pending: 0,
            validated: 0,
            total: 0
          });
        }
        const regionData = regionMap.get(regionName);
        regionData.total++;
        if (submission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION) {
          regionData.pending++;
        } else if (submission.submissionStatus === SUBMISSION_STATUS.VALIDATED) {
          regionData.validated++;
        }
      }
    });
    
    // Convert to array and sort by total (descending), limit to top 10
    return Array.from(regionMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [submissions, userRole]);

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


      case 'Federal Approver':
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
                    Review and approve submissions from Federal Institutes in your scope
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

      case 'Regional Approver':
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

            {/* Visualizations Section - Reduced Chart Content Width */}
            {approverChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Submission Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={approverChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {approverChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Overview Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Status Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={approverChartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#374151" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                        {approverChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Approval Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Approval Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Total Submissions</span>
                    <span className="text-xl font-bold text-mint-primary-blue">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Approval Rate</span>
                    <span className="text-xl font-bold text-green-600">
                      {stats.totalSubmissions > 0 
                        ? ((stats.validated / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Rejection Rate</span>
                    <span className="text-xl font-bold text-red-600">
                      {stats.totalSubmissions > 0 
                        ? ((stats.rejected / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Workload Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Pending Review</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.pendingApproval} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-[#0d6670] h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.pendingApproval / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Completed</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.validated} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.validated / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Submissions Awaiting Your Approval</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">
                    Review and approve submissions from your region
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
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Central Validation Dashboard</h2>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-mint-accent-green rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Pending Validation</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.pendingValidation}</p>
                <p className="text-xs text-white/80">Awaiting final validation</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-mint-accent-green">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Validated</h3>
                  <svg className="w-6 h-6 text-mint-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-mint-accent-green mb-1">{stats.validated}</p>
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

            {/* Visualizations Section */}
            {centralChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Validation Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={centralChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {centralChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Overview Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Validation Status Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={centralChartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#374151" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                        {centralChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Submissions by Region/Unit Type Chart */}
            {centralSubmissionsByRegionData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-4">
                  Submissions by Region/Unit Type (Top {centralSubmissionsByRegionData.length})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={centralSubmissionsByRegionData} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#374151" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      labelFormatter={(label) => {
                        const item = centralSubmissionsByRegionData.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill="#f97316" name="Pending Validation" barSize={45} />
                    <Bar dataKey="validated" stackId="a" fill="#10b981" name="Validated" barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Validation Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Validation Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Total Submissions</span>
                    <span className="text-xl font-bold text-mint-primary-blue">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Validation Rate</span>
                    <span className="text-xl font-bold text-mint-accent-green">
                      {stats.totalSubmissions > 0 
                        ? ((stats.validated / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Rejection Rate</span>
                    <span className="text-xl font-bold text-red-600">
                      {stats.totalSubmissions > 0 
                        ? ((stats.rejected / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Workload Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Pending Validation</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.pendingValidation} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-mint-primary-blue h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.pendingValidation / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Validated</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.validated} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-mint-accent-green h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.validated / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
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
                <div className="mt-4 p-4 bg-mint-primary-blue/10 border border-mint-primary-blue/20 rounded-lg">
                  <p className="text-sm text-mint-primary-blue">
                    <span className="font-semibold">Action Required:</span> You have {stats.pendingValidation} submission{stats.pendingValidation !== 1 ? 's' : ''} waiting for final validation.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Chairman (CC)':
      case 'Secretary (CC)':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-mint-primary-blue">Central Validation Overview</h2>
                <p className="text-sm text-mint-dark-text/70 mt-1">Read-only access to validation dashboard</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                <div className="w-2 h-2 bg-mint-accent-green rounded-full animate-pulse"></div>
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-mint-primary-blue to-mint-secondary-blue rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Pending Validation</h3>
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold mb-1">{stats.pendingValidation}</p>
                <p className="text-xs text-white/80">Awaiting final validation</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-mint-accent-green">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Validated</h3>
                  <svg className="w-6 h-6 text-mint-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-mint-accent-green mb-1">{stats.validated}</p>
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

            {/* Visualizations Section - Read Only */}
            {centralChartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Validation Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={centralChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {centralChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Overview Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                  <h3 className="text-lg font-bold text-mint-primary-blue mb-4">Validation Status Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={centralChartData} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#374151" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                        {centralChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Submissions by Region/Unit Type Chart */}
            {centralSubmissionsByRegionData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-4">
                  Submissions by Region/Unit Type (Top {centralSubmissionsByRegionData.length})
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={centralSubmissionsByRegionData} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#374151" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#374151" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      labelFormatter={(label) => {
                        const item = centralSubmissionsByRegionData.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="pending" stackId="a" fill="#0d6670" name="Pending Validation" barSize={45} />
                    <Bar dataKey="validated" stackId="a" fill="#4CAF50" name="Validated" barSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Validation Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Validation Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Total Submissions</span>
                    <span className="text-xl font-bold text-mint-primary-blue">{stats.totalSubmissions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Validation Rate</span>
                    <span className="text-xl font-bold text-mint-accent-green">
                      {stats.totalSubmissions > 0 
                        ? ((stats.validated / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                    <span className="text-sm text-mint-dark-text">Rejection Rate</span>
                    <span className="text-xl font-bold text-red-600">
                      {stats.totalSubmissions > 0 
                        ? ((stats.rejected / stats.totalSubmissions) * 100).toFixed(1) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
                <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Workload Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Pending Validation</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.pendingValidation} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-mint-primary-blue h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.pendingValidation / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-mint-dark-text">Validated</span>
                      <span className="text-sm font-semibold text-mint-dark-text">
                        {stats.validated} / {stats.totalSubmissions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-mint-accent-green h-3 rounded-full transition-all" 
                        style={{ width: `${stats.totalSubmissions > 0 ? (stats.validated / stats.totalSubmissions * 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Validation Status Overview</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">View-only access to validation information</p>
                </div>
                <a
                  href="/approval/queue"
                  className="bg-mint-primary-blue hover:bg-mint-secondary-blue text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                  title="View queue list"
                >
                  View Queue →
                </a>
              </div>
              <div className="mt-4 p-4 bg-mint-light-gray border border-mint-medium-gray rounded-lg">
                <p className="text-sm text-mint-dark-text/70">
                  <span className="font-semibold">Read-Only Access:</span> You have view-only access to the validation dashboard. Contact a Central Committee Member for approval actions.
                </p>
              </div>
            </div>
          </div>
        );

      case 'Data Contributor':
      case 'Institute Data Contributor':
        // Get current submission for selected year
        let currentSubmission = stats.totalSubmissions > 0 
          ? (user ? getSubmissionsByUser(user.userId).find(s => 
              selectedYear ? s.assessmentYearId === selectedYear.assessmentYearId : true
            ) : null)
          : null;
        
        // Rotate status for demo purposes (same as submission page)
        if (currentSubmission) {
          currentSubmission = rotateSubmissionStatusForDemo(currentSubmission, userRole) || currentSubmission;
        }
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-mint-primary-blue">Data Submission Dashboard</h2>
              <div className="flex items-center gap-4">
                {/* Assessment Year Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-mint-dark-text">Assessment Year:</label>
                  <select
                    value={selectedYear?.assessmentYearId || ''}
                    onChange={(e) => {
                      const year = assessmentYears.find(y => y.assessmentYearId === parseInt(e.target.value));
                      setSelectedYear(year);
                    }}
                    className="px-3 py-2 border border-mint-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue bg-white text-sm"
                  >
                    <option value="">All Years</option>
                    {assessmentYears.map((year) => (
                      <option key={year.assessmentYearId} value={year.assessmentYearId}>
                        {year.yearName} ({year.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-mint-dark-text/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Current Submission Status - Prominent Display */}
            {currentSubmission && selectedYear ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-mint-medium-gray">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-mint-dark-text">Current Submission Status</h3>
                    <p className="text-sm text-mint-dark-text/70 mt-1">
                      {selectedYear.yearName} Assessment
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    currentSubmission.submissionStatus === SUBMISSION_STATUS.DRAFT
                      ? 'bg-yellow-100 text-yellow-800'
                      : currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL
                      ? 'bg-[#0d6670]/10 text-[#0d6670]'
                      : currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                      ? 'bg-orange-100 text-orange-800'
                      : currentSubmission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                      ? 'bg-green-100 text-green-800'
                      : currentSubmission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {currentSubmission.submissionStatus}
                  </span>
                </div>
                
                {/* Status Progress Timeline */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-mint-dark-text">Submission Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Draft */}
                    <div className={`flex-1 h-2 rounded-full ${
                      currentSubmission.submissionStatus !== SUBMISSION_STATUS.DRAFT ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    {/* Pending Approval */}
                    <div className={`flex-1 h-2 rounded-full ${
                      [SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL, SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION, 
                       SUBMISSION_STATUS.VALIDATED, SUBMISSION_STATUS.SCORING_COMPLETE].includes(currentSubmission.submissionStatus)
                        ? 'bg-green-500' 
                        : currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL || 
                          currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                        ? 'bg-[#0d6670]'
                        : 'bg-gray-300'
                    }`}></div>
                    {/* Validated */}
                    <div className={`flex-1 h-2 rounded-full ${
                      [SUBMISSION_STATUS.VALIDATED, SUBMISSION_STATUS.SCORING_COMPLETE].includes(currentSubmission.submissionStatus)
                        ? 'bg-green-500'
                        : currentSubmission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}></div>
                    {/* Completed */}
                    <div className={`flex-1 h-2 rounded-full ${
                      currentSubmission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'
                    }`}></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-mint-dark-text/60">
                    <span>Draft</span>
                    <span>Under Review</span>
                    <span>Validated</span>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            ) : selectedYear ? (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-mint-medium-gray text-center">
                <svg className="w-16 h-16 text-mint-dark-text/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-mint-dark-text mb-2">No Submission Yet</h3>
                <p className="text-sm text-mint-dark-text/70 mb-4">
                  You haven't created a submission for {selectedYear.yearName} yet.
                </p>
                <a
                  href={selectedYear ? `/data/submission?year=${selectedYear.assessmentYearId}` : '/data/submission'}
                  className="inline-block bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Start Submission →
                </a>
              </div>
            ) : null}
            

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Your Submissions</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">Manage your data submissions for your assigned unit</p>
                </div>
                <a
                  href={selectedYear ? `/data/submission?year=${selectedYear.assessmentYearId}` : '/data/submission'}
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  {currentSubmission ? 'Edit Submission →' : 'Start Submission →'}
                </a>
              </div>

              {selectedYear && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentSubmission ? (
                    <>
                      <div>
                        <h4 className="text-sm font-semibold text-mint-dark-text mb-3">Submission Overview</h4>
                        <div className="space-y-3">
                          <div className="p-4 bg-mint-light-gray rounded-lg">
                            <p className="text-xs text-mint-dark-text/60 mb-1">Submission Name</p>
                            <p className="text-sm font-semibold text-mint-dark-text">
                              {currentSubmission.submissionName || `Submission #${currentSubmission.submissionId}`}
                            </p>
                          </div>
                          <div className="p-4 bg-mint-light-gray rounded-lg">
                            <p className="text-xs text-mint-dark-text/60 mb-1">Last Updated</p>
                            <p className="text-sm font-semibold text-mint-dark-text">
                              {currentSubmission.updatedAt 
                                ? new Date(currentSubmission.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                          <span className="text-sm text-mint-dark-text">Assessment Year</span>
                          <span className="text-lg font-bold text-mint-primary-blue">{selectedYear.yearName}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-mint-light-gray rounded-lg">
                          <span className="text-sm text-mint-dark-text">Status</span>
                          <span className={`text-lg font-bold px-3 py-1 rounded-full text-sm ${
                            currentSubmission.submissionStatus === SUBMISSION_STATUS.DRAFT
                              ? 'bg-yellow-100 text-yellow-800'
                              : currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_INITIAL_APPROVAL
                              ? 'bg-[#0d6670]/10 text-[#0d6670]'
                              : currentSubmission.submissionStatus === SUBMISSION_STATUS.PENDING_CENTRAL_VALIDATION
                              ? 'bg-orange-100 text-orange-800'
                              : currentSubmission.submissionStatus === SUBMISSION_STATUS.VALIDATED
                              ? 'bg-green-100 text-green-800'
                              : currentSubmission.submissionStatus === SUBMISSION_STATUS.SCORING_COMPLETE
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {currentSubmission.submissionStatus}
                          </span>
                        </div>
                        {(currentSubmission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_REGIONAL_APPROVER ||
                          currentSubmission.submissionStatus === SUBMISSION_STATUS.REJECTED_BY_CENTRAL_COMMITTEE) && (
                          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                            <span className="text-sm text-red-800">Rejected (Needs Revision)</span>
                            <span className="text-lg font-bold text-red-600">Yes</span>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center py-8">
                      <p className="text-mint-dark-text/70">Select an assessment year to view submission details</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href={selectedYear ? `/data/submission?year=${selectedYear.assessmentYearId}` : '/data/submission'}
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Submit Data</h4>
                  <p className="text-sm text-mint-dark-text/70">Create or edit your data submission</p>
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
                  href="/reports"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200 hover:bg-mint-light-gray"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">View Reports & Analytics</h4>
                  <p className="text-sm text-mint-dark-text/70">Access comprehensive reports, analytics, and national e-government performance metrics</p>
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

