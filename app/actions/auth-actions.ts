'use server'

import { createClient } from '@supabase/supabase-js'

export async function registerUser(data: any) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Crear usuario en Auth con auto-confirmación
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
                full_name: `${data.first_name} ${data.last_name}`.trim()
            }
        })

        if (authError) return { success: false, error: authError.message }
        if (!authUser.user) return { success: false, error: 'No se pudo crear el usuario' }

        // Force confirm email explicitly
        await supabase.auth.admin.updateUserById(authUser.user.id, { email_confirm: true })

        // 2. Crear perfil
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authUser.user.id,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                whatsapp: data.whatsapp,
                role: 'user'
            })

        if (profileError) {
            console.error('Error creando perfil:', profileError)
        }

        return { success: true }
    } catch (error) {
        console.error('Error en registerUser:', error)
        return { success: false, error: 'Error interno del servidor' }
    }
}

/**
 * Deletes a user account and all associated data
 * This MUST run on the server with service_role_key for security
 */
export async function deleteUserAccount(userId: string) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Delete user from auth (this will cascade delete related data via DB triggers/policies)
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) {
            console.error('Error deleting user:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error en deleteUserAccount:', error)
        return { success: false, error: 'Error interno del servidor' }
    }
}
