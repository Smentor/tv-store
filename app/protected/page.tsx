import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { HeaderNav } from "@/components/header-nav"
import DashboardClient from "@/components/dashboard-client"

export default async function ProtectedPage() {
  console.log('[ProtectedPage] Rendering...')
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  console.log('[ProtectedPage] User check:', data?.user?.email || 'No user', 'Error:', error?.message || 'None')

  if (error || !data?.user) {
    console.log('[ProtectedPage] Redirecting to login')
    redirect("/auth/login")
  }

  console.log('[ProtectedPage] Fetching profile for user:', data.user.id)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
  console.log('[ProtectedPage] Profile fetched:', profile?.first_name || 'No profile')

  console.log('[ProtectedPage] Rendering dashboard')
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav user={data.user} profile={profile} />
      <DashboardClient />
    </div>
  )
}
