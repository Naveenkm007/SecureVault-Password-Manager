import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Activity, 
  Database, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { useNavigate } from 'react-router-dom'
import AdminStatCard from '../../components/admin/AdminStatCard'
import SystemHealth from '../../components/admin/SystemHealth'
import UserActivityChart from '../../components/admin/UserActivityChart'
import RecentAdminActions from '../../components/admin/RecentAdminActions'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { 
    systemStats, 
    loading, 
    getSystemStats,
    logAdminAction 
  } = useAdmin()

  useEffect(() => {
    getSystemStats()
    logAdminAction('dashboard_viewed', { timestamp: new Date().toISOString() })
  }, [getSystemStats, logAdminAction])

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        navigate('/admin/users')
        break
      case 'stats':
        navigate('/admin/stats')
        break
      case 'settings':
        navigate('/admin/settings')
        break
      case 'backup':
        // Trigger backup
        logAdminAction('backup_triggered', { timestamp: new Date().toISOString() })
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

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Activity className="h-5 w-5 text-gray-600" />
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard 🛡️
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                System overview and management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getHealthIcon(systemStats.systemHealth)}
                <span className={`text-sm font-medium ${getHealthColor(systemStats.systemHealth)}`}>
                  System: {systemStats.systemHealth}
                </span>
              </div>
              <button
                onClick={() => handleQuickAction('backup')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Database className="-ml-1 mr-2 h-4 w-4" />
                Backup
              </button>
            </div>
          </div>
        </motion.div>

        {/* System Health Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <SystemHealth stats={systemStats} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <AdminStatCard
            title="Total Users"
            value={systemStats.totalUsers}
            icon={Users}
            color="blue"
            trend={`${systemStats.activeUsers} active`}
            trendDirection="up"
          />
          <AdminStatCard
            title="Active Users"
            value={systemStats.activeUsers}
            icon={Users}
            color="green"
            trend={`${Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)}%`}
            trendDirection="up"
          />
          <AdminStatCard
            title="Suspended Users"
            value={systemStats.suspendedUsers}
            icon={AlertTriangle}
            color="red"
            trend={systemStats.suspendedUsers > 0 ? "Action needed" : "All good"}
            trendDirection={systemStats.suspendedUsers > 0 ? "down" : "up"}
          />
          <AdminStatCard
            title="Total Passwords"
            value={systemStats.totalPasswords}
            icon={Database}
            color="purple"
            trend={`${systemStats.averagePasswordsPerUser} avg/user`}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleQuickAction('users')}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">User Management</span>
              </button>
              <button
                onClick={() => handleQuickAction('stats')}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Analytics</span>
              </button>
              <button
                onClick={() => handleQuickAction('settings')}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
              </button>
              <button
                onClick={() => handleQuickAction('backup')}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Database className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Backup</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Activity
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last 30 days
              </span>
            </div>
            <UserActivityChart />
          </motion.div>

          {/* System Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              System Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Backup
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(systemStats.lastBackup).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Storage Used
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {Math.round(systemStats.storageUsed / 1024)} KB / {Math.round(systemStats.storageLimit / 1024)} KB
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Storage Usage
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {Math.round((systemStats.storageUsed / systemStats.storageLimit) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  System Uptime
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  99.9%
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <RecentAdminActions />
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
