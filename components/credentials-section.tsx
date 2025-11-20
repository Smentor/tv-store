"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react"
import { useCredentials } from "@/hooks/use-credentials"

export function CredentialsSection() {
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const { credentials, loading } = useCredentials()

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando credenciales...</div>
  }

  if (!credentials) {
    return <div className="text-center py-8">No hay credenciales disponibles</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Credenciales de Acceso</h2>
        <p className="text-muted-foreground">Usa estas credenciales para acceder a MaxPlayer IPTV</p>
      </div>

      <Card className="p-4 border-orange-300 bg-orange-50 dark:bg-orange-900/20">
        <p className="text-sm text-orange-900 dark:text-orange-300">
          Mantén tus credenciales confidenciales. No las compartas con terceros.
        </p>
      </Card>

      <div className="space-y-4">
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Usuario</p>
            <button
              onClick={() => handleCopy(credentials.username, "username")}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-lg font-semibold text-foreground break-all">{credentials.username}</p>
          {copied === "username" && <p className="text-xs text-green-600 mt-2">Copiado</p>}
        </Card>

        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Contraseña</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleCopy(credentials.password, "password")}
                className="text-accent hover:text-accent/80 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="font-mono text-lg font-semibold text-foreground break-all">
            {showPassword ? credentials.password : "••••••••••••••"}
          </p>
          {copied === "password" && <p className="text-xs text-green-600 mt-2">Copiado</p>}
        </Card>

        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Dirección MAC</p>
            <button
              onClick={() => handleCopy(credentials.mac_address, "mac")}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-lg font-semibold text-foreground break-all">{credentials.mac_address}</p>
          {copied === "mac" && <p className="text-xs text-green-600 mt-2">Copiado</p>}
        </Card>

        <Card className="p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Código Revendedor</p>
            <button
              onClick={() => handleCopy(credentials.reseller_code, "reseller")}
              className="text-accent hover:text-accent/80 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="font-mono text-lg font-semibold text-foreground break-all">{credentials.reseller_code}</p>
          {copied === "reseller" && <p className="text-xs text-green-600 mt-2">Copiado</p>}
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Opciones de Seguridad</h3>
        <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Cambiar contraseña
        </Button>
        <Button variant="outline" className="w-full bg-transparent">
          Historial de conexiones
        </Button>
      </div>
    </div>
  )
}
