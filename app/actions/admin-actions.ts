'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function deleteUsers(userIds: string[]) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Supabase admin deleteUser only takes one ID. We need to loop.
    const results = await Promise.all(
      userIds.map(id => supabase.auth.admin.deleteUser(id))
    )

    const errors = results.filter(r => r.error).map(r => r.error?.message)

    if (errors.length > 0) {
      return { success: false, error: `Errores al eliminar: ${errors.join(', ')}` }
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error interno del servidor' }
  }
}

export async function updateUserPassword(userId: string, password: string) {
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

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function createSubscription(data: any) {
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

  // Calcular fechas (30 días por defecto)
  const startDate = new Date()
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 30)

  const { error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: data.user_id,
      plan_id: data.plan_id,
      plan_name: data.plan_name,
      price: parseFloat(data.price),
      status: 'active',
      next_billing_date: endDate.toISOString()
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function createUser(data: any) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing" }
    }

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

    // Validate input
    if (!data.email || !data.password) {
      return { success: false, error: "Email y contraseña son obligatorios" }
    }
    if (data.password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres" }
    }

    // 1. Crear usuario en Auth
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

    if (authError) return { success: false, error: `Auth Error: ${authError.message}` }
    if (!authUser.user) return { success: false, error: 'No se pudo crear el usuario (No user returned)' }

    // Force confirm email explicitly
    const { data: updateData, error: confirmError } = await supabase.auth.admin.updateUserById(
      authUser.user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error('Error forcing email confirmation:', confirmError)
      return { success: false, error: `User created but email confirmation failed: ${confirmError.message}` }
    }

    // Verify confirmation stuck
    if (!updateData.user?.email_confirmed_at) {
      return { success: false, error: `User created but email_confirmed_at is still null. Update returned: ${JSON.stringify(updateData.user)}` }
    }

    const userId = authUser.user.id

    // 2. Actualizar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        whatsapp: data.whatsapp,
        role: 'user'
      })

    if (profileError) {
      return { success: false, error: `Usuario creado pero error en perfil: ${profileError.message}` }
    }

    // 3. Crear suscripción si hay plan seleccionado
    if (data.plan_id) {
      // Calcular fecha de fin (30 días por defecto)
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 30)

      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: data.plan_id,
          plan_name: data.plan_name,
          price: parseFloat(data.price),
          status: 'active',
          next_billing_date: endDate.toISOString()
        })

      if (subError) console.error('Error creando suscripción:', subError)
    }

    // 4. Crear credenciales IPTV si se proporcionaron
    if (data.iptv_username && data.iptv_password) {
      const { error: credError } = await supabase
        .from('credentials')
        .insert({
          user_id: userId,
          username: data.iptv_username,
          password: data.iptv_password
        })
      if (credError) console.error('Error creando credenciales:', credError)
    }

    revalidatePath('/admin')
    return { success: true, userId }
  } catch (error) {
    console.error('Error en createUser:', error)
    return { success: false, error: 'Error interno del servidor al crear usuario' }
  }
}
