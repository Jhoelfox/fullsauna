# 👥 SISTEMA DE USUARIOS Y SEGUIMIENTO DE ACTIVIDAD

## ✅ IMPLEMENTACIÓN COMPLETA

---

## 🎯 CARACTERÍSTICAS PRINCIPALES

### 1. **Registro de Usuarios Mejorado**

Cada usuario registrado ahora incluye:

```javascript
{
    id: timestamp único,
    nombre: string,
    apellido: string,
    email: string,
    telefono: string,
    ciudad: string,
    password: string,
    notificaciones: boolean,
    
    // NUEVO: Seguimiento de actividad
    fechaRegistro: ISO timestamp,
    ultimaConexion: ISO timestamp,
    enLinea: boolean,
    
    // NUEVO: Historial de actividad
    historialConexiones: [
        {
            tipo: 'registro|login|logout|reserva|compra',
            fecha: ISO timestamp,
            accion: string descripción
        }
    ],
    
    // NUEVO: Estadísticas
    estadisticas: {
        totalCompras: number,
        totalGastado: number,
        totalReservas: number,
        visitasAlSitio: number
    }
}
```

---

## 🔄 SEGUIMIENTO AUTOMÁTICO DE ACTIVIDAD

### **Eventos Rastreados:**

✅ **Registro**
- Se registra cuando el usuario crea su cuenta
- Marca como "en línea" automáticamente
- Incrementa visitas al sitio

✅ **Login**
- Se registra cada inicio de sesión
- Actualiza última conexión
- Marca como "en línea"
- Incrementa contador de visitas

✅ **Logout**
- Se registra al cerrar sesión
- Marca como "offline"
- Guarda timestamp de salida

✅ **Reservas**
- Se registra al agregar reserva al carrito
- Guarda descripción de la acción

✅ **Compras**
- Se registra al completar pago
- Actualiza estadísticas:
  - Total de compras
  - Total gastado
  - Método de pago usado

✅ **Heartbeat (Latido)**
- Actualiza estado cada 30 segundos
- Mantiene usuario como "en línea"
- Se detiene al cerrar la página

---

## 📊 VISTA DE ADMINISTRADOR

### **Tabla de Usuarios Mejorada:**

#### **Columnas Nuevas:**

1. **Estado en Línea** 🟢
   - 🟢 En línea (verde pulsante)
   - ⚫ Offline con tiempo transcurrido
   - Actualización automática cada 30s

2. **Estadísticas Rápidas** 📈
   - 🛍️ Total de compras
   - 👁️ Visitas al sitio
   - Iconos visuales

#### **Características Visuales:**

✅ **Usuarios en Línea:**
- Fondo verde claro
- Border verde a la izquierda
- Aparecen primero en la lista

✅ **Tiempo Transcurrido:**
- "Hace un momento" (< 1 min)
- "Hace X min" (< 1 hora)
- "Hace Xh" (< 24 horas)
- "Hace Xd" (< 7 días)
- "Hace X semanas/meses/años"

✅ **Ordenamiento Inteligente:**
1. Usuarios en línea primero
2. Luego por fecha de registro

---

## 🔍 DETALLES DEL USUARIO

### **Botón "Ver Detalles":**

Abre una ventana emergente con:

#### **1. Información Personal**
- Email
- Teléfono
- Ciudad
- Preferencias de notificaciones

#### **2. Actividad**
- Fecha de registro
- Última conexión
- Estado actual (en línea/offline)

#### **3. Estadísticas Completas**
- Total de compras realizadas
- Total gastado en Bs
- Total de reservas
- Visitas al sitio

#### **4. Historial de Actividad**
- Últimas 10 actividades
- Con iconos por tipo:
  - 👤 Registro
  - 🔓 Login
  - 🔒 Logout
  - 📅 Reserva
  - 🛒 Compra
- Fecha y hora de cada acción
- Descripción detallada

---

## 🎨 DISEÑO VISUAL

### **Estados en Línea:**

```css
En Línea:
- Color: #2ecc71 (Verde)
- Fondo: rgba(46, 204, 113, 0.1)
- Animación: Pulso en el icono
- Border: Verde

Offline:
- Color: #95a5a6 (Gris)
- Fondo: rgba(149, 165, 166, 0.1)
- Sin animación
- Muestra tiempo transcurrido
```

