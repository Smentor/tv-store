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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBrowserClient } from '@/lib/supabase/client'
import { Search, MoreHorizontal, User, Mail, Phone, Tv, Shield, Calendar, CreditCard, Key, Wifi, Bell, Send, Lock, RefreshCw, DollarSign, CheckSquare, Square, Trash2, History, XCircle, AlertTriangle, FileText, Save, Tag } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteUsers } from '@/app/actions/admin-actions'

interface UserLog {
  id: string
  action: string
  details: any
  created_at: string
  admin_id: string | null
}

interface Invoice {
  id: string
  user_id: string
  amount: number
  status: string
  invoice_date: string
  due_date: string
  description?: string
  created_at: string
}

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  whatsapp: string | null
  role: string
  created_at: string
  subscription?: {
    id: string
    plan_name: string
    status: string
    price: number
    next_billing_date: string
    plan_id: string
  } | null
  credentials?: {
    username: string
    password: string
    reseller_code: string
  } | null
}

interface NotificationBatch {
  id: string
  title: string
  message: string
  type: string
  target_count: string
  created_at: string
}

interface Plan {
  id: string
  name: string
  price: number
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])

  // Estados para formularios
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '', whatsapp: '' })
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', type: 'info' })
  const [iptvForm, setIptvForm] = useState({ username: '', password: '' })
  const [priceForm, setPriceForm] = useState({ price: '' })
  const [billingDateForm, setBillingDateForm] = useState({ date: '' })
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
  const [planForm, setPlanForm] = useState({ plan_name: '' })

  const [userLogs, setUserLogs] = useState<UserLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [userInvoices, setUserInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)

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
    setPriceForm({
      price: user.subscription?.price?.toString() || ''
    })
    setPlanForm({
      plan_name: user.subscription?.plan_name || ''
    })
    setBillingDateForm({
      date: user.subscription?.next_billing_date ? format(new Date(user.subscription.next_billing_date), 'yyyy-MM-dd') : ''
    })
    setIsDetailsOpen(true)
    setActiveTab('details')
    loadUserLogs(user.id)
    loadUserInvoices(user.id)
  }

  const handleUpdateProfile = async () => {
    if (!selectedUser?.id) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const updates = {
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      email: profileForm.email,
      whatsapp: profileForm.whatsapp,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', selectedUser.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar perfil',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Perfil actualizado',
        description: 'La información del cliente ha sido actualizada'
      })

      await logAction(selectedUser.id, 'update_profile', {
        previous: {
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          email: selectedUser.email,
          whatsapp: selectedUser.whatsapp
        },
        new: updates
      })

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, ...updates }
          : u
      ))
      setSelectedUser(prev => prev ? { ...prev, ...updates } : prev)
    }
    setIsSubmitting(false)
  }

  const handleUpdateBillingDate = async () => {
    if (!selectedUser?.subscription?.id || !billingDateForm.date) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    // Create a date object and set to end of day or keep as is, usually billing is just the date
    // We'll use the date string and let it be 00:00 UTC or local depending on browser, 
    // but to be safe let's append a time or just use ISO string of the date
    const newDate = new Date(billingDateForm.date)

    const oldDate = selectedUser.subscription.next_billing_date

    const { error } = await supabase
      .from('subscriptions')
      .update({
        next_billing_date: newDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.subscription.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar fecha',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Fecha actualizada',
        description: `La fecha de facturación se actualizó a ${format(newDate, 'PPP', { locale: es })}`
      })

      await logAction(selectedUser.id, 'update_billing_date', {
        previous: oldDate,
        new: newDate.toISOString()
      })

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id && u.subscription
          ? { ...u, subscription: { ...u.subscription, next_billing_date: newDate.toISOString() } }
          : u
      ))

      setSelectedUser(prev => prev && prev.subscription ? {
        ...prev,
        subscription: { ...prev.subscription, next_billing_date: newDate.toISOString() }
      } : prev)
    }
    setIsSubmitting(false)
  }

  const handleUpdatePrice = async () => {
    if (!selectedUser?.subscription?.id) return

    const newPrice = parseFloat(priceForm.price)
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        variant: 'destructive',
        title: 'Precio inválido',
        description: 'Ingresa un precio válido mayor o igual a 0'
      })
      return
    }

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const oldPrice = selectedUser.subscription.price

    const { error } = await supabase
      .from('subscriptions')
      .update({
        price: newPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.subscription.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Precio actualizado',
        description: `El precio de suscripción se actualizó a $${newPrice.toFixed(2)}`
      })
      // Actualizar estado local
      setUsers(users.map(u =>
        u.id === selectedUser.id && u.subscription
          ? { ...u, subscription: { ...u.subscription, price: newPrice } }
          : u
      ))
      setSelectedUser(prev => prev && prev.subscription ? {
        ...prev,
        subscription: { ...prev.subscription, price: newPrice }
      } : prev)

      await logAction(selectedUser.id, 'update_price', {
        previous: oldPrice,
        new: newPrice
      })

    }
    setIsSubmitting(false)
  }

  const handleUpdatePlan = async () => {
    if (!selectedUser?.subscription?.id || !planForm.plan_name) return

    const selectedPlan = availablePlans.find(p => p.name === planForm.plan_name)
    if (!selectedPlan) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const oldPlan = selectedUser.subscription.plan_name

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_name: selectedPlan.name,
        plan_id: selectedPlan.id,
        price: selectedPlan.price, // Update price to match new plan
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.subscription.id)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar plan',
        description: error.message
      })
    } else {
      toast({
        variant: 'success',
        title: 'Plan actualizado',
        description: `El plan se actualizó a ${selectedPlan.name}`
      })

      // Update local state
      const newPrice = selectedPlan.price
      setPriceForm({ price: newPrice.toString() })

      setUsers(users.map(u =>
        u.id === selectedUser.id && u.subscription
          ? {
            ...u,
            subscription: {
              ...u.subscription,
              plan_name: selectedPlan.name,
              price: newPrice
            }
          }
          : u
      ))

      setSelectedUser(prev => prev && prev.subscription ? {
        ...prev,
        subscription: {
          ...prev.subscription,
          plan_name: selectedPlan.name,
          price: newPrice
        }
      } : prev)

      await logAction(selectedUser.id, 'change_plan', {
        previous: oldPlan,
        new: selectedPlan.name
      })
    }
    setIsSubmitting(false)
  }

  const handleSendPasswordReset = async () => {
    if (!selectedUser?.email) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(selectedUser.email, {
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
        description: `Se ha enviado un correo de restablecimiento a ${selectedUser.email}`
      })
      await logAction(selectedUser.id, 'send_password_reset', {})
    }
    setIsSubmitting(false)
  }

  const handleUpdateIptvCredentials = async () => {
    if (!selectedUser?.id) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const oldUsername = selectedUser.credentials?.username

    const { error } = await supabase
      .from('credentials')
      .update({
        username: iptvForm.username,
        password: iptvForm.password,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', selectedUser.id)

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
        u.id === selectedUser.id
          ? { ...u, credentials: { ...u.credentials!, username: iptvForm.username, password: iptvForm.password } }
          : u
      ))

      await logAction(selectedUser.id, 'update_credentials', {
        previous_username: oldUsername,
        new_username: iptvForm.username
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'inactive': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'inactive': return 'Inactivo'
      case 'cancelled': return 'Cancelado'
      default: return 'Sin Plan'
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedUser?.subscription?.id) return

    setIsSubmitting(true)
    const supabase = createBrowserClient()

    const oldStatus = selectedUser.subscription.status

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedUser.subscription.id)

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
        description: `El estado se actualizó a ${getStatusLabel(newStatus)}`
      })

      await logAction(selectedUser.id, 'change_status', {
        previous: oldStatus,
        new: newStatus
      })

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id && u.subscription
          ? { ...u, subscription: { ...u.subscription, status: newStatus } }
          : u
      ))

      setSelectedUser(prev => prev && prev.subscription ? {
        ...prev,
        subscription: { ...prev.subscription, status: newStatus }
      } : prev)
    }
    setIsSubmitting(false)
  }

  const formatLogDetails = (action: string, details: any) => {
    try {
      switch (action) {
        case 'update_profile':
          return 'Actualizó información personal'
        case 'change_plan':
          return `Cambió plan de ${details.previous} a ${details.new}`
        case 'change_status':
          return `Cambió estado de ${getStatusLabel(details.previous)} a ${getStatusLabel(details.new)}`
        case 'update_price':
          return `Actualizó precio de $${details.previous} a $${details.new}`
        case 'update_billing_date':
          return `Cambió fecha de facturación`
        case 'update_credentials':
          return `Actualizó credenciales IPTV (Usuario: ${details.new_username})`
        case 'send_notification':
          return `Envió notificación: ${details.title}`
        case 'send_password_reset':
          return 'Envió correo de restablecimiento de contraseña'
        case 'receive_bulk_notification':
          return `Recibió notificación masiva (ID Lote: ${details.batch_id})`
        case 'bulk_delete':
          return 'Fue eliminado en un proceso masivo'
        case 'delete_notification_batch':
          return `Eliminó un lote de notificaciones (ID: ${details.batch_id})`
        default:
          return JSON.stringify(details)
      }
    } catch (e) {
      return 'Detalles no disponibles'
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

            {selectedIds.size > 0 && (
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
            )}

            <CardContent className="p-0">
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
                          className={`hover:bg-muted/50 transition-colors cursor-pointer ${selectedIds.has(user.id) ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}
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
                              <span className="font-medium truncate" title={`${user.first_name || ''} ${user.last_name || ''}`.trim()}>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Sin nombre'}</span>
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
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isBulkNotifyOpen} onOpenChange={setIsBulkNotifyOpen}>
        <DialogContent>
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
        <DialogContent>
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
        <DialogContent>
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
        <DialogContent>
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
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg sm:text-xl">Gestión de Cliente: {`${selectedUser?.first_name || ''} ${selectedUser?.last_name || ''}`.trim()}</DialogTitle>
            <DialogDescription>Administra la cuenta, servicios y comunicaciones</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-4 h-auto mx-6 mt-4">
                <TabsTrigger value="details" className="text-xs sm:text-sm py-2">Detalles</TabsTrigger>
                <TabsTrigger value="billing" className="text-xs sm:text-sm py-2">Facturación</TabsTrigger>
                <TabsTrigger value="communications" className="text-xs sm:text-sm py-2">Comunicación</TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm py-2">Historial</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto px-6 py-4 space-y-6 mt-0"
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <User className="h-4 w-4" /> Información Personal
                    </h3>
                    <Card className="bg-muted/30 h-full">
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
                            <Badge variant="outline" className="capitalize">{selectedUser.role}</Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Registro:</span>
                            <span className="font-medium">
                              {selectedUser.created_at ? format(new Date(selectedUser.created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Button onClick={handleUpdateProfile} disabled={isSubmitting} className="w-full" size="sm">
                            <Save className="mr-2 h-4 w-4" /> Guardar Información Personal
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Subscription Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <CreditCard className="h-4 w-4" /> Suscripción Actual
                    </h3>
                    <Card className="bg-muted/30 h-full">
                      <CardContent className="p-4 space-y-4">
                        {selectedUser.subscription ? (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Plan</Label>
                              <div className="flex gap-2">
                                <Select
                                  value={planForm.plan_name}
                                  onValueChange={(val) => setPlanForm({ plan_name: val })}
                                >
                                  <SelectTrigger className="h-9 flex-1 bg-background">
                                    <SelectValue placeholder="Seleccionar plan" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availablePlans.map(plan => (
                                      <SelectItem key={plan.id} value={plan.name}>{plan.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button size="sm" onClick={handleUpdatePlan} disabled={isSubmitting || planForm.plan_name === selectedUser.subscription.plan_name} className="h-9">
                                  Aplicar
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Precio Mensual</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={priceForm.price}
                                    onChange={(e) => setPriceForm({ price: e.target.value })}
                                    className="h-9 pl-7 bg-background"
                                  />
                                </div>
                                <Button size="sm" onClick={handleUpdatePrice} disabled={isSubmitting} className="h-9 px-4">
                                  Guardar
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Próximo Pago</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="date"
                                  value={billingDateForm.date}
                                  onChange={(e) => setBillingDateForm({ date: e.target.value })}
                                  className="h-9 flex-1 bg-background"
                                />
                                <Button size="sm" onClick={handleUpdateBillingDate} disabled={isSubmitting} className="h-9 px-4">
                                  Guardar
                                </Button>
                              </div>
                            </div>

                            <div className="pt-3 border-t space-y-2">
                              <Label className="text-sm font-medium">Estado de Suscripción</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant={selectedUser.subscription.status === 'active' ? 'default' : 'outline'}
                                  className={`h-8 flex-1 ${selectedUser.subscription.status === 'active' ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                                  onClick={() => handleUpdateStatus('active')}
                                  disabled={isSubmitting}
                                >
                                  Activo
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedUser.subscription.status === 'inactive' ? 'default' : 'outline'}
                                  className={`h-8 flex-1 ${selectedUser.subscription.status === 'inactive' ? 'bg-yellow-600 hover:bg-yellow-700' : 'text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}
                                  onClick={() => handleUpdateStatus('inactive')}
                                  disabled={isSubmitting}
                                >
                                  Inactivo
                                </Button>
                                <Button
                                  size="sm"
                                  variant={selectedUser.subscription.status === 'cancelled' ? 'default' : 'outline'}
                                  className={`h-8 flex-1 ${selectedUser.subscription.status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                                  onClick={() => handleUpdateStatus('cancelled')}
                                  disabled={isSubmitting}
                                >
                                  Cancelado
                                </Button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">El usuario no tiene una suscripción activa</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* IPTV Credentials */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <Tv className="h-4 w-4" /> Credenciales IPTV
                    </h3>
                    <Card className="bg-muted/30 h-full">
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
                          <Button onClick={handleUpdateIptvCredentials} disabled={isSubmitting} className="w-full" size="sm">
                            <Save className="mr-2 h-4 w-4" /> Actualizar Credenciales
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <Lock className="h-4 w-4" /> Seguridad de la Cuenta
                    </h3>
                    <Card className="bg-muted/30 h-full">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">Restablecer Contraseña</h4>
                            <p className="text-xs text-muted-foreground">
                              Envía correo para nueva contraseña.
                            </p>
                          </div>
                          <Button onClick={handleSendPasswordReset} disabled={isSubmitting} size="sm" variant="outline">
                            <Mail className="mr-2 h-3 w-3" /> Enviar
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
              </TabsContent>

              <TabsContent value="billing" className="space-y-4 py-4">
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
                          <div className="text-3xl font-bold text-green-900">
                            ${selectedUser.subscription?.price.toFixed(2) || '0.00'}
                          </div>
                          <p className="text-xs text-green-600 mt-1">por mes</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-blue-700 font-medium">Último Pago</span>
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-3xl font-bold text-blue-900">
                            ${userInvoices.length > 0 && userInvoices[0].status === 'paid' ? userInvoices[0].amount.toFixed(2) : '0.00'}
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            {userInvoices.length > 0 && userInvoices[0].status === 'paid'
                              ? format(new Date(userInvoices[0].created_at), 'dd/MM/yyyy', { locale: es })
                              : 'Sin pagos registrados'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Coupon/Promotion Info */}
                    {userInvoices.length > 0 && userInvoices[0].description && (
                      <Card className="border-orange-200 bg-orange-50/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Tag className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-orange-900 mb-1">Descuentos Aplicados</h4>
                              <p className="text-sm text-orange-700">{userInvoices[0].description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Invoices History */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <FileText className="h-4 w-4" /> Historial de Facturas
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        {loadingInvoices ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[120px]">Fecha</TableHead>
                                  <TableHead className="w-[100px]">Monto</TableHead>
                                  <TableHead className="w-[100px]">Estado</TableHead>
                                  <TableHead>Descripción</TableHead>
                                  <TableHead className="w-[120px]">Vencimiento</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {userInvoices.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                      <p className="text-sm">No hay facturas registradas</p>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  userInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                      <TableCell className="font-medium">
                                        {format(new Date(invoice.invoice_date || invoice.created_at), 'dd/MM/yyyy', { locale: es })}
                                      </TableCell>
                                      <TableCell className="font-bold text-green-600">
                                        ${invoice.amount.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            invoice.status === 'paid'
                                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                              : invoice.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                                                : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                          }
                                        >
                                          {invoice.status === 'paid' ? 'Pagado' : invoice.status === 'pending' ? 'Pendiente' : 'Fallido'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                        {invoice.description || 'Pago de suscripción'}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: es }) : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="flex-1 overflow-y-auto px-6 py-4 space-y-6 mt-0">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <FileText className="h-4 w-4" /> Historial de Facturas
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        {loadingInvoices ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[120px]">Fecha</TableHead>
                                  <TableHead className="w-[100px]">Monto</TableHead>
                                  <TableHead className="w-[100px]">Estado</TableHead>
                                  <TableHead>Descripción</TableHead>
                                  <TableHead className="w-[120px]">Vencimiento</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {userInvoices.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                      <p className="text-sm">No hay facturas registradas</p>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  userInvoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                      <TableCell className="font-medium">
                                        {format(new Date(invoice.invoice_date || invoice.created_at), 'dd/MM/yyyy', { locale: es })}
                                      </TableCell>
                                      <TableCell className="font-bold text-green-600">
                                        ${invoice.amount.toFixed(2)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={
                                            invoice.status === 'paid'
                                              ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                              : invoice.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'
                                                : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                          }
                                        >
                                          {invoice.status === 'paid' ? 'Pagado' : invoice.status === 'pending' ? 'Pendiente' : 'Fallido'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                                        {invoice.description || 'Pago de suscripción'}
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: es }) : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="communications" className="flex-1 overflow-y-auto px-6 py-4 space-y-4 mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <Bell className="h-4 w-4" /> Enviar Notificación al Dashboard
                    </h3>
                    <Card>
                      <CardContent className="p-6 space-y-4">
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
                            placeholder="Escribe el mensaje para el usuario..."
                            value={notificationForm.message}
                            onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                          />
                        </div>
                        <Button className="w-full" onClick={handleSendNotification} disabled={isSubmitting}>
                          <Send className="mr-2 h-4 w-4" /> Enviar Notificación
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                      <Mail className="h-4 w-4" /> Enviar Correo Electrónico
                    </h3>
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Asunto</Label>
                          <Input placeholder="Ej: Importante sobre tu cuenta" />
                        </div>
                        <div className="space-y-2">
                          <Label>Contenido</Label>
                          <Textarea
                            placeholder="Escribe el contenido del correo..."
                            className="min-h-[120px]"
                          />
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleSendEmail} disabled={isSubmitting}>
                          <Mail className="mr-2 h-4 w-4" /> Enviar Email
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 overflow-y-auto px-6 py-4 space-y-4 mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
                    <History className="h-4 w-4" /> Registro de Cambios
                  </h3>
                  <Card>
                    <CardContent className="p-0">
                      {loadingLogs ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="whitespace-nowrap">Fecha</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Detalles</TableHead>
                                <TableHead>Admin</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No hay registros de cambios para este usuario
                                  </TableCell>
                                </TableRow>
                              ) : (
                                userLogs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell className="whitespace-nowrap text-sm">
                                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="capitalize text-xs">
                                        {log.action.replace(/_/g, ' ')}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px]">
                                      <div className="text-sm break-words" title={JSON.stringify(log.details)}>
                                        {formatLogDetails(log.action, log.details)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                      {log.admin_id ? 'Admin' : 'Sistema'}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div >
  )
}
