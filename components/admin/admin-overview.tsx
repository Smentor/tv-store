'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@/lib/supabase/client'
import { Users, Package, Ticket, Gift, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePlans: 0,
    activePromotions: 0,
    activeCoupons: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createBrowserClient()

    const [subscriptionsResult, plansResult, promotionsResult, couponsResult] = await Promise.all([
      supabase.from('subscriptions').select('user_id', { count: 'exact' }),
      supabase.from('plans').select('*', { count: 'exact' }),
      supabase.from('promotions').select('*', { count: 'exact' }).eq('active', true),
      supabase.from('coupons').select('*', { count: 'exact' }).eq('active', true),
    ])

    const uniqueUsers = subscriptionsResult.data 
      ? new Set(subscriptionsResult.data.map(sub => sub.user_id)).size 
      : 0

    setStats({
      totalUsers: uniqueUsers,
      activePlans: plansResult.count || plansResult.data?.length || 0,
      activePromotions: promotionsResult.count || promotionsResult.data?.length || 0,
      activeCoupons: couponsResult.count || couponsResult.data?.length || 0,
      monthlyRevenue: 0, // TODO: Calcular desde invoices
    })
    setLoading(false)
  }

  const statCards = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Paquetes Activos',
      value: stats.activePlans,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Promociones Activas',
      value: stats.activePromotions,
      icon: Ticket,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Cupones Activos',
      value: stats.activeCoupons,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
