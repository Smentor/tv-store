"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone } from 'lucide-react'
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
import { countryCodes } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface ProfileSettingsProps {
    profile: any
    updateProfile: (data: any) => Promise<{ error: any }>
}

export function ProfileSettings({ profile, updateProfile }: ProfileSettingsProps) {
    const { toast } = useToast()
    const [editInfoOpen, setEditInfoOpen] = useState(false)
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
    }, [editInfoOpen, profile])

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

    return (
        <>
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
                </CardContent>
            </Card>

            <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Información Personal</DialogTitle>
                        <DialogDescription>
                            Actualiza tus datos de contacto aquí.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                    id="firstName"
                                    value={clientInfo.firstName}
                                    onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                    id="lastName"
                                    value={clientInfo.lastName}
                                    onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={clientInfo.email}
                                onChange={(e) => {
                                    setClientInfo({ ...clientInfo, email: e.target.value })
                                    setEmailError("")
                                }}
                                className={emailError ? "border-red-500" : ""}
                            />
                            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <div className="flex gap-2">
                                <Select
                                    value={clientInfo.countryCode}
                                    onValueChange={(value) => setClientInfo({ ...clientInfo, countryCode: value })}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="País" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px]">
                                        {countryCodes.map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                                <span className="mr-2">{country.flag}</span>
                                                {country.code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="whatsapp"
                                    type="tel"
                                    placeholder="Número"
                                    value={clientInfo.phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '')
                                        const max = getMaxDigits()
                                        if (val.length <= max) {
                                            setClientInfo({ ...clientInfo, phoneNumber: val })
                                        }
                                    }}
                                    className="flex-1"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {clientInfo.countryCode && countryCodes.find(c => c.code === clientInfo.countryCode)?.country}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditInfoOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveClientInfo}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
