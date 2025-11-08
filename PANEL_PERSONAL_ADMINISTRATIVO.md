# 👔 Panel de Personal Administrativo - Sauna C y G

## Descripción
Nueva página con acceso limitado para el personal administrativo del Sauna C y G - El Jordán.

## Archivos Creados

### 1. `personal.html`
Página principal del panel de personal con interfaz simplificada.

### 2. `personal-styles.css`
Estilos específicos para el panel de personal.

### 3. `personal-script.js`
Funcionalidad JavaScript para el panel de personal.

## Funcionalidades del Panel de Personal

### ✅ Control de Estados de Sauna
- **Ver todos los módulos** de sauna con su estado actual
- **Cambiar estados** de los módulos:
  - Disponible
  - No Disponible
  - Reservado
  - En Mantenimiento
- **Agregar observaciones** al cambiar estados

### ✅ Registro de Ventas Rápidas
**Formulario simplificado para registrar ventas:**
- Seleccionar producto del inventario
- Ingresar cantidad
- Precio se calcula automáticamente
- Seleccionar método de pago (Efectivo/QR)
- Registro instantáneo

**Características:**
- ✅ Actualiza automáticamente el stock
- ✅ Registra el ingreso en caja
- ✅ Muestra resumen del día
- ✅ Historial de ventas en tiempo real

**Ejemplo de uso:**
```
Producto: Coca-Cola
Cantidad: 2
Precio: 5 Bs c/u
Total: 10 Bs
Método: Efectivo
→ [Registrar Venta]
```

### ✅ Visualización de Inventario
- **Ver todos los productos** disponibles
- **Stock en tiempo real**
- **Alertas de stock bajo** (≤5 unidades)
- **Indicador de agotado** (0 unidades)
- **Solo lectura** (no puede agregar/eliminar productos)

## Resumen del Día

El panel muestra en tiempo real:
- 💰 **Ventas del Día**: Total en Bs
- 🛍️ **Productos Vendidos**: Cantidad total

## Acceso desde Panel de Administrador

En el panel de administrador (`admin.html`) hay un nuevo botón verde:
- **"Panel Personal"** → Abre `personal.html` en nueva pestaña

## Permisos y Limitaciones

### ✅ Puede hacer:
- Cambiar estados de saunas
- Registrar ventas de productos
- Ver inventario completo
- Ver resumen de ventas del día

### ❌ NO puede hacer:
- Agregar/eliminar productos
- Modificar precios
- Ver historial completo de reservas
- Acceder a configuración del sistema
- Ver datos de usuarios
- Gestionar caja (retiros, saldo inicial)
- Exportar datos

## Integración con Sistema Principal

### Datos Compartidos (localStorage):
- `saunaModulos` - Estados de saunas (lectura/escritura)
- `productos` - Inventario (lectura + actualización de stock)
- `ventasPersonal` - Ventas registradas por personal
- `movimientosCaja` - Ingresos automáticos de ventas

### Sincronización Automática:
Todos los cambios se reflejan instantáneamente en el panel de administrador:
- Cambios de estado de saunas
- Ventas de productos
- Actualizaciones de stock
- Ingresos en caja

## Flujo de Trabajo Típico

### 1. Inicio del Día
Personal abre `personal.html`

### 2. Control de Saunas
- Revisa estados de módulos
- Actualiza según disponibilidad

### 3. Ventas
Cliente compra productos:
1. Selecciona producto (ej: Coca-Cola)
2. Ingresa cantidad (ej: 2)
3. Selecciona método de pago
4. Clic en "Registrar Venta"
5. ✅ Stock actualizado automáticamente
6. ✅ Ingreso registrado en caja
7. ✅ Aparece en historial del día

### 4. Monitoreo
- Ve resumen de ventas en tiempo real
- Revisa stock disponible
- Actualiza estados de saunas según necesidad

## Ventajas del Sistema

### Para el Personal:
- ✅ Interfaz simple y rápida
- ✅ Solo lo necesario para su trabajo
- ✅ Registro de ventas en segundos
- ✅ No puede cometer errores críticos

### Para el Administrador:
- ✅ Control total desde su panel
- ✅ Ve todas las ventas registradas
- ✅ Stock actualizado automáticamente
- ✅ Ingresos registrados correctamente
- ✅ Puede supervisar actividad del personal

## Seguridad

- **Acceso separado**: URL diferente (`personal.html`)
- **Permisos limitados**: Solo funciones específicas
- **Sin acceso a datos sensibles**: No ve usuarios, configuración, etc.
- **Trazabilidad**: Todas las acciones se registran con timestamp

## Responsive

El panel funciona perfectamente en:
- 💻 Computadoras
- 📱 Tablets
- 📱 Móviles

## Próximas Mejoras Sugeridas

1. **Sistema de login** para diferenciar admin vs personal
2. **Reportes diarios** para el personal
3. **Notificaciones** de stock bajo
4. **Historial de cambios** de estados de sauna
5. **Turnos** para múltiples empleados
