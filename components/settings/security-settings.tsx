"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Lock, Trash2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { deleteUserAccount } from "@/app/actions/auth-actions"

interface SecuritySettingsProps {
    user: any
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
    const { toast } = useToast()
    const supabase = createClient()

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
    const [changingPassword, setChangingPassword] = useState(false)

    const handleChangePassword = async () => {
        setPasswordErrors({ new: "", confirm: "", general: "" })

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
                toast({
                    title: "Error al cambiar contraseña",
                    description: error.message,
                    variant: "destructive",
                    duration: 3000,
                })
            } else {
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

        if (!user?.id) {
            toast({
                title: "Error",
                description: "No se pudo identificar el usuario.",
                variant: "destructive",
                duration: 3000,
            })
            return
        }

        try {
            // Call secure server action
            const result = await deleteUserAccount(user.id)

            if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || "No se pudo eliminar la cuenta. Contacta con soporte.",
                    variant: "destructive",
                    duration: 3000,
                })
                return
            }

            // Sign out and redirect
            await supabase.auth.signOut()
            window.location.href = '/auth/login'
        } catch (error) {
            console.error('Error deleting account:', error)
            toast({
                title: "Error",
                description: "Ocurrió un error inesperado. Contacta con soporte.",
                variant: "destructive",
                duration: 3000,
            })
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            <CardTitle>Seguridad</CardTitle>
                        </div>
                    </div>
                    <CardDescription>Opciones de seguridad de tu cuenta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            Contraseña
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

            <Card className="border-destructive/50 mt-6">
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
        </>
    )
}
