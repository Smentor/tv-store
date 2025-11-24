import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { UserLog } from './types'
import { CheckCircle2, AlertCircle, Edit, UserCog, CreditCard, Key, Mail, Tv } from 'lucide-react'

export function LogItem({ log }: { log: UserLog }) {
    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    const isUserAction = log.admin_id === null // Usuario hizo el cambio él mismo

    const getActionConfig = (action: string) => {
        switch (action) {
            case 'user_login':
                return { label: 'Inicio de Sesión', icon: CheckCircle2, color: 'text-blue-500' }
            case 'update_status':
                return { label: 'Cambio de Estado', icon: AlertCircle, color: 'text-orange-500' }
            case 'UPDATE_PROFILE':
                return { label: 'Actualización de Perfil', icon: UserCog, color: 'text-blue-500' }
            case 'UPDATE_SUBSCRIPTION':
                return { label: 'Actualización de Suscripción', icon: CreditCard, color: 'text-purple-500' }
            case 'change_plan':
                return { label: 'Cambio de Plan', icon: CreditCard, color: 'text-purple-500' }
            case 'apply_coupon':
                return { label: 'Cupón Aplicado', icon: CreditCard, color: 'text-green-500' }
            case 'update_credentials':
                return { label: 'Credenciales IPTV', icon: Tv, color: 'text-indigo-500' }
            case 'manual_password_update':
                return { label: 'Cambio de Contraseña', icon: Key, color: 'text-red-500' }
            case 'update_notification_settings':
                return { label: 'Preferencias de Notificaciones', icon: Mail, color: 'text-cyan-500' }
            case 'devices_reset':
                return { label: 'Reset de Dispositivos', icon: AlertCircle, color: 'text-red-500' }
            case 'send_password_reset':
                return { label: 'Reset de Contraseña Enviado', icon: Mail, color: 'text-gray-500' }
            case 'send_notification':
                return { label: 'Notificación Enviada', icon: Mail, color: 'text-blue-500' }
            case 'send_email':
                return { label: 'Correo Enviado', icon: Mail, color: 'text-green-500' }
            case 'create_user':
                return { label: 'Usuario Creado', icon: CheckCircle2, color: 'text-green-500' }
            default:
                return { label: action, icon: Edit, color: 'text-gray-500' }
        }
    }

    const { label, icon: Icon, color } = getActionConfig(log.action)

    return (
        <div className="relative group">
            <div className={`absolute -left-[29px] top-1 h-6 w-6 rounded-full bg-background border-2 flex items-center justify-center ${color.replace('text-', 'border-')}`}>
                <Icon className={`h-3 w-3 ${color}`} />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{label}</span>
                        {isUserAction && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                Por el cliente
                            </Badge>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                    </span>
                </div>
                <div className="text-sm bg-muted/30 p-3 rounded-md border border-border/50">
                    <LogContent action={log.action} details={details} isUserAction={isUserAction} />
                </div>
            </div>
        </div>
    )
}

function LogContent({ action, details, isUserAction }: { action: string, details: any, isUserAction: boolean }) {
    if (!details) return <span className="text-muted-foreground italic">Sin detalles</span>

    // Show metadata if available
    const metadata = details.user_agent || details.ip_address ? (
        <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
            {details.user_agent && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="font-medium">Navegador:</span>
                    <span className="truncate max-w-[300px]" title={details.user_agent}>
                        {details.user_agent.includes('Chrome') ? '🌐 Chrome' :
                            details.user_agent.includes('Firefox') ? '🦊 Firefox' :
                                details.user_agent.includes('Safari') ? '🧭 Safari' : '🌐 Navegador'}
                    </span>
                </div>
            )}
            {details.ip_address && (
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium">IP:</span> {details.ip_address}
                </div>
            )}
        </div>
    ) : null

    switch (action) {
        case 'user_login':
            return (
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="text-green-600 font-medium">✓ Sesión iniciada</span>
                    </div>
                    {metadata}
                </div>
            )

        case 'update_status':
            return (
                <div>
                    <div className="flex items-center gap-2 text-xs">
                        {details.previous_status && (
                            <>
                                <StatusBadge status={details.previous_status} />
                                <span>→</span>
                            </>
                        )}
                        <StatusBadge status={details.new_status || details.status} />
                    </div>
                    {metadata}
                </div>
            )

        case 'UPDATE_PROFILE':
            if (details.new && details.previous) {
                const changes = Object.keys(details.new).filter(key => details.new[key] !== details.previous[key])
                if (changes.length === 0) return <span className="text-muted-foreground">Sin cambios detectados</span>
                return (
                    <div>
                        <div className="space-y-1">
                            {changes.map(key => (
                                <div key={key} className="grid grid-cols-[100px_1fr] gap-2 text-xs">
                                    <span className="font-medium text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="line-through text-muted-foreground/70 truncate max-w-[100px]">{String(details.previous[key])}</span>
                                        <span>→</span>
                                        <span className="font-medium">{String(details.new[key])}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {metadata}
                    </div>
                )
            }
            return <pre className="text-xs">{JSON.stringify(details, null, 2)}</pre>

        case 'UPDATE_SUBSCRIPTION':
        case 'change_plan':
            if (details.updates) {
                return (
                    <div>
                        <div className="space-y-1">
                            {Object.entries(details.updates).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-[120px_1fr] gap-2 text-xs">
                                    <span className="font-medium text-muted-foreground capitalize">{key.replace('_', ' ')}:</span>
                                    <span className="font-medium">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                        {metadata}
                    </div>
                )
            }
            return <pre className="text-xs">{JSON.stringify(details, null, 2)}</pre>

        case 'apply_coupon':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        {details.coupon_code && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Código:</span>
                                <span className="font-mono font-bold text-green-600">{details.coupon_code}</span>
                            </div>
                        )}
                        {details.discount && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Descuento:</span>
                                <span className="font-medium text-green-600">{details.discount}</span>
                            </div>
                        )}
                    </div>
                    {metadata}
                </div>
            )

        case 'update_credentials':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        {details.new_username && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Usuario:</span>
                                <span className="font-mono">{details.new_username}</span>
                            </div>
                        )}
                        {details.password_updated && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Contraseña:</span>
                                <span className="text-green-600 font-medium">Actualizada</span>
                            </div>
                        )}
                        {!details.new_username && !details.password_updated && (
                            <pre>{JSON.stringify(details, null, 2)}</pre>
                        )}
                    </div>
                    {metadata}
                </div>
            )

        case 'manual_password_update':
            return (
                <div>
                    <span className="text-xs text-muted-foreground">
                        {isUserAction
                            ? 'El cliente cambió su contraseña de acceso al panel.'
                            : 'Contraseña de acceso al panel actualizada manualmente por administrador.'}
                    </span>
                    {metadata}
                </div>
            )

        case 'update_notification_settings':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        <span className="text-muted-foreground">Preferencias de notificaciones actualizadas</span>
                        {details.changes && (
                            <div className="mt-2 space-y-1">
                                {Object.entries(details.changes).map(([key, value]) => (
                                    <div key={key} className="flex gap-2">
                                        <span className="capitalize">{key.replace('_', ' ')}:</span>
                                        <span className="font-medium">{value ? '✓ Activado' : '✗ Desactivado'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {metadata}
                </div>
            )

        case 'devices_reset':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Acción:</span>
                            <span className="font-medium text-red-600">Todos los dispositivos fueron desconectados</span>
                        </div>
                        {details.devices_count && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Dispositivos afectados:</span>
                                <span>{details.devices_count}</span>
                            </div>
                        )}
                        {details.max_devices && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Máximo permitido:</span>
                                <span>{details.max_devices}</span>
                            </div>
                        )}
                    </div>
                    {metadata}
                </div>
            )

        case 'payment_successful':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Monto:</span>
                            <span className="font-bold text-green-600">${details.amount}</span>
                        </div>
                        {details.payment_type && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Tipo:</span>
                                <span className="capitalize">{details.payment_type.replace('_', ' ')}</span>
                            </div>
                        )}
                        {details.plan_name && (
                            <div className="flex gap-2">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-medium">{details.plan_name}</span>
                            </div>
                        )}
                        {details.description && (
                            <div className="text-muted-foreground mt-1">{details.description}</div>
                        )}
                    </div>
                    {metadata}
                </div>
            )

        case 'send_notification':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Título:</span>
                            <span className="font-medium">{details.title}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Tipo:</span>
                            <Badge variant="outline" className="capitalize">{details.type}</Badge>
                        </div>
                    </div>
                    {metadata}
                </div>
            )

        case 'send_email':
            return (
                <div>
                    <div className="space-y-1 text-xs">
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Para:</span>
                            <span className="font-medium">{details.to}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-muted-foreground">Asunto:</span>
                            <span className="font-medium">{details.subject}</span>
                        </div>
                    </div>
                    {metadata}
                </div>
            )

        default:
            return (
                <div>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(details, null, 2)}</pre>
                    {metadata}
                </div>
            )
    }
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-green-100 text-green-800 border-green-200",
        inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
        cancelled: "bg-red-100 text-red-800 border-red-200"
    }
    const labels = {
        active: "Activo",
        inactive: "Inactivo",
        cancelled: "Cancelado"
    }
    const key = status as keyof typeof styles
    return (
        <Badge variant="outline" className={styles[key] || "bg-gray-100 text-gray-800"}>
            {labels[key] || status}
        </Badge>
    )
}
