import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Check } from 'lucide-react';

const Generator: React.FC = () => {
  const [password, setPassword] = useState('SecurePassword123!');
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Password Generator
      </h1>

      <div className="card p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Generated Password
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={password}
                readOnly
                className="input-field flex-1 font-mono text-lg"
              />
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center px-4"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password Length
              </label>
              <input
                type="range"
                min="8"
                max="32"
                defaultValue="16"
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>8</span>
                <span>32</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Include
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Uppercase letters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Lowercase letters</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Numbers</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="mr-2" />
                  <span className="text-sm">Special characters</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={generatePassword}
            className="btn-primary w-full flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Generate New Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generator;
