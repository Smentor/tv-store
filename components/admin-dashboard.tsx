'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Package, Ticket, Gift, BarChart3, LogOut, Users } from 'lucide-react'
import PlansManagement from '@/components/admin/plans-management'
import PromotionsManagement from '@/components/admin/promotions-management'
import CouponsManagement from '@/components/admin/coupons-management'
import UsersManagement from '@/components/admin/users-management'
import AdminOverview from '@/components/admin/admin-overview'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL, default to 'overview'
  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'overview')

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setCurrentTab(params.get('tab') || 'overview')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogout = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    // Update URL without triggering server-side navigation
    const newUrl = `${window.location.pathname}?tab=${value}`
    window.history.pushState({}, '', newUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Gestiona paquetes, promociones, cupones y usuarios de tu servicio IPTV
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 w-full md:w-auto">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">
            <TabsList className="inline-flex h-auto w-auto p-1 min-w-full md:grid md:w-full md:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-3 md:py-2 md:px-3">
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap inline md:hidden lg:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-3 md:py-2 md:px-3">
                <Users className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap inline md:hidden lg:inline">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2 px-4 py-3 md:py-2 md:px-3">
                <Package className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap inline md:hidden lg:inline">Paquetes</span>
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center gap-2 px-4 py-3 md:py-2 md:px-3">
                <Ticket className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap inline md:hidden lg:inline">Promociones</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center gap-2 px-4 py-3 md:py-2 md:px-3">
                <Gift className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap inline md:hidden lg:inline">Cupones</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="plans">
            <PlansManagement />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
