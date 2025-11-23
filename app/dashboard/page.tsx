import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { HeaderNav } from "@/components/header-nav"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  console.log('[DashboardPage] Rendering...')
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  console.log('[DashboardPage] User check:', data?.user?.email || 'No user', 'Error:', error?.message || 'None')

  if (error || !data?.user) {
    console.log('[DashboardPage] Redirecting to login')
    redirect("/auth/login")
  }

  console.log('[DashboardPage] Fetching profile for user:', data.user.id)
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
  console.log('[DashboardPage] Profile fetched:', profile?.first_name || 'No profile')

  console.log('[DashboardPage] Rendering dashboard')
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav user={data.user} profile={profile} />
      <DashboardClient />
    </div>
  )
}
