'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Tv, CreditCard, Lock, Save, RefreshCw, DollarSign, Plus, Shield, FileText, Send, History } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserProfile, Plan, UserLog, Invoice } from './types'

interface UserDetailsModalProps {
    user: UserProfile | null
    isOpen: boolean
    onClose: () => void
    availablePlans: Plan[]
    onUpdateProfile: (userId: string, data: { first_name: string; last_name: string; email: string; whatsapp: string }) => Promise<void>
    onUpdateIptvCredentials: (userId: string, data: { username: string; password: string }) => Promise<void>
    onUpdateSubscriptionDetails: (userId: string, data: { plan_name: string; price: number; next_billing_date?: string }) => Promise<void>
    onUpdateSubscriptionStatus: (userId: string, status: string) => Promise<void>
    onCreateSubscription: (userId: string, data: { plan_name: string; price: number }) => Promise<void>
    onManualPasswordUpdate: (userId: string, password: string) => Promise<void>
    onSendPasswordReset: (email: string) => Promise<void>
    userLogs: UserLog[]
    userInvoices: Invoice[]
    loadingLogs: boolean
    loadingInvoices: boolean
}

export function UserDetailsModal({
    user,
    isOpen,
    onClose,
    availablePlans,
    onUpdateProfile,
    onUpdateIptvCredentials,
    onUpdateSubscriptionDetails,
    onUpdateSubscriptionStatus,
    onCreateSubscription,
    onManualPasswordUpdate,
    onSendPasswordReset,
    userLogs,
    userInvoices,
    loadingLogs,
    loadingInvoices
}: UserDetailsModalProps) {
    const [activeTab, setActiveTab] = useState('details')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Forms State
    const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '', whatsapp: '' })
    const [iptvForm, setIptvForm] = useState({ username: '', password: '' })
    const [planForm, setPlanForm] = useState({ plan_name: '' })
    const [priceForm, setPriceForm] = useState({ price: '' })
    const [billingDateForm, setBillingDateForm] = useState({ date: '' })
    const [manualPassword, setManualPassword] = useState('')

    useEffect(() => {
        if (user) {
            setProfileForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                whatsapp: user.whatsapp || ''
            })
            setIptvForm({
                username: user.credentials?.username || '',
                password: user.credentials?.password || ''
            })
            setPlanForm({
                plan_name: user.subscription?.plan_name || ''
            })
            setPriceForm({
                price: user.subscription?.price?.toString() || ''
            })
            setBillingDateForm({
                date: user.subscription?.next_billing_date ? new Date(user.subscription.next_billing_date).toISOString().split('T')[0] : ''
            })
            setManualPassword('')
        }
    }, [user])

    const handleProfileSubmit = async () => {
        if (!user) return
        setIsSubmitting(true)
        try {
            await onUpdateProfile(user.id, profileForm)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleIptvSubmit = async () => {
        if (!user) return
        setIsSubmitting(true)
        try {
            await onUpdateIptvCredentials(user.id, iptvForm)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubscriptionSubmit = async () => {
        if (!user) return
        setIsSubmitting(true)
        try {
            await onUpdateSubscriptionDetails(user.id, {
                plan_name: planForm.plan_name,
                price: parseFloat(priceForm.price) || 0,
                next_billing_date: billingDateForm.date
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCreateSubscriptionSubmit = async () => {
        if (!user) return
        setIsSubmitting(true)
        try {
            await onCreateSubscription(user.id, {
                plan_name: planForm.plan_name,
                price: parseFloat(priceForm.price) || 0
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleManualPasswordSubmit = async () => {
        if (!user) return
        setIsSubmitting(true)
        try {
            await onManualPasswordUpdate(user.id, manualPassword)
            setManualPassword('')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[95vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-lg sm:text-xl">Gestión de Cliente: {`${user.first_name || ''} ${user.last_name || ''}`.trim()}</DialogTitle>
                    <DialogDescription>Administra la cuenta, servicios y comunicaciones</DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-4 pb-2">
                        <div className="overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0">
                            <TabsList className="inline-flex h-auto w-auto p-1 min-w-full md:grid md:w-full md:grid-cols-4 gap-2">
                                <TabsTrigger value="details" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Detalles</TabsTrigger>
                                <TabsTrigger value="billing" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Facturación</TabsTrigger>
                                <TabsTrigger value="communications" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Comunicación</TabsTrigger>
                                <TabsTrigger value="history" className="px-4 py-2 text-xs sm:text-sm whitespace-nowrap">Historial</TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                        <div className="grid gap-6 md:grid-cols-2 pb-6">
                            {/* Left Column */}
                            <div className="flex flex-col gap-6">
                                {/* Personal Info */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                        <User className="h-4 w-4" /> Información Personal
                                    </h3>
                                    <Card className="bg-muted/30">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="first-name" className="text-sm font-medium">Nombre</Label>
                                                <Input
                                                    id="first-name"
                                                    value={profileForm.first_name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                                                    className="h-9 bg-background"
                                                    placeholder="Nombre del cliente"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last-name" className="text-sm font-medium">Apellido</Label>
                                                <Input
                                                    id="last-name"
                                                    value={profileForm.last_name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                                                    className="h-9 bg-background"
                                                    placeholder="Apellido del cliente"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="h-9 bg-background"
                                                    placeholder="correo@ejemplo.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                                                <Input
                                                    id="whatsapp"
                                                    value={profileForm.whatsapp}
                                                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                                    className="h-9 bg-background"
                                                    placeholder="+51 999 999 999"
                                                />
                                            </div>
                                            <div className="pt-2 border-t space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Rol:</span>
                                                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-muted-foreground">Registro:</span>
                                                    <span className="font-medium">
                                                        {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Button onClick={handleProfileSubmit} disabled={isSubmitting} className="w-full" size="sm">
                                                    <Save className="mr-2 h-4 w-4" /> Guardar Información Personal
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* IPTV Credentials */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                        <Tv className="h-4 w-4" /> Credenciales IPTV
                                    </h3>
                                    <Card className="bg-muted/30">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Usuario IPTV</Label>
                                                <Input
                                                    value={iptvForm.username}
                                                    onChange={(e) => setIptvForm({ ...iptvForm, username: e.target.value })}
                                                    className="bg-background"
                                                    placeholder="Usuario del servicio"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Contraseña IPTV</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={iptvForm.password}
                                                        onChange={(e) => setIptvForm({ ...iptvForm, password: e.target.value })}
                                                        className="bg-background"
                                                        placeholder="Contraseña del servicio"
                                                    />
                                                    <Button variant="outline" size="icon" onClick={() => setIptvForm({ ...iptvForm, password: 'Temp' + Math.random().toString(36).slice(-8) })}>
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <Button onClick={handleIptvSubmit} disabled={isSubmitting} className="w-full" size="sm">
                                                    <Save className="mr-2 h-4 w-4" /> Actualizar Credenciales
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-6">
                                {/* Subscription Info */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                        <CreditCard className="h-4 w-4" /> Suscripción Actual
                                    </h3>
                                    <Card className="bg-muted/30">
                                        <CardContent className="p-4 space-y-4">
                                            {user.subscription ? (
                                                <>
                                                    <div className="grid gap-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Plan</Label>
                                                                <Select
                                                                    value={planForm.plan_name}
                                                                    onValueChange={(val) => setPlanForm({ plan_name: val })}
                                                                >
                                                                    <SelectTrigger className="h-9 bg-background">
                                                                        <SelectValue placeholder="Seleccionar plan" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availablePlans.map(plan => (
                                                                            <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-medium">Precio Mensual</Label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={priceForm.price}
                                                                        onChange={(e) => setPriceForm({ price: e.target.value })}
                                                                        className="h-9 pl-7 bg-background"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Próximo Pago</Label>
                                                            <Input
                                                                type="date"
                                                                value={billingDateForm.date}
                                                                onChange={(e) => setBillingDateForm({ date: e.target.value })}
                                                                className="h-9 bg-background"
                                                            />
                                                        </div>

                                                        <Button
                                                            onClick={handleSubscriptionSubmit}
                                                            disabled={isSubmitting}
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            <Save className="mr-2 h-4 w-4" /> Guardar Cambios de Suscripción
                                                        </Button>
                                                    </div>

                                                    <div className="pt-3 border-t space-y-2">
                                                        <Label className="text-sm font-medium">Estado de Suscripción</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant={user.subscription.status === 'active' ? 'default' : 'outline'}
                                                                className={`h-8 flex-1 ${user.subscription.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                                                onClick={() => onUpdateSubscriptionStatus(user.id, 'active')}
                                                                disabled={isSubmitting}
                                                            >
                                                                Activo
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={user.subscription.status === 'inactive' ? 'default' : 'outline'}
                                                                className={`h-8 flex-1 ${user.subscription.status === 'inactive' ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}
                                                                onClick={() => onUpdateSubscriptionStatus(user.id, 'inactive')}
                                                                disabled={isSubmitting}
                                                            >
                                                                Inactivo
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={user.subscription.status === 'cancelled' ? 'default' : 'outline'}
                                                                className={`h-8 flex-1 ${user.subscription.status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                                                                onClick={() => onUpdateSubscriptionStatus(user.id, 'cancelled')}
                                                                disabled={isSubmitting}
                                                            >
                                                                Cancelado
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="text-center py-4 text-muted-foreground border-b mb-4">
                                                        <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                        <p className="text-sm">El usuario no tiene una suscripción activa</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">Agregar Suscripción Manual</Label>
                                                        <div className="grid gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-muted-foreground">Plan</Label>
                                                                <Select
                                                                    value={planForm.plan_name}
                                                                    onValueChange={(val) => {
                                                                        const plan = availablePlans.find(p => p.name === val)
                                                                        setPlanForm({ plan_name: val })
                                                                        if (plan) setPriceForm({ price: plan.price.toString() })
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-9 bg-background">
                                                                        <SelectValue placeholder="Seleccionar plan" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availablePlans.map(plan => (
                                                                            <SelectItem key={plan.id} value={plan.name}>{plan.name} - ${plan.price}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-muted-foreground">Precio Acordado</Label>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={priceForm.price}
                                                                        onChange={(e) => setPriceForm({ price: e.target.value })}
                                                                        className="h-9 pl-7 bg-background"
                                                                        placeholder="0.00"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <Button
                                                                onClick={handleCreateSubscriptionSubmit}
                                                                disabled={isSubmitting || !planForm.plan_name}
                                                                className="w-full"
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" /> Crear Suscripción
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Security */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                        <Lock className="h-4 w-4" /> Seguridad de la Cuenta
                                    </h3>
                                    <Card className="bg-muted/30">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-sm">Restablecer Contraseña</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Envía correo para nueva contraseña.
                                                    </p>
                                                </div>
                                                <Button onClick={() => user.email && onSendPasswordReset(user.email)} disabled={isSubmitting || !user.email} size="sm" variant="outline">
                                                    <Mail className="mr-2 h-3 w-3" /> Enviar
                                                </Button>
                                            </div>

                                            <div className="space-y-3 p-3 border rounded-lg bg-background">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-sm">Cambio Manual de Contraseña</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        Establece una nueva contraseña directamente.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="text"
                                                        placeholder="Nueva contraseña"
                                                        value={manualPassword}
                                                        onChange={(e) => setManualPassword(e.target.value)}
                                                        className="h-9 text-sm"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 shrink-0"
                                                        onClick={() => setManualPassword(Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))}
                                                        title="Generar aleatoria"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    onClick={handleManualPasswordSubmit}
                                                    disabled={isSubmitting || !manualPassword}
                                                    className="w-full"
                                                    size="sm"
                                                >
                                                    <Save className="mr-2 h-4 w-4" /> Guardar Nueva Contraseña
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-100">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-sm text-red-700">Zona de Peligro</h4>
                                                    <p className="text-xs text-red-600/80">
                                                        Acciones críticas de cuenta.
                                                    </p>
                                                </div>
                                                <Button variant="destructive" size="sm">
                                                    <Shield className="mr-2 h-3 w-3" /> Suspender
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="billing" className="space-y-4 py-4 overflow-y-auto px-6">
                        <div className="space-y-6">
                            {/* Current Payment Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                    <DollarSign className="h-4 w-4" /> Información de Pago Actual
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-green-700 font-medium">Precio Actual</span>
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-green-800">
                                                ${user.subscription?.price?.toFixed(2) || '0.00'}
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">Por mes</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-blue-700 font-medium">Próxima Facturación</span>
                                                <History className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-blue-800">
                                                {user.subscription?.next_billing_date ? format(new Date(user.subscription.next_billing_date), 'dd MMM yyyy', { locale: es }) : 'No programada'}
                                            </div>
                                            <p className="text-xs text-blue-600 mt-1">Renovación automática</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Invoices Table */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                    <FileText className="h-4 w-4" /> Historial de Facturas
                                </h3>
                                <div className="border rounded-md">
                                    {loadingInvoices ? (
                                        <div className="p-8 text-center text-muted-foreground">Cargando facturas...</div>
                                    ) : userInvoices.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium">ID</th>
                                                        <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                                        <th className="px-4 py-3 text-left font-medium">Monto</th>
                                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {userInvoices.map((invoice) => (
                                                        <tr key={invoice.id}>
                                                            <td className="px-4 py-3 font-mono text-xs">{invoice.id.slice(0, 8)}...</td>
                                                            <td className="px-4 py-3">{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</td>
                                                            <td className="px-4 py-3">${invoice.amount.toFixed(2)}</td>
                                                            <td className="px-4 py-3">
                                                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className={invoice.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                                                                    {invoice.status === 'paid' ? 'Pagado' : invoice.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">No hay facturas registradas</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="communications" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 border-2 border-dashed rounded-lg">
                                <div className="p-4 bg-muted rounded-full">
                                    <Send className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Centro de Comunicaciones</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Próximamente podrás enviar correos y mensajes de WhatsApp directamente desde aquí.
                                    </p>
                                </div>
                                <Button variant="outline" disabled>
                                    Nueva Comunicación
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 overflow-y-auto px-6 py-4 mt-0">
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                                <History className="h-4 w-4" /> Registro de Actividad
                            </h3>
                            <div className="space-y-4">
                                {loadingLogs ? (
                                    <div className="text-center py-8 text-muted-foreground">Cargando historial...</div>
                                ) : userLogs.length > 0 ? (
                                    <div className="relative pl-4 border-l-2 border-muted space-y-6">
                                        {userLogs.map((log) => (
                                            <div key={log.id} className="relative">
                                                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary" />
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">{log.action}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border font-mono">
                                                        {JSON.stringify(log.details, null, 2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">No hay actividad registrada</div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
