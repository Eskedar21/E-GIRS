import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

export default function ReportsIndex() {
  const { user } = useAuth();
  const userRole = user ? user.role : '';

  // Define role-specific reports
  const roleBasedReports = {
    'Regional Approver': [
      {
        id: 'regional-report',
        title: 'Regional Performance Report',
        description: 'Index results for region, zone, and woreda with overview numbers and visual representations',
        path: '/reports/regional-approver',
        icon: '📊',
        color: 'from-mint-primary-blue to-mint-secondary-blue',
        features: [
          'Region, Zone, and Woreda index results',
          'Overview numbers and KPIs',
          'Indicator-based visualizations',
          'Dimension-based representations',
          'Export capabilities'
        ]
      }
    ],
    'Data Contributor': [
      {
        id: 'contributor-report',
        title: 'My Unit Performance Report',
        description: 'Index results for your assigned unit with year filter',
        path: '/reports/data-contributor',
        icon: '📋',
        color: 'from-green-500 to-emerald-600',
        features: [
          'Unit-specific index results',
          'Year of assessment filter',
          'Performance trends',
          'Dimension breakdown',
          'Export capabilities'
        ]
      }
    ],
    'Institute Data Contributor': [
      {
        id: 'contributor-report',
        title: 'My Unit Performance Report',
        description: 'Index results for your assigned unit with year filter',
        path: '/reports/data-contributor',
        icon: '📋',
        color: 'from-green-500 to-emerald-600',
        features: [
          'Unit-specific index results',
          'Year of assessment filter',
          'Performance trends',
          'Dimension breakdown',
          'Export capabilities'
        ]
      }
    ],
    'Federal Data Contributor': [
      {
        id: 'federal-contributor-report',
        title: 'My Submissions Report',
        description: 'View your submission history and status (no index calculation)',
        path: '/reports/federal-contributor',
        icon: '📄',
        color: 'from-purple-500 to-indigo-600',
        features: [
          'Submission history',
          'Status tracking',
          'Year filter',
          'Submission details',
          'Export capabilities'
        ]
      }
    ],
    'Central Committee Member': [
      {
        id: 'central-approver-report',
        title: 'Comprehensive Administrative Report',
        description: 'All administrative units results with federal institutions final submissions',
        path: '/reports/central-approver',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'All admin units results',
          'Tabbed interface',
          'Federal institutions final submissions',
          'Comprehensive analytics',
          'Export capabilities'
        ]
      }
    ],
    'Chairman (CC)': [
      {
        id: 'central-approver-report',
        title: 'Comprehensive Administrative Report',
        description: 'All administrative units results with federal institutions final submissions',
        path: '/reports/central-approver',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'All admin units results',
          'Tabbed interface',
          'Federal institutions final submissions',
          'Comprehensive analytics',
          'Export capabilities'
        ]
      }
    ],
    'Secretary (CC)': [
      {
        id: 'central-approver-report',
        title: 'Comprehensive Administrative Report',
        description: 'All administrative units results with federal institutions final submissions',
        path: '/reports/central-approver',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'All admin units results',
          'Tabbed interface',
          'Federal institutions final submissions',
          'Comprehensive analytics',
          'Export capabilities'
        ]
      }
    ],
    'MInT Admin': [
      {
        id: 'central-approver-report',
        title: 'Comprehensive Administrative Report',
        description: 'All administrative units results with federal institutions final submissions',
        path: '/reports/central-approver',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'All admin units results',
          'Tabbed interface',
          'Federal institutions final submissions',
          'Comprehensive analytics',
          'Export capabilities'
        ]
      },
      {
        id: 'federal-overview',
        title: 'Federal Institute Submissions Overview',
        description: 'Consolidated view of submission status across all Federal Institutes',
        path: '/reports/federal-institutes-overview',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'Filter by year and status',
          'Sortable data table',
          'Submission tracking',
          'CSV export',
          'Role-based access'
        ]
      },
      {
        id: 'federal-detail',
        title: 'Federal Institute Detailed Submission View',
        description: 'View complete question-and-answer data for a specific Federal Institute',
        path: '/reports/federal-institute-detail',
        icon: '📄',
        color: 'from-purple-500 to-indigo-600',
        features: [
          'Complete Q&A display',
          'Evidence links',
          'Central Committee notes',
          'Print to PDF',
          'Organized by dimensions'
        ]
      }
    ],
    'Super Admin': [
      {
        id: 'central-approver-report',
        title: 'Comprehensive Administrative Report',
        description: 'All administrative units results with federal institutions final submissions',
        path: '/reports/central-approver',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'All admin units results',
          'Tabbed interface',
          'Federal institutions final submissions',
          'Comprehensive analytics',
          'Export capabilities'
        ]
      },
      {
        id: 'federal-overview',
        title: 'Federal Institute Submissions Overview',
        description: 'Consolidated view of submission status across all Federal Institutes',
        path: '/reports/federal-institutes-overview',
        icon: '🏛️',
        color: 'from-orange-500 to-red-600',
        features: [
          'Filter by year and status',
          'Sortable data table',
          'Submission tracking',
          'CSV export',
          'Role-based access'
        ]
      },
      {
        id: 'federal-detail',
        title: 'Federal Institute Detailed Submission View',
        description: 'View complete question-and-answer data for a specific Federal Institute',
        path: '/reports/federal-institute-detail',
        icon: '📄',
        color: 'from-purple-500 to-indigo-600',
        features: [
          'Complete Q&A display',
          'Evidence links',
          'Central Committee notes',
          'Print to PDF',
          'Organized by dimensions'
        ]
      }
    ]
  };

  // Get available reports for current user role
  const getAvailableReports = () => {
    if (!userRole) return [];
    
    // Get role-specific reports
    const reports = roleBasedReports[userRole] || [];
    
    // Add unit scorecard for all roles (if they have access to view units)
    reports.push({
      id: 'unit-scorecard',
      title: 'Unit Scorecard',
      description: 'Detailed drill-down report for individual administrative units',
      path: '/reports/unit-scorecard',
      icon: '📋',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Dimensional performance analysis',
        'Unit vs National Average comparison',
        'Sub-unit rankings',
        'Radar chart visualization',
        'Export capabilities'
      ]
    });
    
    return reports;
  };

  const availableReports = getAvailableReports();

  return (
    <ProtectedRoute allowedRoles={['all']}>
      <Layout title="Reports">
        <div className="flex">
          <Sidebar />
          <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-mint-primary-blue mb-2">
                  Reports & Analytics
                </h1>
                <p className="text-mint-dark-text/70 text-lg">
                  Access comprehensive reports and visualizations for e-government performance analysis
                </p>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableReports.map((report) => (
                  <Link
                    key={report.id}
                    href={report.path}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-mint-medium-gray overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                      {/* Header with gradient */}
                      <div className={`bg-gradient-to-r ${report.color} p-6 text-white`}>
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{report.icon}</div>
                          <div>
                            <h2 className="text-xl font-bold mb-1">{report.title}</h2>
                            <p className="text-white/90 text-sm">{report.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="p-6">
                        <h3 className="text-sm font-semibold text-mint-dark-text mb-3 uppercase tracking-wide">
                          Key Features
                        </h3>
                        <ul className="space-y-2">
                          {report.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-sm text-mint-dark-text/70">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Footer with CTA */}
                      <div className="px-6 pb-6">
                        <div className="flex items-center justify-between text-mint-primary-blue group-hover:text-mint-secondary-blue transition-colors">
                          <span className="text-sm font-semibold">View Report</span>
                          <span className="text-lg">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Info Section */}
              <div className="mt-8 bg-[#0d6670]/10 border border-[#0d6670]/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-mint-primary-blue mb-3">About Reports</h3>
                <div className="space-y-2 text-sm text-mint-dark-text/70">
                  <p>
                    <strong>Role-Specific Reports:</strong> Each user role has access to reports tailored to their responsibilities and scope of work. Reports are designed to provide relevant insights based on your access level.
                  </p>
                  <p>
                    <strong>Access Control:</strong> Report access is automatically filtered based on your role and assigned administrative unit. You will only see data within your authorized scope.
                  </p>
                  <p>
                    All reports support data export in CSV format and include interactive visualizations for better data analysis.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

