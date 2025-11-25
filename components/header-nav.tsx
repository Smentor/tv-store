"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, ChevronDown } from 'lucide-react'
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
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📺</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">MaxPlayer IPTV</h1>
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
                className="flex items-center gap-2.5 hover:bg-accent/50 px-2 py-1.5 h-auto rounded-lg transition-all"
              >
                <div className="relative">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all hover:ring-primary/40">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-secondary text-white font-bold text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {subscription?.status === 'active' && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>
                <div className="hidden md:flex flex-col items-start gap-0.5">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <Badge
                    variant={statusBadge.variant}
                    className="text-[10px] h-3.5 px-1.5 font-medium"
                  >
                    {statusBadge.label}
                  </Badge>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <DropdownMenuLabel className="px-2 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary to-secondary text-white font-bold text-base">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    {subscription?.status === 'active' && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    {subscription?.plan?.name && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-xs font-medium text-foreground">{subscription.plan.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </DropdownMenuLabel>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="rounded-md cursor-pointer"
                  >
                    <Shield className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium">Panel Admin</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-md cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
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
