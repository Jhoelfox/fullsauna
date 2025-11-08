# 🔐 Sistema de Autenticación del Panel Admin

## ✅ Implementación Completada

Se ha implementado un sistema completo de autenticación para proteger el acceso al panel de administración.

---

## 🎯 Credenciales Iniciales

### Por Defecto:
- **Usuario:** `Jhoel Cristian Quispe Mendoza`
- **Contraseña:** `63047700x`

**Nota:** Estas credenciales se pueden cambiar desde el panel de administración.

---

## 📋 Componentes del Sistema

### 1. Página de Login (`admin-login.html`)
**Características:**
- ✅ Diseño moderno y profesional
- ✅ Validación de credenciales
- ✅ Mostrar/ocultar contraseña
- ✅ Mensajes de error animados
- ✅ Verificación de sesión activa
- ✅ Responsive design

### 2. Verificación de Sesión (`admin.html`)
**Características:**
- ✅ Verificación automática al cargar
- ✅ Redirección si no hay sesión
- ✅ Expiración de sesión (8 horas)
- ✅ Renovación automática de timestamp

### 3. Gestión de Credenciales
**Características:**
- ✅ Cambiar usuario
- ✅ Cambiar contraseña
- ✅ Validación de contraseña actual
- ✅ Confirmación de nueva contraseña
- ✅ Historial de accesos

---

## 🔄 Flujo de Autenticación

### Login:
```
Usuario ingresa credenciales
    ↓
Sistema valida contra localStorage
    ↓
Si es correcto:
  - Crea sesión (8 horas)
  - Registra acceso
  - Redirige a admin.html
    ↓
Si es incorrecto:
  - Muestra error
  - Limpia contraseña
  - Permite reintentar
```

### Verificación de Sesión:
```
Usuario accede a admin.html
    ↓
Sistema verifica sesión
    ↓
Si no hay sesión:
  - Redirige a login
    ↓
Si sesión expiró (>8 horas):
  - Elimina sesión
  - Muestra alerta
  - Redirige a login
    ↓
Si sesión válida:
  - Actualiza timestamp
  - Permite acceso
```

---

## 💾 Estructura de Datos

### 1. Credenciales (`adminCredentials`)
```javascript
{
  "username": "Jhoel Cristian Quispe Mendoza",
  "password": "63047700x"
}
```

### 2. Sesión Activa (`adminSession`)
```javascript
{
  "username": "Jhoel Cristian Quispe Mendoza",
  "timestamp": 1699999999999
}
```

### 3. Historial de Accesos (`adminAccesos`)
```javascript
[
  {
    "username": "Jhoel Cristian Quispe Mendoza",
    "fecha": "2024-11-08T10:30:00.000Z"
  }
]
```

---

## 🎨 Interfaz de Usuario

### Página de Login:
```
┌─────────────────────────────────────┐
│         🛡️ Panel de Admin           │
│     Sauna C y G - El Jordán         │
├─────────────────────────────────────┤
│                                     │
│  👤 Usuario                         │
│  [_________________________]        │
│                                     │
│  🔒 Contraseña                      │
│  [_________________________] 👁️     │
│                                     │
│  [🔓 Ingresar al Panel]            │
│                                     │
│  🏠 Volver al inicio                │
└─────────────────────────────────────┘
```

### Header del Admin:
```
┌─────────────────────────────────────┐
│ Logo | Navegación | 👤 Admin | 🚪 Salir │
└─────────────────────────────────────┘
```

### Gestión de Credenciales:
```
┌─────────────────────────────────────┐
│ 🔑 Seguridad y Acceso              │
├─────────────────────────────────────┤
│ [🔒 Cambiar Usuario y Contraseña]  │
│ [📜 Ver Historial de Accesos]      │
│                                     │
│ 👤 Usuario actual: Jhoel...        │
│ 🛡️ Sesión activa                   │
└─────────────────────────────────────┘
```

---

## 🔧 Funciones Principales

### En `admin-login.html`:

