import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, RefreshCw, Filter } from 'lucide-react'
import { Plan } from './types'

interface UsersFiltersProps {
    searchTerm: string
    setSearchTerm: (term: string) => void
    statusFilter: string
    setStatusFilter: (status: string) => void
    planFilter: string
    setPlanFilter: (plan: string) => void
    availablePlans: Plan[]
    onRefresh: () => void
    onCreateUser: () => void
}

export function UsersFilters({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    availablePlans,
    onRefresh,
    onCreateUser
}: UsersFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex flex-1 w-full md:w-auto gap-2">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, email o whatsapp..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" onClick={onRefresh} title="Recargar">
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Estado" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                        <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Plan" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los planes</SelectItem>
                        {availablePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.name}>
                                {plan.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={onCreateUser} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                </Button>
            </div>
        </div>
    )
}
