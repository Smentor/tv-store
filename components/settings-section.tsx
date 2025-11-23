"use client"

import { useSettings } from "@/hooks/use-settings"
import { useProfile } from "@/hooks/use-profile"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { ProfileSettings } from "./settings/profile-settings"
import { NotificationSettings } from "./settings/notification-settings"
import { SecuritySettings } from "./settings/security-settings"
import { DeviceSettings } from "./settings/device-settings"

export function SettingsSection() {
  const { settings, loading, updateSettings } = useSettings()
  const { profile, loading: loadingProfile, updateProfile } = useProfile()
  const { subscription } = useSubscription()
  const { user } = useAuth()

  if (loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground mt-1">Administra las preferencias de tu cuenta</p>
      </div>

      <ProfileSettings profile={profile} updateProfile={updateProfile} />
      <NotificationSettings settings={settings} updateSettings={updateSettings} />
      <DeviceSettings subscription={subscription} />
      <SecuritySettings user={user} />
    </div>
  )
}
