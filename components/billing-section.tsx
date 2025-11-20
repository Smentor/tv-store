"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, CreditCard, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useState, useEffect } from "react"
import { useInvoices } from "@/hooks/use-invoices"
import { useProfile } from "@/hooks/use-profile"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const countryCodes = [
  // Más populares primero
  { code: "+51", country: "Perú", flag: "🇵🇪", maxDigits: 9 },
  { code: "+1", country: "Estados Unidos/Canadá", flag: "🇺🇸", maxDigits: 10 },
  { code: "+52", country: "México", flag: "🇲🇽", maxDigits: 10 },
  { code: "+34", country: "España", flag: "🇪🇸", maxDigits: 9 },
  { code: "+54", country: "Argentina", flag: "🇦🇷", maxDigits: 10 },
  { code: "+57", country: "Colombia", flag: "🇨🇴", maxDigits: 10 },
  { code: "+55", country: "Brasil", flag: "🇧🇷", maxDigits: 11 },
  { code: "+56", country: "Chile", flag: "🇨🇱", maxDigits: 9 },
  // Resto en orden alfabético
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

export function BillingSection() {
  const [editPaymentOpen, setEditPaymentOpen] = useState(false)
  const [editInfoOpen, setEditInfoOpen] = useState(false)
  const { invoices, loading: loadingInvoices } = useInvoices()
  const { profile, loading: loadingProfile, updateProfile } = useProfile()
  const { toast } = useToast()
  
  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+51",
    phoneNumber: ""
  })

  const [emailError, setEmailError] = useState("")

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

  useEffect(() => {
    if (editInfoOpen) {
      const parsed = parseProfileForEdit()
      if (parsed) {
        setClientInfo(parsed)
      }
    }
  }, [editInfoOpen])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      paid: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: "Pagado",
        icon: CheckCircle2
      },
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        label: "Pendiente",
        icon: Clock
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: "Fallido",
        icon: XCircle
      },
    }
    return statusMap[status] || statusMap.pending
  }
  
  const handleConnectMercadoPago = () => {
    toast({
      title: "MercadoPago",
      description: "Funcionalidad de integración próximamente disponible",
    })
    setEditPaymentOpen(false)
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

  const showLoadingSpinner = loadingInvoices && invoices.length === 0
  
  if (showLoadingSpinner) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Cargando información de facturación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Facturación</h2>
        <p className="text-muted-foreground">Gestiona tu cuenta de facturación y pagos</p>
      </div>

      <Card className="p-6 border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Método de Pago</h3>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#009EE3"/>
                  <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#009EE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-foreground">MercadoPago</p>
                <p className="text-sm text-muted-foreground">Gestión de pagos conectada</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setEditPaymentOpen(true)}
            >
              Configurar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Historial de Facturas</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No hay facturas disponibles</p>
            <p className="text-sm text-muted-foreground">Tus facturas aparecerán aquí cuando realices pagos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-muted-foreground font-medium">Factura</th>
                  <th className="text-left py-3 text-muted-foreground font-medium">Fecha</th>
                  <th className="text-left py-3 text-muted-foreground font-medium">Monto</th>
                  <th className="text-left py-3 text-muted-foreground font-medium">Estado</th>
                  <th className="text-left py-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.status)
                  const StatusIcon = statusBadge.icon
                  return (
                    <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 font-medium text-foreground">{invoice.id}</td>
                      <td className="py-4 text-muted-foreground">{formatDate(invoice.invoice_date)}</td>
                      <td className="py-4 font-medium text-foreground">${invoice.amount.toFixed(2)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-primary hover:text-primary/80 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={editPaymentOpen} onOpenChange={setEditPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Método de Pago</DialogTitle>
            <DialogDescription>
              Conecta tu cuenta de MercadoPago para gestionar tus pagos de forma segura
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#009EE3"/>
                  <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="#009EE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">MercadoPago</h4>
                <p className="text-sm text-muted-foreground">Procesamiento seguro de pagos con MercadoPago</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pagos seguros y encriptados</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Múltiples métodos de pago disponibles</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Gestión automática de suscripciones</span>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPaymentOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConnectMercadoPago} className="bg-[#009EE3] hover:bg-[#0082BD]">
              Conectar con MercadoPago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                Nombre
              </Label>
              <Input 
                id="firstName" 
                value={clientInfo.firstName}
                onChange={(e) => setClientInfo({...clientInfo, firstName: e.target.value})}
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                Apellido
              </Label>
              <Input 
                id="lastName" 
                value={clientInfo.lastName}
                onChange={(e) => setClientInfo({...clientInfo, lastName: e.target.value})}
                placeholder="Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                Correo electrónico
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={clientInfo.email}
                onChange={(e) => {
                  const newEmail = e.target.value
                  setClientInfo({...clientInfo, email: newEmail})
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
                WhatsApp
              </Label>
              <div className="flex gap-2">
                <Select 
                  value={clientInfo.countryCode} 
                  onValueChange={(value) => {
                    setClientInfo({...clientInfo, countryCode: value, phoneNumber: ""})
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
                        setClientInfo({...clientInfo, phoneNumber: value})
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
    </div>
  )
}
