import React from 'react';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface SystemHealthProps {
  stats: any;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ stats }) => {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        System Health
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">System Status</p>
            <p className="text-sm text-green-700 dark:text-green-300">All systems operational</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">Uptime</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">99.9%</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Alerts</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">2 active alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
