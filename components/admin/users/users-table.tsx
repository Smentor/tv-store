import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, User, Shield, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { UserProfile } from './types'
import { getStatusColor, getStatusLabel } from '@/lib/utils/subscription'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UsersTableProps {
    users: UserProfile[]
    loading: boolean
    selectedIds: Set<string>
    toggleSelectAll: () => void
    toggleSelect: (id: string) => void
    onViewDetails: (user: UserProfile) => void
    // Pagination
    page: number
    setPage: (page: number) => void
    pageSize: number
    totalUsers: number
}

export function UsersTable({
    users,
    loading,
    selectedIds,
    toggleSelectAll,
    toggleSelect,
    onViewDetails,
    page,
    setPage,
    pageSize,
    totalUsers
}: UsersTableProps) {

    const totalPages = Math.ceil(totalUsers / pageSize)
    const allSelected = users.length > 0 && selectedIds.size === users.length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-md">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Próximo Pago</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No se encontraron usuarios.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(user.id)}
                                            onCheckedChange={() => toggleSelect(user.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.first_name || user.last_name
                                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                    : 'Sin nombre'}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                {user.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.whatsapp ? (
                                            <div className="flex items-center gap-1 text-sm">
                                                <Phone className="w-3 h-3 text-muted-foreground" />
                                                {user.whatsapp}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.subscription ? (
                                            <Badge variant="outline">{user.subscription.plan_name}</Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Sin plan</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.subscription ? (
                                            <Badge className={getStatusColor(user.subscription.status)}>
                                                {getStatusLabel(user.subscription.status)}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Sin suscripción</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.subscription?.next_billing_date ? (
                                            <span className="text-sm">
                                                {format(new Date(user.subscription.next_billing_date), 'dd MMM yyyy', { locale: es })}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copiar ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => onViewDetails(user)}>
                                                    <User className="mr-2 h-4 w-4" /> Ver detalles
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                    Mostrando {users.length} de {totalUsers} usuarios
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <div className="text-sm font-medium">
                        Página {page} de {Math.max(1, totalPages)}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page >= totalPages || loading}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
