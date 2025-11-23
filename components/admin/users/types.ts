export interface UserLog {
    id: string
    action: string
    details: any
    created_at: string
    admin_id: string | null
}

export interface Invoice {
    id: string
    user_id: string
    amount: number
    status: string
    invoice_date: string
    due_date: string
    description?: string
    created_at: string
}

export interface UserProfile {
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
        server_url?: string
        mac_address?: string
    } | null
}

export interface Plan {
    id: string
    name: string
    price: number
}

export interface NotificationBatch {
    id: string
    title: string
    message: string
    type: string
    target_count: number
    created_at: string
}
