import { createClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import { HeaderNav } from "@/components/header-nav"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav user={data.user} profile={profile} />
      <DashboardClient />
    </div>
  )
}
