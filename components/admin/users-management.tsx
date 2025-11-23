'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Search, MoreHorizontal, User, Bell, RefreshCw, CheckSquare, Square, Trash2, AlertTriangle, Tag, Plus, Calendar, History, CreditCard, XCircle, Phone, DollarSign, Shield } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteUsers, createUser, updateUserPassword, createSubscription } from '@/app/actions/admin-actions'
import { UserDetailsModal } from './users/user-details-modal'
import { UserProfile, Plan, UserLog, Invoice, NotificationBatch } from './users/types'
import { getStatusColor, getStatusLabel } from '@/lib/utils/subscription'

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
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
    loadUsers()
    loadAvailablePlans()
    loadNotificationBatches()
  }, [])

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

  const loadUsers = async () => {
    const supabase = createBrowserClient()

    // 1. Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar usuarios',
        description: profilesError.message,
      })
      setLoading(false)
      return
    }

    // 2. Fetch subscriptions and credentials for all users
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')

    const { data: credentials } = await supabase
      .from('credentials')
      .select('*')

    // 3. Merge data
    const mergedUsers = profiles.map(profile => ({
      ...profile,
      subscription: subscriptions?.find(sub => sub.user_id === profile.id) || null,
      credentials: credentials?.find(cred => cred.user_id === profile.id) || null
    }))

    setUsers(mergedUsers)
    setLoading(false)
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

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.whatsapp || '').includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || user.subscription?.status === statusFilter
    const matchesPlan = planFilter === 'all' || user.subscription?.plan_name === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleViewDetails = (user: UserProfile) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)

    loadUserLogs(user.id)
    loadUserInvoices(user.id)
  }

  const handleUpdateProfile = async (userId: string, data: { first_name: string; last_name: string; email: string; whatsapp: string }) => {
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
        title: 'Perfil actualizado',
        description: 'Los datos del usuario han sido actualizados correctamente.',
      })
      loadUsers()
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

    if (!createUserForm.email || !createUserForm.password) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor ingresa email y contraseña.',
      })
      return
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
      loadUsers()
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
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))

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
      toast({ title: 'Suscripción creada exitosamente' })
      loadUsers()
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
      // Actualizar estado local
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, credentials: { ...u.credentials!, username: data.username, password: data.password } }
          : u
      ))

      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, credentials: { ...selectedUser.credentials!, username: data.username, password: data.password } })
      }

      logAction(userId, 'update_credentials', {
        previous_username: oldUsername,
        new_username: data.username
      })
    }
    setIsSubmitting(false)
  }

  const handleUpdateStatus = async (userId: string, status: string) => {
    setIsSubmitting(true)
    const supabase = createBrowserClient()

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

      // Update local state
      setUsers(users.map(u =>
        u.id === userId && u.subscription
          ? { ...u, subscription: { ...u.subscription, status: status } }
          : u
      ))

      if (selectedUser && selectedUser.id === userId && selectedUser.subscription) {
        setSelectedUser({ ...selectedUser, subscription: { ...selectedUser.subscription, status: status } })
      }

      logAction(userId, 'update_status', { status })
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
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)))
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
      loadUsers() // Reload to show changes
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
      loadUsers() // Reload to show changes
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
      toast({ variant: 'success', title: 'Fechas actualizadas', description: `Se actualizó la fecha de facturación de ${selectedIds.size} usuarios` })
      setIsBulkDateOpen(false)
      setSelectedIds(new Set())
      loadUsers() // Reload to show changes
      // Log action for each user
      Array.from(selectedIds).forEach(userId => {
        logAction(userId, 'update_billing_date', {
          previous: 'N/A', // difficult to get previous for bulk
          new: newDate.toISOString()
        })
      })
    }
    setIsSubmitting(false)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsSubmitting(true)

    const result = await deleteUsers(Array.from(selectedIds))

    if (!result.success) {
      toast({ variant: 'destructive', title: 'Error', description: result.error })
    } else {
      toast({ variant: 'success', title: 'Usuarios eliminados', description: `Se eliminaron ${selectedIds.size} usuarios permanentemente` })
      setIsBulkDeleteOpen(false)
      setSelectedIds(new Set())
      loadUsers()
      // Log action for each user
      Array.from(selectedIds).forEach(userId => {
        logAction(userId, 'bulk_delete', {})
      })
    }
    setIsSubmitting(false)
  }

  const handleDeleteBatch = async (batchId: string) => {
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('notification_batches')
      .delete()
      .eq('id', batchId)

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el envío' })
    } else {
      toast({ variant: 'success', title: 'Eliminado', description: 'Se eliminaron las notificaciones enviadas' })
      loadNotificationBatches()
      await logAction('system', 'delete_notification_batch', { batch_id: batchId })
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">Administra tus clientes y suscripciones</p>
        </div>
        <Button variant="outline" onClick={() => setShowBatches(!showBatches)}>
          <History className="mr-2 h-4 w-4" />
          {showBatches ? 'Ver Usuarios' : 'Historial de Envíos'}
        </Button>
      </div>

      {showBatches ? (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Notificaciones Masivas</CardTitle>
            <CardDescription>Gestiona los envíos realizados. Eliminar un envío borrará las notificaciones de los usuarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationBatches.map(batch => (
                  <TableRow key={batch.id}>
                    <TableCell>{format(new Date(batch.created_at), 'PPP p', { locale: es })}</TableCell>
                    <TableCell className="font-medium">{batch.title}</TableCell>
                    <TableCell className="max-w-md truncate">{batch.message}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{batch.target_count} usuarios</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBatch(batch.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Eliminar / Cancelar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {notificationBatches.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay envíos masivos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-none shadow-md">
            <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-primary/30 focus-visible:ring-primary bg-background shadow-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2 w-full sm:w-auto">
                  <User className="h-4 w-4" />
                  Agregar Usuario
                </Button>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-background">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los planes</SelectItem>
                    {availablePlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {
              selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border shadow-xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
                  <span className="text-sm font-medium flex items-center gap-2 border-r pr-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {selectedIds.size}
                    </div>
                    seleccionados
                  </span>
                  <div className="flex gap-2 items-center">
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkPlanOpen(true)} title="Cambiar Plan">
                      <CreditCard className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkStatusOpen(true)} title="Cambiar Estado">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkDateOpen(true)} title="Cambiar Fecha">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsBulkNotifyOpen(true)} title="Enviar Notificación">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsBulkDeleteOpen(true)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            }

            < CardContent className="p-0" >
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[1000px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-[50px] pl-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                            onCheckedChange={toggleSelectAll}
                            className="h-5 w-5 scale-125 border-2 border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-all"
                          />
                        </div>
                      </TableHead>
                      <TableHead className="w-[20%]">Usuario</TableHead>
                      <TableHead className="w-[15%]">Contacto</TableHead>
                      <TableHead className="w-[12%]">Plan Actual</TableHead>
                      <TableHead className="w-[12%]">Costo</TableHead>
                      <TableHead className="w-[12%]">Próximo Pago</TableHead>
                      <TableHead className="w-[10%]">Estado</TableHead>
                      <TableHead className="w-[14%]">Registro</TableHead>
                      <TableHead className="text-right w-[5%]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <User className="h-8 w-8 opacity-20" />
                            <p>No se encontraron usuarios con los filtros seleccionados</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className={`hover: bg - muted / 50 transition - colors cursor - pointer ${selectedIds.has(user.id) ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'} `}
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('[role="checkbox"]')) return;
                            toggleSelect(user.id);
                          }}
                        >
                          <TableCell className="pl-4 py-4">
                            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIds.has(user.id)}
                                onCheckedChange={() => toggleSelect(user.id)}
                                className="h-5 w-5 scale-125 border-2 border-muted-foreground/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary transition-all"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col max-w-[200px]">
                              <span className="font-medium truncate" title={`${user.first_name || ''} ${user.last_name || ''} `.trim()}>{`${user.first_name || ''} ${user.last_name || ''} `.trim() || 'Sin nombre'}</span>
                              <span className="text-xs text-muted-foreground truncate" title={user.email || ''}>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              {user.whatsapp ? (
                                <>
                                  <Phone className="h-3 w-3 text-green-500 shrink-0" />
                                  <span className="truncate">{user.whatsapp}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <Badge variant="outline" className="font-normal bg-background">
                                {user.subscription.plan_name}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin suscripción</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.subscription ? (
                              <div className="flex items-center gap-1 font-semibold text-primary">
                                <DollarSign className="h-3 w-3" />
                                {user.subscription.price.toFixed(2)}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.subscription?.next_billing_date ? (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(user.subscription.next_billing_date), 'dd/MM/yyyy')}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.subscription?.status)}>
                              {getStatusLabel(user.subscription?.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: es })}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                  <User className="mr-2 h-4 w-4" /> Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Shield className="mr-2 h-4 w-4" /> Suspender Cuenta
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
            </CardContent >
          </Card >
        </>
      )}

      <Dialog open={isBulkNotifyOpen} onOpenChange={setIsBulkNotifyOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar Notificación Masiva</DialogTitle>
            <DialogDescription>
              Se enviará a {selectedIds.size} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ej: Mantenimiento programado"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={notificationForm.type}
                onValueChange={(val) => setNotificationForm({ ...notificationForm, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea
                placeholder="Escribe el mensaje para los usuarios..."
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkNotifyOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkNotify} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar a Todos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkPlanOpen} onOpenChange={setIsBulkPlanOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cambiar Plan Masivamente</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo plan para los {selectedIds.size} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Plan</Label>
              <Select value={bulkPlan} onValueChange={setBulkPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkPlanOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangePlan} disabled={isSubmitting || !bulkPlan}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Planes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cambiar Estado Masivamente</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo estado para los {selectedIds.size} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkStatusOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangeStatus} disabled={isSubmitting || !bulkStatus}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Estados'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDateOpen} onOpenChange={setIsBulkDateOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cambiar Fecha de Facturación Masivamente</DialogTitle>
            <DialogDescription>
              Selecciona la nueva fecha de facturación para los {selectedIds.size} usuarios seleccionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nueva Fecha</Label>
              <Input
                type="date"
                value={bulkDate}
                onChange={(e) => setBulkDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDateOpen(false)}>Cancelar</Button>
            <Button onClick={handleBulkChangeDate} disabled={isSubmitting || !bulkDate}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Fechas'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Eliminar Usuarios
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a los {selectedIds.size} usuarios seleccionados? Esta acción es irreversible y eliminará todos sus datos, suscripciones y credenciales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar Usuarios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        availablePlans={availablePlans}
        onUpdateProfile={handleUpdateProfile}
        onUpdateIptvCredentials={handleUpdateIptvCredentials}
        onUpdateSubscriptionDetails={handleUpdateSubscriptionDetails}
        onUpdateSubscriptionStatus={handleUpdateStatus}
        onCreateSubscription={handleCreateSubscription}
        onManualPasswordUpdate={handleManualPasswordUpdate}
        onSendPasswordReset={handleSendPasswordReset}
        userLogs={userLogs}
        userInvoices={userInvoices}
        loadingLogs={loadingLogs}
        loadingInvoices={loadingInvoices}
      />
      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Crea un nuevo usuario manualmente. Se creará la cuenta de acceso y opcionalmente la suscripción.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Credenciales de Acceso (Obligatorio)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Contraseña <span className="text-red-500">*</span></Label>
                  <Input
                    id="new-password"
                    type="text"
                    placeholder="Contraseña segura"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Mínimo 6 caracteres</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Información Personal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-firstname">Nombre</Label>
                  <Input
                    id="new-firstname"
                    placeholder="Juan"
                    value={createUserForm.first_name}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-lastname">Apellido</Label>
                  <Input
                    id="new-lastname"
                    placeholder="Pérez"
                    value={createUserForm.last_name}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-whatsapp">WhatsApp</Label>
                  <Input
                    id="new-whatsapp"
                    placeholder="+593..."
                    value={createUserForm.whatsapp}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Suscripción Inicial (Opcional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select
                    value={createUserForm.plan_id}
                    onValueChange={(val) => {
                      const plan = availablePlans.find(p => p.id === val)
                      setCreateUserForm({
                        ...createUserForm,
                        plan_id: val,
                        price: plan ? plan.price.toString() : ''
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name} - ${plan.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-price">Precio Acordado</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-price"
                      className="pl-9"
                      placeholder="0.00"
                      value={createUserForm.price}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, price: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Credenciales IPTV (Opcional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-iptv-user">Usuario IPTV</Label>
                  <Input
                    id="new-iptv-user"
                    placeholder="user123"
                    value={createUserForm.iptv_username}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, iptv_username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-iptv-pass">Contraseña IPTV</Label>
                  <Input
                    id="new-iptv-pass"
                    placeholder="pass123"
                    value={createUserForm.iptv_password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, iptv_password: e.target.value })}
                  />
                </div>
              </div>
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
    </div>
  )
}
