"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  plan_name: string
  price: number
  status: string
  next_billing_date: string
  created_at: string
  updated_at: string
  plan?: {
    id: string
    name: string
    max_screens: number
    price: number
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Verify session is still valid
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          plan:plans!subscriptions_plan_id_fkey (
            id,
            name,
            max_screens,
            price
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error
      setSubscription(data || null)
      setError(null)
    } catch (err) {
      console.error('[useSubscription] Error:', err)
      setError(err instanceof Error ? err.message : "Error fetching subscription")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return { subscription, loading, error, refetch: fetchSubscription }
}
