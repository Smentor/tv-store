"use client"

import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export function useUserLogger() {
    const { user } = useAuth()

    const logAction = async (
        action: string,
        details: any = {},
        options?: {
            userId?: string
            adminId?: string | null
        }
    ) => {
        try {
            const supabase = createClient()

            // Use provided userId or current user's ID
            const targetUserId = options?.userId || user?.id

            if (!targetUserId) {
                console.warn('Cannot log action: No user ID available')
                return { success: false, error: 'No user ID' }
            }

            const logEntry = {
                user_id: targetUserId,
                admin_id: options?.adminId !== undefined ? options.adminId : null,
                action,
                details: {
                    ...details,
                    timestamp: new Date().toISOString(),
                    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
                }
            }

            const { error } = await supabase
                .from('user_logs')
                .insert(logEntry)

            if (error) {
                console.error('Error logging action:', error)
                return { success: false, error: error.message }
            }

            return { success: true }
        } catch (err) {
            console.error('Exception logging action:', err)
            return { success: false, error: 'Exception occurred' }
        }
    }

    return { logAction }
}
