"use client"

import type React from "react"
import { Home, Tv, FileText, Key, Settings } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentView: string
  setCurrentView: (view: string) => void
}

export function DashboardLayout({ children, currentView, setCurrentView }: DashboardLayoutProps) {
  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "plans", label: "Planes", icon: Tv },
    { id: "billing", label: "Facturación", icon: FileText },
    { id: "credentials", label: "Credenciales", icon: Key },
    { id: "settings", label: "Configuración", icon: Settings },
  ]

  return (
    <div className="flex gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex flex-col gap-2 sticky top-8 h-fit">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
