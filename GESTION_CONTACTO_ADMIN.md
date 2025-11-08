# 📞 Gestión de Información de Contacto desde Admin

## ✅ Funcionalidad Implementada

El administrador ahora puede editar toda la información de contacto, ubicación y horarios que aparece en la página principal de clientes, sin necesidad de editar código.

---

## 🎯 Ubicación en el Panel Admin

**Sección:** Configuración del Sistema  
**Tarjeta:** "Información de Contacto"

### Botones disponibles:
1. **📝 Editar Información de Contacto** - Abre el editor completo
2. **👁️ Ver Vista Previa** - Abre la página principal en la sección de contacto

### Vista Previa:
Muestra los datos actuales:
- 📞 Teléfono 1
- 📞 Teléfono 2
- 📍 Ubicación completa

---

## 📝 Campos Editables

### 1. Teléfonos de Contacto
- **Teléfono 1 (WhatsApp):** Número principal
- **Teléfono 2 (WhatsApp):** Número secundario

**Formato:** Solo números (ej: 62975072)  
**Uso:** Se agregan automáticamente enlaces de WhatsApp

---

### 2. Ubicación
- **Nombre del Lugar:** Ej: "Vida en Cristo DASS"
- **Dirección Completa:** Ej: "El Jordán, La Paz - Bolivia"

**Uso:** Aparece en la sección de contacto y en el mapa

---

### 3. Horarios de Atención
- **Días de Atención:** Ej: "Lunes a Domingo"
- **Hora de Apertura:** Selector de hora (ej: 08:00)
- **Hora de Cierre:** Selector de hora (ej: 22:00)

**Formato:** Automático con selector de hora

---

### 4. Mapa de Google
- **URL del Mapa:** Código iframe src de Google Maps

**Incluye ayuda paso a paso:**
- Botón "¿Cómo obtener el código del mapa?"
- Tutorial completo con instrucciones
- Ejemplos visuales

---

### 5. Mensaje de WhatsApp
- **Mensaje Inicial:** Texto predefinido al abrir WhatsApp

**Ejemplo:** "Hola, quisiera información sobre el sauna"

---

## 🔄 Flujo de Actualización

```
Admin abre editor → Modifica campos → Guarda cambios
    ↓
Datos se guardan en localStorage
    ↓
Página principal lee datos al cargar
    ↓
Información actualizada visible para clientes
```

---

## 📱 Actualización Automática

### Lo que se actualiza automáticamente:

1. **Teléfonos:**
   - Enlaces de llamada (`tel:`)
   - Enlaces de WhatsApp (`wa.me`)
   - Números visibles

2. **Ubicación:**
   - Nombre del lugar
   - Dirección completa
   - Badge en el mapa

3. **Horarios:**
   - Días de atención
   - Horario de apertura y cierre
   - Formato automático (AM/PM)

4. **Mapa:**
   - iframe de Google Maps
   - Enlace "Cómo Llegar"

5. **WhatsApp:**
   - Mensaje predefinido
   - Enlace con número correcto

---

## 🎨 Interfaz del Editor

### Diseño:
- Modal amplio (700px)
- Formulario organizado por secciones
- Campos con iconos descriptivos
- Ayuda contextual
- Validación de campos requeridos

### Secciones:
1. 📞 Teléfonos de Contacto
2. 📍 Ubicación
3. 🕐 Horarios de Atención
4. 🗺️ Mapa de Google
5. 💬 Mensaje de WhatsApp

---

## 📖 Guía: Cómo Obtener el Código del Mapa

