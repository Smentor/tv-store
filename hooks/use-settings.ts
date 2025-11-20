import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

export interface UserSettings {
  email_notifications: boolean
  whatsapp_notifications: boolean
  renewal_reminder: boolean
  plan_changes_notifications: boolean
}

const defaultSettings: UserSettings = {
  email_notifications: true,
  whatsapp_notifications: true,
  renewal_reminder: true,
  plan_changes_notifications: true
}

export function useSettings() {
  const supabase = createClient()
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      console.log("[v0] Cargando settings para usuario:", user?.id)
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error) {
        console.log('[v0] Settings table not found, using defaults:', error.message)
        setSettings(defaultSettings)
        setError(null)
        return
      }
      
      console.log("[v0] Settings cargados:", data)
      setSettings(data)
    } catch (err: any) {
      console.log('[v0] Error fetching settings, using defaults:', err)
      setSettings(defaultSettings)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!existingSettings) {
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            ...defaultSettings,
            ...updates
          })

        if (insertError) {
          console.log('[v0] Cannot create settings in DB, updating locally only:', insertError)
          setSettings(prev => ({ ...prev, ...updates }))
          return { success: true, local: true }
        }
      } else {
        const { error } = await supabase
          .from('user_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', user?.id)

        if (error) {
          console.log('[v0] Cannot save to DB, updating locally only:', error)
          setSettings(prev => ({ ...prev, ...updates }))
          return { success: true, local: true }
        }
      }
      
      setSettings(prev => ({ ...prev, ...updates }))
      
      return { success: true }
    } catch (err: any) {
      console.error('[v0] Error updating settings:', err)
      setSettings(prev => ({ ...prev, ...updates }))
      return { success: true, local: true }
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  }
}
