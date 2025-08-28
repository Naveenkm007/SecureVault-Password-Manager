import React, { createContext, useContext, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { supabase } from '../lib/supabase'
import { User, AdminLog } from '../lib/supabase'
import toast from 'react-hot-toast'

interface AdminContextType {
  users: User[]
  adminLogs: AdminLog[]
  loading: boolean
  systemStats: SystemStats
  deleteUser: (userId: string) => Promise<void>
  suspendUser: (userId: string, reason: string) => Promise<void>
  unsuspendUser: (userId: string) => Promise<void>
  resetUserPassword: (userId: string) => Promise<void>
  getSystemStats: () => Promise<void>
  logAdminAction: (action: string, details: any) => Promise<void>
}

interface SystemStats {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalPasswords: number
  averagePasswordsPerUser: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
  lastBackup: string
  storageUsed: number
  storageLimit: number
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient()
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalPasswords: 0,
    averagePasswordsPerUser: 0,
    systemHealth: 'good',
    lastBackup: '',
    storageUsed: 0,
    storageLimit: 1000000 // 1GB in bytes
  })

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery(
    ['admin-users'],
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  // Fetch admin logs
  const { data: adminLogs = [], isLoading: logsLoading } = useQuery(
    ['admin-logs'],
    async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return data || []
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  // Delete user
  const deleteUser = useMutation(
    async (userId: string) => {
      // First delete all passwords
      const { error: passwordsError } = await supabase
        .from('passwords')
        .delete()
        .eq('user_id', userId)

      if (passwordsError) throw passwordsError

      // Then delete the user
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (userError) throw userError

      queryClient.invalidateQueries(['admin-users'])
      toast.success('User deleted successfully')
    }
  )

  // Suspend user
  const suspendUser = useMutation(
    async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('users')
        .update({ 
          settings: { 
            suspended: true, 
            suspension_reason: reason,
            suspended_at: new Date().toISOString()
          } 
        })
        .eq('id', userId)

      if (error) throw error

      queryClient.invalidateQueries(['admin-users'])
      toast.success('User suspended successfully')
    }
  )

  // Unsuspend user
  const unsuspendUser = useMutation(
    async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .update({ 
          settings: { 
            suspended: false, 
            suspension_reason: null,
            suspended_at: null
          } 
        })
        .eq('id', userId)

      if (error) throw error

      queryClient.invalidateQueries(['admin-users'])
      toast.success('User unsuspended successfully')
    }
  )

  // Reset user password
  const resetUserPassword = useMutation(
    async (userId: string) => {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: 'TempPassword123!'
      })

      if (error) throw error

      toast.success('User password reset successfully')
    }
  )

  // Get system statistics
  const getSystemStats = async () => {
    try {
      // Get user counts
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .not('settings->suspended', 'eq', true)

      const { count: suspendedUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('settings->suspended', true)

      // Get password counts
      const { count: totalPasswords } = await supabase
        .from('passwords')
        .select('*', { count: 'exact', head: true })

      // Calculate averages
      const averagePasswordsPerUser = totalUsers ? Math.round(totalPasswords / totalUsers) : 0

      // Determine system health
      let systemHealth: SystemStats['systemHealth'] = 'excellent'
      if (suspendedUsers > totalUsers * 0.1) systemHealth = 'warning'
      if (suspendedUsers > totalUsers * 0.2) systemHealth = 'critical'

      // Mock storage calculation (in real app, calculate actual storage)
      const storageUsed = totalPasswords * 1000 // Assume 1KB per password entry
      const storageLimit = 1000000 // 1GB

      setSystemStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        suspendedUsers: suspendedUsers || 0,
        totalPasswords: totalPasswords || 0,
        averagePasswordsPerUser,
        systemHealth,
        lastBackup: new Date().toISOString(),
        storageUsed,
        storageLimit
      })
    } catch (error) {
      console.error('Failed to get system stats:', error)
    }
  }

  // Log admin actions
  const logAdminAction = async (action: string, details: any) => {
    try {
      const { error } = await supabase
        .from('admin_logs')
        .insert({
          admin_id: 'admin', // In real app, get from auth context
          action,
          details
        })

      if (error) throw error

      queryClient.invalidateQueries(['admin-logs'])
    } catch (error) {
      console.error('Failed to log admin action:', error)
    }
  }

  const value: AdminContextType = {
    users,
    adminLogs,
    loading: usersLoading || logsLoading,
    systemStats,
    deleteUser: deleteUser.mutateAsync,
    suspendUser: suspendUser.mutateAsync,
    unsuspendUser: unsuspendUser.mutateAsync,
    resetUserPassword: resetUserPassword.mutateAsync,
    getSystemStats,
    logAdminAction,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
