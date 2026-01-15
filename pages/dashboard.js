import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { getAllUnits } from '../data/administrativeUnits';

export default function Dashboard() {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const userRole = user ? user.role : '';
  const [units] = useState(getAllUnits());
  const [stats, setStats] = useState({
    totalUnits: 0,
    draftSubmissions: 0,
    pendingApproval: 0,
    pendingValidation: 0,
    completed: 0
  });

  useEffect(() => {
    // Calculate statistics
    setStats({
      totalUnits: units.length,
      draftSubmissions: 5, // Mock data
      pendingApproval: 3, // Mock data
      pendingValidation: 2, // Mock data
      completed: 10 // Mock data
    });
  }, [units]);

  const renderRoleBasedContent = () => {
    switch (userRole) {
      case 'MInT Admin':
      case 'Super Admin':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mint-primary-blue">Administrative Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Total Units</h3>
                </div>
                <p className="text-4xl font-bold text-mint-primary-blue mb-1">{stats.totalUnits}</p>
                <p className="text-xs text-mint-dark-text/60">Administrative units</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Draft</h3>
                </div>
                <p className="text-4xl font-bold text-yellow-600 mb-1">{stats.draftSubmissions}</p>
                <p className="text-xs text-mint-dark-text/60">In progress</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Pending Approval</h3>
                </div>
                <p className="text-4xl font-bold text-[#0d6670] mb-1">{stats.pendingApproval}</p>
                <p className="text-xs text-mint-dark-text/60">Awaiting review</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-mint-dark-text/70 uppercase tracking-wide">Pending Validation</h3>
                </div>
                <p className="text-4xl font-bold text-orange-600 mb-1">{stats.pendingValidation}</p>
                <p className="text-xs text-mint-dark-text/60">Central committee</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="/admin/administrative-units"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Manage Administrative Units</h4>
                  <p className="text-sm text-mint-dark-text/70">Register and manage administrative units</p>
                </a>
                <a
                  href="/admin/assessment-framework"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Assessment Framework</h4>
                  <p className="text-sm text-mint-dark-text/70">Configure assessment dimensions and indicators</p>
                </a>
                <a
                  href="/admin/users"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">User Management</h4>
                  <p className="text-sm text-mint-dark-text/70">Create and manage user accounts</p>
                </a>
              </div>
            </div>
          </div>
        );


      case 'Regional Approver':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mint-primary-blue">Approval Queue</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Submissions Awaiting Your Approval</h3>
                  <p className="text-3xl font-bold text-mint-primary-blue mt-2">{stats.pendingApproval}</p>
                </div>
                <a
                  href="/approval/queue"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
                >
                  View Approval Queue
                </a>
              </div>
            </div>
          </div>
        );

      case 'Central Committee Member':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mint-primary-blue">Central Validation</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Submissions Awaiting Final Validation</h3>
                  <p className="text-3xl font-bold text-mint-primary-blue mt-2">{stats.pendingValidation}</p>
                </div>
                <a
                  href="/validation/central"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
                >
                  View Validation Queue
                </a>
              </div>
            </div>
          </div>
        );

      case 'Data Contributor':
      case 'Institute Data Contributor':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-mint-primary-blue">Data Submission Dashboard</h2>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-mint-dark-text">Your Submissions</h3>
                  <p className="text-sm text-mint-dark-text/70 mt-1">Manage your data submissions for your assigned unit</p>
                </div>
                <a
                  href="/data/submission"
                  className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Start / Edit Submission
                </a>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-mint-light-gray rounded-lg p-4 border border-mint-medium-gray">
                  <p className="text-sm text-mint-dark-text/70 mb-1">Draft Submissions</p>
                  <p className="text-2xl font-bold text-mint-primary-blue">{stats.draftSubmissions}</p>
                </div>
                <div className="bg-mint-light-gray rounded-lg p-4 border border-mint-medium-gray">
                  <p className="text-sm text-mint-dark-text/70 mb-1">Pending Approval</p>
                  <p className="text-2xl font-bold text-[#0d6670]">{stats.pendingApproval}</p>
                </div>
                <div className="bg-mint-light-gray rounded-lg p-4 border border-mint-medium-gray">
                  <p className="text-sm text-mint-dark-text/70 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-mint-medium-gray">
              <h3 className="text-lg font-semibold text-mint-dark-text mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/data/submission"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-semibold text-mint-primary-blue mb-2 group-hover:text-mint-secondary-blue transition-colors">Submit Data</h4>
                  <p className="text-sm text-mint-dark-text/70">Create or edit your data submission</p>
                </a>
                <a
                  href="/public-dashboard"
                  className="group p-5 border-2 border-mint-medium-gray rounded-xl hover:border-mint-primary-blue hover:shadow-md transition-all duration-200"
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
            <h2 className="text-2xl font-bold text-mint-primary-blue">Welcome</h2>
            <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
              <p className="text-mint-dark-text">Dashboard content for your role will be displayed here.</p>
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

