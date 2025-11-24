"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useUserLogger } from "@/hooks/use-user-logger"

interface NotificationSettingsProps {
    settings: any
    updateSettings: (data: any) => Promise<{ success: boolean; error?: any }>
}

export function NotificationSettings({ settings, updateSettings }: NotificationSettingsProps) {
    const { toast } = useToast()
    const { logAction } = useUserLogger()
    const [notifications, setNotifications] = useState({
        email: true,
        whatsapp: true,
        renewalReminder: true,
        planChanges: true,
    })
    const [savingNotifications, setSavingNotifications] = useState(false)

    useEffect(() => {
        if (settings) {
            setNotifications({
                email: settings.email_notifications ?? true,
                whatsapp: settings.whatsapp_notifications ?? true,
                renewalReminder: settings.renewal_reminder ?? true,
                planChanges: settings.plan_changes_notifications ?? true,
            })
        }
    }, [settings])

    const handleSaveNotifications = async () => {
        setSavingNotifications(true)
        try {
            const newSettings = {
                email_notifications: notifications.email,
                whatsapp_notifications: notifications.whatsapp,
                renewal_reminder: notifications.renewalReminder,
                plan_changes_notifications: notifications.planChanges,
            }

            const result = await updateSettings(newSettings)

            if (result.success) {
                // Log the notification settings change
                await logAction('update_notification_settings', {
                    changes: newSettings,
                    changed_by: 'user'
                })

                toast({
                    variant: "success",
                    title: "Configuración guardada",
                    description: "Tus preferencias han sido actualizadas correctamente.",
                    duration: 3000,
                })
            } else {
                toast({
                    title: "Error al guardar",
                    description: "No se pudo guardar la configuración.",
                    variant: "destructive",
                    duration: 3000,
                })
            }
        } catch (error) {
            toast({
                title: "Error al guardar",
                description: "Ocurrió un error al guardar.",
                variant: "destructive",
                duration: 3000,
            })
        } finally {
            setSavingNotifications(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <CardTitle>Notificaciones</CardTitle>
                </div>
                <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                        <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo electrónico</p>
                    </div>
                    <Switch
                        id="email-notifications"
                        checked={notifications.email}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="whatsapp-notifications">Notificaciones por WhatsApp</Label>
                        <p className="text-sm text-muted-foreground">Recibe alertas por WhatsApp</p>
                    </div>
                    <Switch
                        id="whatsapp-notifications"
                        checked={notifications.whatsapp}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, whatsapp: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="renewal-reminder">Recordatorio de Renovación</Label>
                        <p className="text-sm text-muted-foreground">Te avisamos antes de que venza tu suscripción</p>
                    </div>
                    <Switch
                        id="renewal-reminder"
                        checked={notifications.renewalReminder}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, renewalReminder: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="plan-changes">Cambios de Plan</Label>
                        <p className="text-sm text-muted-foreground">Notificaciones sobre actualizaciones de tu plan</p>
                    </div>
                    <Switch
                        id="plan-changes"
                        checked={notifications.planChanges}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, planChanges: checked })}
                    />
                </div>

                <Button
                    onClick={handleSaveNotifications}
                    className="w-full mt-4"
                    disabled={savingNotifications}
                >
                    {savingNotifications ? "Guardando..." : "Guardar Preferencias"}
                </Button>
            </CardContent>
        </Card>
    )
}
