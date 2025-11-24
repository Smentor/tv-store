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

export async function updateUserProfile(userId: string, data: { first_name: string; last_name: string; email: string; whatsapp: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Update Auth email if changed
  if (data.email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, { email: data.email })
    if (authError) return { success: false, error: authError.message }
  }

  // Update Profile
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      whatsapp: data.whatsapp,
      email: data.email // Keep sync
    })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateIptvCredentials(userId: string, data: { username: string; password: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check if exists
  const { data: existing } = await supabase.from('credentials').select('id').eq('user_id', userId).single()

  let error
  if (existing) {
    const res = await supabase.from('credentials').update(data).eq('user_id', userId)
    error = res.error
  } else {
    const res = await supabase.from('credentials').insert({ ...data, user_id: userId })
    error = res.error
  }

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateSubscriptionDetails(userId: string, data: { plan_name: string; price: number; next_billing_date?: string }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('subscriptions')
    .update(data)
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function updateSubscriptionStatus(userId: string, status: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('user_id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function sendPasswordReset(email: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) return { success: false, error: error.message }

  return { success: true }
}

// --- BULK ACTIONS ---

export async function bulkUpdatePlans(userIds: string[], planName: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // 1. Obtener el plan
  const { data: plan } = await supabase.from('plans').select('*').eq('name', planName).single()
  if (!plan) return { success: false, error: 'Plan no encontrado' }

  // 2. Obtener suscripciones existentes
  const { data: existingSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .in('user_id', userIds)

  const existingUserIds = new Set(existingSubs?.map(s => s.user_id) || [])

  // 3. Preparar Updates e Inserts
  const updates = []
  const inserts = []

  const now = new Date()
  const nextBilling = new Date(now)
  nextBilling.setDate(nextBilling.getDate() + 30)

  for (const userId of userIds) {
    if (existingUserIds.has(userId)) {
      updates.push(userId)
    } else {
      inserts.push({
        user_id: userId,
        plan_id: plan.id,
        plan_name: plan.name,
        price: plan.price,
        status: 'active',
        next_billing_date: nextBilling.toISOString()
      })
    }
  }

  // 4. Ejecutar operaciones
  const errors = []
  let updatedCount = 0
  let createdCount = 0

  // Update existentes
  if (updates.length > 0) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: plan.id,
        plan_name: plan.name,
        price: plan.price
      })
      .in('user_id', updates)
      .select('id')

    if (error) errors.push(`Error actualizando: ${error.message}`)
    else updatedCount = data?.length || 0
  }

  // Insert nuevos
  if (inserts.length > 0) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(inserts)
      .select('id')

    if (error) errors.push(`Error creando nuevos: ${error.message}`)
    else createdCount = data?.length || 0
  }

  if (errors.length > 0) return { success: false, error: errors.join(', ') }

  revalidatePath('/admin')
  return { success: true, message: `Se actualizaron ${updatedCount} y se crearon ${createdCount} suscripciones.` }
}

export async function bulkUpdateStatus(userIds: string[], status: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status })
    .in('user_id', userIds)
    .select('id')

  if (error) return { success: false, error: error.message }

  const count = data?.length || 0
  const skipped = userIds.length - count
  const message = skipped > 0
    ? `Se actualizaron ${count} usuarios (${skipped} omitidos por no tener suscripción).`
    : `Se actualizaron ${count} usuarios.`

  revalidatePath('/admin')
  return { success: true, message, count, skipped }
}

export async function bulkUpdateDates(userIds: string[], date: string) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { error } = await supabase
    .from('subscriptions')
    .update({ next_billing_date: new Date(date).toISOString() })
    .in('user_id', userIds)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  return { success: true }
}