1. **Inicialización de Credenciales**
```javascript
// Crea credenciales por defecto si no existen
if (!localStorage.getItem('adminCredentials')) {
    const defaultCredentials = {
        username: 'Jhoel Cristian Quispe Mendoza',
        password: '63047700x'
    };
    localStorage.setItem('adminCredentials', JSON.stringify(defaultCredentials));
}
```

2. **Verificación de Sesión Activa**
```javascript
// Redirige a admin si ya hay sesión válida
window.addEventListener('load', function() {
    const sesion = localStorage.getItem('adminSession');
    if (sesion) {
        // Verifica expiración (8 horas)
        // Redirige si es válida
    }
});
```

3. **Validación de Login**
```javascript
// Valida credenciales y crea sesión
document.getElementById('login-form').addEventListener('submit', function(e) {
    // Obtiene credenciales
    // Valida usuario y contraseña
    // Crea sesión
    // Registra acceso
    // Redirige a admin
});
```

### En `admin.html`:

1. **Verificación al Cargar**
```javascript
// Script inline al inicio del body
(function() {
    const sesion = localStorage.getItem('adminSession');
    if (!sesion) {
        window.location.href = 'admin-login.html';
        return;
    }
    // Verifica expiración
    // Actualiza timestamp
})();
```

2. **Cerrar Sesión**
```javascript
function cerrarSesion() {
    if (confirm('¿Estás seguro?')) {
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
    }
}
```

### En `admin-script.js`:

1. **Cambiar Credenciales**
```javascript
function guardarCredenciales(event) {
    // Valida contraseña actual
    // Valida coincidencia de nuevas contraseñas
    // Guarda nuevas credenciales
    // Actualiza sesión
    // Actualiza UI
}
```

2. **Ver Historial**
```javascript
function verHistorialAccesos() {
    // Lee historial de localStorage
    // Muestra modal con lista
    // Opción de limpiar historial
}
```

---

## 🔒 Seguridad

### Características de Seguridad:

1. **Sesiones con Expiración**
   - Duración: 8 horas
   - Renovación automática en cada carga
   - Eliminación al cerrar sesión

2. **Validación de Contraseña Actual**
   - Requerida para cambiar credenciales
   - Previene cambios no autorizados

3. **Confirmación de Cambios**
   - Doble confirmación al cambiar credenciales
   - Muestra nuevo usuario antes de guardar

4. **Historial de Accesos**
   - Registro de todos los logins
   - Fecha y hora de cada acceso
   - Usuario que accedió

### Limitaciones Actuales:

⚠️ **Importante:** Este sistema usa localStorage, que NO es seguro para producción.

**Limitaciones:**
- ❌ Contraseñas en texto plano
- ❌ Datos accesibles desde consola
- ❌ Sin encriptación
- ❌ Sin protección contra XSS
- ❌ Sin límite de intentos fallidos
- ❌ Sin recuperación de contraseña

**Para producción se recomienda:**
- ✅ Backend con base de datos
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Tokens JWT
- ✅ HTTPS obligatorio
- ✅ Rate limiting
- ✅ 2FA (autenticación de dos factores)

---

## 📱 Responsive Design

### Desktop:
- Header con usuario y botón de salir
- Modal centrado
- Todos los elementos visibles

### Tablet:
- Header adaptado
- Modal ajustado
- Botones apilados

### Mobile:
- Botones flotantes en esquina inferior
- Solo iconos visibles
- Modal full-width

---

## 🎯 Casos de Uso

### Caso 1: Primer Acceso
1. Usuario abre `admin.html`
2. Sistema redirige a `admin-login.html`
3. Usuario ingresa credenciales por defecto
4. Sistema crea sesión y redirige
5. Usuario accede al panel

### Caso 2: Cambiar Credenciales
1. Usuario va a Configuración → Seguridad
2. Clic en "Cambiar Usuario y Contraseña"
3. Ingresa nuevo usuario y contraseña
4. Confirma con contraseña actual
5. Sistema guarda y actualiza

### Caso 3: Sesión Expirada
1. Usuario accede después de 8 horas
2. Sistema detecta sesión expirada
3. Muestra alerta
4. Redirige a login
5. Usuario debe iniciar sesión nuevamente

