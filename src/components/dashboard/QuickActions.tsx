import React from 'react';
import { Plus, Key, Shield, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions = [
    { name: 'Add Password', icon: Plus, action: 'add', color: 'blue' },
    { name: 'Generate Password', icon: Key, action: 'generate', color: 'green' },
    { name: 'Security Report', icon: Shield, action: 'security', color: 'red' },
    { name: 'View Vault', icon: BarChart3, action: 'vault', color: 'purple' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={() => onAction(action.action)}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className={`w-12 h-12 ${colorClasses[action.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-3`}>
              <action.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
              {action.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
