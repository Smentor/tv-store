import { createClient } from "@supabase/supabase-js"

// Verificar variables de entorno
console.log("\n========== VERIFICACIÓN DE SUPABASE ==========\n")

const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

let allEnvVarsPresent = true
const envVars = {}

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (!value) {
    console.log(`❌ ${envVar}: NO CONFIGURADA`)
    allEnvVarsPresent = false
  } else {
    const masked = value.substring(0, 10) + "..."
    console.log(`✅ ${envVar}: ${masked}`)
    envVars[envVar] = value
  }
}

if (!allEnvVarsPresent) {
  console.log("\n❌ ERROR: Falta configurar variables de entorno")
  process.exit(1)
}

console.log("\n========== PRUEBAS DE CONEXIÓN ==========\n")

// Crear cliente Supabase
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// Test 1: Verificar conexión básica
try {
  console.log("Verificando conexión con Supabase...")
  const { data, error } = await supabase.from("profiles").select("count", { count: "exact" }).limit(1)

  if (error) {
    console.log(`❌ Error de conexión: ${error.message}`)
  } else {
    console.log(`✅ Conexión exitosa con Supabase`)
  }
} catch (error) {
  console.log(`❌ Error fatal: ${error.message}`)
}

// Test 2: Verificar acceso a tablas
console.log("\n========== VERIFICANDO TABLAS ==========\n")
const tablesToCheck = ["profiles", "subscriptions", "credentials", "invoices", "plans"]

for (const table of tablesToCheck) {
  try {
    const { data, error } = await supabase.from(table).select("count", { count: "exact" }).limit(1)

    if (error) {
      console.log(`⚠️ Tabla "${table}": No existe o no hay permisos`)
    } else {
      console.log(`✅ Tabla "${table}": Accesible`)
    }
  } catch (error) {
    console.log(`❌ Error verificando tabla "${table}": ${error.message}`)
  }
}

console.log("\n========== VERIFICACIÓN COMPLETADA ==========\n")
