"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Monitor } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUserLogger } from "@/hooks/use-user-logger"

interface DeviceSettingsProps {
    subscription: any
}

export function DeviceSettings({ subscription }: DeviceSettingsProps) {
    const { toast } = useToast()
    const { logAction } = useUserLogger()
    const [showDevicesDialog, setShowDevicesDialog] = useState(false)
    const [resettingDevices, setResettingDevices] = useState(false)

    const handleResetDevices = async () => {
        setResettingDevices(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))

            await logAction('devices_reset', {
                action_type: 'reset_all_devices',
                devices_count: 2,
                max_devices: subscription?.plan?.max_screens || 1
            })

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

    return (
        <>
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

            <Dialog open={showDevicesDialog} onOpenChange={setShowDevicesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resetear Dispositivos</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas desconectar todos los dispositivos?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDevicesDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleResetDevices}
                            disabled={resettingDevices}
                        >
                            {resettingDevices ? "Reseteando..." : "Sí, Resetear Todo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
