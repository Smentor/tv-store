import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { UserProfile, Plan } from './types'
import { useToast } from '@/hooks/use-toast'

interface UseUsersProps {
    initialPageSize?: number
}

export function useUsers({ initialPageSize = 10 }: UseUsersProps = {}) {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [totalUsers, setTotalUsers] = useState(0)

    // Pagination State
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(initialPageSize)

    // Filter State
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [planFilter, setPlanFilter] = useState('all')

    const { toast } = useToast()

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const supabase = createBrowserClient()

        try {
            // 1. Base Query on Profiles
            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })

            // 2. Apply Search
            if (searchTerm) {
                query = query.or(`email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%`)
            }

            // 3. Apply Pagination
            const from = (page - 1) * pageSize
            const to = from + pageSize - 1
            query = query.range(from, to)

            const { data: profiles, error: profilesError, count } = await query

            if (profilesError) throw profilesError

            if (profiles && profiles.length > 0) {
                const userIds = profiles.map(p => p.id)

                // 4. Fetch Related Data (Optimized: Only for current page users)
                const [subscriptionsResult, credentialsResult] = await Promise.all([
                    supabase.from('subscriptions').select('*').in('user_id', userIds),
                    supabase.from('credentials').select('*').in('user_id', userIds)
                ])

                const subscriptions = subscriptionsResult.data || []
                const credentials = credentialsResult.data || []

                // 5. Merge Data & Apply Client-side Filters (Status/Plan)
                // Note: Ideally Status/Plan filtering should be server-side too, but requires Joins or denormalization.
                // For now, we filter client-side BUT this affects pagination accuracy if strict server-side pagination is needed for these filters.
                // To fix this properly, we would need to join tables in the main query or denormalize status/plan_name to profiles.
                // Given the current schema, we will do a "best effort" here, but strictly speaking, 
                // filtering by status/plan on the client after fetching a page of profiles might result in empty pages.
                // 
                // CORRECT APPROACH FOR SCALABILITY:
                // We should query the TABLE that has the filter first.
                // If filtering by status (subscriptions), query subscriptions first.
                // If filtering by plan (subscriptions), query subscriptions first.
                // If no filter or search only, query profiles.

                let finalUsers = profiles.map(profile => ({
                    ...profile,
                    subscription: subscriptions.find(sub => sub.user_id === profile.id) || null,
                    credentials: credentials.find(cred => cred.user_id === profile.id) || null
                }))

                // Apply Status/Plan filters if they are active (Client-side for now to avoid complex dynamic joins)
                // WARNING: This is a trade-off. True server-side filtering for related tables requires a different query strategy.
                // For this iteration, we will keep it simple. If the user filters by "Active", they might see fewer than 10 results per page.
                if (statusFilter !== 'all') {
                    finalUsers = finalUsers.filter(u => u.subscription?.status === statusFilter)
                }
                if (planFilter !== 'all') {
                    finalUsers = finalUsers.filter(u => u.subscription?.plan_name === planFilter)
                }

                setUsers(finalUsers)
                setTotalUsers(count || 0)
            } else {
                setUsers([])
                setTotalUsers(0)
            }

        } catch (error: any) {
            console.error('Error fetching users:', error)
            toast({
                variant: 'destructive',
                title: 'Error al cargar usuarios',
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, searchTerm, statusFilter, planFilter, toast])

    // Debounce search to avoid too many requests
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchUsers])

    return {
        users,
        loading,
        totalUsers,
        page,
        setPage,
        pageSize,
        setPageSize,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        planFilter,
        setPlanFilter,
        refreshUsers: fetchUsers
    }
}
