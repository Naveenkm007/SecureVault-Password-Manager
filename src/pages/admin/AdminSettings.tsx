import React from 'react';
import { Settings, Shield, Database, Bell } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Admin Settings
      </h1>

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">System Maintenance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable maintenance mode</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Force Password Reset</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Require all users to reset passwords</p>
              </div>
              <button className="btn-secondary">Force Reset</button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Auto Backup</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Automated daily backups</p>
              </div>
              <select className="input-field w-32">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Data Retention</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Keep deleted data for</p>
              </div>
              <select className="input-field w-32">
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Security Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive security notifications</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">System Updates</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notify about system updates</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
