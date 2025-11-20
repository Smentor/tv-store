import { createClient } from "@supabase/supabase-js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local')
console.log("Loading env from:", envPath)

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '')
        }
    })
} else {
    console.error("No .env.local found")
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
    console.log("Checking subscriptions table schema...")
    const { data, error } = await supabase.from('subscriptions').select('*').limit(1)

    if (error) {
        console.error("Error fetching subscriptions:", error)
        return
    }

    if (data && data.length > 0) {
        console.log("Columns found in subscriptions table:")
        console.log(Object.keys(data[0]))
    } else {
        console.log("No subscriptions found to infer schema.")
        // Try to insert a dummy record to provoke an error that might reveal columns, or just list known columns
        console.log("Trying to insert dummy to check columns...")
        const { error: insertError } = await supabase.from('subscriptions').insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            plan_id: '00000000-0000-0000-0000-000000000000',
            price: 0
        })
        if (insertError) {
            console.log("Insert error (expected):", insertError.message)
            // Sometimes error messages list valid columns
        }
    }
}

checkSchema()
