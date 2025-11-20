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
      try {
        setLoading(true)
        const supabase = createClient()
        const { data, error } = await supabase
          .from("plans")
          .select("*")
          .order("price", { ascending: true })

        if (error) throw error
        setPlans(data || [])
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
