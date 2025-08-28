import React from 'react';
import { Activity, Plus, Key, Shield } from 'lucide-react';

const RecentActivity: React.FC = () => {
  const activities = [
    { id: 1, type: 'add', message: 'Added password for Gmail', time: '2 minutes ago', icon: Plus },
    { id: 2, type: 'generate', message: 'Generated new password', time: '5 minutes ago', icon: Key },
    { id: 3, type: 'security', message: 'Security scan completed', time: '10 minutes ago', icon: Shield },
    { id: 4, type: 'add', message: 'Added password for Facebook', time: '1 hour ago', icon: Plus },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'add': return 'text-blue-600 dark:text-blue-400';
      case 'generate': return 'text-green-600 dark:text-green-400';
      case 'security': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Activity className="h-5 w-5 mr-2" />
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className={`w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ${getIconColor(activity.type)}`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
