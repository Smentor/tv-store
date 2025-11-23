"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

export interface Credentials {
  id: string
  user_id: string
  username: string
  password: string
  mac_address: string
  reseller_code: string
}

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCredentials(null)
      setLoading(false)
      return
    }

    const fetchCredentials = async () => {
      try {
        const supabase = createClient()

        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }
        const { data, error } = await supabase.from("credentials").select("*").eq("user_id", user.id).single()

        if (error && error.code !== "PGRST116") throw error
        setCredentials(data || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching credentials")
      } finally {
        setLoading(false)
      }
    }

    fetchCredentials()
  }, [user]) // Only depend on user, not supabase instance

  return { credentials, loading, error }
}
