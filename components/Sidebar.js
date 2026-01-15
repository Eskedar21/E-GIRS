import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';

export default function Sidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const userRole = user ? user.role : '';

  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      roles: ['all'] // Available to all authenticated users
    },
    {
      title: 'Administrative Units',
      path: '/admin/administrative-units',
      roles: ['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)', 'Central Committee Member', 'Secretary (CC)', 'Initial Approver']
    },
    {
      title: 'Assessment Framework',
      path: '/admin/assessment-framework',
      roles: ['Super Admin', 'MInT Admin']
    },
    {
      title: 'User Management',
      path: '/admin/users',
      roles: ['Super Admin', 'MInT Admin']
    },
    {
      title: 'Data Submission',
      path: '/data/submission',
      roles: ['Data Contributor', 'Institute Data Contributor']
    },
    {
      title: 'Approval Queue',
      path: '/approval/queue',
      roles: ['Regional Approver', 'Federal Approver', 'Initial Approver']
    },
    {
      title: 'Central Validation',
      path: '/validation/central',
      roles: ['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)']
    },
    {
      title: 'Reports',
      path: '/reports',
      roles: ['all']
    },
    {
      title: 'Public Dashboard',
      path: '/public-dashboard',
      roles: ['all']
    },
    {
      title: 'My Profile',
      path: '/profile',
      roles: ['all']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  );

  // SVG Icon components
  const IconComponent = ({ title, isActive }) => {
    const iconClass = `w-5 h-5 ${isActive ? 'text-white' : 'text-mint-dark-text group-hover:text-mint-primary-blue'}`;
    
    switch (title) {
      case 'Dashboard':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'Administrative Units':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'Assessment Framework':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'User Management':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'Data Submission':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'Approval Queue':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'Central Validation':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Reports':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'Public Dashboard':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'My Profile':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white text-mint-dark-text min-h-screen fixed left-0 top-16 shadow-lg border-r border-mint-medium-gray transition-all duration-300 z-40`}>
      <nav className="p-4">
        {/* Toggle Button */}
        <div className="mb-4 flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-mint-dark-text/60">Navigation</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`w-5 h-5 text-mint-dark-text transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-mint-primary-blue text-white shadow-md font-semibold'
                    : 'hover:bg-gray-50 text-mint-dark-text hover:text-mint-primary-blue'
                }`}
                title={isCollapsed ? item.title : ''}
              >
                <span className={`${isCollapsed ? '' : 'mr-3'}`}>
                  <IconComponent title={item.title} isActive={isActive(item.path)} />
                </span>
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

