"use client"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useSettings } from "@/hooks/use-settings"
import { useProfile } from "@/hooks/use-profile"
import { useAuth } from "@/hooks/use-auth"
import { ProfileSettings } from "./settings/profile-settings"
import { NotificationSettings } from "./settings/notification-settings"
import { SecuritySettings } from "./settings/security-settings"
import { DeviceSettings } from "./settings/device-settings"
import { Skeleton } from "./ui/skeleton"

export function SettingsSection() {
  const { profile, settings, subscription, loading, refetch } = useDashboardData()
  const { updateSettings } = useSettings() // Solo para la función update
  const { updateProfile } = useProfile() // Solo para la función update
  const { user } = useAuth()

  // Mostrar skeletons mientras carga (solo primera vez, el cache hará esto instant después)
  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
          <p className="text-muted-foreground mt-1">Administra las preferencias de tu cuenta</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[250px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    )
  }

  // Wrappers que invalidan cache después de actualizar
  const handleUpdateProfile = async (updates: any) => {
    const result = await updateProfile(updates)
    await refetch() // Recargar datos cacheados
    return result
  }

  const handleUpdateSettings = async (updates: any) => {
    const result = await updateSettings(updates)
    await refetch() // Recargar datos cacheados
    return result
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuración</h2>
        <p className="text-muted-foreground mt-1">Administra las preferencias de tu cuenta</p>
      </div>

      <ProfileSettings profile={profile} updateProfile={handleUpdateProfile} />
      <NotificationSettings settings={settings} updateSettings={handleUpdateSettings} />
      <DeviceSettings subscription={subscription} />
      <SecuritySettings user={user} />
    </div>
  )
}
