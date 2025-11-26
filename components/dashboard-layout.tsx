"use client"

import type React from "react"
import { Home, Tv, FileText, Key, Settings, Menu, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
  currentView: string
  setCurrentView: (view: string) => void
}

export function DashboardLayout({ children, currentView, setCurrentView }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "plans", label: "Planes", icon: Tv },
    { id: "billing", label: "Facturación", icon: FileText },
    { id: "credentials", label: "Credenciales", icon: Key },
    { id: "settings", label: "Configuración", icon: Settings },
    { id: "support", label: "Soporte", icon: HelpCircle },
  ]

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = currentView === item.id
        return (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id)
              setOpen(false)
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Mobile Menu Trigger */}
      <div className="md:hidden flex items-center mb-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <SheetTitle className="text-lg font-bold mb-4">Menú</SheetTitle>
            <SheetDescription className="sr-only">Navegación del dashboard</SheetDescription>
            <NavContent />
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-lg">Menú</span>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col gap-2 sticky top-24 h-fit">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">{children}</main>
    </div>
  )
}
