"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHome } from "@/components/dashboard-home"
import { PlansSection } from "@/components/plans-section"
import { BillingSection } from "@/components/billing-section"
import { CredentialsSection } from "@/components/credentials-section"
import { SettingsSection } from "@/components/settings-section"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Shield } from 'lucide-react'

export default function DashboardClient() {
  const [currentView, setCurrentView] = useState("home")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAdminRole()
  }, [])

  const checkAdminRole = async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      setIsAdmin(profile?.role === 'admin')
    }
    setLoading(false)
  }

  return (
    <DashboardLayout currentView={currentView} setCurrentView={setCurrentView}>
      {!loading && isAdmin && (
        <div className="mb-4">
          <Button
            onClick={() => router.push('/admin')}
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Shield className="h-4 w-4" />
            Acceder al Panel de Administración
          </Button>
        </div>
      )}
      
      <div className="min-h-[600px]">
        <div style={{ display: currentView === "home" ? "block" : "none" }}>
          <DashboardHome setCurrentView={setCurrentView} />
        </div>
        <div style={{ display: currentView === "plans" ? "block" : "none" }}>
          <PlansSection setCurrentView={setCurrentView} />
        </div>
        <div style={{ display: currentView === "billing" ? "block" : "none" }}>
          <BillingSection />
        </div>
        <div style={{ display: currentView === "credentials" ? "block" : "none" }}>
          <CredentialsSection />
        </div>
        <div style={{ display: currentView === "settings" ? "block" : "none" }}>
          <SettingsSection />
        </div>
      </div>
    </DashboardLayout>
  )
}
