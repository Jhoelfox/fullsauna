// Script para el Panel de Personal Administrativo
// Las funciones de módulos y productos se heredan de admin-script.js

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Cargar módulos y productos usando las funciones del admin
    cargarModulosAdmin();
    cargarProductosAdmin();
    
    // Cargar funciones específicas del personal
    cargarProductosParaVenta();
    cargarVentasDelDia();
    actualizarResumenVentas();
    
    // Configurar formularios de ventas
    document.getElementById('form-venta-rapida')?.addEventListener('submit', registrarVenta);
    document.getElementById('form-efectivo-rapido')?.addEventListener('submit', registrarIngresoEfectivo);
    
    // Listener para cambio de estado en el modal
    document.getElementById('modulo-estado')?.addEventListener('change', cambiarEstadoModulo);
});

// ============= FUNCIONES ESPECÍFICAS DE VENTAS =============

function cambiarTipoVenta(tipo) {
    const tabs = document.querySelectorAll('.venta-tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.closest('.venta-tab-btn').classList.add('active');
    
    if (tipo === 'producto') {
        document.getElementById('form-venta-producto').style.display = 'block';
        document.getElementById('form-ingreso-efectivo').style.display = 'none';
    } else {
        document.getElementById('form-venta-producto').style.display = 'none';
        document.getElementById('form-ingreso-efectivo').style.display = 'block';
    }
}

function cargarProductosParaVenta() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const select = document.getElementById('producto-venta');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    
    productos.forEach(producto => {
        if (producto.stock > 0) {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} - ${producto.precio} Bs (Stock: ${producto.stock})`;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            select.appendChild(option);
        }
    });
}

function actualizarPrecioVenta() {
    const select = document.getElementById('producto-venta');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const precio = parseFloat(selectedOption.dataset.precio);
        document.getElementById('precio-unitario-venta').value = precio.toFixed(2);
        calcularTotalVenta();
    } else {
        document.getElementById('precio-unitario-venta').value = '';
        document.getElementById('total-venta').value = '';
    }
}

function calcularTotalVenta() {
    const cantidad = parseInt(document.getElementById('cantidad-venta').value) || 0;
    const precioUnitario = parseFloat(document.getElementById('precio-unitario-venta').value) || 0;
    const total = cantidad * precioUnitario;
    
    document.getElementById('total-venta').value = total.toFixed(2);
}

function registrarVenta(e) {
    e.preventDefault();
    
    const productoSelect = document.getElementById('producto-venta');
    const productoId = productoSelect.value;
    const productoNombre = productoSelect.options[productoSelect.selectedIndex].text.split(' - ')[0];
    const cantidad = parseInt(document.getElementById('cantidad-venta').value);
    const precioUnitario = parseFloat(document.getElementById('precio-unitario-venta').value);
    const total = parseFloat(document.getElementById('total-venta').value);
    const metodoPago = document.getElementById('metodo-pago-venta').value;
    
    // Verificar stock
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const productoIndex = productos.findIndex(p => p.id == productoId);
    
    if (productoIndex === -1) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    if (productos[productoIndex].stock < cantidad) {
        mostrarNotificacion('Stock insuficiente', 'error');
        return;
    }
    
    // Actualizar stock
    productos[productoIndex].stock -= cantidad;
    localStorage.setItem('productos', JSON.stringify(productos));
    
    // Registrar venta
    const venta = {
        id: Date.now().toString(),
        productoId: productoId,
        productoNombre: productoNombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: total,
        metodoPago: metodoPago,
        fecha: new Date().toISOString(),
        tipo: 'producto'
    };
    
    const ventas = JSON.parse(localStorage.getItem('ventasPersonal')) || [];
    ventas.push(venta);
    localStorage.setItem('ventasPersonal', JSON.stringify(ventas));
    
    // Registrar en caja
    registrarEnCaja(venta);
    
    // Limpiar formulario
    document.getElementById('form-venta-rapida').reset();
    document.getElementById('precio-unitario-venta').value = '';
    document.getElementById('total-venta').value = '';
    
    // Actualizar vistas
    cargarProductosParaVenta();
    cargarProductosAdmin();
    cargarVentasDelDia();
    actualizarResumenVentas();
    
    mostrarNotificacion(`Venta registrada: ${productoNombre} x${cantidad}`, 'success');
}

function registrarIngresoEfectivo(e) {
    e.preventDefault();
    
    const monto = parseFloat(document.getElementById('monto-efectivo').value);
    const concepto = document.getElementById('concepto-efectivo').value;
    const descripcion = document.getElementById('descripcion-efectivo').value;
    
    const ingreso = {
        id: Date.now().toString(),
        tipo: 'ingreso',
        concepto: concepto,
        descripcion: descripcion,
        monto: monto,
        metodo: 'efectivo',
        fecha: new Date().toISOString(),
        usuario: 'Personal Administrativo'
    };
    
    const movimientos = JSON.parse(localStorage.getItem('movimientosCaja')) || [];
    movimientos.push(ingreso);
    localStorage.setItem('movimientosCaja', JSON.stringify(movimientos));
    
    // Registrar también en ventas personal
    const venta = {
        id: Date.now().toString(),
        productoNombre: concepto,
        cantidad: 1,
        precioUnitario: monto,
        total: monto,
        metodoPago: 'efectivo',
        fecha: new Date().toISOString(),
        tipo: 'efectivo',
        descripcion: descripcion
    };
    
    const ventas = JSON.parse(localStorage.getItem('ventasPersonal')) || [];
    ventas.push(venta);
    localStorage.setItem('ventasPersonal', JSON.stringify(ventas));
    
    // Limpiar formulario
    document.getElementById('form-efectivo-rapido').reset();
    
    // Actualizar vistas
    cargarVentasDelDia();
    actualizarResumenVentas();
    
    mostrarNotificacion(`Ingreso registrado: ${monto.toFixed(2)} Bs`, 'success');
}

function registrarEnCaja(venta) {
    const movimiento = {
        id: Date.now().toString(),
        tipo: 'ingreso',
        concepto: 'Venta de Productos',
        descripcion: `${venta.productoNombre} x${venta.cantidad}`,
        monto: venta.total,
        metodo: venta.metodoPago,
        fecha: venta.fecha,
        usuario: 'Personal Administrativo'
    };
    
    const movimientos = JSON.parse(localStorage.getItem('movimientosCaja')) || [];
    movimientos.push(movimiento);
    localStorage.setItem('movimientosCaja', JSON.stringify(movimientos));
}

function cargarVentasDelDia() {
    const ventas = JSON.parse(localStorage.getItem('ventasPersonal')) || [];
    const hoy = new Date().toDateString();
    const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoy);
    
    const lista = document.getElementById('ventas-lista-hoy');
    
    if (!lista) return;
    
    if (ventasHoy.length === 0) {
        lista.innerHTML = '<p class="lista-vacia"><i class="fas fa-receipt"></i><br>No hay ventas registradas hoy</p>';
        return;
    }
    
    lista.innerHTML = ventasHoy.reverse().map(venta => `
        <div class="venta-item">
            <div class="venta-info">
                <div class="venta-producto">${venta.productoNombre}</div>
                <div class="venta-detalles">
                    ${venta.tipo === 'producto' ? `Cantidad: ${venta.cantidad} | ` : ''}
                    ${new Date(venta.fecha).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}
                    ${venta.descripcion ? `<br><small>${venta.descripcion}</small>` : ''}
                </div>
            </div>
            <div>
                <span class="venta-monto">${venta.total.toFixed(2)} Bs</span>
                <span class="venta-metodo ${venta.metodoPago}">${venta.metodoPago === 'efectivo' ? 'Efectivo' : 'QR'}</span>
            </div>
        </div>
    `).join('');
}

function actualizarResumenVentas() {
    const ventas = JSON.parse(localStorage.getItem('ventasPersonal')) || [];
    const hoy = new Date().toDateString();
    const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoy);
    
    const totalVentas = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const totalProductos = ventasHoy.reduce((sum, v) => sum + (v.cantidad || 0), 0);
    
    const ventasDiaEl = document.getElementById('ventas-dia-total');
    const productosVendidosEl = document.getElementById('productos-vendidos-total');
    
    if (ventasDiaEl) ventasDiaEl.textContent = `${totalVentas.toFixed(2)} Bs`;
    if (productosVendidosEl) productosVendidosEl.textContent = totalProductos;
}

// Función para actualizar estados de módulos (wrapper)
function actualizarEstadoModulos() {
    cargarModulosAdmin();
    mostrarNotificacion('Estados actualizados', 'success');
}


// Función para cerrar sesión
function cerrarSesionPersonal(event) {
    if (event) event.preventDefault();
    
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar sesión
        localStorage.removeItem('sesionPersonal');
        
        // Redirigir al login
        window.location.href = 'personal-login.html';
    }
}

// Mostrar nombre del personal en el header
window.addEventListener('load', function() {
    const sesion = JSON.parse(localStorage.getItem('sesionPersonal'));
    if (sesion && sesion.nombre) {
        const logoText = document.querySelector('.logo-text span');
        if (logoText) {
            logoText.innerHTML = `Sauna C y G - El Jordán <span style="margin-left: 1rem; color: #27ae60; font-weight: 600;">| ${sesion.nombre}</span>`;
        }
    }
});