### **Tabla de Usuarios:**

```css
Header:
- Gradiente: #2c3e50 → #34495e
- Texto blanco
- Uppercase

Filas:
- Hover: Fondo gris claro + scale(1.01)
- Usuario online: Fondo verde claro
- Border bottom: Gris claro

Badges:
- Ciudad: Azul
- Reservas: Gris (inactivo) / Verde (activo)
- Estado: Verde (online) / Gris (offline)
```

---

## 🔧 FUNCIONES JAVASCRIPT

### **Cliente (script.js):**

#### `registrarActividadUsuario(usuarioId, tipo, descripcion)`
- Registra cualquier actividad del usuario
- Actualiza última conexión
- Marca como en línea

#### `marcarUsuarioEnLinea(usuarioId)`
- Marca usuario como en línea
- Incrementa visitas
- Registra login

#### `marcarUsuarioOffline(usuarioId)`
- Marca usuario como offline
- Registra logout
- Guarda timestamp

#### `actualizarActividadUsuarioActual(accion, descripcion)`
- Registra actividad del usuario actual
- Usa sesión activa

#### `obtenerUsuarioActual()`
- Retorna datos del usuario logueado
- Null si no hay sesión

#### `iniciarHeartbeat()`
- Inicia actualización cada 30s
- Mantiene estado en línea

#### `detenerHeartbeat()`
- Detiene actualización automática
- Se ejecuta al cerrar página

### **Admin (admin-script.js):**

#### `calcularTiempoTranscurrido(fecha)`
- Calcula tiempo desde una fecha
- Retorna string legible
- Formatos: minutos, horas, días, etc.

#### `verDetallesUsuario(usuarioId)`
- Abre ventana con detalles completos
- Muestra historial de actividad
- Estadísticas detalladas

#### `cargarUsuariosAdmin()`
- Carga tabla de usuarios
- Ordena por estado en línea
- Actualiza cada 30 segundos

---

## 📱 RESPONSIVE DESIGN

### **Desktop:**
- Tabla completa visible
- Todas las columnas
- Hover effects completos

### **Tablet:**
- Scroll horizontal si necesario
- Columnas compactas
- Padding reducido

### **Mobile:**
- Tabla con scroll horizontal
- Ancho mínimo: 1000px
- Mantiene funcionalidad completa

---

## 🔐 PRIVACIDAD Y SEGURIDAD

### **Datos Almacenados:**

✅ **LocalStorage:**
- Usuarios completos
- Historial de actividad
- Estadísticas

⚠️ **Consideraciones:**
- Contraseñas en texto plano (demo)
- Sin encriptación (demo)
- Para producción: usar backend + hash

### **Recomendaciones para Producción:**

1. **Backend Real:**
   - Base de datos (MongoDB/PostgreSQL)
   - API REST
   - Autenticación JWT

2. **Seguridad:**
   - Hash de contraseñas (bcrypt)
   - Tokens de sesión
   - HTTPS obligatorio

3. **Privacidad:**
   - GDPR compliance
   - Política de privacidad
   - Consentimiento de tracking

---

## 🚀 CÓMO FUNCIONA

### **Flujo de Registro:**

1. Usuario completa formulario
2. Se validan datos
3. Se crea usuario con:
   - Datos personales
   - Estado "en línea"
   - Historial inicial
   - Estadísticas en 0
4. Se crea sesión automática
5. Se inicia heartbeat
6. Admin puede ver usuario inmediatamente

### **Flujo de Login:**

1. Usuario ingresa credenciales
2. Se validan datos
3. Se marca como "en línea"
4. Se registra actividad de login
5. Se incrementan visitas
6. Se crea sesión
7. Se inicia heartbeat
8. Admin ve cambio de estado

### **Flujo de Actividad:**

1. Usuario realiza acción (compra, reserva)
2. Se registra en historial
3. Se actualizan estadísticas
4. Se guarda en localStorage
5. Admin puede ver en tiempo real

### **Flujo de Logout:**

1. Usuario cierra sesión o página
2. Se marca como "offline"
3. Se registra actividad de logout
4. Se detiene heartbeat
5. Admin ve cambio de estado

