"use client"

import { useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  created_at: string
  read: boolean
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setNotifications(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to new notifications
    const supabase = createBrowserClient()
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `read=eq.false`
        },
        (payload) => {
          // Refresh notifications when a new one arrives
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id))

    const supabase = createBrowserClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900"
      case 'warning': return "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-900"
      case 'error': return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900"
      default: return "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900"
    }
  }

  if (loading || notifications.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative flex items-start gap-4 p-4 rounded-lg border ${getStyles(notification.type)} shadow-sm transition-all animate-in fade-in slide-in-from-top-2`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 mr-6">
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => markAsRead(notification.id)}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  )
}
