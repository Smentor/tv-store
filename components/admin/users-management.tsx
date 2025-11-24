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
import { CheckSquare, Square, Trash2, AlertTriangle, Tag, Calendar, CreditCard, XCircle, DollarSign, Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { deleteUsers, createUser, updateUserPassword, createSubscription } from '@/app/actions/admin-actions'
import { UserDetailsModal } from './users/user-details-modal'
import { UserProfile, Plan, UserLog, Invoice, NotificationBatch } from './users/types'
import { useUsers } from './users/use-users'
import { UsersFilters } from './users/users-filters'
import { UsersTable } from './users/users-table'

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
    refreshUsers()
    loadAvailablePlans()
    loadNotificationBatches()
  }, []) // refreshUsers is stable

  const loadAvailablePlans = async () => {
    const supabase = createBrowserClient()

    const { data: plans, error } = await supabase
      .from('plans')
      .select('id, name, price')
      .order('name')

    if (!error && plans) {
      setAvailablePlans(plans)
    }
  }

  const loadNotificationBatches = async () => {
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('notification_batches')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setNotificationBatches(data)
  }

  const loadUserLogs = async (userId: string) => {
    setLoadingLogs(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('user_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setUserLogs(data)
    }
    setLoadingLogs(false)
  }

  const loadUserInvoices = async (userId: string) => {
    setLoadingInvoices(true)
    const supabase = createBrowserClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setUserInvoices(data)
    }
    setLoadingInvoices(false)
  }

  const logAction = async (userId: string, action: string, details: any) => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('user_logs').insert({
      user_id: userId,
      admin_id: user?.id,
      action,
      details
    })

    // Reload logs if we are viewing them
    if (selectedUser?.id === userId) {
      loadUserLogs(userId)
    }
  }

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)

    loadUserLogs(user.id)
    loadUserInvoices(user.id)
  }

  const handleUpdateProfile = async (userId: string, data: { first_name: string; last_name: string; email: string; whatsapp: string }) => {
    // Check for changes
    if (selectedUser) {
      const hasChanges =
        data.first_name !== (selectedUser.first_name || '') ||
        data.last_name !== (selectedUser.last_name || '') ||
        data.email !== (selectedUser.email || '') ||
        data.whatsapp !== (selectedUser.whatsapp || '')

      if (!hasChanges) {
        toast({
          title: 'Sin cambios',
          description: 'No se detectaron cambios en el perfil.',
        })
        return
      }
    }

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        whatsapp: data.whatsapp
      })
      .eq('id', userId)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar perfil',
        description: error.message,
      })
    } else {
      toast({
        variant: 'success',
        title: 'Perfil actualizado',
        description: 'Los datos del usuario han sido actualizados correctamente.',
      })
      refreshUsers()
      if (selectedUser) {
        logAction(userId, 'UPDATE_PROFILE', { previous: selectedUser, new: data })
        setSelectedUser({ ...selectedUser, ...data })
      }
    }
    setIsSubmitting(false)
  }

  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'El email y la contraseña son obligatorios.',
      })
      return
    }

    setIsSubmitting(true)

    // Buscar el nombre del plan si se seleccionó uno
    let planName = ''
    if (createUserForm.plan_id) {
      const plan = availablePlans.find(p => p.id === createUserForm.plan_id)
      if (plan) planName = plan.name
    }

    if (createUserForm.password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres.',
      })
      return
    }

    const result = await createUser({
      ...createUserForm,
      plan_name: planName
    })

    if (result.success) {
      toast({
        variant: 'success',
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente.',
      })
      setIsCreateUserOpen(false)
      setCreateUserForm({
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
      refreshUsers()
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al crear usuario',
        description: result.error,
      })
    }
    setIsSubmitting(false)
  }


  const handleUpdateSubscriptionDetails = async (userId: string, data: { plan_name: string; price: number; next_billing_date?: string }) => {
    if (!selectedUser?.subscription?.id) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()
    const updates: any = {}
    let hasChanges = false

    // 1. Check Plan
    if (data.plan_name && data.plan_name !== selectedUser.subscription.plan_name) {
      const plan = availablePlans.find(p => p.name === data.plan_name)
      if (plan) {
        updates.plan_id = plan.id
        updates.plan_name = plan.name
        hasChanges = true
      }
    }

    // 2. Check Price
    if (data.price !== undefined && data.price !== selectedUser.subscription.price) {
      updates.price = data.price
      hasChanges = true
    }

    // 3. Check Date
    if (data.next_billing_date) {
      const newDate = new Date(data.next_billing_date)
      const oldDate = new Date(selectedUser.subscription.next_billing_date)
      if (newDate.toISOString().split('T')[0] !== oldDate.toISOString().split('T')[0]) {
        updates.next_billing_date = newDate.toISOString()
        hasChanges = true
      }
    }

    if (!hasChanges) {
      setIsSubmitting(false)
      return
    }

    updates.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', selectedUser.subscription.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar suscripción',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Suscripción actualizada',
        description: 'Los detalles de la suscripción han sido guardados.'
      })

      // Update local state optimistically
      const updatedUser = {
        ...selectedUser,
        subscription: {
          ...selectedUser.subscription,
          ...updates
        }
      }
      setSelectedUser(updatedUser)
      refreshUsers() // Refresh list to show changes

      logAction(userId, 'UPDATE_SUBSCRIPTION', { updates })
    }
    setIsSubmitting(false)
  }

  const handleCreateSubscription = async (userId: string, data: { plan_name: string; price: number }) => {
    setIsSubmitting(true)
    const selectedPlan = availablePlans.find(p => p.name === data.plan_name)

    if (!selectedPlan) {
      toast({ variant: 'destructive', title: 'Error', description: 'Plan no válido' })
      setIsSubmitting(false)
      return
    }

    const result = await createSubscription({
      user_id: userId,
      plan_id: selectedPlan.id,
      plan_name: selectedPlan.name,
      price: data.price || selectedPlan.price
    })

    if (result.success) {
      toast({ variant: 'success', title: 'Suscripción creada exitosamente' })
      refreshUsers()
      setIsDetailsOpen(false)
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    }
    setIsSubmitting(false)
  }

  const handleManualPasswordUpdate = async (userId: string, password: string) => {
    setIsSubmitting(true)
    const result = await updateUserPassword(userId, password)

    if (result.success) {
      toast({
        variant: 'success',
        title: 'Contraseña actualizada',
        description: 'La contraseña del usuario ha sido cambiada exitosamente.',
      })
      logAction(userId, 'UPDATE_PASSWORD_MANUAL', { userId })
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      })
    }
    setIsSubmitting(false)
  }

  const handleSendPasswordReset = async (email: string) => {
    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar correo',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Correo enviado',
        description: `Se ha enviado un correo de restablecimiento a ${email}`
      })
      if (selectedUser) {
        await logAction(selectedUser.id, 'send_password_reset', {})
      }
    }
    setIsSubmitting(false)
  }

  const handleUpdateIptvCredentials = async (userId: string, data: { username: string; password: string }) => {
    // Check for changes
    if (selectedUser?.credentials) {
      const hasChanges =
        data.username !== (selectedUser.credentials.username || '') ||
        data.password !== (selectedUser.credentials.password || '')

      if (!hasChanges) {
        toast({
          title: 'Sin cambios',
          description: 'No se detectaron cambios en las credenciales.',
        })
        return
      }
    }

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const oldUsername = selectedUser?.credentials?.username

    const { error } = await supabase
      .from('credentials')
      .update({
        username: data.username,
        password: data.password,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Credenciales actualizadas',
        description: 'Las credenciales IPTV han sido actualizadas correctamente'
      })

      refreshUsers()

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, credentials: { ...selectedUser.credentials!, username: data.username, password: data.password } })
      }

      logAction(userId, 'update_credentials', {
        previous_username: oldUsername,
        new_username: data.username,
        password_updated: data.password !== selectedUser?.credentials?.password
      })
    }
    setIsSubmitting(false)
  }

  const handleUpdateStatus = async (userId: string, status: string) => {
    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const previousStatus = selectedUser?.subscription?.status || 'unknown'

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar estado',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Estado actualizado',
        description: `El estado de la suscripción se ha actualizado a ${status}`
      })

      refreshUsers()

      if (selectedUser && selectedUser.id === userId && selectedUser.subscription) {
        setSelectedUser({ ...selectedUser, subscription: { ...selectedUser.subscription, status: status } })
      }

      logAction(userId, 'update_status', {
        previous_status: previousStatus,
        new_status: status
      })
    }
    setIsSubmitting(false)
  }

  const handleSendNotification = async () => {
    if (!selectedUser?.id) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: selectedUser.id,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type
      })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Notificación enviada',
        description: 'El usuario verá el mensaje en su dashboard'
      })
      await logAction(selectedUser.id, 'send_notification', {
        title: notificationForm.title,
        type: notificationForm.type
      })

      setNotificationForm({ title: '', message: '', type: 'info' })
    }
    setIsSubmitting(false)
  }

  const handleSendEmail = async () => {
    // Simulación de envío de correo ya que requiere integración backend
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      variant: 'success',
      title: 'Correo enviado',
      description: `Se ha enviado un correo a ${selectedUser?.email}`
    })
    if (selectedUser?.id) {
      await logAction(selectedUser.id, 'send_email', {
        to: selectedUser.email,
        subject: 'Simulado', // Placeholder
        body: 'Simulado' // Placeholder
      })
    }
    setIsSubmitting(false)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map(u => u.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkNotify = async () => {
    if (selectedIds.size === 0) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()

    // 1. Create Batch
    const { data: batch, error: batchError } = await supabase
      .from('notification_batches')
      .insert({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        target_count: selectedIds.size
      })
      .select()
      .single()

    if (batchError || !batch) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el envío masivo' })
      setIsSubmitting(false)
      return
    }

    // 2. Create Notifications
    const notifications = Array.from(selectedIds).map(userId => ({
      user_id: userId,
      title: notificationForm.title,
      message: notificationForm.message,
      type: notificationForm.type,
      batch_id: batch.id
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notifError) {
      toast({ variant: 'destructive', title: 'Error parcial', description: 'Algunas notificaciones fallaron' })
    } else {
      toast({ variant: 'success', title: 'Enviado', description: `Se enviaron ${selectedIds.size} notificaciones` })
      setIsBulkNotifyOpen(false)
      setNotificationForm({ title: '', message: '', type: 'info' })
      setSelectedIds(new Set())
      loadNotificationBatches()
      // Log action for each user
      Array.from(selectedIds).forEach(userId => {
        logAction(userId, 'receive_bulk_notification', {
          batch_id: batch.id,
          title: notificationForm.title
        })
      })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangePlan = async () => {
    if (selectedIds.size === 0 || !bulkPlan) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()

    // Get plan details to update price as well (optional, but good practice)
    const { data: planData } = await supabase
      .from('plans')
      .select('price')
      .eq('name', bulkPlan)
      .single()

    const updates: any = {
      plan_name: bulkPlan,
      updated_at: new Date().toISOString()
    }

    if (planData) {
      updates.price = planData.price
    }

    const { error } = await supabase
      .from('subscriptions')
      .update(updates)
      .in('user_id', Array.from(selectedIds))

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar los planes' })
    } else {
      toast({ variant: 'success', title: 'Planes actualizados', description: `Se actualizó el plan de ${selectedIds.size} usuarios` })
      setIsBulkPlanOpen(false)
      setSelectedIds(new Set())
      refreshUsers() // Reload to show changes
      // Log action for each user
      Array.from(selectedIds).forEach(userId => {
        logAction(userId, 'change_plan', {
          previous: 'N/A', // difficult to get previous for bulk
          new: bulkPlan,
          new_price: planData?.price
        })
      })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangeStatus = async () => {
    if (selectedIds.size === 0 || !bulkStatus) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: bulkStatus,
        updated_at: new Date().toISOString()
      })
      .in('user_id', Array.from(selectedIds))

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar los estados' })
    } else {
      toast({ variant: 'success', title: 'Estados actualizados', description: `Se actualizó el estado de ${selectedIds.size} usuarios` })
      setIsBulkStatusOpen(false)
      setSelectedIds(new Set())
      refreshUsers() // Reload to show changes
      // Log action for each user
      Array.from(selectedIds).forEach(userId => {
        logAction(userId, 'change_status', {
          previous: 'N/A', // difficult to get previous for bulk
          new: bulkStatus
        })
      })
    }
    setIsSubmitting(false)
  }

  const handleBulkChangeDate = async () => {
    if (selectedIds.size === 0 || !bulkDate) return
    setIsSubmitting(true)

    const supabase = createBrowserClient()
    const newDate = new Date(bulkDate)

    const { error } = await supabase
      .from('subscriptions')
      .update({
        next_billing_date: newDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('user_id', Array.from(selectedIds))

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar las fechas' })
    } else {
      toast({ variant: 'success', title: 'Fechas actualizadas', description: `Se actualizó la fecha de ${selectedIds.size} usuarios` })
      setIsBulkDateOpen(false)
      setSelectedIds(new Set())
      refreshUsers()
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
              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-right-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        {selectedIds.size} seleccionados
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones Masivas</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsBulkNotifyOpen(true)}>
                        <Bell className="mr-2 h-4 w-4" /> Enviar Notificación
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsBulkPlanOpen(true)}>
                        <Tag className="mr-2 h-4 w-4" /> Cambiar Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsBulkStatusOpen(true)}>
                        <AlertTriangle className="mr-2 h-4 w-4" /> Cambiar Estado
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsBulkDateOpen(true)}>
                        <Calendar className="mr-2 h-4 w-4" /> Cambiar Vencimiento
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsBulkDeleteOpen(true)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuarios
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
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
            toggleSelectAll={toggleSelectAll}
            toggleSelect={toggleSelect}
            onViewDetails={handleViewDetails}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            totalUsers={totalUsers}
          />
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onUpdateProfile={handleUpdateProfile}
          onUpdateSubscriptionDetails={handleUpdateSubscriptionDetails}
          onCreateSubscription={handleCreateSubscription}
          onUpdateIptvCredentials={handleUpdateIptvCredentials}
          onUpdateSubscriptionStatus={handleUpdateStatus}
          onManualPasswordUpdate={handleManualPasswordUpdate}
          onSendPasswordReset={handleSendPasswordReset}
          userLogs={userLogs}
          loadingLogs={loadingLogs}
          userInvoices={userInvoices}
          loadingInvoices={loadingInvoices}
          availablePlans={availablePlans}
        />
      )}

      {/* Create User Modal */}
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa los datos para registrar un nuevo cliente manualmente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-firstname">Nombre</Label>
                <Input
                  id="new-firstname"
                  value={createUserForm.first_name}
                  onChange={(e) => setCreateUserForm({ ...createUserForm, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lastname">Apellido</Label>
                <Input
                  id="new-lastname"
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
    </div>
  )
}