---

## 📊 ESTADÍSTICAS DISPONIBLES

### **Por Usuario:**

- **Total Compras:** Número de transacciones
- **Total Gastado:** Suma en Bolivianos
- **Total Reservas:** Número de reservas
- **Visitas al Sitio:** Contador de sesiones

### **Globales (Admin):**

- **Total Usuarios:** Todos los registrados
- **Usuarios Hoy:** Registrados hoy
- **Usuarios Semana:** Registrados esta semana
- **Usuarios Activos:** Con al menos 1 reserva

---

## 🎯 CASOS DE USO

### **Para el Admin:**

1. **Monitoreo en Tiempo Real:**
   - Ver quién está en línea ahora
   - Identificar usuarios activos
   - Detectar patrones de uso

2. **Análisis de Comportamiento:**
   - Ver historial de actividad
   - Identificar usuarios frecuentes
   - Analizar horarios de conexión

3. **Soporte al Cliente:**
   - Ver última conexión
   - Revisar historial de compras
   - Contactar usuarios activos

4. **Marketing:**
   - Identificar usuarios inactivos
   - Segmentar por actividad
   - Personalizar ofertas

### **Para el Usuario:**

1. **Experiencia Personalizada:**
   - Sistema reconoce al usuario
   - Guarda preferencias
   - Historial de compras

2. **Seguimiento:**
   - Ver propias estadísticas
   - Revisar historial
   - Gestionar cuenta

---

## 🔄 ACTUALIZACIÓN AUTOMÁTICA

### **Cliente:**
- Heartbeat cada 30 segundos
- Actualiza última conexión
- Mantiene estado en línea

### **Admin:**
- Recarga tabla cada 30 segundos
- Actualiza estados en tiempo real
- Sin necesidad de refrescar página

---

## 🧪 TESTING

### **Probar el Sistema:**

1. **Registrar Usuario:**
   ```
   - Ir a index.html
   - Clic en "Registrarse"
   - Completar formulario
   - Verificar registro exitoso
   ```

2. **Ver en Admin:**
   ```
   - Ir a admin.html
   - Sección "Usuarios Registrados"
   - Verificar usuario aparece
   - Estado: 🟢 En línea
   ```

3. **Probar Actividad:**
   ```
   - Agregar producto al carrito
   - Hacer una reserva
   - Completar compra
   - Ver historial en admin
   ```

4. **Probar Logout:**
   ```
   - Cerrar sesión en index.html
   - Verificar en admin
   - Estado: ⚫ Offline
   - Tiempo transcurrido actualizado
   ```

5. **Ver Detalles:**
   ```
   - En admin, clic "Ver Detalles"
   - Verificar información completa
   - Ver historial de actividad
   - Revisar estadísticas
   ```

---

## 📝 NOTAS IMPORTANTES

1. **LocalStorage:**
   - Datos persisten en el navegador
   - No se sincronizan entre dispositivos
   - Limitado a ~5-10MB

2. **Tiempo Real:**
   - Actualización cada 30 segundos
   - No es instantáneo
   - Suficiente para demo

3. **Heartbeat:**
   - Se ejecuta mientras la página está abierta
   - Se detiene al cerrar
   - Marca como offline automáticamente

4. **Historial:**
   - Se guarda todo el historial
   - Puede crecer mucho
   - Considerar límite en producción

---

## 🎉 RESUMEN

### **Antes:**
- ❌ Solo datos básicos de usuario
- ❌ Sin seguimiento de actividad
- ❌ Sin estado en línea
- ❌ Sin estadísticas
- ❌ Sin historial

### **Ahora:**
- ✅ Registro completo con seguimiento
- ✅ Estado en línea en tiempo real
- ✅ Historial de todas las actividades
- ✅ Estadísticas detalladas
- ✅ Vista de admin mejorada
- ✅ Actualización automática
- ✅ Heartbeat para mantener estado
- ✅ Detalles completos por usuario
- ✅ Ordenamiento inteligente
- ✅ Diseño visual atractivo

---

**Fecha de Implementación:** 7 de Noviembre, 2025  
**Desarrollador:** Kiro AI Assistant  
**Estado:** ✅ Completado y Funcional
