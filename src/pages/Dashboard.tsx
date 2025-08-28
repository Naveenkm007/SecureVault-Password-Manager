import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Key, 
  Shield, 
  TrendingUp, 
  Activity, 
  Lock,
  Users,
  Database
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useVault } from '../contexts/VaultContext'
import { useAuth } from '../contexts/AuthContext'
import StatCard from '../components/dashboard/StatCard'
import SecurityScore from '../components/dashboard/SecurityScore'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivity from '../components/dashboard/RecentActivity'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { 
    passwords, 
    loading, 
    analyzeVaultSecurity,
    searchPasswords 
  } = useVault()

  const securityAnalysis = analyzeVaultSecurity()
  const recentPasswords = passwords.slice(0, 5)

  useEffect(() => {
    // Refresh data when component mounts
  }, [])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate('/password/new')
        break
      case 'generate':
        navigate('/generator')
        break
      case 'security':
        navigate('/security')
        break
      case 'vault':
        navigate('/vault')
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's what's happening with your vault today
          </p>
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <SecurityScore score={securityAnalysis.score} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Passwords"
            value={securityAnalysis.totalPasswords}
            icon={Database}
            color="blue"
            trend="+12%"
            trendDirection="up"
          />
          <StatCard
            title="Security Score"
            value={`${securityAnalysis.score}/100`}
            icon={Shield}
            color="green"
            trend={securityAnalysis.score > 80 ? "Excellent" : "Needs attention"}
            trendDirection={securityAnalysis.score > 80 ? "up" : "down"}
          />
          <StatCard
            title="Weak Passwords"
            value={securityAnalysis.weakPasswords}
            icon={Lock}
            color="red"
            trend={securityAnalysis.weakPasswords > 0 ? "Action needed" : "All secure"}
            trendDirection={securityAnalysis.weakPasswords > 0 ? "down" : "up"}
          />
          <StatCard
            title="Active Sessions"
            value="1"
            icon={Users}
            color="purple"
            trend="Current"
            trendDirection="neutral"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <QuickActions onAction={handleQuickAction} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Passwords */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Passwords
              </h2>
              <button
                onClick={() => navigate('/vault')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </button>
            </div>
            
            {recentPasswords.length === 0 ? (
              <div className="text-center py-8">
                <Key className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No passwords yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding your first password
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/password/new')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4" />
                    Add Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPasswords.map((password) => (
                  <div
                    key={password.id}
                    onClick={() => navigate(`/password/edit/${password.id}`)}
                    className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {password.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {password.username}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {password.favorite && (
                        <span className="text-yellow-500">⭐</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Security Issues */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Security Issues
              </h2>
              <button
                onClick={() => navigate('/security')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View report
              </button>
            </div>

            {securityAnalysis.issues.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="mx-auto h-12 w-12 text-green-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  All good! 🎉
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No security issues found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {securityAnalysis.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 text-sm">
                          {issue.icon}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {issue.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <RecentActivity />
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
