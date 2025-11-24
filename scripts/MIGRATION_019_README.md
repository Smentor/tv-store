# Migración Crítica: Habilitar Logging de Usuarios

## ⚠️ IMPORTANTE - EJECUTAR INMEDIATAMENTE

El sistema actualmente **NO está registrando las acciones de los usuarios** en el historial debido a políticas restrictivas de RLS (Row Level Security) en la tabla `user_logs`.

## Problema Identificado

Las políticas actuales de la tabla `user_logs` solo permiten que los **administradores** inserten registros. Esto significa que cuando un usuario regular actualiza su perfil o cambia su contraseña, el sistema intenta guardar el log pero la base de datos lo rechaza silenciosamente.

## Solución

Ejecutar el script de migración `019_allow_user_self_logging.sql` que:

1. Permite que los usuarios inserten logs de sus propias acciones
2. Permite que los usuarios vean sus propios logs
3. Mantiene la capacidad de los admins de ver e insertar todos los logs

## Cómo Ejecutar la Migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del archivo `scripts/019_allow_user_self_logging.sql`
5. Haz clic en **Run**

### Opción 2: Desde la línea de comandos

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O usando psql directamente
psql -h <your-db-host> -U postgres -d postgres -f scripts/019_allow_user_self_logging.sql
```

## Verificación

Después de ejecutar la migración, verifica que funcione:

1. Inicia sesión como un usuario regular (no admin)
2. Ve a Configuración → Información Personal
3. Cambia algún dato (nombre, email, etc.)
4. Guarda los cambios
5. Como admin, ve al panel de administración
6. Abre el modal de detalles del usuario
7. Ve a la pestaña "Historial"
8. **Deberías ver el cambio registrado** con `admin_id: null` (indicando que fue el usuario quien lo hizo)

## Acciones que se Registrarán Automáticamente

Una vez ejecutada la migración, el sistema registrará:

### ✅ Acciones del Usuario (desde su dashboard)
- Actualización de perfil (nombre, apellido, email, WhatsApp)
- Cambio de contraseña
- Inicio de sesión (próximamente)
- Cambios de plan (próximamente)
- Aplicación de cupones (próximamente)

### ✅ Acciones del Administrador (desde panel admin)
- Actualización de perfil del usuario
- Actualización de credenciales IPTV
- Cambio de suscripción
- Cambio de estado
- Cambio manual de contraseña
- Envío de reset de contraseña

## Diferenciación en el Historial

- **Cambios del usuario**: `admin_id = null`
- **Cambios del admin**: `admin_id = <id del administrador>`

## Próximos Pasos

Después de ejecutar esta migración, se recomienda:

1. Agregar logging para inicio de sesión
2. Agregar logging para cambios de plan
3. Agregar logging para aplicación de cupones
4. Agregar logging para acciones de facturación

## Soporte

Si encuentras algún problema al ejecutar la migración, verifica:

1. Que tienes permisos de administrador en la base de datos
2. Que la tabla `user_logs` existe
3. Que la función `is_admin()` existe
4. Revisa los logs de error en Supabase Dashboard

---

**Fecha de creación**: 2025-11-23
**Prioridad**: 🔴 CRÍTICA
**Estado**: ⏳ Pendiente de ejecución
