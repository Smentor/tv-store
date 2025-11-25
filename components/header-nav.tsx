"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, CreditCard, Key, ChevronDown, Crown } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface HeaderNavProps {
  user?: SupabaseUser | null
  profile?: any
}

export function HeaderNav({ user, profile }: HeaderNavProps) {
  const router = useRouter()
  const supabase = createClient()
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, plan:plans!subscriptions_plan_id_fkey(name)')
      .eq('user_id', user?.id)
      .single()

    setSubscription(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    } else if (profile?.first_name) {
      return profile.first_name
    } else if (user?.email) {
      return user.email.split("@")[0]
    }
    return "Usuario"
  }

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    } else if (profile?.first_name) {
      return profile.first_name.substring(0, 2).toUpperCase()
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const getStatusBadge = () => {
    if (!subscription) return { label: 'Sin Plan', variant: 'secondary' as const }

    switch (subscription.status) {
      case 'active':
        return { label: 'Activo', variant: 'default' as const }
      case 'inactive':
        return { label: 'Inactivo', variant: 'secondary' as const }
      case 'cancelled':
        return { label: 'Cancelado', variant: 'destructive' as const }
      default:
        return { label: subscription.status, variant: 'secondary' as const }
    }
  }

  const userName = getDisplayName()
  const userInitials = getInitials()
  const isAdmin = profile?.role === 'admin'
  const statusBadge = getStatusBadge()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">📺</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">MaxPlayer IPTV</h1>
            {isAdmin && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Panel Administrativo
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent px-2 py-1.5 h-auto rounded-lg">
                <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant={statusBadge.variant} className="text-xs px-1.5 py-0 h-4">
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
                    {subscription && (
                      <div className="mt-2 flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-medium text-foreground">{subscription.plan?.name || 'Plan Básico'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push('/dashboard?view=plans')} className="cursor-pointer">
                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Mi Plan</span>
                  <span className="text-xs text-muted-foreground">Ver y cambiar suscripción</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/dashboard?view=credentials')} className="cursor-pointer">
                <Key className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Credenciales IPTV</span>
                  <span className="text-xs text-muted-foreground">Acceso a servidores</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push('/dashboard?view=billing')} className="cursor-pointer">
                <CreditCard className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Facturación</span>
                  <span className="text-xs text-muted-foreground">Historial de pagos</span>
                </div>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Panel Admin</span>
                      <span className="text-xs text-muted-foreground">Gestión del sistema</span>
                    </div>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
