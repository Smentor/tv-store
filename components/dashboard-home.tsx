"use client"

import { Card } from "@/components/ui/card"
import { ChevronRight, Check, AlertCircle, Tv, CreditCard, Key, HelpCircle, AlertTriangle, CheckCircle, Info, Monitor, Percent } from 'lucide-react'
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { NotificationsList } from "@/components/notifications-list"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardHomeProps {
  setCurrentView: (view: string) => void
}

export function DashboardHome({ setCurrentView }: DashboardHomeProps) {
  const { subscription, loading } = useDashboardData()
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [activePromotions, setActivePromotions] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !hasLoadedOnce) {
      setHasLoadedOnce(true)
    }
  }, [loading, hasLoadedOnce])

  useEffect(() => {
    loadActivePromotions()
  }, [])

  const loadActivePromotions = async () => {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)

    if (!error && data) {
      setActivePromotions(data)
    }
  }

  const daysRemaining = subscription
    ? Math.ceil((new Date(subscription.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  // Dispositivos conectados - primer valor dummy, máximo desde el plan
  const connectedDevices = 2 // TODO: Obtener de tabla de dispositivos reales
  const maxDevices = subscription?.plan?.max_screens || 1
  const devicePercentage = (connectedDevices / maxDevices) * 100

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAlertStatus = () => {
    if (!subscription || subscription.status !== "active") {
      return {
        variant: "destructive",
        icon: AlertTriangle,
        title: "Atención Requerida",
        message: "Tu suscripción no está activa. Por favor contacta a soporte o renueva tu plan.",
        bgColor: "bg-red-50/50 dark:bg-red-950/10",
        borderColor: "border-red-100 dark:border-red-900/50",
        iconColor: "text-red-500 dark:text-red-400"
      }
    }

    if (daysRemaining <= 2) {
      return {
        variant: "warning",
        icon: AlertTriangle,
        title: "Renovación Próxima",
        message: `Tu suscripción caduca en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}. Asegúrate de que tu método de pago esté actualizado.`,
        bgColor: "bg-orange-50 dark:bg-orange-950/30",
        borderColor: "border-orange-200 dark:border-orange-900",
        iconColor: "text-orange-600 dark:text-orange-400"
      }
    }

    if (daysRemaining <= 7) {
      return {
        variant: "info",
        icon: Info,
        title: "Información",
        message: `Tu suscripción se renovará en ${daysRemaining} días. Tu próxima facturación es el ${formatDate(subscription.next_billing_date)}.`,
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-200 dark:border-blue-900",
        iconColor: "text-blue-600 dark:text-blue-400"
      }
    }

    return {
      variant: "success",
      icon: CheckCircle,
      title: "Todo en Orden",
      message: "Tu suscripción está activa y funcionando correctamente. Para cualquier inconveniente, contacta a nuestro soporte.",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-900",
      iconColor: "text-green-600 dark:text-green-400"
    }
  }

  const alertStatus = getAlertStatus()
  const AlertIcon = alertStatus.icon

  if (loading && !hasLoadedOnce) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Notifications Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>

        {/* Status Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 border border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido de vuelta</h2>
        <p className="text-muted-foreground">Aquí está el resumen de tu cuenta</p>
      </div>

      {/* NotificationsList component */}
      <NotificationsList />

      {activePromotions.length > 0 && (
        <Card className="p-4 border border-orange-200/60 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Percent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-1 text-lg">
                🎉 ¡Promoción Activa! {activePromotions[0].name}
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-200 mb-3">
                {activePromotions[0].description}
              </p>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  {activePromotions[0].discount_percentage ? (
                    <>{activePromotions[0].discount_percentage}% de descuento</>
                  ) : (
                    <>S/ {activePromotions[0].discount_amount} de descuento</>
                  )}
                </div>
                <button
                  onClick={() => setCurrentView("plans")}
                  className="text-sm text-orange-700 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 font-semibold underline"
                >
                  Ver planes →
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plan Status */}
        <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Plan Actual</p>
              <p className="text-2xl font-bold text-foreground">{subscription?.plan_name || "Sin plan"}</p>
              <p className="text-xs text-accent mt-2">{subscription?.status === "active" ? "Activo" : "Inactivo"}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Tv className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>

        {/* Next Billing */}
        <Card className="p-6 border border-border bg-card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Próxima Facturación</p>
              <p className="text-2xl font-bold text-foreground">
                {subscription ? formatDate(subscription.next_billing_date) : "N/A"}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <Check className="w-3 h-3" /> {subscription?.status === "active" ? "Activo" : "Inactivo"}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Dispositivos Conectados */}
        <Card
          className="p-6 border border-border bg-card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            setCurrentView("settings")
            // Scroll to devices section after a small delay
            setTimeout(() => {
              document.getElementById('devices-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Dispositivos Conectados</p>
              <p className="text-2xl font-bold text-foreground">{connectedDevices} de {maxDevices}</p>
              <p className="text-xs text-muted-foreground mt-2">Dispositivos activos</p>
            </div>
            <div className="relative w-16 h-16 flex-shrink-0">
              {/* Circular Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="3"
                />
                {/* Progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-accent"
                  strokeWidth="3"
                  strokeDasharray={`${devicePercentage} 100`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView("plans")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tv className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Cambiar de Plan</p>
                  <p className="text-sm text-muted-foreground">Actualiza a un plan superior</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView("billing")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ver Facturas</p>
                  <p className="text-sm text-muted-foreground">Historial de pagos</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView("credentials")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ver Credenciales</p>
                  <p className="text-sm text-muted-foreground">Tu usuario y contraseña</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setCurrentView("support")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Soporte Técnico</p>
                  <p className="text-sm text-muted-foreground">Contacta a nuestro equipo</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>

      {/* Important Notice */}
      <Card className={`p-4 border ${alertStatus.borderColor} ${alertStatus.bgColor}`}>
        <div className="flex gap-3">
          <AlertIcon className={`w-5 h-5 ${alertStatus.iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className="font-medium text-foreground mb-1">{alertStatus.title}</p>
            <p className="text-sm text-muted-foreground">
              {alertStatus.message}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
