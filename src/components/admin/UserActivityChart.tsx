import React from 'react';
import { BarChart3 } from 'lucide-react';

const UserActivityChart: React.FC = () => {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">User Activity Chart</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Chart component will be implemented here</p>
      </div>
    </div>
  );
};

export default UserActivityChart;
