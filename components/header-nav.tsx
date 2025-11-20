"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { User } from "@supabase/supabase-js"

interface HeaderNavProps {
  user?: User | null
  profile?: any
}

export function HeaderNav({ user, profile }: HeaderNavProps) {
  const router = useRouter()
  const supabase = createClient()

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

  const userName = getDisplayName()

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📺</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">MaxPlayer IPTV</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userName}</span>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
