import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Key } from 'lucide-react';

const Vault: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Password Vault
        </h1>
        <button className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Password
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search passwords..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="text-center py-12">
          <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No passwords yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by adding your first password to the vault
          </p>
          <button className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vault;
