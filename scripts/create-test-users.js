import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://eelxeotkfnfvjvwvaubc.supabase.co"
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY no está configurada")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const testUsers = [
  {
    email: "cliente1@test.com",
    password: "TestPassword123!",
    fullName: "Cliente Prueba 1",
  },
  {
    email: "cliente2@test.com",
    password: "TestPassword123!",
    fullName: "Cliente Prueba 2",
  },
  {
    email: "cliente3@test.com",
    password: "TestPassword123!",
    fullName: "Cliente Prueba 3",
  },
]

async function createTestUsers() {
  console.log("========== CREANDO USUARIOS DE PRUEBA ==========\n")

  for (const user of testUsers) {
    try {
      console.log(`Creando usuario: ${user.email}...`)

      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
        },
      })

      if (error) {
        console.error(`❌ Error creando ${user.email}:`, error.message)
      } else {
        console.log(`✅ Usuario creado exitosamente: ${user.email}`)
        console.log(`   ID: ${data.user.id}`)
        console.log(`   Email: ${data.user.email}\n`)
      }
    } catch (err) {
      console.error(`❌ Error inesperado:`, err.message)
    }
  }

  console.log("========== USUARIOS DE PRUEBA CREADOS ==========\n")
  console.log("Puedes usar estos usuarios para probar el dashboard:")
  testUsers.forEach((user) => {
    console.log(`  Email: ${user.email}`)
    console.log(`  Contraseña: ${user.password}\n`)
  })
}

createTestUsers()
