import React from 'react';
import { Activity, Users, Shield, Database } from 'lucide-react';

const RecentAdminActions: React.FC = () => {
  const actions = [
    { id: 1, type: 'user', message: 'Suspended user account', time: '5 minutes ago', icon: Users },
    { id: 2, type: 'security', message: 'Security audit completed', time: '10 minutes ago', icon: Shield },
    { id: 3, type: 'database', message: 'Database backup created', time: '1 hour ago', icon: Database },
    { id: 4, type: 'user', message: 'New user registration', time: '2 hours ago', icon: Users },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        Recent Admin Actions
      </h2>
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <action.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {action.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAdminActions;
