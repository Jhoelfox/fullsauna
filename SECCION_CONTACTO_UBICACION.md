# 📍 Sección de Contacto y Ubicación

## ✅ Implementación Completada

Se ha agregado una sección completa de contacto y ubicación en la página principal de clientes (`index.html`).

---

## 📋 Contenido Agregado

### 1. Información de Contacto

**Teléfonos:**
- 📱 62975072 (WhatsApp)
- 📱 72340226 (WhatsApp)

**Ubicación:**
- 📍 Vida en Cristo DASS
- 📍 El Jordán, La Paz - Bolivia

**Horarios:**
- 🕐 Lunes a Domingo
- 🕐 8:00 AM - 10:00 PM

---

## 🗺️ Mapa Interactivo

Se ha integrado un mapa de Google Maps con:
- ✅ Ubicación aproximada de "Vida en Cristo DASS, El Jordán"
- ✅ Mapa interactivo (zoom, navegación)
- ✅ Badge flotante con el nombre del negocio
- ✅ Diseño responsive

**Nota:** El mapa usa coordenadas aproximadas de El Jordán, La Paz. Para mayor precisión, se recomienda:
1. Buscar la ubicación exacta en Google Maps
2. Obtener el código de inserción (embed)
3. Reemplazar el iframe actual

---

## 🎨 Características de Diseño

### Tarjetas de Información:
- 📞 **Teléfonos** - Con enlaces directos a WhatsApp
- 📍 **Ubicación** - Dirección completa
- 🕐 **Horarios** - Días y horas de atención

### Botones de Acción:
1. **Chatear por WhatsApp**
   - Color verde (#25D366)
   - Abre WhatsApp con mensaje predefinido
   - Enlace: `https://wa.me/59162975072`

2. **Cómo Llegar**
   - Abre Google Maps con la ubicación
   - Muestra direcciones desde ubicación actual

### Efectos Visuales:
- ✨ Hover effects en tarjetas
- ✨ Animaciones suaves
- ✨ Sombras y elevación
- ✨ Gradientes modernos

---

## 📱 Responsive Design

### Desktop (> 768px):
- Grid de 2 columnas (info + mapa)
- Mapa altura completa
- Tarjetas en columna

### Tablet (768px):
- Grid de 1 columna
- Mapa primero
- Información debajo

### Mobile (< 480px):
- Diseño vertical optimizado
- Botones full-width
- Mapa altura reducida (300px)

---

## 🔗 Enlaces Funcionales

### WhatsApp:
```
https://wa.me/59162975072?text=Hola,%20quisiera%20información%20sobre%20el%20sauna
```
- Abre WhatsApp Web o App
- Mensaje predefinido
- Número: +591 62975072

### Google Maps:
```
https://www.google.com/maps/search/?api=1&query=Vida+en+Cristo+DASS+El+Jordan+La+Paz
```
- Busca la ubicación en Google Maps
- Muestra direcciones
- Compatible con móviles

---

## 🎯 Footer Agregado

Se ha agregado un footer profesional con:

### Contenido:
- 🏢 Logo y descripción del negocio
- 🔗 Enlaces rápidos (Ubicación, Contacto, Admin)
- © Copyright 2024

### Diseño:
- Fondo oscuro con gradiente
- Enlaces con hover effects
- Responsive en móviles

---

## 📂 Archivos Modificados

1. **index.html**
   - Agregada sección `<section class="contacto-ubicacion">`
   - Agregado `<footer class="footer">`
   - Antes del cierre de `</body>`

2. **styles.css**
   - Agregados estilos para `.contacto-ubicacion`
   - Agregados estilos para `.footer`
   - Media queries responsive

---

## 🔧 Personalización

### Para actualizar el mapa:

1. **Ir a Google Maps:**
   - Buscar "Vida en Cristo DASS, El Jordán, La Paz"
   - Hacer clic en "Compartir"
   - Seleccionar "Insertar un mapa"
   - Copiar el código iframe

2. **Reemplazar en index.html:**
   ```html
   <iframe 
       src="TU_NUEVO_CODIGO_AQUI"
       width="100%" 
       height="100%" 
       style="border:0; border-radius: 12px;" 
       allowfullscreen="" 
       loading="lazy">
   </iframe>
   ```

### Para cambiar teléfonos:

Buscar en `index.html`:
```html
<a href="tel:+59162975072" class="contacto-link">
    <i class="fab fa-whatsapp"></i> 62975072
</a>
```

Cambiar el número en:
- `href="tel:+591TUNUMERO"`
- El texto visible

### Para cambiar horarios:

Buscar en `index.html`:
```html
<p><strong>Lunes a Domingo</strong></p>
<p>8:00 AM - 10:00 PM</p>
```

---

## ✅ Checklist de Implementación

- ✅ Sección de contacto agregada
- ✅ Información de teléfonos (62975072, 72340226)
- ✅ Ubicación (Vida en Cristo DASS)
- ✅ Mapa de Google Maps integrado
- ✅ Botones de WhatsApp funcionales
- ✅ Botón de direcciones a Google Maps
- ✅ Footer profesional
- ✅ Diseño responsive
- ✅ Estilos CSS completos
- ✅ Hover effects y animaciones

---

## 🎨 Colores Utilizados

- **Primario:** #667eea (Morado)
- **Secundario:** #764ba2 (Morado oscuro)
- **WhatsApp:** #25D366 (Verde)
- **Fondo:** Gradiente #f5f7fa → #c3cfe2
- **Footer:** Gradiente #2c3e50 → #34495e

---

## 📱 Pruebas Recomendadas

1. ✅ Verificar que los enlaces de WhatsApp funcionen
2. ✅ Probar el botón "Cómo Llegar"
3. ✅ Verificar el mapa en diferentes dispositivos
4. ✅ Probar responsive en móvil
5. ✅ Verificar que los teléfonos sean clickeables

---

## 🚀 Próximos Pasos (Opcional)

1. **Obtener ubicación exacta:**
   - Ir físicamente al local
   - Obtener coordenadas GPS exactas
   - Actualizar el mapa con ubicación precisa

2. **Agregar más información:**
   - Email de contacto
   - Redes sociales (Facebook, Instagram)
   - Galería de fotos del local

3. **Integración avanzada:**
   - Formulario de contacto
   - Chat en vivo
   - Reservas desde la sección de contacto

---

## 📝 Notas Importantes

- Los números de WhatsApp están configurados con código de país +591 (Bolivia)
- El mapa usa coordenadas aproximadas de El Jordán
- Los enlaces se abren en nueva pestaña (_blank)
- El diseño es completamente responsive
- Compatible con todos los navegadores modernos
