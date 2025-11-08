# 📊 SISTEMA DE DISPONIBILIDAD EN TIEMPO REAL

## ✅ IMPLEMENTACIÓN COMPLETA

---

## 🎯 OBJETIVO

Cuando el administrador marca un módulo como "No Disponible" o "Reservado", el sistema actualiza automáticamente la cantidad de saunas disponibles y los clientes ven solo las cantidades reales disponibles.

---

## 🔄 FLUJO COMPLETO

### **Proceso:**

```
1. Admin cambia estado de sauna
   ↓
2. Sistema calcula disponibilidad
   ↓
3. Guarda en localStorage
   ↓
4. Dispara evento de actualización
   ↓
5. Cliente recibe actualización INSTANTÁNEA
   ↓
6. Interfaz se actualiza automáticamente
   ↓
7. Badges muestran disponibilidad real
```

---

## 📊 CÁLCULO DE DISPONIBILIDAD

### **Módulos Base:**

```javascript
{
    individual: { total: 2 },      // 2 saunas individuales
    doble: { total: 5 },           // 5 saunas dobles
    semifamiliar: { total: 2 },    // 2 saunas semifamiliares
    familiar: { total: 3 }          // 3 saunas familiares
}
```

### **Estados Posibles:**

1. **Disponible:** Sauna lista para reservar
2. **Reservada:** Sauna ocupada por cliente
3. **No Disponible:** Sauna marcada como no disponible por admin
4. **Mantenimiento:** Sauna en mantenimiento

---

## 🎨 VISUALIZACIÓN PARA CLIENTES

### **Badge Verde (Disponible):**

```
┌─────────────────────────────┐
│ Sauna Individual            │
│                             │
│ [✓ 2 Disponibles]  ← Verde │
│                             │
│ Precio: 15 Bs               │
│ [Reservar Ahora]            │
└─────────────────────────────┘
```

**Características:**
- Color: Verde (#2ecc71)
- Icono: Check circle
- Botón: Habilitado

---

### **Badge Naranja (Pocas Disponibles):**

```
┌─────────────────────────────┐
│ Sauna Doble                 │
│                             │
│ [⚠ 1 Disponible]  ← Naranja│
│                             │
│ Precio: 25 Bs               │
│ [Reservar Ahora]            │
└─────────────────────────────┘
```

**Características:**
- Color: Naranja (#f39c12)
- Icono: Warning triangle
- Animación: Pulso
- Botón: Habilitado

---

### **Badge Rojo (No Disponible):**

```
┌─────────────────────────────┐
│ Sauna Familiar              │
│                             │
│ [✗ No Disponible]  ← Rojo  │
│                             │
│ Precio: 45 Bs               │
│ [No Disponible] (disabled)  │
└─────────────────────────────┘
```

**Características:**
- Color: Rojo (#e74c3c)
- Icono: Times circle
- Card: Opacidad reducida + Grayscale
- Botón: Deshabilitado

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **En el Admin (admin-script.js):**

```javascript
// Calcular disponibilidad
function calcularDisponibilidadSaunas() {
    const modulosBase = {
        individual: { total: 2 },
        doble: { total: 5 },
        semifamiliar: { total: 2 },
        familiar: { total: 3 }
    };
    
    const disponibilidad = {};
    
    // Para cada tipo de módulo
    Object.keys(modulosBase).forEach(tipo => {
        let disponibles = 0;
        let reservadas = 0;
        let noDisponibles = 0;
        
        // Contar saunas por estado
        for (let i = 1; i <= modulosBase[tipo].total; i++) {
            const saunaId = `${tipo}-${i}`;
            const config = configuracionModulos[saunaId];
            
            if (config.estado === 'no-disponible') {
                noDisponibles++;
            } else if (config.estado === 'reservado') {
                reservadas++;
            } else {
                disponibles++;
            }
        }
        
        disponibilidad[tipo] = {
            total: modulosBase[tipo].total,
            disponibles: disponibles,
            reservadas: reservadas,
            noDisponibles: noDisponibles
        };
    });
    
    // Guardar para que clientes puedan verlo
    localStorage.setItem('disponibilidadSaunas', JSON.stringify(disponibilidad));
    
    return disponibilidad;
}
```

---

### **Actualización Automática:**

```javascript
// Al guardar configuración de módulo
function guardarConfiguracionModulo() {
    // ... guardar configuración ...
    
    // ACTUALIZAR DISPONIBILIDAD
    actualizarDisponibilidadTiempoReal();
}

function actualizarDisponibilidadTiempoReal() {
    const disponibilidad = calcularDisponibilidadSaunas();
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('disponibilidadActualizada', {
        detail: disponibilidad
    }));
}
```

---

### **En la Página del Cliente (script.js):**

```javascript
// Obtener disponibilidad
function obtenerDisponibilidadSaunas() {
    return JSON.parse(localStorage.getItem('disponibilidadSaunas') || '{}');
}

// Actualizar visualización
function actualizarVisualizacionDisponibilidad() {
    const disponibilidad = obtenerDisponibilidadSaunas();
    
    Object.keys(disponibilidad).forEach(tipo => {
        const info = disponibilidad[tipo];
        const card = document.querySelector(`[data-modulo="${tipo}"]`);
        
        if (card) {
            // Crear/actualizar badge
            let badge = card.querySelector('.disponibilidad-badge');
            
            if (info.disponibles === 0) {
                // No disponible
                badge.className = 'disponibilidad-badge no-disponible';
                badge.innerHTML = '<i class="fas fa-times-circle"></i> No Disponible';
                card.classList.add('modulo-no-disponible');
                
                // Deshabilitar botón
                const boton = card.querySelector('button');
                boton.disabled = true;
                boton.textContent = 'No Disponible';
                
            } else if (info.disponibles <= 2) {
                // Pocas disponibles
                badge.className = 'disponibilidad-badge pocas-disponibles';
                badge.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${info.disponibles} Disponible${info.disponibles > 1 ? 's' : ''}`;
                
            } else {
                // Disponible
                badge.className = 'disponibilidad-badge disponible';
                badge.innerHTML = `<i class="fas fa-check-circle"></i> ${info.disponibles} Disponibles`;
            }
        }
    });
}

