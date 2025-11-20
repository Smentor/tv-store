'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function deleteUsers(userIds: string[]) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.auth.admin.deleteUser(userIds[0]) // Delete one by one or loop
    
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
