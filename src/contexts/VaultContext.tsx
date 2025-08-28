import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { Password } from '../lib/supabase'
import CryptoJS from 'crypto-js'
import toast from 'react-hot-toast'

interface VaultContextType {
  passwords: Password[]
  loading: boolean
  addPassword: (passwordData: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePassword: (id: string, passwordData: Partial<Password>) => Promise<void>
  deletePassword: (id: string) => Promise<void>
  searchPasswords: (query: string, category?: string) => Password[]
  generatePassword: (options?: PasswordGeneratorOptions) => string
  analyzePasswordStrength: (password: string) => PasswordStrength
  analyzeVaultSecurity: () => VaultSecurityAnalysis
  exportVault: () => void
  importVault: (file: File) => Promise<void>
}

interface PasswordGeneratorOptions {
  length?: number
  uppercase?: boolean
  lowercase?: boolean
  numbers?: boolean
  symbols?: boolean
  excludeAmbiguous?: boolean
}

interface PasswordStrength {
  score: number
  text: string
  color: string
  feedback: string[]
}

interface VaultSecurityAnalysis {
  totalPasswords: number
  weakPasswords: number
  duplicatePasswords: number
  oldPasswords: number
  issues: Array<{
    type: string
    message: string
    icon: string
  }>
  score: number
}

const VaultContext = createContext<VaultContextType | undefined>(undefined)

export const useVault = () => {
  const context = useContext(VaultContext)
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider')
  }
  return context
}

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [masterKey, setMasterKey] = useState<string | null>(null)

  // Fetch passwords
  const { data: passwords = [], isLoading } = useQuery(
    ['passwords', user?.id],
    async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    {
      enabled: !!user,
      refetchOnWindowFocus: false,
    }
  )

  // Encryption/Decryption functions
  const generateKey = (password: string, salt: string) => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 100000
    })
  }

  const encrypt = (data: string, password: string) => {
    try {
      const salt = CryptoJS.lib.WordArray.random(128/8)
      const key = generateKey(password, salt)
      const iv = CryptoJS.lib.WordArray.random(128/8)
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      return {
        salt: salt.toString(),
        iv: iv.toString(),
        data: encrypted.toString()
      }
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  const decrypt = (encryptedData: any, password: string) => {
    try {
      const salt = CryptoJS.enc.Hex.parse(encryptedData.salt)
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv)
      const key = generateKey(password, salt)

      const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })

      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  // Password operations
  const addPassword = useMutation(
    async (passwordData: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user || !masterKey) throw new Error('User not authenticated or master key not set')

      const encryptedPassword = encrypt(passwordData.encrypted_password, masterKey)
      
      const { error } = await supabase
        .from('passwords')
        .insert({
          ...passwordData,
          user_id: user.id,
          encrypted_password: JSON.stringify(encryptedPassword)
        })

      if (error) throw error
      
      queryClient.invalidateQueries(['passwords', user.id])
      toast.success('Password added successfully!')
    }
  )

  const updatePassword = useMutation(
    async ({ id, ...passwordData }: { id: string } & Partial<Password>) => {
      if (!user || !masterKey) throw new Error('User not authenticated or master key not set')

      let updateData = { ...passwordData }
      if (passwordData.encrypted_password) {
        const encryptedPassword = encrypt(passwordData.encrypted_password, masterKey)
        updateData.encrypted_password = JSON.stringify(encryptedPassword)
      }

      const { error } = await supabase
        .from('passwords')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      queryClient.invalidateQueries(['passwords', user.id])
      toast.success('Password updated successfully!')
    }
  )

  const deletePassword = useMutation(
    async (id: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('passwords')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      
      queryClient.invalidateQueries(['passwords', user.id])
      toast.success('Password deleted successfully!')
    }
  )

  // Utility functions
  const searchPasswords = (query: string, category?: string) => {
    let results = passwords

    if (category) {
      results = results.filter(p => p.category === category)
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      results = results.filter(p => 
        p.title.toLowerCase().includes(lowercaseQuery) ||
        p.username.toLowerCase().includes(lowercaseQuery) ||
        (p.website && p.website.toLowerCase().includes(lowercaseQuery)) ||
        (p.notes && p.notes.toLowerCase().includes(lowercaseQuery))
      )
    }

    return results
  }

  const generatePassword = (options: PasswordGeneratorOptions = {}) => {
    const defaults = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: false
    }

    const settings = { ...defaults, ...options }
    let charset = ''
    
    if (settings.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (settings.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (settings.numbers) charset += '0123456789'
    if (settings.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (settings.excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, '')
    }

    if (!charset) {
      throw new Error('No character set selected')
    }

    let password = ''
    const array = new Uint8Array(settings.length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < settings.length; i++) {
      password += charset[array[i] % charset.length]
    }

    return password
  }

  const analyzePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, text: 'Enter password', color: '#666', feedback: [] }

    let score = 0
    let feedback = []

    if (password.length >= 12) score += 25
    else if (password.length >= 8) score += 15
    else feedback.push('Use at least 8 characters')

    if (/[a-z]/.test(password)) score += 15
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 15
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score += 15
    else feedback.push('Include numbers')

    if (/[^a-zA-Z\d]/.test(password)) score += 20
    else feedback.push('Include special characters')

    if (password.length >= 16) score += 10
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10

    let text, color
    if (score >= 80) {
      text = 'Very Strong'
      color = '#10B981'
    } else if (score >= 60) {
      text = 'Strong'
      color = '#10B981'
    } else if (score >= 40) {
      text = 'Medium'
      color = '#F59E0B'
    } else if (score >= 20) {
      text = 'Weak'
      color = '#EF4444'
    } else {
      text = 'Very Weak'
      color = '#EF4444'
    }

    return { score, text, color, feedback }
  }

  const analyzeVaultSecurity = (): VaultSecurityAnalysis => {
    const analysis = {
      totalPasswords: passwords.length,
      weakPasswords: 0,
      duplicatePasswords: 0,
      oldPasswords: 0,
      issues: [],
      score: 100
    }

    const passwordMap = new Map()
    const currentDate = new Date()

    passwords.forEach(entry => {
      const strength = analyzePasswordStrength(entry.encrypted_password)
      if (strength.score < 60) {
        analysis.weakPasswords++
      }

      if (passwordMap.has(entry.encrypted_password)) {
        analysis.duplicatePasswords++
      } else {
        passwordMap.set(entry.encrypted_password, 1)
      }

      const modifiedDate = new Date(entry.updated_at)
      const daysDiff = (currentDate.getTime() - modifiedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 365) {
        analysis.oldPasswords++
      }
    })

    if (analysis.weakPasswords > 0) {
      analysis.issues.push({
        type: 'weak',
        message: `${analysis.weakPasswords} weak password${analysis.weakPasswords > 1 ? 's' : ''} found`,
        icon: '⚠️'
      })
      analysis.score -= Math.min(30, analysis.weakPasswords * 5)
    }

    if (analysis.duplicatePasswords > 0) {
      analysis.issues.push({
        type: 'duplicate',
        message: `${analysis.duplicatePasswords} duplicate password${analysis.duplicatePasswords > 1 ? 's' : ''} found`,
        icon: '🔄'
      })
      analysis.score -= Math.min(40, analysis.duplicatePasswords * 10)
    }

    if (analysis.oldPasswords > 0) {
      analysis.issues.push({
        type: 'old',
        message: `${analysis.oldPasswords} password${analysis.oldPasswords > 1 ? 's' : ''} older than 1 year`,
        icon: '📅'
      })
      analysis.score -= Math.min(20, analysis.oldPasswords * 3)
    }

    analysis.score = Math.max(0, Math.min(100, analysis.score))
    return analysis
  }

  const exportVault = () => {
    if (!passwords.length) {
      toast.error('No passwords to export')
      return
    }

    const exportData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      passwords: passwords.map(p => ({
        title: p.title,
        username: p.username,
        website: p.website,
        notes: p.notes,
        category: p.category,
        favorite: p.favorite,
        created_at: p.created_at,
        updated_at: p.updated_at
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `securevault-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Vault exported successfully!')
  }

  const importVault = async (file: File) => {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)
      
      if (importData.passwords && Array.isArray(importData.passwords)) {
        // Process each password
        for (const passwordData of importData.passwords) {
          await addPassword.mutateAsync({
            title: passwordData.title,
            username: passwordData.username,
            encrypted_password: passwordData.password || 'Imported Password',
            website: passwordData.website,
            notes: passwordData.notes,
            category: passwordData.category || 'Imported',
            favorite: passwordData.favorite || false
          })
        }
        
        toast.success(`Imported ${importData.passwords.length} passwords`)
      } else {
        throw new Error('Invalid file format')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import file')
    }
  }

  const value: VaultContextType = {
    passwords,
    loading: isLoading,
    addPassword: addPassword.mutateAsync,
    updatePassword: updatePassword.mutateAsync,
    deletePassword: deletePassword.mutateAsync,
    searchPasswords,
    generatePassword,
    analyzePasswordStrength,
    analyzeVaultSecurity,
    exportVault,
    importVault,
  }

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  )
}