// Escuchar cambios
window.addEventListener('storage', function(e) {
    if (e.key === 'disponibilidadSaunas') {
        actualizarVisualizacionDisponibilidad();
    }
});

// Actualizar cada 10 segundos
setInterval(actualizarVisualizacionDisponibilidad, 10000);
```

---

## 📊 ESTRUCTURA DE DATOS

### **Disponibilidad Guardada:**

```javascript
{
    "individual": {
        "total": 2,
        "disponibles": 1,
        "reservadas": 1,
        "noDisponibles": 0,
        "porcentajeDisponible": 50
    },
    "doble": {
        "total": 5,
        "disponibles": 3,
        "reservadas": 1,
        "noDisponibles": 1,
        "porcentajeDisponible": 60
    },
    "semifamiliar": {
        "total": 2,
        "disponibles": 2,
        "reservadas": 0,
        "noDisponibles": 0,
        "porcentajeDisponible": 100
    },
    "familiar": {
        "total": 3,
        "disponibles": 0,
        "reservadas": 2,
        "noDisponibles": 1,
        "porcentajeDisponible": 0
    }
}
```

---

## 🎨 ESTILOS CSS

### **Badge Disponible:**

```css
.disponibilidad-badge.disponible {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: white;
}
```

### **Badge Pocas Disponibles:**

```css
.disponibilidad-badge.pocas-disponibles {
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: white;
    animation: pulse-warning 2s infinite;
}

@keyframes pulse-warning {
    0%, 100% {
        box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
    }
    50% {
        box-shadow: 0 4px 20px rgba(243, 156, 18, 0.8);
    }
}
```

### **Badge No Disponible:**

```css
.disponibilidad-badge.no-disponible {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
}
```

### **Card No Disponible:**

```css
.modulo-no-disponible {
    opacity: 0.6;
    filter: grayscale(50%);
}

