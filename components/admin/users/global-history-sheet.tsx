import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogItem } from "./log-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, History } from "lucide-react"

interface GlobalHistorySheetProps {
    isOpen: boolean
    onClose: () => void
    userIds?: string[]
}

interface GlobalLog {
    id: string
    action: string
    details: any
    created_at: string
    admin_id: string | null
    user_id: string | null
    user?: {
        email: string
        first_name: string
        last_name: string
    }
    admin?: {
        email: string
    }
}

export function GlobalHistorySheet({ isOpen, onClose, userIds = [] }: GlobalHistorySheetProps) {
    const [logs, setLogs] = useState<GlobalLog[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchGlobalLogs()
        }
    }, [isOpen, userIds])

    const fetchGlobalLogs = async () => {
        setLoading(true)
        const supabase = createClient()

        // 1. Fetch raw logs
        let query = supabase
            .from('user_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)

        // Filter by specific users if provided
        if (userIds && userIds.length > 0) {
            query = query.in('user_id', userIds)
        }

        const { data: logsData, error: logsError } = await query

        if (logsError) {
            console.error('Error fetching logs:', logsError)
            setLoading(false)
            return
        }

        if (!logsData || logsData.length === 0) {
            setLogs([])
            setLoading(false)
            return
        }

        // 2. Extract unique user IDs (both user_id and admin_id)
        const uniqueUserIds = new Set<string>()
        logsData.forEach(log => {
            if (log.user_id) uniqueUserIds.add(log.user_id)
            if (log.admin_id) uniqueUserIds.add(log.admin_id)
        })

        // 3. Fetch profiles for these IDs
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .in('id', Array.from(uniqueUserIds))

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
        }

        // 4. Map profiles to logs
        const profilesMap = new Map()
        if (profilesData) {
            profilesData.forEach(profile => {
                profilesMap.set(profile.id, profile)
            })
        }

        const enrichedLogs = logsData.map(log => ({
            ...log,
            user: log.user_id ? profilesMap.get(log.user_id) : undefined,
            admin: log.admin_id ? profilesMap.get(log.admin_id) : undefined
        }))

        setLogs(enrichedLogs as any)
        setLoading(false)
    }

    const title = userIds && userIds.length > 0
        ? `Historial de Selección (${userIds.length} usuarios)`
        : "Historial Global del Sistema"

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl flex flex-col h-full">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {title}
                    </SheetTitle>
                    <SheetDescription>
                        Registro de acciones realizadas
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-8 pl-4 border-l-2 border-muted ml-2 py-4">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative group">
                                        {/* User Context Header */}
                                        <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-muted border-2 border-background group-hover:bg-primary transition-colors" />

                                        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs bg-muted/30 p-2 rounded-md">
                                            <div className="font-medium text-foreground">
                                                Usuario: <span className="text-muted-foreground">{log.user?.email || 'Sistema'}</span>
                                            </div>
                                            {log.admin && (
                                                <div className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                                                    <span>Admin: {log.admin.email}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pl-2">
                                            <LogItem log={log} />
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No hay registros disponibles
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
