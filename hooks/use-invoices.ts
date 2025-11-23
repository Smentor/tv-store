"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

export interface Invoice {
  id: string
  user_id: string
  amount: number
  status: string
  invoice_date: string
  due_date: string
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setInvoices([])
      setLoading(false)
      return
    }

    const fetchInvoices = async () => {
      try {
        const supabase = createClient()

        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("invoice_date", { ascending: false })

        if (error) throw error
        setInvoices(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching invoices")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [user]) // Only depend on user, not supabase instance

  return { invoices, loading, error }
}
