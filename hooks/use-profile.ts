"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useUserLogger } from "@/hooks/use-user-logger"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  whatsapp: string | null
  created_at: string
  updated_at: string
}

export function useProfile() {
  const { user } = useAuth()
  const { logAction } = useUserLogger()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Verify session is still valid (handles race condition during logout)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setProfile(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: "No hay usuario autenticado" }

    try {
      const supabase = createClient()

      // Store previous values for logging
      const previousProfile = profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        whatsapp: profile.whatsapp
      } : null

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      // Log the action (user updating their own profile)
      if (previousProfile) {
        const logResult = await logAction('UPDATE_PROFILE', {
          previous: previousProfile,
          new: { ...previousProfile, ...updates },
          changed_by: 'user'
        })

        if (!logResult.success) {
          console.error('Failed to log profile update:', logResult.error)
        }
      }

      // Refetch profile after update
      await fetchProfile()

      return { error: null }
    } catch (err) {
      console.error("Error updating profile:", err)
      return { error: err instanceof Error ? err.message : "Error actualizando perfil" }
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}

