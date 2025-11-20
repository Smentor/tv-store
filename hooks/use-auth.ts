"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      console.log('[useAuth] Fetching user...')
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log('[useAuth] User fetched:', user?.email || 'No user')
        setUser(user)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription?.unsubscribe()
  }, []) // Empty dependency array since createClient is now stable

  return { user, loading }
}
