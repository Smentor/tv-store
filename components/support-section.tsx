"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Mail, Send, FileQuestion, Phone, CheckCircle2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export function SupportSection() {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ticketSent, setTicketSent] = useState(false)

    const handleSendTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulación de envío
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        setTicketSent(true)

        toast({
            title: "Ticket enviado correctamente",
            description: "Nuestro equipo de soporte te contactará pronto.",
            variant: "success",
        })
    }

    if (ticketSent) {
        return (
            <div className="max-w-md mx-auto text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">¡Mensaje Recibido!</h2>
                    <p className="text-muted-foreground mt-2">
                        Hemos recibido tu solicitud de soporte. Te responderemos a tu correo electrónico o WhatsApp registrado lo antes posible.
                    </p>
                </div>
                <Button onClick={() => setTicketSent(false)} variant="outline">
                    Enviar otro mensaje
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Centro de Ayuda</h2>
                <p className="text-muted-foreground">Estamos aquí para ayudarte con cualquier problema</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Channels */}
                <div className="md:col-span-1 space-y-4">
                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle className="text-lg">WhatsApp</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Respuesta inmediata para problemas urgentes.
                            </p>
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Chatear ahora
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-lg">Email</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Para consultas generales o facturación.
                            </p>
                            <Button variant="outline" className="w-full gap-2">
                                <Mail className="w-4 h-4" />
                                soporte@maxplayer.com
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4" /> Horario de Atención
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Lunes a Domingo<br />
                            9:00 AM - 10:00 PM (Hora Local)
                        </p>
                    </div>
                </div>

                {/* Contact Form & FAQ */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Envíanos un mensaje</CardTitle>
                            <CardDescription>
                                Describe tu problema y te ayudaremos a resolverlo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendTicket} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Asunto</Label>
                                        <Input id="subject" placeholder="Ej: Problema de conexión" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría</Label>
                                        <select
                                            id="category"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option>Soporte Técnico</option>
                                            <option>Facturación</option>
                                            <option>Renovación</option>
                                            <option>Otro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Mensaje</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Detalla tu problema aquí..."
                                        className="min-h-[120px]"
                                        required
                                        suppressHydrationWarning
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                    {isSubmitting ? (
                                        "Enviando..."
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Ticket
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <FileQuestion className="w-5 h-5 text-primary" />
                            Preguntas Frecuentes
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>¿Cómo configuro mi dispositivo?</AccordionTrigger>
                                <AccordionContent>
                                    Para configurar tu dispositivo, ve a la sección de "Credenciales" en este panel. Allí encontrarás tu usuario, contraseña y la URL del servidor. Ingresa estos datos en tu aplicación IPTV preferida.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>¿Puedo usar mi cuenta en varios dispositivos?</AccordionTrigger>
                                <AccordionContent>
                                    Sí, pero el número de dispositivos simultáneos depende de tu plan. El plan Básico permite 1 dispositivo, mientras que el Premium permite hasta 3. Puedes ver los dispositivos conectados en el Dashboard.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Mi servicio se congela, ¿qué hago?</AccordionTrigger>
                                <AccordionContent>
                                    Primero, verifica tu conexión a internet. Recomendamos al menos 20Mbps estables. Si el problema persiste, intenta reiniciar tu router y tu dispositivo. Si aún falla, contáctanos por WhatsApp.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>¿Cómo renuevo mi suscripción?</AccordionTrigger>
                                <AccordionContent>
                                    Ve a la sección "Planes" y selecciona tu plan actual o uno nuevo. El sistema te guiará para realizar el pago y la renovación será automática.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </div>
    )
}
