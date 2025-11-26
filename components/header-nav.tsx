"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, ChevronDown, Moon, Sun, HelpCircle } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
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
import { cn } from "@/lib/utils"

interface HeaderNavProps {
  user?: SupabaseUser | null
  profile?: any
}

export function HeaderNav({ user, profile }: HeaderNavProps) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [subscription, setSubscription] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  // Evitar hidratación incorrecta
  if (!mounted) {
    return null
  }

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">📺</span>
          </div>
          <h1 className="text-lg font-bold text-foreground hidden sm:block">MaxPlayer IPTV</h1>
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
              <Button
                variant="ghost"
                className="group flex items-center gap-3 hover:bg-muted/50 px-2 sm:px-3 py-2 h-auto rounded-full border border-transparent hover:border-border transition-all duration-200"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-background shadow-sm transition-transform group-hover:scale-105">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {subscription?.status === 'active' && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="hidden md:flex flex-col items-start gap-0.5 text-left">
                  <p className="text-sm font-medium leading-none max-w-[120px] truncate text-foreground group-hover:text-primary transition-colors">
                    {userName}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4 px-1.5 font-medium bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border-0"
                    >
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 p-2" sideOffset={8}>
              {/* Perfil Compacto */}
              <div className="flex items-center gap-3 p-3 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Conectado como</p>
                  <p className="text-sm font-semibold truncate text-foreground mt-0.5">{user?.email}</p>
                  {subscription?.plan?.name && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {subscription.plan.name}
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenuSeparator className="my-1" />

              {/* Selector de Tema con Switch */}
              <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm font-medium">Modo Oscuro</span>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  className="data-[state=checked]:bg-indigo-500"
                />
              </div>

              <DropdownMenuItem className="rounded-md cursor-pointer py-2.5 mt-1">
                <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Ayuda y Soporte</span>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="rounded-md cursor-pointer py-2.5 focus:bg-accent"
                  >
                    <Shield className="mr-2 h-4 w-4 text-indigo-500" />
                    <span className="font-medium">Panel Admin</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-md cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
