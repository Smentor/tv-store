/**
 * Utility functions for subscription status handling
 */

export function getStatusColor(status?: string): string {
    switch (status) {
        case 'active':
            return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
        case 'inactive':
            return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
        case 'cancelled':
            return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
        default:
            return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
}

export function getStatusLabel(status?: string): string {
    switch (status) {
        case 'active':
            return 'Activo'
        case 'inactive':
            return 'Inactivo'
        case 'cancelled':
            return 'Cancelado'
        default:
            return 'Sin Plan'
    }
}
