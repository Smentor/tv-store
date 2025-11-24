'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBrowserClient } from '@/lib/supabase/client'
import { CheckSquare, Square, Trash2, AlertTriangle, Tag, Calendar, CreditCard, XCircle, DollarSign, Bell, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  deleteUsers, createUser, updateUserPassword, createSubscription,
  updateUserProfile, updateIptvCredentials, updateSubscriptionDetails,
  updateSubscriptionStatus, sendPasswordReset,
  bulkUpdatePlans, bulkUpdateStatus, bulkUpdateDates
} from '@/app/actions/admin-actions'
import { UserDetailsModal } from './users/user-details-modal'
import { UserProfile, Plan, UserLog, Invoice, NotificationBatch } from './users/types'
import { useUsers } from './users/use-users'
import { UsersFilters } from './users/users-filters'
import { UsersTable } from './users/users-table'
import { GlobalHistorySheet } from './users/global-history-sheet'

export default function UsersManagement() {
  // Use Custom Hook for Data & Pagination
  const {
    users,
    loading,
    totalUsers,
    page,
    setPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    refreshUsers
  } = useUsers()

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])

  // Estados para formularios
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', type: 'info' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkNotifyOpen, setIsBulkNotifyOpen] = useState(false)
  const [isBulkPlanOpen, setIsBulkPlanOpen] = useState(false)
  const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false)
  const [isBulkDateOpen, setIsBulkDateOpen] = useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [bulkPlan, setBulkPlan] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkDate, setBulkDate] = useState('')
  const [notificationBatches, setNotificationBatches] = useState<NotificationBatch[]>([])
  const [showBatches, setShowBatches] = useState(false)

  const [userLogs, setUserLogs] = useState<UserLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [userInvoices, setUserInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

  const [isGlobalHistoryOpen, setIsGlobalHistoryOpen] = useState(false)
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([])

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    whatsapp: '',
    plan_id: '',
    plan_name: '',
    price: '',
    iptv_username: '',
    iptv_password: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    const fetchPlans = async () => {
      const supabase = createBrowserClient()
      const { data } = await supabase.from('plans').select('*')
      if (data) setAvailablePlans(data)
    }
    fetchPlans()
  }, [])

  const handleCreateUser = async () => {
    setIsSubmitting(true)
    const result = await createUser(createUserForm)

    if (result.success) {
      toast({ variant: 'success', title: 'Usuario creado', description: 'El usuario ha sido creado exitosamente' })
      setIsCreateUserOpen(false)
      setCreateUserForm({
        email: '', password: '', first_name: '', last_name: '', whatsapp: '',
        plan_id: '', plan_name: '', price: '', iptv_username: '', iptv_password: ''
      })
      refreshUsers()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === users.length && users.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map(u => u.id)))
    }
  }

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedIds(newSelected)
  }

  // ... (rest of handlers)

  // ... (inside return)


  const handleBulkNotify = async () => {
    if (selectedIds.size === 0) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()
    const notifications = Array.from(selectedIds).map(userId => ({
      user_id: userId,
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      read: false
    }))

    const { error } = await supabase.from('notifications').insert(notifications)

    if (!error) {
      toast({ variant: 'success', title: 'Notificaciones enviadas', description: `Se enviaron ${selectedIds.size} notificaciones` })
      setIsBulkNotifyOpen(false)
      setNotificationForm({ title: '', message: '', type: 'info' })
      setSelectedIds(new Set())
    } else {
      toast({ variant: 'destructive', title: 'Error', description: error.message })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangePlan = async () => {
    if (selectedIds.size === 0 || !bulkPlan) return
    setIsSubmitting(true)

    const result = await bulkUpdatePlans(Array.from(selectedIds), bulkPlan)

    if (result.success) {
      toast({ variant: 'success', title: 'Planes actualizados', description: result.message || `Se actualizaron ${selectedIds.size} usuarios` })
      setIsBulkPlanOpen(false)
      setSelectedIds(new Set())
      refreshUsers()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangeStatus = async () => {
    if (selectedIds.size === 0 || !bulkStatus) return
    setIsSubmitting(true)

    const result = await bulkUpdateStatus(Array.from(selectedIds), bulkStatus)

    if (result.success) {
      if (result.count === 0) {
        // Nadie fue actualizado
        toast({
          variant: 'default',
          title: 'Sin cambios',
          description: `No se pudo actualizar ningún usuario. ${result.skipped} ${result.skipped === 1 ? 'usuario no tiene' : 'usuarios no tienen'} un plan asignado.`
        })
      } else if (result.skipped && result.skipped > 0) {
        // Algunos actualizados, algunos omitidos
        toast({
          variant: 'default',
          title: 'Actualización parcial',
          description: result.message
        })
      } else {
        // Todos actualizados
        toast({
          variant: 'success',
          title: 'Estados actualizados',
          description: result.message
        })
      }
      setIsBulkStatusOpen(false)
      setSelectedIds(new Set())
      refreshUsers()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangeDate = async () => {
    if (selectedIds.size === 0 || !bulkDate) return
    setIsSubmitting(true)

    const result = await bulkUpdateDates(Array.from(selectedIds), bulkDate)

    if (result.success) {
      toast({ variant: 'success', title: 'Fechas actualizadas', description: `Se actualizaron ${selectedIds.size} usuarios` })
      setIsBulkDateOpen(false)
      setSelectedIds(new Set())
      refreshUsers()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsSubmitting(true)

    const result = await deleteUsers(Array.from(selectedIds))

    if (result.success) {
      toast({ variant: 'success', title: 'Usuarios eliminados', description: `Se eliminaron ${selectedIds.size} usuarios` })
      setIsBulkDeleteOpen(false)
      setSelectedIds(new Set())
      refreshUsers()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleUserClick = async (user: UserProfile) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
    setLoadingLogs(true)
    setLoadingInvoices(true)

    const supabase = createBrowserClient()

    // Fetch Logs
    const { data: logs } = await supabase
      .from('user_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setUserLogs(logs || [])
    setLoadingLogs(false)

    // Fetch Invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setUserInvoices(invoices || [])
    setLoadingInvoices(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra usuarios, suscripciones y credenciales IPTV
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedHistoryIds([]) // Clear selection for global history
                  setIsGlobalHistoryOpen(true)
                }}
              >
                <History className="mr-2 h-4 w-4" />
                Historial Global
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UsersFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            planFilter={planFilter}
            setPlanFilter={setPlanFilter}
            availablePlans={availablePlans}
            onRefresh={refreshUsers}
            onCreateUser={() => setIsCreateUserOpen(true)}
          />

          <UsersTable
            users={users}
            loading={loading}
            selectedIds={selectedIds}
            toggleSelectAll={handleSelectAll}
            toggleSelect={handleSelectUser}
            onViewDetails={handleUserClick}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            totalUsers={totalUsers}
          />
        </CardContent>
      </Card>

      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedUser(null)
          setUserLogs([])
          setUserInvoices([])
        }}
        availablePlans={availablePlans}
        onUpdateProfile={async (userId, data) => {
          await updateUserProfile(userId, data)
          refreshUsers()
        }}
        onUpdateIptvCredentials={async (userId, data) => {
          await updateIptvCredentials(userId, data)
          refreshUsers()
        }}
        onUpdateSubscriptionDetails={async (userId, data) => {
          await updateSubscriptionDetails(userId, data)
          refreshUsers()
        }}
        onUpdateSubscriptionStatus={async (userId, status) => {
          await updateSubscriptionStatus(userId, status)
          refreshUsers()
        }}
        onCreateSubscription={async (userId, data) => {
          await createSubscription({ ...data, user_id: userId, plan_id: availablePlans.find(p => p.name === data.plan_name)?.id })
          refreshUsers()
        }}
        onManualPasswordUpdate={async (userId, password) => {
          await updateUserPassword(userId, password)
        }}
        onSendPasswordReset={async (email) => {
          await sendPasswordReset(email)
        }}
        userLogs={userLogs}
        userInvoices={userInvoices}
        loadingLogs={loadingLogs}
        loadingInvoices={loadingInvoices}
      />

      {/* Create User Modal */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo usuario. Se creará una cuenta y perfil.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  value={createUserForm.first_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  value={createUserForm.last_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="new-email"
                type="email"
                value={createUserForm.email}
                onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Contraseña <span className="text-red-500">*</span></Label>
              <Input
                id="new-password"
                type="password"
                value={createUserForm.password}
                onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-whatsapp">WhatsApp</Label>
              <Input
                id="new-whatsapp"
                value={createUserForm.whatsapp}
                onChange={(e) => setCreateUserForm({ ...createUserForm, whatsapp: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-plan">Plan Inicial (Opcional)</Label>
              <Select
                value={createUserForm.plan_id}
                onValueChange={(value) => setCreateUserForm({ ...createUserForm, plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ${plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Notify Modal */}
      <Dialog open={isBulkNotifyOpen} onOpenChange={setIsBulkNotifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Notificación Masiva</DialogTitle>
            <DialogDescription>
              Enviando a {selectedIds.size} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                placeholder="Ej: Mantenimiento Programado"
              />
            </div>
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                placeholder="Escribe el mensaje aquí..."
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={notificationForm.type}
                onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkNotifyOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkNotify} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Plan Modal */}
      <Dialog open={isBulkPlanOpen} onOpenChange={setIsBulkPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambio de Plan Masivo</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo plan para {selectedIds.size} usuarios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkPlan} onValueChange={setBulkPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo plan" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.name}>
                    {plan.name} - ${plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkPlanOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangePlan} disabled={isSubmitting || !bulkPlan}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Planes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Status Modal */}
      <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambio de Estado Masivo</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para {selectedIds.size} usuarios.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Nota: El cambio de estado solo se aplicará a usuarios que ya tengan un plan asignado.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkStatusOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangeStatus} disabled={isSubmitting || !bulkStatus}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Estados'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Date Modal */}
      <Dialog open={isBulkDateOpen} onOpenChange={setIsBulkDateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambio de Vencimiento Masivo</DialogTitle>
            <DialogDescription>
              Selecciona la nueva fecha de vencimiento para {selectedIds.size} usuarios.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="date"
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDateOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangeDate} disabled={isSubmitting || !bulkDate}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Fechas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Modal */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuarios Masivamente</DialogTitle>
            <DialogDescription className="text-red-600 font-medium">
              ¿Estás seguro de que deseas eliminar a los {selectedIds.size} usuarios seleccionados? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Eliminar Usuarios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-background/95 backdrop-blur-md border shadow-xl rounded-full px-6 py-3 flex items-center gap-4 ring-1 ring-black/5">
            <div className="flex items-center gap-2 border-r pr-4 mr-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                {selectedIds.size}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Seleccionados</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsBulkNotifyOpen(true)}
                title="Enviar Notificación"
              >
                <Bell className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Notificar</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsBulkPlanOpen(true)}
                title="Cambiar Plan"
              >
                <Tag className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Plan</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsBulkStatusOpen(true)}
                title="Cambiar Estado"
              >
                <AlertTriangle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Estado</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => setIsBulkDateOpen(true)}
                title="Cambiar Vencimiento"
              >
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Vencimiento</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => {
                  setSelectedHistoryIds(Array.from(selectedIds))
                  setIsGlobalHistoryOpen(true)
                }}
                title="Ver Historial"
              >
                <History className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Historial</span>
              </Button>

              <div className="w-px h-6 bg-border mx-1"></div>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                onClick={() => setIsBulkDeleteOpen(true)}
                title="Eliminar Usuarios"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full ml-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setSelectedIds(new Set())}
                title="Cancelar selección"
              >
                <span className="sr-only">Cancelar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      <GlobalHistorySheet
        isOpen={isGlobalHistoryOpen}
        onClose={() => setIsGlobalHistoryOpen(false)}
        userIds={selectedHistoryIds}
      />
    </div>
  )
}
