// EJEMPLO: Cómo usar el hook optimizado

// ============================================
// ANTES (Múltiples hooks - Lento)
// ============================================
import { useProfile } from "@/hooks/use-profile"
import { useSubscription } from "@/hooks/use-subscription"
import { useCredentials } from "@/hooks/use-credentials"
import { useSettings } from "@/hooks/use-settings"

export function DashboardHomeOld() {
    const { profile, loading: loadingProfile } = useProfile()
    const { subscription, loading: loadingSubscription } = useSubscription()
    const { credentials, loading: loadingCredentials } = useCredentials()
    const { settings, loading: loadingSettings } = useSettings()

    // Tiene que esperar a que TODOS terminen
    const loading = loadingProfile || loadingSubscription || loadingCredentials || loadingSettings

    if (loading) return <div>Cargando...</div>

    return (
        <div>
            <h1>Bienvenido {profile?.first_name}</h1>
            <p>Plan: {subscription?.plan_name}</p>
            <p>Usuario IPTV: {credentials?.username}</p>
        </div>
    )
}

// ============================================
// DESPUÉS (Un solo hook - Rápido)
// ============================================
import { useDashboardData } from "@/hooks/use-dashboard-data"

export function DashboardHomeNew() {
    const { profile, subscription, credentials, settings, loading, refetch } = useDashboardData()

    if (loading) return <div>Cargando...</div>

    return (
        <div>
            <h1>Bienvenido {profile?.first_name}</h1>
            <p>Plan: {subscription?.plan_name}</p>
            <p>Usuario IPTV: {credentials?.username}</p>

            {/* Cuando actualizas algo, invalida el caché */}
            <button onClick={async () => {
                await updateSomething()
                refetch() // Actualiza todos los datos
            }}>
                Actualizar
            </button>
        </div>
    )
}

// ============================================
// VENTAJAS
// ============================================
// 1. Una sola consulta en lugar de 4
// 2. Consultas en paralelo (más rápido)
// 3. Caché automático (navegación instantánea)
// 4. Menos código
// 5. Más fácil de mantener