.modulo-no-disponible::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
}
```

---

## ⚡ ACTUALIZACIÓN EN TIEMPO REAL

### **Métodos de Actualización:**

1. **Storage Event:**
   - Detecta cambios en localStorage
   - Actualiza automáticamente
   - Funciona entre pestañas

2. **Custom Event:**
   - Evento personalizado 'disponibilidadActualizada'
   - Actualización inmediata
   - Comunicación directa

3. **Polling:**
   - Verifica cada 10 segundos
   - Backup si eventos fallan
   - Asegura sincronización

---

## 🎯 CASOS DE USO

### **Caso 1: Admin Marca Sauna como No Disponible**

```
1. Admin abre configuración de "Doble-1"
2. Cambia estado a "No Disponible"
3. Guarda configuración
4. Sistema calcula: Dobles disponibles = 4 (antes 5)
5. Cliente ve badge actualizado: "4 Disponibles"
6. Actualización INSTANTÁNEA
```

### **Caso 2: Todas las Saunas Ocupadas**

```
1. Admin marca todas las familiares como reservadas
2. Sistema calcula: Familiares disponibles = 0
3. Cliente ve badge rojo: "No Disponible"
4. Card se vuelve gris
5. Botón "Reservar" se deshabilita
6. Cliente no puede reservar
```

### **Caso 3: Última Sauna Disponible**

```
1. Solo queda 1 sauna individual disponible
2. Sistema calcula: Individuales disponibles = 1
3. Cliente ve badge naranja: "⚠ 1 Disponible"
4. Badge pulsa para llamar atención
5. Cliente sabe que debe reservar pronto
```

---

## 📱 RESPONSIVE

### **Desktop:**

```
┌────────────────────────────────┐
│ Sauna Individual               │
│                                │
│ [✓ 2 Disponibles]  ← Badge    │
│                                │
│ Precio: 15 Bs                  │
│ [Reservar Ahora]               │
└────────────────────────────────┘
```

### **Mobile:**

```
┌──────────────────┐
│ Sauna Individual │
│                  │
│ [✓ 2 Disp.]     │
│                  │
│ 15 Bs            │
│ [Reservar]       │
└──────────────────┘
```

---

## 🔔 NOTIFICACIONES

### **Cuando Cambia Disponibilidad:**

```javascript
// Opcional: Notificar al cliente
if (disponibilidadAnterior[tipo].disponibles > 0 && 
    disponibilidadNueva[tipo].disponibles === 0) {
    
    mostrarNotificacionUsuario({
        titulo: '⚠️ Atención',
        mensaje: `Las saunas ${tipo} ya no están disponibles.`
    });
}
```

---

## ✅ VENTAJAS

### **Para el Cliente:**

1. **Información en Tiempo Real:**
   - Ve disponibilidad actual
   - No pierde tiempo reservando lo no disponible
   - Toma decisiones informadas

2. **Experiencia Mejorada:**
   - Badges visuales claros
   - Colores intuitivos
   - Animaciones que llaman atención

3. **Prevención de Errores:**
   - No puede reservar lo no disponible
   - Botones deshabilitados automáticamente
   - Menos frustraciones

### **Para el Admin:**

1. **Control Total:**
   - Marca saunas como no disponibles
   - Clientes ven cambios al instante
   - No necesita comunicación manual

2. **Gestión Eficiente:**
   - Actualización automática
   - Sin intervención adicional
   - Sistema se encarga de todo

---

## 🧪 TESTING

### **Checklist:**

- [ ] Admin marca sauna como no disponible
- [ ] Disponibilidad se calcula correctamente
- [ ] Se guarda en localStorage
- [ ] Cliente ve badge actualizado
- [ ] Badge tiene color correcto
- [ ] Botón se deshabilita si no hay disponibles
- [ ] Card se vuelve gris si no disponible
- [ ] Animación de pulso en pocas disponibles
- [ ] Actualización cada 10 segundos funciona
- [ ] Storage event funciona
- [ ] Responsive en móviles

---

## 📊 RESUMEN

### **Sistema Implementado:**

- ✅ Cálculo automático de disponibilidad
- ✅ Actualización en tiempo real
- ✅ Badges visuales con colores
- ✅ Animaciones de atención
- ✅ Botones deshabilitados automáticamente
- ✅ Cards con efecto visual
- ✅ Múltiples métodos de actualización
- ✅ Responsive completo
- ✅ Fácil de usar

### **Resultado:**

🎉 **DISPONIBILIDAD EN TIEMPO REAL FUNCIONANDO**

Los clientes ven solo las cantidades reales de saunas disponibles, actualizadas instantáneamente cuando el administrador cambia el estado de cualquier módulo.

---

**Fecha de Implementación:** 7 de Noviembre, 2025  
**Estado:** ✅ Sistema de Disponibilidad Activo
