"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Shield, Trash2, Lock, User, Mail, Phone, Monitor, AlertTriangle } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useSettings } from "@/hooks/use-settings"
import { useProfile } from "@/hooks/use-profile"
import { useSubscription } from "@/hooks/use-subscription"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const countryCodes = [
  { code: "+51", country: "Perú", flag: "🇵🇪", maxDigits: 9 },
  { code: "+1", country: "Estados Unidos/Canadá", flag: "🇺🇸", maxDigits: 10 },
  { code: "+52", country: "México", flag: "🇲🇽", maxDigits: 10 },
  { code: "+34", country: "España", flag: "🇪🇸", maxDigits: 9 },
  { code: "+54", country: "Argentina", flag: "🇦🇷", maxDigits: 10 },
  { code: "+57", country: "Colombia", flag: "🇨🇴", maxDigits: 10 },
  { code: "+55", country: "Brasil", flag: "🇧🇷", maxDigits: 11 },
  { code: "+56", country: "Chile", flag: "🇨🇱", maxDigits: 9 },
  { code: "+49", country: "Alemania", flag: "🇩🇪", maxDigits: 11 },
  { code: "+213", country: "Argelia", flag: "🇩🇿", maxDigits: 9 },
  { code: "+966", country: "Arabia Saudita", flag: "🇸🇦", maxDigits: 9 },
  { code: "+61", country: "Australia", flag: "🇦🇺", maxDigits: 9 },
  { code: "+43", country: "Austria", flag: "🇦🇹", maxDigits: 10 },
  { code: "+32", country: "Bélgica", flag: "🇧🇪", maxDigits: 9 },
  { code: "+591", country: "Bolivia", flag: "🇧🇴", maxDigits: 8 },
  { code: "+86", country: "China", flag: "🇨🇳", maxDigits: 11 },
  { code: "+82", country: "Corea del Sur", flag: "🇰🇷", maxDigits: 10 },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷", maxDigits: 8 },
  { code: "+53", country: "Cuba", flag: "🇨🇺", maxDigits: 8 },
  { code: "+45", country: "Dinamarca", flag: "🇩🇰", maxDigits: 8 },
  { code: "+593", country: "Ecuador", flag: "🇪🇨", maxDigits: 9 },
  { code: "+20", country: "Egipto", flag: "🇪🇬", maxDigits: 10 },
  { code: "+503", country: "El Salvador", flag: "🇸🇻", maxDigits: 8 },
  { code: "+971", country: "Emiratos Árabes", flag: "🇦🇪", maxDigits: 9 },
  { code: "+63", country: "Filipinas", flag: "🇵🇭", maxDigits: 10 },
  { code: "+358", country: "Finlandia", flag: "🇫🇮", maxDigits: 10 },
  { code: "+33", country: "Francia", flag: "🇫🇷", maxDigits: 9 },
  { code: "+502", country: "Guatemala", flag: "🇬🇹", maxDigits: 8 },
  { code: "+594", country: "Guayana Francesa", flag: "🇬🇫", maxDigits: 9 },
  { code: "+592", country: "Guyana", flag: "🇬🇾", maxDigits: 7 },
  { code: "+509", country: "Haití", flag: "🇭🇹", maxDigits: 8 },
  { code: "+504", country: "Honduras", flag: "🇭🇳", maxDigits: 8 },
  { code: "+91", country: "India", flag: "🇮🇳", maxDigits: 10 },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", maxDigits: 11 },
  { code: "+972", country: "Israel", flag: "🇮🇱", maxDigits: 9 },
  { code: "+39", country: "Italia", flag: "🇮🇹", maxDigits: 10 },
  { code: "+81", country: "Japón", flag: "🇯🇵", maxDigits: 10 },
  { code: "+254", country: "Kenia", flag: "🇰🇪", maxDigits: 10 },
  { code: "+60", country: "Malasia", flag: "🇲🇾", maxDigits: 10 },
  { code: "+212", country: "Marruecos", flag: "🇲🇦", maxDigits: 9 },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮", maxDigits: 8 },
  { code: "+234", country: "Nigeria", flag: "🇳🇬", maxDigits: 10 },
  { code: "+47", country: "Noruega", flag: "🇳🇴", maxDigits: 8 },
  { code: "+64", country: "Nueva Zelanda", flag: "🇳🇿", maxDigits: 9 },
  { code: "+31", country: "Países Bajos", flag: "🇳🇱", maxDigits: 9 },
  { code: "+507", country: "Panamá", flag: "🇵🇦", maxDigits: 8 },
  { code: "+595", country: "Paraguay", flag: "🇵🇾", maxDigits: 9 },
  { code: "+351", country: "Portugal", flag: "🇵🇹", maxDigits: 9 },
  { code: "+1-787", country: "Puerto Rico", flag: "🇵🇷", maxDigits: 10 },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧", maxDigits: 10 },
  { code: "+1-809", country: "República Dominicana", flag: "🇩🇴", maxDigits: 10 },
  { code: "+7", country: "Rusia", flag: "🇷🇺", maxDigits: 10 },
  { code: "+65", country: "Singapur", flag: "🇸🇬", maxDigits: 8 },
  { code: "+27", country: "Sudáfrica", flag: "🇿🇦", maxDigits: 9 },
  { code: "+46", country: "Suecia", flag: "🇸🇪", maxDigits: 9 },
  { code: "+41", country: "Suiza", flag: "🇨🇭", maxDigits: 9 },
  { code: "+66", country: "Tailandia", flag: "🇹🇭", maxDigits: 9 },
  { code: "+216", country: "Túnez", flag: "🇹🇳", maxDigits: 8 },
  { code: "+90", country: "Turquía", flag: "🇹🇷", maxDigits: 10 },
  { code: "+598", country: "Uruguay", flag: "🇺🇾", maxDigits: 8 },
  { code: "+58", country: "Venezuela", flag: "🇻🇪", maxDigits: 10 },
  { code: "+84", country: "Vietnam", flag: "🇻🇳", maxDigits: 10 },
]

