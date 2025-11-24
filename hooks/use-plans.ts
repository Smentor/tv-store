"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Plan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  max_screens: number
  plan_type: string
  plan_type_id: string // Changed from number to string to support multiple IDs like "2,4,5"
  created_at: string
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlans() {
      // Check cache first
      const cached = sessionStorage.getItem('plans_data')
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        // Cache valid for 1 hour
        if (age < 1000 * 60 * 60) {
          setPlans(data)
          setLoading(false)
          return
        }
      }

      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .order("price", { ascending: true })

        if (error) throw error

        setPlans(data || [])
        // Save to cache
        sessionStorage.setItem('plans_data', JSON.stringify({
          data: data || [],
          timestamp: Date.now()
        }))

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching plans")
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  return { plans, loading, error }
}