### Caso 4: Cerrar Sesión
1. Usuario hace clic en "Salir"
2. Sistema pide confirmación
3. Usuario confirma
4. Sistema elimina sesión
5. Redirige a login

---

## 🔄 Mantenimiento

### Cambiar Duración de Sesión:

En `admin-login.html` y `admin.html`:
```javascript
// Cambiar 8 horas por el valor deseado
if (ahora - sesionData.timestamp > 8 * 60 * 60 * 1000) {
    // 8 horas = 8 * 60 * 60 * 1000 milisegundos
}
```

### Resetear Credenciales:

Desde la consola del navegador:
```javascript
localStorage.removeItem('adminCredentials');
localStorage.removeItem('adminSession');
// Recargar página para usar credenciales por defecto
```

### Limpiar Todo:

```javascript
localStorage.clear();
// Recargar página
```

---

## 📊 Estadísticas

### Datos Almacenados:
- Credenciales de acceso
- Sesión activa
- Historial de accesos
- Timestamp de última actividad

### Tamaño Aproximado:
- Credenciales: ~100 bytes
- Sesión: ~150 bytes
- Historial (100 accesos): ~10 KB

---

## 🎓 Guía de Uso

### Para el Administrador:

1. **Primer Login:**
   - Usuario: `Jhoel Cristian Quispe Mendoza`
   - Contraseña: `63047700x`

2. **Cambiar Credenciales (Recomendado):**
   - Ir a Configuración → Seguridad
   - Cambiar usuario y contraseña
   - Guardar en lugar seguro

3. **Cerrar Sesión:**
   - Hacer clic en botón "Salir"
   - Confirmar acción

4. **Ver Historial:**
   - Ir a Configuración → Seguridad
   - Ver Historial de Accesos
   - Revisar accesos recientes

---

## ⚙️ Configuración

### Archivos Modificados:

1. **`admin-login.html`** (NUEVO)
   - Página de login
   - Validación de credenciales
   - Gestión de sesiones

2. **`admin.html`**
   - Verificación de sesión
   - Botón de cerrar sesión
   - Tarjeta de seguridad

3. **`admin-script.js`**
   - Funciones de autenticación
   - Gestión de credenciales
   - Historial de accesos

4. **`admin-styles.css`**
   - Estilos para header actions
   - Estilos para botón de logout
   - Responsive design

---

## 🚀 Mejoras Futuras (Opcional)

### Corto Plazo:
1. Límite de intentos fallidos
2. Bloqueo temporal tras intentos
3. Recuperación de contraseña por email
4. Preguntas de seguridad

### Mediano Plazo:
1. Backend con API REST
2. Base de datos real
3. Encriptación de contraseñas
4. Tokens JWT

### Largo Plazo:
1. Autenticación de dos factores (2FA)
2. Login con Google/Facebook
3. Roles y permisos
4. Auditoría completa

---

## ✅ Checklist de Seguridad

Para el administrador:

- [ ] Cambiar credenciales por defecto
- [ ] Usar contraseña fuerte (mínimo 8 caracteres)
- [ ] No compartir credenciales
- [ ] Cerrar sesión al terminar
- [ ] Revisar historial periódicamente
- [ ] Limpiar historial antiguo
- [ ] No acceder desde computadoras públicas
- [ ] Usar HTTPS en producción

---

## 📝 Notas Importantes

1. **Credenciales por defecto:** Cambiarlas inmediatamente después del primer acceso

2. **Sesiones:** Expiran automáticamente después de 8 horas de inactividad

3. **Historial:** Se guarda localmente y puede ser limpiado

4. **Seguridad:** Este sistema es básico y NO debe usarse en producción sin mejoras

5. **Backup:** Guardar credenciales en lugar seguro (no en el navegador)

---

## 🎯 Conclusión

El sistema de autenticación está completamente funcional y proporciona:
- ✅ Protección básica del panel admin
- ✅ Gestión de sesiones
- ✅ Cambio de credenciales
- ✅ Historial de accesos
- ✅ Interfaz intuitiva

Para uso interno o desarrollo, el sistema es adecuado. Para producción, se recomienda implementar las mejoras de seguridad mencionadas.