export function SettingsSection() {
  const { toast } = useToast()
  const { settings, loading, updateSettings } = useSettings()
  const { profile, loading: loadingProfile, updateProfile } = useProfile()
  const { subscription } = useSubscription()
  const { user } = useAuth()
  const supabase = createClient()

  const [notifications, setNotifications] = useState({
    email: settings?.email_notifications ?? true,
    whatsapp: settings?.whatsapp_notifications ?? true,
    renewalReminder: settings?.renewal_reminder ?? true,
    planChanges: settings?.plan_changes_notifications ?? true,
  })

  const [editInfoOpen, setEditInfoOpen] = useState(false)
  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+51",
    phoneNumber: ""
  })
  const [emailError, setEmailError] = useState("")

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [passwordErrors, setPasswordErrors] = useState({
    new: "",
    confirm: "",
    general: ""
  })
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showDevicesDialog, setShowDevicesDialog] = useState(false)
  const [resettingDevices, setResettingDevices] = useState(false)

  const parseProfileForEdit = () => {
    if (!profile) return null

    let countryCode = "+51"
    let phoneNumber = ""

    if (profile.whatsapp) {
      const whatsappClean = profile.whatsapp.trim()
      const matchingCountry = countryCodes.find(c => whatsappClean.startsWith(c.code))

      if (matchingCountry) {
        countryCode = matchingCountry.code
        phoneNumber = whatsappClean.substring(matchingCountry.code.length).replace(/\D/g, '')
      } else {
        phoneNumber = whatsappClean.replace(/\D/g, '')
      }
    }

    return {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      email: profile.email || "",
      countryCode,
      phoneNumber
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getMaxDigits = () => {
    const country = countryCodes.find(c => c.code === clientInfo.countryCode)
    return country?.maxDigits || 15
  }

  const getPhoneValidationMessage = () => {
    const country = countryCodes.find(c => c.code === clientInfo.countryCode)
    if (!country) return ""

    if (clientInfo.phoneNumber && clientInfo.phoneNumber.length !== country.maxDigits) {
      return `Para ${country.country} se requieren exactamente ${country.maxDigits} dígitos`
    }
    return ""
  }

  useEffect(() => {
    if (editInfoOpen) {
      const parsed = parseProfileForEdit()
      if (parsed) {
        setClientInfo(parsed)
      }
    }
  }, [editInfoOpen])

  useEffect(() => {
    if (settings) {
      setNotifications({
        email: settings.email_notifications,
        whatsapp: settings.whatsapp_notifications,
        renewalReminder: settings.renewal_reminder,
        planChanges: settings.plan_changes_notifications,
      })
    }
  }, [settings])

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    console.log("[v0] Guardando preferencias de notificaciones")
    try {
      const result = await updateSettings({
        email_notifications: notifications.email,
        whatsapp_notifications: notifications.whatsapp,
        renewal_reminder: notifications.renewalReminder,
        plan_changes_notifications: notifications.planChanges,
      })

      console.log("[v0] Resultado de updateSettings:", result)

      if (result.success) {
        console.log("[v0] Llamando toast de éxito")
        toast({
          variant: "success",
          title: "Configuración guardada",
          description: "Tus preferencias han sido actualizadas correctamente.",
          duration: 3000,
        })
      } else {
        console.log("[v0] Llamando toast de error")
        toast({
          title: "Error al guardar",
          description: "No se pudo guardar la configuración.",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error("[v0] Error guardando preferencias:", error)
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

  const handleSaveClientInfo = async () => {
    if (!clientInfo.email || !validateEmail(clientInfo.email)) {
      setEmailError("Por favor ingresa un correo electrónico válido")
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "El correo electrónico no tiene un formato válido",
        duration: 3000
      })
      return
    }

    setEmailError("")

    const validationMessage = getPhoneValidationMessage()
    if (clientInfo.phoneNumber && validationMessage) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: validationMessage,
        duration: 3000
      })
      return
    }

    const fullWhatsApp = clientInfo.phoneNumber
      ? `${clientInfo.countryCode}${clientInfo.phoneNumber.replace(/\s/g, '')}`
      : ""

    const { error } = await updateProfile({
      first_name: clientInfo.firstName,
      last_name: clientInfo.lastName,
      email: clientInfo.email,
      whatsapp: fullWhatsApp
    })

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la información: " + error,
        duration: 3000
      })
    } else {
      toast({
        variant: "success",
        title: "✓ Información actualizada",
        description: "Tu información de contacto se ha guardado correctamente",
        duration: 3000
      })
      setEditInfoOpen(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordErrors({ new: "", confirm: "", general: "" })
    console.log("[v0] Iniciando cambio de contraseña")

    if (!passwordData.new || !passwordData.confirm) {
      setPasswordErrors({
        new: !passwordData.new ? "Este campo es requerido" : "",
        confirm: !passwordData.confirm ? "Este campo es requerido" : "",
        general: ""
      })
      toast({
        title: "Error",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordData.new.length < 8) {
      setPasswordErrors({
        new: "La contraseña debe tener al menos 8 caracteres",
        confirm: "",
        general: ""
      })
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordErrors({
        new: "",
        confirm: "Las contraseñas no coinciden",
        general: ""
      })
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })

      if (error) {
        console.error("[v0] Error cambiando contraseña:", error)
        toast({
          title: "Error al cambiar contraseña",
          description: error.message,
          variant: "destructive",
          duration: 3000,
        })
      } else {
        console.log("[v0] Contraseña cambiada exitosamente, mostrando toast")
        toast({
          variant: "success",
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente.",
          duration: 3000,
        })
        setShowPasswordDialog(false)
        setPasswordData({ current: "", new: "", confirm: "" })
        setPasswordErrors({ new: "", confirm: "", general: "" })
      }
    } catch (error) {
      console.error("[v0] Error en handleChangePassword:", error)
      toast({
        title: "Error al cambiar contraseña",
        description: "Ocurrió un error al cambiar la contraseña.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") {
      toast({
        title: "Error",
        description: "Por favor escribe ELIMINAR para confirmar.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const { error } = await supabase.auth.admin.deleteUser(user?.id || '')

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta. Contacta con soporte.",
        variant: "destructive",
        duration: 3000,
      })
    } else {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    }
  }

  const handleResetDevices = async () => {
    setResettingDevices(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        variant: "success",
        title: "Dispositivos reseteados",
        description: "Todos los dispositivos han sido desconectados exitosamente.",
        duration: 3000,
      })
      setShowDevicesDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron resetear los dispositivos.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setResettingDevices(false)
    }
  }

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Cuenta y Seguridad</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setEditInfoOpen(true)}
            >
              Editar información
            </Button>
          </div>
          <CardDescription>Tu información personal y opciones de seguridad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Información Personal
            </h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Nombre completo</p>
                  <p className="text-base font-medium text-foreground">
                    {profile?.first_name || profile?.last_name
                      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                      : "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Correo electrónico</p>
                  <p className="text-base font-medium text-foreground truncate">
                    {profile?.email || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                  <p className="text-base font-medium text-foreground">
                    {profile?.whatsapp || "No especificado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Seguridad
            </h3>
            <button
              onClick={() => setShowPasswordDialog(true)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">Cambiar Contraseña</p>
                  <p className="text-xs text-muted-foreground">Actualiza tu contraseña de acceso</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-primary transition-colors">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
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

      {/* Gestión de Dispositivos */}
      <Card id="devices-section">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            <CardTitle>Gestión de Dispositivos</CardTitle>
          </div>
          <CardDescription>Administra los dispositivos conectados a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">Dispositivos conectados</p>
                <p className="text-sm text-muted-foreground">
                  2 de {subscription?.plan?.max_screens || 1} dispositivos activos
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setShowDevicesDialog(true)}
            >
              Resetear Dispositivos
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Al resetear los dispositivos, se desconectarán todos los dispositivos actualmente conectados.
            Deberás volver a iniciar sesión en cada uno de ellos.
          </p>
        </CardContent>
      </Card>

      {/* Zona Peligrosa */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
          </div>
          <CardDescription>Acciones irreversibles en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Cuenta
          </Button>
        </CardContent>
      </Card>

      {/* Dialog Cambiar Contraseña */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu nueva contraseña (mínimo 8 caracteres)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                className={passwordErrors.new ? "border-destructive" : ""}
              />
              {passwordErrors.new && (
                <p className="text-sm text-destructive">{passwordErrors.new}</p>
              )}
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className={passwordErrors.confirm ? "border-destructive" : ""}
              />
              {passwordErrors.confirm && (
                <p className="text-sm text-destructive">{passwordErrors.confirm}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Cuenta */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Eliminar Cuenta</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Para confirmar, escribe <strong>ELIMINAR</strong> en el campo de abajo:
            </p>
            <Input
              placeholder="ELIMINAR"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "ELIMINAR"}
            >
              Eliminar Cuenta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Información del Cliente */}
      <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Información del Cliente</DialogTitle>
            <DialogDescription>
              Actualiza tu información de contacto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre
              </Label>
              <Input
                id="firstName"
                value={clientInfo.firstName}
                onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Apellido
              </Label>
              <Input
                id="lastName"
                value={clientInfo.lastName}
                onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                placeholder="Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={(e) => {
                  const newEmail = e.target.value
                  setClientInfo({ ...clientInfo, email: newEmail })
                  if (newEmail && !validateEmail(newEmail)) {
                    setEmailError("Formato de correo inválido")
                  } else {
                    setEmailError("")
                  }
                }}
                placeholder="cliente@ejemplo.com"
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">
                  {emailError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                WhatsApp
              </Label>
              <div className="flex gap-2">
                <Select
                  value={clientInfo.countryCode}
                  onValueChange={(value) => {
                    setClientInfo({ ...clientInfo, countryCode: value, phoneNumber: "" })
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      {(() => {
                        const country = countryCodes.find(c => c.code === clientInfo.countryCode)
                        return country ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">{country.flag}</span>
                            <span className="text-sm">{country.code}</span>
                          </span>
                        ) : "Seleccionar"
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countryCodes.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{country.flag}</span>
                          <span className="text-sm">{country.code}</span>
                          <span className="text-xs text-muted-foreground">({country.country})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={clientInfo.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '')
                      const maxDigits = getMaxDigits()
                      if (value.length <= maxDigits) {
                        setClientInfo({ ...clientInfo, phoneNumber: value })
                      }
                    }}
                    placeholder={`${"9".repeat(getMaxDigits())}`}
                    maxLength={getMaxDigits()}
                    className={getPhoneValidationMessage() ? "border-red-500" : ""}
                  />
                  {getPhoneValidationMessage() && (
                    <p className="text-xs text-red-500 mt-1">
                      {getPhoneValidationMessage()}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Formato: {clientInfo.countryCode}{clientInfo.phoneNumber || `${"9".repeat(getMaxDigits())}`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInfoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveClientInfo}>
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDevicesDialog} onOpenChange={setShowDevicesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetear Dispositivos Conectados</DialogTitle>
            <DialogDescription>
              Esta acción desconectará todos los dispositivos actualmente conectados a tu cuenta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Importante</p>
                <p className="text-muted-foreground">
                  Deberás volver a iniciar sesión en todos tus dispositivos después de resetearlos.
                  Usa esta opción si sospechas que alguien más está usando tu cuenta.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Dispositivos que serán desconectados:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="w-4 h-4" />
                  Smart TV - Samsung (Última conexión: Hoy)
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="w-4 h-4" />
                  Android Phone - Xiaomi (Última conexión: Ayer)
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDevicesDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetDevices}
              disabled={resettingDevices}
            >
              {resettingDevices ? "Reseteando..." : "Resetear Dispositivos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