### Paso 1: Ir a Google Maps
1. Abre [Google Maps](https://www.google.com/maps)
2. Busca tu ubicación exacta

### Paso 2: Compartir
3. Haz clic en "Compartir" 📤
4. Selecciona "Insertar un mapa"

### Paso 3: Copiar URL
5. Verás un código HTML:
   ```html
   <iframe src="https://www.google.com/maps/embed?pb=..."></iframe>
   ```
6. Copia SOLO la URL dentro de `src="..."`

### Paso 4: Pegar
7. Pega la URL en el campo "URL del Mapa"
8. Guarda los cambios

**Ejemplo de URL correcta:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825...
```

---

## 💾 Almacenamiento

### Estructura en localStorage:

```javascript
{
  "telefono1": "62975072",
  "telefono2": "72340226",
  "ubicacionNombre": "Vida en Cristo DASS",
  "ubicacionDireccion": "El Jordán, La Paz - Bolivia",
  "horarioDias": "Lunes a Domingo",
  "horarioInicio": "08:00",
  "horarioFin": "22:00",
  "mapaUrl": "https://www.google.com/maps/embed?pb=...",
  "whatsappMensaje": "Hola, quisiera información sobre el sauna"
}
```

**Clave:** `infoContacto`

---

## 🔧 Funciones JavaScript

### En admin-script.js:

1. **`abrirEditorContacto()`**
   - Abre el modal
   - Carga datos actuales
   - Llena el formulario

2. **`guardarContacto(event)`**
   - Valida campos
   - Guarda en localStorage
   - Actualiza vista previa
   - Muestra notificación

3. **`cargarVistaPreviewContacto()`**
   - Lee datos de localStorage
   - Actualiza vista previa en admin

4. **`actualizarContactoEnPagina(contacto)`**
   - Guarda datos para la página principal

5. **`abrirAyudaMapa()`**
   - Muestra tutorial del mapa
   - Instrucciones paso a paso

### En index.html:

1. **`actualizarInformacionContacto(contacto)`**
   - Lee datos de localStorage
   - Actualiza todos los elementos
   - Modifica enlaces y textos

---

## ✅ Validaciones

### Campos requeridos:
- ✅ Teléfono 1
- ✅ Teléfono 2
- ✅ Nombre del lugar
- ✅ Dirección completa
- ✅ Días de atención
- ✅ Hora de apertura
- ✅ Hora de cierre

### Validaciones automáticas:
- Formato de teléfono (solo números)
- Formato de hora (HH:MM)
- Campos no vacíos

---

## 🎯 Valores por Defecto

Si no hay datos guardados, se usan estos valores:

```javascript
{
  telefono1: "62975072",
  telefono2: "72340226",
  ubicacionNombre: "Vida en Cristo DASS",
  ubicacionDireccion: "El Jordán, La Paz - Bolivia",
  horarioDias: "Lunes a Domingo",
  horarioInicio: "08:00",
  horarioFin: "22:00",
  mapaUrl: "https://www.google.com/maps/embed?pb=...",
  whatsappMensaje: "Hola, quisiera información sobre el sauna"
}
```

---

## 📱 Responsive

### Desktop:
- Modal centrado (700px)
- Campos en grid 2 columnas
- Formulario completo visible

### Tablet:
- Modal adaptado
- Campos en 1 columna
- Scroll vertical

### Mobile:
- Modal full-width (95%)
- Campos apilados
- Botones full-width

---

## 🔄 Sincronización

### Actualización en tiempo real:
1. Admin guarda cambios
2. Datos se guardan en localStorage
3. Cliente recarga página
4. Información actualizada visible

**Nota:** Los clientes deben recargar la página para ver los cambios.

---

## 🎨 Estilos CSS

### Clases agregadas:

- `.contacto-preview` - Vista previa en admin
- `.form-section` - Secciones del formulario
- `.form-group` - Grupos de campos
- `.preview-item` - Items de vista previa

### Colores:
- Primario: #667eea
- Fondo: #f8f9fa
- Texto: #2c3e50
- Borde: #e0e0e0

---

## 🚀 Ventajas

1. **Sin código:** Admin no necesita editar HTML
2. **Fácil de usar:** Interfaz intuitiva
3. **Validación:** Campos requeridos y formatos
4. **Ayuda integrada:** Tutorial del mapa
5. **Vista previa:** Ver cambios antes de publicar
6. **Responsive:** Funciona en todos los dispositivos
7. **Persistente:** Datos guardados en localStorage

---

## 📝 Notas Importantes

1. **Formato de teléfonos:** Solo números, sin espacios ni guiones
2. **Código de país:** Se agrega automáticamente (+591)
3. **URL del mapa:** Solo la URL del src, no todo el iframe
4. **Recarga necesaria:** Clientes deben recargar para ver cambios
5. **localStorage:** Datos se mantienen en el navegador

---

## 🔮 Mejoras Futuras (Opcional)

1. **Backend:** Guardar en base de datos
2. **Actualización en vivo:** WebSockets para cambios instantáneos
3. **Múltiples ubicaciones:** Gestionar varias sucursales
4. **Historial:** Ver cambios anteriores
5. **Validación avanzada:** Verificar URLs de mapas
6. **Preview en vivo:** Ver cambios sin guardar

---

## ✅ Checklist de Uso

Para el administrador:

- [ ] Abrir panel admin
- [ ] Ir a "Configuración del Sistema"
- [ ] Hacer clic en "Editar Información de Contacto"
- [ ] Completar todos los campos
- [ ] Si es necesario, actualizar el mapa (usar botón de ayuda)
- [ ] Guardar cambios
- [ ] Verificar vista previa
- [ ] Abrir página principal para confirmar

---

## 🎓 Capacitación Recomendada

### Para el administrador:

1. **Edición básica:**
   - Cambiar teléfonos
   - Actualizar horarios
   - Modificar ubicación

2. **Edición del mapa:**
   - Buscar ubicación en Google Maps
   - Obtener código de inserción
   - Copiar URL correcta
   - Pegar y guardar

3. **Personalización:**
   - Mensaje de WhatsApp
   - Días de atención
   - Horarios especiales

---

## 📞 Soporte

Si tienes problemas:

1. **Mapa no se muestra:**
   - Verifica que copiaste solo la URL
   - Asegúrate de que la URL comience con `https://`
   - Prueba buscando la ubicación nuevamente

2. **WhatsApp no funciona:**
   - Verifica el formato del número (solo dígitos)
   - Asegúrate de que el número sea válido

3. **Cambios no se ven:**
   - Recarga la página principal (Ctrl+F5)
   - Limpia caché del navegador
   - Verifica que guardaste los cambios
