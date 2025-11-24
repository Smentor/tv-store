'use server'

import { createClient } from '@/lib/supabase/server'

export async function logUserLogin(userId: string, metadata?: {
    user_agent?: string
    ip_address?: string
}) {
    try {
        const supabase = await createClient()

        const { error } = await supabase.from('user_logs').insert({
            user_id: userId,
            admin_id: null,
            action: 'user_login',
            details: {
                ...metadata,
                timestamp: new Date().toISOString(),
                login_method: 'email_password'
            }
        })

        if (error) {
            console.error('Error logging user login:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err) {
        console.error('Exception logging user login:', err)
        return { success: false, error: 'Exception occurred' }
    }
}
