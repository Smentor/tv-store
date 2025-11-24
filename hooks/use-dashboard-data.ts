"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

interface DashboardData {
    profile: any
    subscription: any
    credentials: any
    settings: any
}

const CACHE_KEY = 'dashboard_data_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useDashboardData() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuth()

    const getCachedData = useCallback(() => {
        if (typeof window === 'undefined') return null

        const cached = sessionStorage.getItem(CACHE_KEY)
        if (!cached) return null

        try {
            const { data, timestamp } = JSON.parse(cached)
            if (Date.now() - timestamp < CACHE_DURATION) {
                return data
            }
            sessionStorage.removeItem(CACHE_KEY)
        } catch {
            sessionStorage.removeItem(CACHE_KEY)
        }
        return null
    }, [])

    const setCachedData = useCallback((data: DashboardData) => {
        if (typeof window === 'undefined') return

        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                data,
                timestamp: Date.now()
            }))
        } catch (err) {
            console.warn('Failed to cache dashboard data:', err)
        }
    }, [])

    const fetchDashboardData = useCallback(async (useCache = true) => {
        if (!user) {
            setData(null)
            setLoading(false)
            return
        }

        // Try cache first
        if (useCache) {
            const cached = getCachedData()
            if (cached) {
                setData(cached)
                setLoading(false)
                return
            }
        }

        try {
            setLoading(true)
            const supabase = createClient()

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }

            // Fetch all data in parallel
            const [profileRes, subscriptionRes, credentialsRes, settingsRes] = await Promise.all([
                supabase.from("profiles").select("*").eq("id", user.id).single(),
                supabase.from("subscriptions").select(`
          *,
          plan:plans!subscriptions_plan_id_fkey (
            id,
            name,
            max_screens,
            price
          )
        `).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single(),
                supabase.from("credentials").select("*").eq("user_id", user.id).single(),
                supabase.from("user_settings").select("*").eq("user_id", user.id).single()
            ])

            const dashboardData: DashboardData = {
                profile: profileRes.data || null,
                subscription: subscriptionRes.data || null,
                credentials: credentialsRes.data || null,
                settings: settingsRes.data || {
                    email_notifications: true,
                    whatsapp_notifications: true,
                    renewal_reminder: true,
                    plan_changes_notifications: true
                }
            }

            setData(dashboardData)
            setCachedData(dashboardData)
            setError(null)
        } catch (err) {
            console.error("Error fetching dashboard data:", err)
            setError(err instanceof Error ? err.message : "Error loading data")
        } finally {
            setLoading(false)
        }
    }, [user, getCachedData, setCachedData])

    const invalidateCache = useCallback(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(CACHE_KEY)
        }
        fetchDashboardData(false)
    }, [fetchDashboardData])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    return {
        data,
        loading,
        error,
        refetch: invalidateCache,
        profile: data?.profile,
        subscription: data?.subscription,
        credentials: data?.credentials,
        settings: data?.settings
    }
}
