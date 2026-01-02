import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = user ? user.role : '';

  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      roles: ['all'] // Available to all authenticated users
    },
    {
      title: 'Administrative Units',
      path: '/admin/administrative-units',
      icon: '🏛️',
      roles: ['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)', 'Central Committee Member', 'Secretary (CC)', 'Initial Approver']
    },
    {
      title: 'Assessment Framework',
      path: '/admin/assessment-framework',
      icon: '📋',
      roles: ['Super Admin', 'MInT Admin']
    },
    {
      title: 'User Management',
      path: '/admin/users',
      icon: '👥',
      roles: ['Super Admin', 'MInT Admin']
    },
    {
      title: 'Data Submission',
      path: '/data/submission',
      icon: '📝',
      roles: ['Data Contributor', 'Institute Data Contributor']
    },
    {
      title: 'Approval Queue',
      path: '/approval/queue',
      icon: '✅',
      roles: ['Regional Approver', 'Federal Approver', 'Initial Approver']
    },
    {
      title: 'Central Validation',
      path: '/validation/central',
      icon: '🔍',
      roles: ['Central Committee Member', 'Chairman (CC)', 'Secretary (CC)']
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: '📈',
      roles: ['all']
    },
    {
      title: 'Public Dashboard',
      path: '/public-dashboard',
      icon: '🌐',
      roles: ['all']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-white text-mint-dark-text min-h-screen fixed left-0 top-16 shadow-lg border-r border-mint-medium-gray">
      <nav className="p-4">
        <div className="mb-4 px-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-mint-dark-text/60 mb-2">Navigation</h2>
        </div>
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-mint-primary-blue text-white shadow-md font-semibold'
                    : 'hover:bg-gray-50 text-mint-dark-text hover:text-mint-primary-blue'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

