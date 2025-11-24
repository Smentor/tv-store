# Sistema de Logging Completo - MaxPlayer IPTV

## ✅ IMPLEMENTADO

### 1. Infraestructura Base
- ✅ Hook centralizado de logging (`hooks/use-user-logger.ts`)
- ✅ Componente mejorado de visualización de logs (`components/admin/users/log-item.tsx`)
- ✅ Badge "Por el cliente" para identificar acciones del usuario
- ✅ Migración SQL para permitir que usuarios registren sus propias acciones
- ✅ Captura de metadata (user_agent, timestamp)

### 2. Acciones Registradas del Usuario

#### Perfil y Cuenta
- ✅ **Actualización de Perfil** (`UPDATE_PROFILE`)
  - Nombre, apellido, email, WhatsApp
  - Muestra cambios campo por campo (antes → después)
  - Badge "Por el cliente"

- ✅ **Cambio de Contraseña** (`manual_password_update`)
  - Desde el dashboard del usuario
  - Diferencia entre cambio por usuario vs admin

- ✅ **Preferencias de Notificaciones** (`update_notification_settings`)
  - Email, WhatsApp, recordatorios, cambios de plan
  - Muestra qué se activó/desactivó

### 3. Acciones Registradas del Administrador
- ✅ Actualización de perfil de usuario
- ✅ Actualización de credenciales IPTV
- ✅ Cambio de suscripción
- ✅ Cambio de estado (activo/inactivo/cancelado)
- ✅ Cambio manual de contraseña
- ✅ Envío de reset de contraseña
- ✅ Creación de usuario

### 4. Visualización Mejorada
- ✅ Iconos específicos por tipo de acción
- ✅ Colores diferenciados
- ✅ Badge "Por el cliente" para acciones del usuario
- ✅ Formato legible de cambios
- ✅ Búsqueda en historial
- ✅ Metadata (navegador, IP cuando esté disponible)

## 🚧 PENDIENTE DE IMPLEMENTAR

### 1. Inicio de Sesión
**Archivo**: `app/auth/login/page.tsx` o middleware
**Acción**: `user_login`
**Detalles a capturar**:
- IP address
- User agent
- Timestamp
- Método de login (email/password, OAuth, etc.)

**Implementación sugerida**:
```typescript
// En el componente de login, después de login exitoso
import { logUserLogin } from '@/app/actions/log-actions'

// Después de login exitoso
await logUserLogin(user.id, {
  user_agent: navigator.userAgent,
  ip_address: await fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(data => data.ip)
})
```

### 2. Cambios de Plan
**Archivo**: `components/plans-section.tsx`
**Acción**: `change_plan`
**Detalles a capturar**:
- Plan anterior
- Plan nuevo
- Precio anterior
- Precio nuevo
- Razón del cambio (upgrade/downgrade)

**Implementación sugerida**:
```typescript
await logAction('change_plan', {
  previous_plan: currentPlan.name,
  new_plan: selectedPlan.name,
  previous_price: currentPlan.price,
  new_price: selectedPlan.price,
  change_type: selectedPlan.price > currentPlan.price ? 'upgrade' : 'downgrade'
})
```

### 3. Aplicación de Cupones
**Archivo**: Componente de cupones (por crear o existente)
**Acción**: `apply_coupon`
**Detalles a capturar**:
- Código del cupón
- Descuento aplicado
- Plan al que se aplicó
- Precio antes/después

**Implementación sugerida**:
```typescript
await logAction('apply_coupon', {
  coupon_code: couponCode,
  discount: discountAmount,
  discount_type: discountType, // percentage or fixed
  plan_name: planName,
  original_price: originalPrice,
  final_price: finalPrice
})
```

### 4. Acciones de Facturación
**Archivo**: `components/billing-section.tsx`
**Acciones**: 
- `payment_successful`
- `payment_failed`
- `subscription_renewed`
- `subscription_cancelled`

**Detalles a capturar**:
- Monto
- Método de pago
- ID de transacción
- Estado del pago

**Implementación sugerida**:
```typescript
await logAction('payment_successful', {
  amount: paymentAmount,
  currency: 'USD',
  payment_method: paymentMethod,
  transaction_id: transactionId,
  invoice_id: invoiceId
})
```

### 5. Captura de IP Address
**Prioridad**: Alta (seguridad)
**Implementación**:

Opción 1 - Cliente (menos seguro):
```typescript
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}
```

Opción 2 - Servidor (más seguro):
```typescript
// En Server Action
import { headers } from 'next/headers'

export async function getClientIP() {
  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return null
}
```

### 6. Eventos Adicionales Recomendados

#### Seguridad
- `failed_login_attempt` - Intentos fallidos de inicio de sesión
- `password_reset_requested` - Solicitud de reset de contraseña
- `email_verification` - Verificación de email
- `two_factor_enabled` - Activación de 2FA (si se implementa)

#### Dispositivos
- `device_connected` - Nuevo dispositivo conectado
- `device_disconnected` - Dispositivo desconectado
- `devices_reset` - Reset de todos los dispositivos

#### Soporte
- `support_ticket_created` - Ticket de soporte creado
- `support_message_sent` - Mensaje enviado a soporte

## 📝 INSTRUCCIONES DE USO

### Para Registrar una Nueva Acción

1. **En componente del cliente**:
```typescript
import { useUserLogger } from '@/hooks/use-user-logger'

const { logAction } = useUserLogger()

await logAction('nombre_accion', {
  // detalles relevantes
  campo1: valor1,
  campo2: valor2
})
```

2. **Agregar el caso en `log-item.tsx`**:
```typescript
case 'nombre_accion':
    return { label: 'Etiqueta Legible', icon: IconoRelevante, color: 'text-color-500' }
```

3. **Agregar el formato de visualización**:
```typescript
case 'nombre_accion':
    return (
        <div>
            {/* Formato personalizado */}
            {metadata}
        </div>
    )
```

## 🔒 CONSIDERACIONES DE SEGURIDAD

1. **Datos Sensibles**: NUNCA registrar contraseñas completas, solo indicar que fueron cambiadas
2. **PII**: Ser cuidadoso con información personal identificable
3. **Retención**: Considerar política de retención de logs (ej. 90 días)
4. **Acceso**: Solo administradores pueden ver logs de otros usuarios
5. **Auditoría**: Los logs mismos no deben ser editables ni eliminables

## 📊 MÉTRICAS SUGERIDAS

Basado en los logs, se pueden crear dashboards con:
- Actividad de usuarios por día/semana/mes
- Acciones más comunes
- Horarios de mayor actividad
- Cambios de plan (tendencias)
- Tasa de renovación
- Problemas de pago
- Dispositivos más usados

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Implementar logging de inicio de sesión** (Prioridad: Alta)
2. **Capturar IP address en todas las acciones** (Prioridad: Alta)
3. **Implementar logging de cambios de plan** (Prioridad: Media)
4. **Implementar logging de cupones** (Prioridad: Media)
5. **Implementar logging de facturación** (Prioridad: Media)
6. **Agregar dashboard de métricas** (Prioridad: Baja)

---

**Última actualización**: 2025-11-23
**Estado**: En desarrollo activo
**Cobertura actual**: ~60% de acciones del usuario
