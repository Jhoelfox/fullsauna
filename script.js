// ==========================================
// VERIFICACIÓN DE BLOQUEO DE PÁGINA
// ==========================================

// Verificar si la página está bloqueada al cargar
document.addEventListener('DOMContentLoaded', function() {
    verificarBloqueoAlCargar();
});

function verificarBloqueoAlCargar() {
    const paginaBloqueada = localStorage.getItem('paginaBloqueada') === 'true';
    
    if (paginaBloqueada) {
        mostrarPaginaBloqueada();
        return;
    }
    
    // Si no está bloqueada, continuar con la carga normal
    inicializarPaginaNormal();
}

function mostrarPaginaBloqueada() {
    const mensajePersonalizado = localStorage.getItem('mensajeBloqueo') || 
        'El sistema está temporalmente fuera de servicio por mantenimiento. Disculpe las molestias.';
    
    const fechaBloqueo = localStorage.getItem('fechaBloqueo');
    let infoFecha = '';
    
    if (fechaBloqueo) {
        const fecha = new Date(fechaBloqueo);
        infoFecha = `<p class="fecha-bloqueo">Desde: ${fecha.toLocaleString('es-ES')}</p>`;
    }
    
    document.body.innerHTML = `
        <div class="pagina-bloqueada">
            <div class="contenido-bloqueo">
                <div class="icono-bloqueo">
                    <i class="fas fa-lock"></i>
                </div>
                <h1>Página Temporalmente Cerrada</h1>
                <div class="mensaje-bloqueo">
                    <p>${mensajePersonalizado}</p>
                    ${infoFecha}
                </div>
                <div class="acciones-bloqueo">
                    <button onclick="verificarDesbloqueo()" class="btn-verificar">
                        <i class="fas fa-sync"></i> Verificar Estado
                    </button>
                    <a href="admin.html" class="btn-admin">
                        <i class="fas fa-user-shield"></i> Acceso Administrador
                    </a>
                </div>
                <div class="info-contacto">
                    <p><i class="fas fa-phone"></i> Para más información, contacte al administrador</p>
                </div>
            </div>
        </div>
    `;
    
    // Agregar estilos para la página bloqueada
    agregarEstilosPaginaBloqueada();
    
    // Verificar cada 30 segundos si se desbloqueó
    setInterval(verificarDesbloqueo, 30000);
}

function verificarDesbloqueo() {
    const paginaBloqueada = localStorage.getItem('paginaBloqueada') === 'true';
    
    if (!paginaBloqueada) {
        // La página fue desbloqueada, recargar
        location.reload();
    } else {
        // Mostrar mensaje de que sigue bloqueada
        mostrarNotificacionBloqueo('La página sigue bloqueada', 'info');
    }
}

function mostrarNotificacionBloqueo(mensaje, tipo) {
    const notification = document.createElement('div');
    notification.className = `notificacion-bloqueo ${tipo}`;
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${mensaje}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function agregarEstilosPaginaBloqueada() {
    const style = document.createElement('style');
    style.textContent = `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .pagina-bloqueada {
            width: 100%;
            max-width: 600px;
            padding: 2rem;
        }
        
        .contenido-bloqueo {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .icono-bloqueo {
            font-size: 4rem;
            color: #e74c3c;
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 1.5rem;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .mensaje-bloqueo {
            margin-bottom: 2rem;
            color: #34495e;
            line-height: 1.6;
        }
        
        .mensaje-bloqueo p {
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }
        
        .fecha-bloqueo {
            font-size: 0.9rem;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .acciones-bloqueo {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        
        .btn-verificar, .btn-admin {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }
        
        .btn-verificar {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
        }
        
        .btn-verificar:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
        }
        
        .btn-admin {
            background: linear-gradient(135deg, #e67e22, #d35400);
            color: white;
        }
        
        .btn-admin:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(230, 126, 34, 0.4);
        }
        
        .info-contacto {
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .notificacion-bloqueo {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        
        .notificacion-bloqueo.info {
            background: linear-gradient(135deg, #3498db, #2980b9);
        }
        
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
            .pagina-bloqueada {
                padding: 1rem;
            }
            
            .contenido-bloqueo {
                padding: 2rem;
            }
            
            h1 {
                font-size: 1.5rem;
            }
            
            .acciones-bloqueo {
                flex-direction: column;
                align-items: center;
            }
            
            .btn-verificar, .btn-admin {
                width: 100%;
                max-width: 250px;
                justify-content: center;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function inicializarPaginaNormal() {
    // Continuar con la inicialización normal de la página
    // Esta función se llamará solo si la página no está bloqueada
    inicializarApp();
}

// ==========================================
// CONFIGURACIÓN DE MÓDULOS
// ==========================================

// Configuración de módulos con cantidades específicas
const modulos = {
    individual: {
        nombre: 'Individual',
        precio: 15,
        regaderas: 1,
        capacidad: '1 adulto o 1 adulto + 1 niño',
        disponibles: 2, // 2 individuales
        descripcion: 'Módulo individual perfecto para relajación personal',
        caracteristicas: ['Sauna privado', 'Temperatura controlada', 'Ducha incluida', 'Toallas limpias']
    },
    doble: {
        nombre: 'Doble',
        precio: 25,
        regaderas: 1,
        capacidad: '2 adultos o 2 adultos + 1 niño',
        disponibles: 5, // 5 dobles
        descripcion: 'Módulo doble ideal para parejas',
        caracteristicas: ['Sauna para dos', 'Ambiente romántico', 'Ducha compartida', 'Kit de relajación']
    },
    semifamiliar: {
        nombre: 'Semifamiliar',
        precio: 35,
        regaderas: 2,
        capacidad: '2 adultos + 2 niños',
        disponibles: 2, // 2 semifamiliares
        descripcion: 'Módulo semifamiliar para familias pequeñas',
        caracteristicas: ['Espacio amplio', 'Dos duchas', 'Área para niños', 'Seguridad garantizada']
    },
    familiar: {
        nombre: 'Familiar',
        precio: 45,
        regaderas: 2,
        capacidad: '3-4 adultos y/o hasta 4 niños',
        disponibles: 3, // 3 familiares
        descripcion: 'Módulo familiar grande para grupos',
        caracteristicas: ['Máximo espacio', 'Dos duchas amplias', 'Área de descanso', 'Perfecto para grupos']
    }
};

// Productos por defecto
let productos = [
    { id: 1, nombre: 'Chocolate Premium', categoria: 'dulces', precio: 5, stock: 45 },
    { id: 2, nombre: 'Caramelos Artesanales', categoria: 'dulces', precio: 3, stock: 80 },
    { id: 3, nombre: 'Gomitas Naturales', categoria: 'dulces', precio: 4, stock: 60 },
    { id: 4, nombre: 'Champú Herbal Orgánico', categoria: 'shampus', precio: 18, stock: 25 },
    { id: 5, nombre: 'Champú Anticaspa Premium', categoria: 'shampus', precio: 22, stock: 18 },
    { id: 6, nombre: 'Champú para Niños', categoria: 'shampus', precio: 15, stock: 30 },
    { id: 7, nombre: 'Coca Cola 500ml', categoria: 'refrescos', precio: 8, stock: 75 },
    { id: 8, nombre: 'Agua Mineral Premium', categoria: 'refrescos', precio: 5, stock: 90 },
    { id: 9, nombre: 'Jugo Natural', categoria: 'refrescos', precio: 12, stock: 40 },
    { id: 10, nombre: 'Toalla Premium', categoria: 'implementos', precio: 35, stock: 20 },
    { id: 11, nombre: 'Chinelas Antideslizantes', categoria: 'implementos', precio: 25, stock: 35 },
    { id: 12, nombre: 'Kit de Relajación', categoria: 'implementos', precio: 50, stock: 15 }
];

// Variables globales
let carrito = [];
let moduloSeleccionado = null;
let pasoActual = 1;
let personasSeleccionadas = '';
let categoriaFiltro = 'todos';
let fechaSeleccionada = '';
let horarioSeleccionado = '';

// Configuración de horarios
const HORARIO_APERTURA = 8; // 8:00 AM
const HORARIO_CIERRE = 22;   // 10:00 PM
const INTERVALO_MINUTOS = 30;

// La inicialización se maneja en verificarBloqueoAlCargar()

function inicializarApp() {
    cargarDatosLocalStorage();
    configurarEventListeners();
    cargarProductos();
    actualizarContadorCarrito();

    // Verificar si el usuario ya está registrado
    const usuarioRegistrado = localStorage.getItem('usuarioRegistrado');
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    
    if (usuarioRegistrado === 'true' && nombreUsuario) {
        // Usuario ya registrado, saltar página de bienvenida
        iniciarExperienciaDirecta();
    } else {
        // Usuario nuevo, mostrar página de bienvenida
        // Configurar botón de bienvenida
        const btnIniciar = document.getElementById('btn-iniciar');
        if (btnIniciar) {
            btnIniciar.addEventListener('click', iniciarExperiencia);
        }
    }
}

function iniciarExperienciaDirecta() {
    const welcomePage = document.getElementById('welcome-page');
    const mainApp = document.getElementById('main-app');
    const header = document.querySelector('.modern-header');

    // Ocultar página de bienvenida sin animación
    welcomePage.style.display = 'none';
    mainApp.style.display = 'block';
    header.style.display = 'block';

    // Cargar vista de saunas disponibles
    cargarVistasSaunasDisponibles();

    // Mostrar carrito flotante si hay items
    if (carrito.length > 0) {
        mostrarCarritoFlotante();
    }

    // Mostrar toast de bienvenida personalizado
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    setTimeout(() => {
        mostrarToast(`¡Bienvenido de nuevo, ${nombreUsuario}!`, 'success');
    }, 500);
}

function iniciarExperiencia() {
    const welcomePage = document.getElementById('welcome-page');
    const mainApp = document.getElementById('main-app');
    const header = document.querySelector('.modern-header');

    // Animar salida de la página de bienvenida
    welcomePage.classList.add('fade-out');

    setTimeout(() => {
        welcomePage.style.display = 'none';
        mainApp.style.display = 'block';
        header.style.display = 'block';

        // Cargar vista de saunas disponibles
        cargarVistasSaunasDisponibles();

        // Mostrar carrito flotante si hay items
        if (carrito.length > 0) {
            mostrarCarritoFlotante();
        }

        // Mostrar toast de bienvenida
        setTimeout(() => {
            mostrarToast('¡Bienvenido a Sauna C y G! Comienza tu experiencia de relajación', 'success');
        }, 500);
    }, 800);
}

function iniciarExperiencia() {
    const welcomePage = document.getElementById('welcome-page');
    const mainApp = document.getElementById('main-app');
    const header = document.querySelector('.modern-header');

    // Animar salida de la página de bienvenida
    welcomePage.classList.add('fade-out');

    setTimeout(() => {
        welcomePage.style.display = 'none';
        mainApp.style.display = 'block';
        header.style.display = 'block';

        // Mostrar toast de bienvenida
        setTimeout(() => {
            mostrarToast('¡Bienvenido a Sauna C y G! Comienza tu experiencia de relajación', 'success');
        }, 500);
    }, 800);
}

function configurarEventListeners() {
    // Botón del carrito
    document.getElementById('carrito-btn').addEventListener('click', mostrarCarrito);

    // Navegación de pasos
    document.getElementById('next-btn').addEventListener('click', siguientePaso);
    document.getElementById('prev-btn').addEventListener('click', pasoAnterior);

    // Opciones de personas
    document.querySelectorAll('.persona-option').forEach(option => {
        option.addEventListener('click', function () {
            seleccionarPersonas(this.dataset.value);
        });
    });

    // Filtros de productos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            filtrarProductos(this.dataset.categoria);
        });
    });

    // Selector de fecha
    const fechaInput = document.getElementById('fecha-visita');
    if (fechaInput) {
        // Establecer fecha mínima como hoy
        const hoy = new Date();
        fechaInput.min = hoy.toISOString().split('T')[0];

        // Establecer fecha máxima como 30 días desde hoy
        const fechaMaxima = new Date();
        fechaMaxima.setDate(hoy.getDate() + 30);
        fechaInput.max = fechaMaxima.toISOString().split('T')[0];

        fechaInput.addEventListener('change', function () {
            fechaSeleccionada = this.value;
            cargarHorariosDisponibles();
        });
    }
}

// Funciones de navegación por pasos
function siguientePaso() {
    if (pasoActual === 1) {
        if (!personasSeleccionadas) {
            mostrarToast('Por favor selecciona cuántas personas vendrán', 'warning');
            return;
        }
        actualizarModulosDisponibles();
        pasoActual = 2;
    } else if (pasoActual === 2) {
        if (!moduloSeleccionado) {
            mostrarToast('Por favor selecciona un módulo', 'warning');
            return;
        }
        cargarHorariosDisponibles();
        pasoActual = 3;
    } else if (pasoActual === 3) {
        if (!fechaSeleccionada) {
            mostrarToast('Por favor selecciona una fecha', 'warning');
            return;
        }
        if (!horarioSeleccionado) {
            mostrarToast('Por favor selecciona un horario', 'warning');
            return;
        }
        pasoActual = 4;
    } else if (pasoActual === 4) {
        const alergias = document.getElementById('alergias').value.trim();
        if (!alergias) {
            mostrarToast('Por favor completa la información de alergias', 'warning');
            document.getElementById('alergias').focus();
            return;
        }
        agregarModuloAlCarrito();
        return;
    }

    actualizarPasos();
}

function pasoAnterior() {
    if (pasoActual > 1) {
        pasoActual--;
        actualizarPasos();
    }
}

function actualizarPasos() {
    // Actualizar indicadores de paso
    document.querySelectorAll('.step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNumber < pasoActual) {
            step.classList.add('completed');
        } else if (stepNumber === pasoActual) {
            step.classList.add('active');
        }
    });

    // Mostrar/ocultar pasos
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === pasoActual) {
            step.classList.add('active');
        }
    });

    // Actualizar botones de navegación
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.style.display = pasoActual === 1 ? 'none' : 'flex';

    if (pasoActual === 4) {
        nextBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar al Carrito';
    } else {
        nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
    }
}

function seleccionarPersonas(valor) {
    // Remover selección anterior
    document.querySelectorAll('.persona-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Seleccionar nueva opción
    const opcionSeleccionada = document.querySelector(`[data-value="${valor}"]`);
    opcionSeleccionada.classList.add('selected');

    personasSeleccionadas = valor;
    mostrarToast('Selección actualizada', 'success');
}

function actualizarModulosDisponibles() {
    const modulosGrid = document.getElementById('modulos-grid');

    if (!personasSeleccionadas) {
        modulosGrid.innerHTML = '<p class="text-center">Selecciona primero cuántas personas vendrán</p>';
        return;
    }

    let modulosPermitidos = [];

    switch (personasSeleccionadas) {
        case '1-adulto':
        case '1-adulto-1-niño':
            modulosPermitidos = ['individual', 'doble', 'semifamiliar', 'familiar'];
            break;
        case '2-adultos':
        case '2-adultos-1-niño':
            modulosPermitidos = ['doble', 'semifamiliar', 'familiar'];
            break;
        case '2-adultos-2-niños':
            modulosPermitidos = ['semifamiliar', 'familiar'];
            break;
        case '3-4-adultos-niños':
            modulosPermitidos = ['familiar'];
            break;
    }

    const modulosDisponibles = getModulosDisponibles();
    let html = '';

    Object.keys(modulosDisponibles).forEach(tipo => {
        const modulo = modulosDisponibles[tipo];
        const permitidoPorCapacidad = modulosPermitidos.includes(tipo);
        const disponiblePorAdmin = modulo.disponible;
        const permitido = permitidoPorCapacidad && disponiblePorAdmin;

        let claseDisabled = '';
        let textoBoton = 'Seleccionar Módulo';
        let motivoNoDisponible = '';

        if (!permitidoPorCapacidad) {
            claseDisabled = 'disabled';
            textoBoton = 'Capacidad Insuficiente';
        } else if (!disponiblePorAdmin) {
            claseDisabled = 'disabled';
            textoBoton = 'No Disponible';
            motivoNoDisponible = modulo.motivo ? `<p class="modulo-motivo"><i class="fas fa-info-circle"></i> ${modulo.motivo}</p>` : '';
        }

        html += `
            <div class="modulo-card ${claseDisabled}" ${permitido ? `onclick="seleccionarModulo('${tipo}')"` : ''}>
                <div class="modulo-header">
                    <span class="modulo-tipo">${modulo.nombre}</span>
                    <span class="modulo-precio">${modulo.precio} Bs</span>
                </div>
                <div class="modulo-info">
                    <p>${modulo.descripcion}</p>
                    <p><strong>Capacidad:</strong> ${modulo.capacidad}</p>
                    <p><strong>Disponibles:</strong> ${modulo.disponibles}</p>
                    ${motivoNoDisponible}
                </div>
                <ul class="modulo-features">
                    ${modulo.caracteristicas.map(caracteristica =>
            `<li><i class="fas fa-check"></i> ${caracteristica}</li>`
        ).join('')}
                </ul>
                <button class="btn-seleccionar" ${!permitido ? 'disabled' : ''}>
                    ${textoBoton}
                </button>
            </div>
        `;
    });

    modulosGrid.innerHTML = html;
}

// Funciones para manejo de horarios
function cargarHorariosDisponibles() {
    const horariosGrid = document.getElementById('horarios-grid');

    if (!fechaSeleccionada) {
        horariosGrid.innerHTML = '<p class="text-center">Selecciona primero una fecha</p>';
        return;
    }

    const horarios = generarHorarios();
    let html = '';

    horarios.forEach(horario => {
        const disponible = verificarDisponibilidad(fechaSeleccionada, horario.valor);
        const claseDisponible = disponible ? '' : 'disabled';
        const textoEstado = disponible ? 'Disponible' : 'Ocupado';

        html += `
            <div class="horario-option ${claseDisponible}" 
                 ${disponible ? `onclick="seleccionarHorario('${horario.valor}')"` : ''}>
                <div class="horario-time">${horario.texto}</div>
                <div class="horario-status">${textoEstado}</div>
            </div>
        `;
    });

    horariosGrid.innerHTML = html;
}

function generarHorarios() {
    const horarios = [];

    for (let hora = HORARIO_APERTURA; hora < HORARIO_CIERRE; hora++) {
        for (let minuto = 0; minuto < 60; minuto += INTERVALO_MINUTOS) {
            const horaFormateada = hora.toString().padStart(2, '0');
            const minutoFormateado = minuto.toString().padStart(2, '0');
            const valorHorario = `${horaFormateada}:${minutoFormateado}`;
            const textoHorario = `${horaFormateada}:${minutoFormateado}`;

            horarios.push({
                valor: valorHorario,
                texto: textoHorario
            });
        }
    }

    return horarios;
}

function verificarDisponibilidad(fecha, hora) {
    // Verificar si es una fecha pasada
    const fechaHora = new Date(`${fecha}T${hora}`);
    const ahora = new Date();

    if (fechaHora < ahora) {
        return false;
    }

    // Verificar reservas existentes (simulado)
    const reservasExistentes = obtenerReservasExistentes(fecha, hora);

    // Verificar módulos disponibles según configuración del admin
    const modulosDisponiblesTotal = getTotalModulosDisponibles();

    return reservasExistentes < modulosDisponiblesTotal;
}

function getModulosDisponibles() {
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const modulosDisponibles = {};

    Object.keys(modulos).forEach(tipo => {
        const config = configuracionModulos[tipo] || { disponible: true };
        modulosDisponibles[tipo] = {
            ...modulos[tipo],
            disponible: config.disponible,
            motivo: config.motivo || ''
        };
    });

    return modulosDisponibles;
}

function obtenerReservasExistentes(fecha, hora) {
    // Simular reservas existentes
    // En una aplicación real, esto consultaría la base de datos
    const reservasGuardadas = JSON.parse(localStorage.getItem('reservasHorarios') || '{}');
    const clave = `${fecha}_${hora}`;
    return reservasGuardadas[clave] || 0;
}

function getTotalModulosDisponibles() {
    const modulosDisponibles = getModulosDisponibles();
    return Object.values(modulosDisponibles)
        .filter(modulo => modulo.disponible)
        .reduce((total, modulo) => total + modulo.disponibles, 0);
}

function seleccionarHorario(hora) {
    // Remover selección anterior
    document.querySelectorAll('.horario-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Seleccionar nuevo horario
    const opcionSeleccionada = event.currentTarget;
    opcionSeleccionada.classList.add('selected');

    horarioSeleccionado = hora;
    mostrarToast(`Horario ${hora} seleccionado`, 'success');
}

function guardarReservaHorario(fecha, hora) {
    const reservasGuardadas = JSON.parse(localStorage.getItem('reservasHorarios') || '{}');
    const clave = `${fecha}_${hora}`;
    reservasGuardadas[clave] = (reservasGuardadas[clave] || 0) + 1;
    localStorage.setItem('reservasHorarios', JSON.stringify(reservasGuardadas));
}

// Función para seleccionar módulo
function seleccionarModulo(tipo) {
    // Remover selección anterior
    document.querySelectorAll('.modulo-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.btn-seleccionar');
        btn.textContent = 'Seleccionar Módulo';
        btn.classList.remove('selected');
    });

    // Seleccionar nuevo módulo
    const card = event.currentTarget;
    card.classList.add('selected');
    const btn = card.querySelector('.btn-seleccionar');
    btn.textContent = '✓ Módulo Seleccionado';
    btn.classList.add('selected');

    moduloSeleccionado = {
        tipo: tipo,
        ...modulos[tipo]
    };

    mostrarToast(`Módulo ${modulos[tipo].nombre} seleccionado`, 'success');
}

// Función para agregar módulo al carrito
function agregarModuloAlCarrito() {
    if (!moduloSeleccionado) return;

    const alergias = document.getElementById('alergias').value.trim();
    if (!alergias) {
        mostrarToast('Por favor, complete el campo de alergias', 'warning');
        document.getElementById('alergias').focus();
        return;
    }

    const segundaAdquisicion = document.getElementById('segunda-adquisicion').checked;

    // Verificar si ya existe una reserva similar
    const reservaExistente = carrito.find(item =>
        item.tipo === 'reserva' &&
        item.modulo === moduloSeleccionado.tipo &&
        item.personas === personasSeleccionadas
    );

    if (reservaExistente && !segundaAdquisicion) {
        mostrarToast('Ya tienes una reserva de este tipo. Marca "Segunda adquisición" si deseas agregar otra.', 'warning');
        return;
    }

    const reserva = {
        id: Date.now(),
        tipo: 'reserva',
        modulo: moduloSeleccionado.tipo,
        nombre: `Reserva ${moduloSeleccionado.nombre}`,
        precio: moduloSeleccionado.precio,
        personas: personasSeleccionadas,
        fecha: fechaSeleccionada,
        horario: horarioSeleccionado,
        alergias: alergias,
        segundaAdquisicion: segundaAdquisicion,
        cantidad: 1
    };

    carrito.push(reserva);
    actualizarContadorCarrito();
    guardarDatosLocalStorage();

    // Guardar reserva de horario
    guardarReservaHorario(fechaSeleccionada, horarioSeleccionado);

    // Resetear formulario
    resetearFormulario();

    mostrarToast('¡Reserva agregada al carrito exitosamente!', 'success');
}

function resetearFormulario() {
    pasoActual = 1;
    personasSeleccionadas = '';
    moduloSeleccionado = null;
    fechaSeleccionada = '';
    horarioSeleccionado = '';

    // Limpiar selecciones
    document.querySelectorAll('.persona-option').forEach(option => {
        option.classList.remove('selected');
    });

    document.querySelectorAll('.modulo-card').forEach(card => {
        card.classList.remove('selected');
    });

    document.querySelectorAll('.horario-option').forEach(option => {
        option.classList.remove('selected');
    });

    const fechaInput = document.getElementById('fecha-visita');
    if (fechaInput) fechaInput.value = '';

    document.getElementById('alergias').value = '';
    document.getElementById('segunda-adquisicion').checked = false;

    actualizarPasos();
}

// Función para filtrar productos
function filtrarProductos(categoria) {
    // Actualizar botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-categoria="${categoria}"]`).classList.add('active');

    categoriaFiltro = categoria;
    cargarProductos();
}

// Función para cargar productos
function cargarProductos() {
    const productosGrid = document.getElementById('productos-grid');

    let productosFiltrados = productos;

    if (categoriaFiltro !== 'todos') {
        productosFiltrados = productos.filter(p => p.categoria === categoriaFiltro);
    }

    let html = '';

    productosFiltrados.forEach(producto => {
        if (producto.stock > 0) {
            const stockClase = producto.stock < 10 ? 'stock-bajo' : '';

            html += `
                <div class="producto-card" data-categoria="${producto.categoria}">
                    ${producto.imagen ? `<div class="producto-imagen-main"><img src="${producto.imagen}" alt="${producto.nombre}"></div>` : '<div class="producto-sin-imagen-main"><i class="fas fa-image"></i></div>'}
                    <div class="producto-header">
                        <span class="producto-nombre">${producto.nombre}</span>
                        <span class="producto-precio">${producto.precio} Bs</span>
                    </div>
                    <span class="producto-categoria">${getCategoriaLabel(producto.categoria)}</span>
                    <div class="producto-stock ${stockClase}">
                        Stock: ${producto.stock} unidades
                        ${producto.stock < 10 ? '<br><small>¡Pocas unidades!</small>' : ''}
                    </div>
                    <div class="cantidad-control">
                        <button onclick="cambiarCantidad(${producto.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="cantidad-${producto.id}" value="1" min="1" max="${producto.stock}">
                        <button onclick="cambiarCantidad(${producto.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-agregar" onclick="agregarProductoAlCarrito(${producto.id})">
                        <i class="fas fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            `;
        }
    });

    if (html === '') {
        html = '<div class="no-productos"><p>No hay productos disponibles en esta categoría</p></div>';
    }

    productosGrid.innerHTML = html;
}

function getCategoriaLabel(categoria) {
    const labels = {
        'refrescos': 'Bebidas',
        'shampus': 'Champús',
        'implementos': 'Implementos',
        'dulces': 'Dulces'
    };
    return labels[categoria] || categoria;
}

// Función para cambiar cantidad
function cambiarCantidad(productoId, cambio) {
    const input = document.getElementById(`cantidad-${productoId}`);
    const producto = productos.find(p => p.id === productoId);
    let nuevaCantidad = parseInt(input.value) + cambio;

    if (nuevaCantidad < 1) nuevaCantidad = 1;
    if (nuevaCantidad > producto.stock) nuevaCantidad = producto.stock;

    input.value = nuevaCantidad;
}

// Función para agregar producto al carrito
function agregarProductoAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    const cantidad = parseInt(document.getElementById(`cantidad-${productoId}`).value);

    if (cantidad > producto.stock) {
        mostrarToast('No hay suficiente stock disponible', 'error');
        return;
    }

    const itemExistente = carrito.find(item => item.tipo === 'producto' && item.id === productoId);

    if (itemExistente) {
        if (itemExistente.cantidad + cantidad > producto.stock) {
            mostrarToast('No hay suficiente stock disponible', 'error');
            return;
        }
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: productoId,
            tipo: 'producto',
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad,
            categoria: producto.categoria
        });
    }

    actualizarContadorCarrito();
    guardarDatosLocalStorage();

    // Resetear cantidad a 1
    document.getElementById(`cantidad-${productoId}`).value = 1;

    mostrarToast(`${producto.nombre} agregado al carrito`, 'success');
}

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('carrito-count');
    const contadorFlotante = document.getElementById('carrito-flotante-count');
    const totalFlotante = document.getElementById('carrito-flotante-total');

    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const totalPrecio = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

    contador.textContent = totalItems;
    if (contadorFlotante) contadorFlotante.textContent = totalItems;
    if (totalFlotante) totalFlotante.textContent = `${totalPrecio} Bs`;

    // Mostrar/ocultar carrito flotante
    if (totalItems > 0) {
        mostrarCarritoFlotante();
        actualizarCarritoFlotante();
    } else {
        ocultarCarritoFlotante();
    }
}

function mostrarCarritoFlotante() {
    const carritoFlotante = document.getElementById('carrito-flotante');
    if (carritoFlotante) {
        carritoFlotante.style.display = 'block';
    }
}

function ocultarCarritoFlotante() {
    const carritoFlotante = document.getElementById('carrito-flotante');
    if (carritoFlotante) {
        carritoFlotante.style.display = 'none';
    }
}

function toggleCarritoFlotante() {
    const carritoFlotante = document.getElementById('carrito-flotante');
    const toggleIcon = document.getElementById('carrito-toggle-icon');

    carritoFlotante.classList.toggle('collapsed');

    if (carritoFlotante.classList.contains('collapsed')) {
        toggleIcon.className = 'fas fa-chevron-down';
    } else {
        toggleIcon.className = 'fas fa-chevron-up';
    }
}

function actualizarCarritoFlotante() {
    const carritoFlotanteItems = document.getElementById('carrito-flotante-items');

    if (!carritoFlotanteItems) return;

    if (carrito.length === 0) {
        carritoFlotanteItems.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--gray-600);">Carrito vacío</p>';
        return;
    }

    let html = '';

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        let icono = '';
        let detalles = '';

        if (item.tipo === 'reserva') {
            icono = '<i class="fas fa-spa"></i>';
            detalles = `${getPersonasLabel(item.personas)}`;
            if (item.fecha && item.horario) {
                const fechaFormateada = new Date(item.fecha).toLocaleDateString('es-ES');
                detalles += ` - ${fechaFormateada} ${item.horario}`;
            }
        } else {
            icono = '<i class="fas fa-box"></i>';
            detalles = `${getCategoriaLabel(item.categoria)} - Cant: ${item.cantidad}`;
        }

        html += `
            <div class="carrito-flotante-item">
                <div class="item-flotante-icon">${icono}</div>
                <div class="item-flotante-info">
                    <div class="item-flotante-nombre">${item.nombre}</div>
                    <div class="item-flotante-detalles">${detalles}</div>
                </div>
                <div class="item-flotante-precio">${subtotal} Bs</div>
            </div>
        `;
    });

    carritoFlotanteItems.innerHTML = html;
}

function procederPago() {
    if (carrito.length === 0) {
        mostrarToast('El carrito está vacío', 'warning');
        return;
    }

    mostrarCarrito();
}

// Función para mostrar carrito
function mostrarCarrito() {
    const modal = document.getElementById('carrito-modal');
    const carritoItems = document.getElementById('carrito-items');
    const subtotalPrecio = document.getElementById('subtotal-precio');
    const totalPrecio = document.getElementById('total-precio');

    if (carrito.length === 0) {
        carritoItems.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 2rem;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                <p>Tu carrito está vacío</p>
                <small>Agrega productos o reserva un módulo para comenzar</small>
            </div>
        `;
        if (subtotalPrecio) subtotalPrecio.textContent = '0 Bs';
        totalPrecio.textContent = '0 Bs';
    } else {
        let html = '';
        let total = 0;

        carrito.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            let detalles = '';
            let icono = '';

            if (item.tipo === 'reserva') {
                const fechaFormateada = item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : '';
                detalles = `Personas: ${getPersonasLabel(item.personas)}`;
                if (item.fecha && item.horario) {
                    detalles += `<br>Fecha: ${fechaFormateada} a las ${item.horario}`;
                }
                if (item.segundaAdquisicion) {
                    detalles += '<br>(Segunda adquisición)';
                }
                icono = '<i class="fas fa-spa"></i>';
            } else {
                detalles = `Categoría: ${getCategoriaLabel(item.categoria)}`;
                icono = '<i class="fas fa-box"></i>';
            }

            html += `
                <div class="cart-item">
                    <div class="item-info">
                        <div class="item-nombre">${item.nombre}</div>
                        <div class="item-detalles">${detalles}</div>
                        <div class="item-detalles">Cantidad: ${item.cantidad} × ${item.precio} Bs</div>
                    </div>
                    <div class="item-precio">${subtotal} Bs</div>
                    <button onclick="eliminarDelCarrito(${index})" class="btn-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        carritoItems.innerHTML = html;
        if (subtotalPrecio) subtotalPrecio.textContent = `${total} Bs`;
        totalPrecio.textContent = `${total} Bs`;
    }

    modal.classList.add('show');
    modal.style.display = 'flex';
}

function getPersonasLabel(personas) {
    const labels = {
        '1-adulto': '1 Adulto',
        '1-adulto-1-niño': '1 Adulto + 1 Niño',
        '2-adultos': '2 Adultos',
        '2-adultos-1-niño': '2 Adultos + 1 Niño',
        '2-adultos-2-niños': '2 Adultos + 2 Niños',
        '3-4-adultos-niños': '3-4 Adultos/Niños'
    };
    return labels[personas] || personas;
}

// Funciones para vista de saunas disponibles
function cargarVistasSaunasDisponibles() {
    const grid = document.getElementById('saunas-status-grid');
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');

    let html = '';
    let numeroSauna = 1;

    Object.keys(modulos).forEach(tipo => {
        const modulo = modulos[tipo];
        const config = configuracionModulos[tipo] || { disponible: true };

        // Crear cada unidad individual del módulo
        for (let i = 1; i <= modulo.disponibles; i++) {
            const saunaId = `${tipo}-${i}`;
            const reserva = reservasActuales[saunaId];

            let estado = 'disponible';
            let estadoTexto = 'Disponible';
            let estadoIcono = 'fas fa-check-circle';
            let temporizadorHtml = '';
            let accionesHtml = '';

            // Determinar estado del sauna
            if (!config.disponible) {
                if (config.tiempoMantenimiento > 0) {
                    estado = 'mantenimiento';
                    estadoTexto = 'Mantenimiento';
                    estadoIcono = 'fas fa-tools';
                } else {
                    estado = 'ocupado';
                    estadoTexto = 'No Disponible';
                    estadoIcono = 'fas fa-times-circle';
                }
            } else if (reserva) {
                if (reserva.estado === 'ocupado') {
                    estado = 'ocupado';
                    estadoTexto = 'En Uso';
                    estadoIcono = 'fas fa-user';

                    if (reserva.tiempoRestante > 0) {
                        const horas = Math.floor(reserva.tiempoRestante / 60);
                        const minutos = reserva.tiempoRestante % 60;
                        temporizadorHtml = `
                            <div class="sauna-temporizador">
                                <div class="temporizador-tiempo" id="temporizador-${saunaId}">
                                    ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}
                                </div>
                                <div class="temporizador-label">Tiempo restante de uso</div>
                            </div>
                        `;
                    }
                } else if (reserva.estado === 'reservado') {
                    estado = 'reservado';
                    estadoTexto = 'Reservado';
                    estadoIcono = 'fas fa-clock';

                    const horaReserva = new Date(reserva.horaDisponible).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    temporizadorHtml = `
                        <div class="sauna-temporizador">
                            <div class="temporizador-tiempo">${horaReserva}</div>
                            <div class="temporizador-label">Disponible a partir de</div>
                        </div>
                    `;
                }
            }

            // Botón de reservar para después si está ocupado
            if (estado === 'ocupado' || estado === 'reservado') {
                accionesHtml = `
                    <div class="sauna-actions">
                        <button class="btn-reservar-despues" onclick="reservarParaDespues('${saunaId}', '${tipo}')">
                            <i class="fas fa-clock"></i> Reservar para Después
                        </button>
                    </div>
                `;
            }

            html += `
                <div class="sauna-status-card ${estado}">
                    <div class="sauna-status-header">
                        <div>
                            <div class="sauna-numero">Sauna #${numeroSauna}</div>
                            <div class="sauna-tipo">${modulo.nombre}</div>
                        </div>
                        <div class="sauna-status-badge ${estado}">
                            <i class="${estadoIcono}"></i>
                            ${estadoTexto}
                        </div>
                    </div>
                    
                    <div class="sauna-info">
                        <div class="sauna-info-row">
                            <span class="sauna-info-label">Precio:</span>
                            <span class="sauna-info-value">${modulo.precio} Bs</span>
                        </div>
                        <div class="sauna-info-row">
                            <span class="sauna-info-label">Capacidad:</span>
                            <span class="sauna-info-value">${modulo.capacidad}</span>
                        </div>
                        <div class="sauna-info-row">
                            <span class="sauna-info-label">Regaderas:</span>
                            <span class="sauna-info-value">${modulo.regaderas}</span>
                        </div>
                    </div>
                    
                    ${temporizadorHtml}
                    ${accionesHtml}
                </div>
            `;

            numeroSauna++;
        }
    });

    grid.innerHTML = html;

    // Iniciar temporizadores para saunas en uso
    iniciarTemporizadoresSaunas();
}

function reservarParaDespues(saunaId, tipo) {
    const tiempoEspera = prompt('¿En cuántos minutos estará disponible? (mínimo 15 minutos)');

    if (tiempoEspera && !isNaN(tiempoEspera) && parseInt(tiempoEspera) >= 15) {
        const minutos = parseInt(tiempoEspera);
        const horaDisponible = new Date();
        horaDisponible.setMinutes(horaDisponible.getMinutes() + minutos);

        const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');
        reservasActuales[saunaId] = {
            estado: 'reservado',
            horaDisponible: horaDisponible.toISOString(),
            tipo: tipo
        };

        localStorage.setItem('reservasActuales', JSON.stringify(reservasActuales));
        cargarVistasSaunasDisponibles();

        mostrarToast(`Sauna reservado para las ${horaDisponible.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 'success');
    } else {
        mostrarToast('Por favor ingresa un tiempo válido (mínimo 15 minutos)', 'warning');
    }
}

function iniciarTemporizadoresSaunas() {
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');

    Object.keys(reservasActuales).forEach(saunaId => {
        const reserva = reservasActuales[saunaId];

        if (reserva.estado === 'ocupado' && reserva.tiempoRestante > 0) {
            // Iniciar temporizador de uso
            const intervalo = setInterval(() => {
                reserva.tiempoRestante--;

                const display = document.getElementById(`temporizador-${saunaId}`);
                if (display) {
                    const horas = Math.floor(reserva.tiempoRestante / 60);
                    const minutos = reserva.tiempoRestante % 60;
                    display.textContent = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
                }

                if (reserva.tiempoRestante <= 0) {
                    clearInterval(intervalo);
                    delete reservasActuales[saunaId];
                    localStorage.setItem('reservasActuales', JSON.stringify(reservasActuales));
                    cargarVistasSaunasDisponibles();
                    mostrarToast(`Sauna #${saunaId} ahora está disponible`, 'success');
                }
            }, 60000); // Actualizar cada minuto
        } else if (reserva.estado === 'reservado') {
            // Verificar si ya es hora de que esté disponible
            const horaDisponible = new Date(reserva.horaDisponible);
            const ahora = new Date();

            if (ahora >= horaDisponible) {
                delete reservasActuales[saunaId];
                localStorage.setItem('reservasActuales', JSON.stringify(reservasActuales));
                cargarVistasSaunasDisponibles();
                mostrarToast(`Sauna #${saunaId} ahora está disponible`, 'success');
            }
        }
    });
}

// Función para mostrar notificaciones toast
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');

    // Configurar icono según el tipo
    let icono = '';
    switch (tipo) {
        case 'success':
            icono = 'fas fa-check-circle';
            break;
        case 'warning':
            icono = 'fas fa-exclamation-triangle';
            break;
        case 'error':
            icono = 'fas fa-times-circle';
            break;
        default:
            icono = 'fas fa-info-circle';
    }

    // Actualizar contenido
    toastIcon.className = `toast-icon ${icono}`;
    toastMessage.textContent = mensaje;

    // Remover clases anteriores y agregar la nueva
    toast.className = `toast ${tipo}`;

    // Mostrar toast
    toast.classList.add('show');

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Función para cerrar carrito
function cerrarCarrito() {
    const modal = document.getElementById('carrito-modal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// Función para eliminar del carrito
function eliminarDelCarrito(index) {
    const item = carrito[index];
    carrito.splice(index, 1);
    actualizarContadorCarrito();
    mostrarCarrito();
    guardarDatosLocalStorage();
    mostrarToast(`${item.nombre} eliminado del carrito`, 'success');
}

// Función para pagar en efectivo
function pagarEfectivo() {
    if (carrito.length === 0) {
        mostrarToast('El carrito está vacío', 'warning');
        return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    if (confirm(`¿Enviar solicitud de pago en efectivo por ${total} Bs al administrador?`)) {
        enviarSolicitudPagoEfectivo(total);
    }
}

// Función para enviar solicitud de pago en efectivo
function enviarSolicitudPagoEfectivo(total) {
    const solicitud = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: [...carrito],
        total: total,
        metodoPago: 'efectivo',
        estado: 'pendiente',
        clienteInfo: {
            timestamp: Date.now(),
            navegador: navigator.userAgent.split(')')[0] + ')',
            pantalla: `${screen.width}x${screen.height}`
        }
    };

    // Guardar solicitud pendiente
    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    solicitudesPendientes.push(solicitud);
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

    // Limpiar carrito temporalmente (se restaurará si se rechaza)
    const carritoRespaldo = [...carrito];
    carrito = [];
    moduloSeleccionado = null;

    // Resetear formulario
    resetearFormulario();
    actualizarContadorCarrito();
    guardarDatosLocalStorage();

    // Mostrar mensaje de confirmación
    mostrarToast('Solicitud enviada al administrador. Esperando confirmación...', 'success');

    // Cerrar modal de carrito
    cerrarCarrito();

    // Mostrar modal de espera
    mostrarModalEspera(solicitud.id, carritoRespaldo);
}

// Modal de espera de confirmación
function mostrarModalEspera(solicitudId, carritoRespaldo) {
    // Crear modal de espera si no existe
    if (!document.getElementById('modal-espera')) {
        const modalHTML = `
            <div id="modal-espera" class="modal modern-modal">
                <div class="modal-overlay"></div>
                <div class="modal-content espera-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-clock"></i> Esperando Confirmación</h2>
                    </div>
                    <div class="modal-body">
                        <div class="espera-content">
                            <div class="espera-icon">
                                <i class="fas fa-hourglass-half"></i>
                            </div>
                            <h3>Solicitud de Pago Enviada</h3>
                            <p>Tu solicitud de pago en efectivo ha sido enviada al administrador.</p>
                            <p><strong>Total: <span id="espera-total">0</span> Bs</strong></p>
                            <div class="espera-status">
                                <div class="status-indicator">
                                    <div class="pulse-dot"></div>
                                    <span>Esperando confirmación del administrador...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="cancelarSolicitud('${solicitudId}')" class="btn-cancel">
                            <i class="fas fa-times"></i> Cancelar Solicitud
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById('modal-espera');
    const totalSpan = document.getElementById('espera-total');
    const total = carritoRespaldo.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    totalSpan.textContent = total;
    modal.classList.add('show');
    modal.style.display = 'flex';

    // Verificar estado cada 3 segundos
    const intervaloVerificacion = setInterval(() => {
        verificarEstadoSolicitud(solicitudId, carritoRespaldo, intervaloVerificacion);
    }, 3000);

    // Guardar referencia del intervalo para poder cancelarlo
    modal.dataset.intervalo = intervaloVerificacion;
}

// Verificar estado de la solicitud
function verificarEstadoSolicitud(solicitudId, carritoRespaldo, intervalo) {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitud = solicitudesPendientes.find(s => s.id == solicitudId);

    if (!solicitud) {
        // Solicitud no encontrada, probablemente procesada
        clearInterval(intervalo);
        cerrarModalEspera();
        return;
    }

    if (solicitud.estado === 'confirmada') {
        clearInterval(intervalo);
        cerrarModalEspera();
        procesarPagoConfirmado(solicitud);
    } else if (solicitud.estado === 'rechazada') {
        clearInterval(intervalo);
        cerrarModalEspera();
        restaurarCarrito(carritoRespaldo, solicitud.motivoRechazo);
    }
}

// Cancelar solicitud
function cancelarSolicitud(solicitudId) {
    if (confirm('¿Estás seguro de que quieres cancelar la solicitud?')) {
        let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
        const solicitud = solicitudesPendientes.find(s => s.id == solicitudId);

        if (solicitud) {
            // Remover solicitud
            solicitudesPendientes = solicitudesPendientes.filter(s => s.id != solicitudId);
            localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

            // Restaurar carrito
            carrito = [...solicitud.items];
            actualizarContadorCarrito();
            guardarDatosLocalStorage();
        }

        cerrarModalEspera();
        mostrarToast('Solicitud cancelada. Tu carrito ha sido restaurado.', 'warning');
    }
}

// Cerrar modal de espera
function cerrarModalEspera() {
    const modal = document.getElementById('modal-espera');
    if (modal) {
        const intervalo = modal.dataset.intervalo;
        if (intervalo) {
            clearInterval(parseInt(intervalo));
        }
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Procesar pago confirmado
function procesarPagoConfirmado(solicitud) {
    // Procesar como pago normal
    procesarPago('efectivo', solicitud.total, solicitud.items);
    mostrarToast('¡Pago confirmado por el administrador! Gracias por tu compra.', 'success');
}

// Restaurar carrito si se rechaza
function restaurarCarrito(carritoRespaldo, motivo) {
    carrito = [...carritoRespaldo];
    actualizarContadorCarrito();
    guardarDatosLocalStorage();

    const mensajeMotivo = motivo ? `\nMotivo: ${motivo}` : '';
    mostrarToast(`Solicitud rechazada por el administrador.${mensajeMotivo}\nTu carrito ha sido restaurado.`, 'error');
}

// Función para pagar con QR
function pagarQR() {
    if (carrito.length === 0) {
        mostrarToast('El carrito está vacío', 'warning');
        return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    document.getElementById('total-qr').textContent = `${total} Bs`;

    cerrarCarrito();
    const qrModal = document.getElementById('qr-modal');
    qrModal.classList.add('show');
    qrModal.style.display = 'flex';
}

// Función para cerrar modal QR
function cerrarQR() {
    const modal = document.getElementById('qr-modal');
    modal.classList.remove('show');
    modal.style.display = 'none';
}

// Función para confirmar pago QR
function confirmarPagoQR() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Verificar si hay reservas en el carrito
    const tieneReservas = carrito.some(item => item.tipo === 'reserva');
    
    if (tieneReservas) {
        // Si hay reservas, crear solicitud pendiente para confirmación del admin
        crearSolicitudPagoQR(total);
    } else {
        // Si solo son productos, procesar pago directamente
        procesarPago('qr', total);
    }
    
    cerrarQR();
}

// Función para crear solicitud de pago QR (para reservas)
function crearSolicitudPagoQR(total) {
    // Obtener datos del formulario
    const nombre = document.getElementById('nombre')?.value || 'Cliente';
    const email = document.getElementById('email')?.value || '';
    const telefono = document.getElementById('telefono')?.value || '';
    
    const solicitud = {
        id: 'SOL-QR-' + Date.now(),
        cliente: nombre,
        email: email,
        telefono: telefono,
        fecha: new Date().toISOString(),
        items: [...carrito],
        total: total,
        metodoPago: 'qr',
        estado: 'pendiente',
        clienteInfo: {
            nombre: nombre,
            email: email,
            telefono: telefono
        }
    };
    
    // Guardar solicitud pendiente
    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    solicitudesPendientes.push(solicitud);
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));
    
    // Limpiar carrito
    carrito = [];
    moduloSeleccionado = null;
    resetearFormulario();
    actualizarContadorCarrito();
    cargarProductos();
    guardarDatosLocalStorage();
    
    // Mostrar mensaje de confirmación
    mostrarToast('✅ Solicitud de pago QR enviada. El administrador confirmará tu pago pronto.', 'success');
    
    // Mostrar modal de confirmación
    mostrarModalConfirmacionQR(solicitud.id);
}

// Función para mostrar modal de confirmación de solicitud QR
function mostrarModalConfirmacionQR(solicitudId) {
    const modal = document.createElement('div');
    modal.className = 'modal-confirmacion-qr';
    modal.innerHTML = `
        <div class="modal-confirmacion-content">
            <div class="confirmacion-header">
                <i class="fas fa-qrcode"></i>
                <h2>Solicitud de Pago QR Enviada</h2>
            </div>
            <div class="confirmacion-body">
                <p><strong>ID de Solicitud:</strong> ${solicitudId}</p>
                <p>Tu solicitud de pago con QR ha sido enviada al administrador.</p>
                <p>Recibirás una confirmación una vez que el pago sea verificado.</p>
                <div class="confirmacion-info">
                    <i class="fas fa-info-circle"></i>
                    <span>El administrador verificará tu pago y confirmará tu reserva.</span>
                </div>
            </div>
            <div class="confirmacion-footer">
                <button onclick="cerrarModalConfirmacionQR()" class="btn-primary">
                    <i class="fas fa-check"></i> Entendido
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    setTimeout(() => modal.classList.add('show'), 10);
}

// Función para cerrar modal de confirmación QR
function cerrarModalConfirmacionQR() {
    const modal = document.querySelector('.modal-confirmacion-qr');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Función para procesar pago
function procesarPago(metodoPago, total, itemsCustom = null) {
    // Usar items personalizados o carrito actual
    const items = itemsCustom || [...carrito];

    // Guardar transacción
    const transaccion = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: items,
        total: total,
        metodoPago: metodoPago
    };

    // Guardar en localStorage para el admin
    let transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    transacciones.push(transaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));

    // Actualizar stock de productos
    items.forEach(item => {
        if (item.tipo === 'producto') {
            const producto = productos.find(p => p.id === item.id);
            if (producto) {
                producto.stock -= item.cantidad;
            }
        }
    });

    // Limpiar carrito solo si no se proporcionaron items personalizados
    if (!itemsCustom) {
        carrito = [];
        moduloSeleccionado = null;

        // Resetear formulario
        resetearFormulario();
    }

    // Resetear formulario
    resetearFormulario();

    actualizarContadorCarrito();
    cargarProductos();
    guardarDatosLocalStorage();

    mostrarToast(`¡Pago procesado exitosamente! Total: ${total} Bs`, 'success');
}

// Funciones de localStorage
function guardarDatosLocalStorage() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarDatosLocalStorage() {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
    }

    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
}

// Función para mostrar notificaciones toast
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');

    // Configurar icono según el tipo
    let icono = '';
    toast.className = 'toast';

    switch (tipo) {
        case 'success':
            icono = 'fas fa-check-circle';
            toast.classList.add('success');
            break;
        case 'error':
            icono = 'fas fa-exclamation-circle';
            toast.classList.add('error');
            break;
        case 'warning':
            icono = 'fas fa-exclamation-triangle';
            toast.classList.add('warning');
            break;
        default:
            icono = 'fas fa-info-circle';
    }

    toastIcon.className = `toast-icon ${icono}`;
    toastMessage.textContent = mensaje;

    // Mostrar toast
    toast.classList.add('show');

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Event listeners para cerrar modales al hacer clic fuera
window.onclick = function (event) {
    const carritoModal = document.getElementById('carrito-modal');
    const qrModal = document.getElementById('qr-modal');

    if (event.target === carritoModal || event.target.classList.contains('modal-overlay')) {
        cerrarCarrito();
    }
    if (event.target === qrModal || event.target.classList.contains('modal-overlay')) {
        cerrarQR();
    }
}// ==========================================
// SISTEMA DE REGISTRO Y LOGIN
// ==========================================

// Función para mostrar el modal de registro
function mostrarRegistro() {
    const modal = document.getElementById('registro-modal');
    modal.style.display = 'block';
    
    // Agregar animación
    setTimeout(() => {
        modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.3s ease';
    }, 10);
}

// Función para cerrar el modal de registro
function cerrarRegistro() {
    const modal = document.getElementById('registro-modal');
    modal.style.display = 'none';
    
    // Limpiar formularios
    document.getElementById('login-form').reset();
    document.getElementById('registro-form').reset();
}

// Función para cambiar entre tabs de login y registro
function cambiarTab(tab) {
    // Actualizar botones de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Actualizar contenido de tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('login-tab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('registro-tab').classList.add('active');
    }
}

// Event listener para el formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarLogin();
        });
    }
    
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            procesarRegistro();
        });
    }
});

// Función para procesar el login
function procesarLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const recordar = document.getElementById('recordar').checked;
    
    // Validar campos
    if (!email || !password) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Buscar usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Login exitoso
        const sesion = {
            usuario: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono
            },
            fechaLogin: new Date().toISOString(),
            recordar: recordar
        };
        
        localStorage.setItem('sesionActual', JSON.stringify(sesion));
        
        // Marcar como usuario registrado para futuras visitas
        localStorage.setItem('usuarioRegistrado', 'true');
        localStorage.setItem('nombreUsuario', usuario.nombre);
        
        // Actualizar interfaz
        actualizarInterfazUsuario(sesion.usuario);
        
        cerrarRegistro();
        mostrarNotificacion(`¡Bienvenido de nuevo, ${usuario.nombre}!`, 'success');
    } else {
        mostrarNotificacion('Correo o contraseña incorrectos', 'error');
    }
}

// Función para procesar el registro
function procesarRegistro() {
    const nombre = document.getElementById('registro-nombre').value.trim();
    const apellido = document.getElementById('registro-apellido').value.trim();
    const email = document.getElementById('registro-email').value.trim().toLowerCase();
    const telefono = document.getElementById('registro-telefono').value.trim();
    const ciudad = document.getElementById('registro-ciudad').value;
    const password = document.getElementById('registro-password').value;
    const passwordConfirm = document.getElementById('registro-password-confirm').value;
    const terminos = document.getElementById('terminos').checked;
    const notificaciones = document.getElementById('notificaciones').checked;
    
    // Validaciones
    if (!nombre || !apellido || !email || !telefono || !ciudad || !password) {
        mostrarToast('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    if (!terminos) {
        mostrarToast('Debes aceptar los términos y condiciones', 'warning');
        return;
    }
    
    if (password !== passwordConfirm) {
        mostrarToast('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        mostrarToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    // Validar formato de teléfono
    if (!/^[0-9]{8,10}$/.test(telefono)) {
        mostrarToast('El teléfono debe tener entre 8 y 10 dígitos', 'warning');
        return;
    }
    
    // Verificar si el email ya existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    if (usuarios.find(u => u.email === email)) {
        mostrarToast('Este correo ya está registrado. Intenta iniciar sesión.', 'error');
        return;
    }
    
    // Verificar si el teléfono ya existe
    if (usuarios.find(u => u.telefono === telefono)) {
        mostrarToast('Este teléfono ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        nombreCompleto: `${nombre} ${apellido}`,
        email: email,
        telefono: telefono,
        ciudad: ciudad,
        password: password,
        notificaciones: notificaciones,
        fechaRegistro: new Date().toISOString(),
        reservasRealizadas: 0,
        totalGastado: 0,
        ultimaVisita: null,
        activo: true
    };
    
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Crear sesión automáticamente
    const sesion = {
        usuario: {
            id: nuevoUsuario.id,
            nombre: nombre,
            apellido: apellido,
            email: email,
            telefono: telefono,
            ciudad: ciudad
        },
        fechaLogin: new Date().toISOString(),
        recordar: true
    };
    
    localStorage.setItem('sesionActual', JSON.stringify(sesion));
    
    // Marcar como usuario registrado para futuras visitas
    localStorage.setItem('usuarioRegistrado', 'true');
    localStorage.setItem('nombreUsuario', nombre);
    
    // Actualizar interfaz
    actualizarInterfazUsuario(sesion.usuario);
    
    cerrarRegistro();
    mostrarToast(`¡Bienvenido a Sauna C y G, ${nombre}! 🎉`, 'success');
    
    // Limpiar formulario
    document.getElementById('registro-form').reset();
}

// Función para actualizar la interfaz cuando hay un usuario logueado
function actualizarInterfazUsuario(usuario) {
    const registerBtn = document.getElementById('registro-btn');
    
    if (registerBtn) {
        registerBtn.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${usuario.nombre}</span>
        `;
        registerBtn.onclick = function() {
            mostrarMenuUsuario();
        };
        registerBtn.classList.add('usuario-logueado');
    }
}

// Función para mostrar menú de usuario
function mostrarMenuUsuario() {
    const sesion = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesion) {
        mostrarRegistro();
        return;
    }
    
    const opciones = confirm(`Hola ${sesion.usuario.nombre}!\n\n¿Qué deseas hacer?\n\nOK = Ver mi perfil\nCancelar = Cerrar sesión`);
    
    if (opciones) {
        mostrarPerfilUsuario();
    } else {
        cerrarSesion();
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('sesionActual');
        
        const registerBtn = document.getElementById('registro-btn');
        if (registerBtn) {
            registerBtn.innerHTML = `
                <i class="fas fa-user-plus"></i>
                <span>Registrarse</span>
            `;
            registerBtn.onclick = mostrarRegistro;
            registerBtn.classList.remove('usuario-logueado');
        }
        
        mostrarNotificacion('Sesión cerrada exitosamente', 'success');
    }
}

// Función para mostrar perfil de usuario
function mostrarPerfilUsuario() {
    const sesion = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesion) return;
    
    const usuario = sesion.usuario;
    const mensaje = `
PERFIL DE USUARIO

Nombre: ${usuario.nombre} ${usuario.apellido}
Email: ${usuario.email}
Teléfono: ${usuario.telefono}

Fecha de registro: ${new Date(sesion.fechaLogin).toLocaleDateString('es-ES')}
    `.trim();
    
    alert(mensaje);
}

// Verificar sesión al cargar la página
function verificarSesionActiva() {
    const sesion = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (sesion && sesion.usuario) {
        actualizarInterfazUsuario(sesion.usuario);
    }
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('registro-modal');
    if (event.target === modal) {
        cerrarRegistro();
    }
});

// ==========================================
// FUNCIONES MEJORADAS PARA REGISTRO
// ==========================================

// Función para cambiar entre tabs (actualizada)
function cambiarTab(tab) {
    // Actualizar botones de tabs
    document.querySelectorAll('.registro-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Actualizar contenido de tabs
    document.querySelectorAll('.registro-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tab === 'login') {
        document.querySelector('.registro-tab-btn:first-child').classList.add('active');
        document.getElementById('login-tab').classList.add('active');
    } else {
        document.querySelector('.registro-tab-btn:last-child').classList.add('active');
        document.getElementById('registro-tab').classList.add('active');
    }
}

// Función para mostrar/ocultar contraseña
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = event.currentTarget;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Función para validar fuerza de contraseña
function validarFuerzaPassword(password) {
    let fuerza = 0;
    
    if (password.length >= 6) fuerza += 25;
    if (password.length >= 8) fuerza += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) fuerza += 25;
    if (/[0-9]/.test(password)) fuerza += 15;
    if (/[^a-zA-Z0-9]/.test(password)) fuerza += 10;
    
    return fuerza;
}

// Event listener para mostrar fuerza de contraseña
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('registro-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const fuerza = validarFuerzaPassword(this.value);
            const strengthBar = document.querySelector('.strength-bar');
            
            if (strengthBar) {
                strengthBar.style.width = fuerza + '%';
                
                if (fuerza < 40) {
                    strengthBar.style.background = '#ff4757';
                } else if (fuerza < 70) {
                    strengthBar.style.background = '#ffa502';
                } else {
                    strengthBar.style.background = '#4CAF50';
                }
            }
        });
    }
});

// Función mejorada para manejar login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const recordar = document.getElementById('recordar').checked;
    
    // Validar campos
    if (!email || !password) {
        mostrarToast('Por favor completa todos los campos', 'warning');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast('Por favor ingresa un correo válido', 'warning');
        return;
    }
    
    // Buscar usuario en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Login exitoso
        const sesion = {
            usuario: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                ciudad: usuario.ciudad || ''
            },
            fechaLogin: new Date().toISOString(),
            recordar: recordar
        };
        
        localStorage.setItem('sesionActual', JSON.stringify(sesion));
        
        cerrarRegistro();
        mostrarToast(`¡Bienvenido de nuevo, ${usuario.nombre}!`, 'success');
        
        // Recargar la página para actualizar la interfaz
        setTimeout(() => {
            location.reload();
        }, 1000);
    } else {
        mostrarToast('Correo o contraseña incorrectos', 'error');
        
        // Agregar efecto de shake al formulario
        const form = document.getElementById('login-form');
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
            form.style.animation = '';
        }, 500);
    }
}

// Función mejorada para manejar registro
function handleRegistro(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('registro-nombre').value.trim();
    const apellido = document.getElementById('registro-apellido').value.trim();
    const email = document.getElementById('registro-email').value.trim().toLowerCase();
    const telefono = document.getElementById('registro-telefono').value.trim();
    const ciudad = document.getElementById('registro-ciudad').value;
    const password = document.getElementById('registro-password').value;
    const passwordConfirm = document.getElementById('registro-password-confirm').value;
    const terminos = document.getElementById('terminos').checked;
    const notificaciones = document.getElementById('notificaciones').checked;
    
    // Validaciones
    if (!nombre || !apellido || !email || !telefono || !ciudad || !password || !passwordConfirm) {
        mostrarToast('Por favor completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast('Por favor ingresa un correo válido', 'warning');
        return;
    }
    
    // Validar formato de teléfono
    const telefonoRegex = /^[0-9]{8,10}$/;
    if (!telefonoRegex.test(telefono)) {
        mostrarToast('El teléfono debe tener entre 8 y 10 dígitos', 'warning');
        return;
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
        mostrarToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
        mostrarToast('Las contraseñas no coinciden', 'warning');
        return;
    }
    
    // Validar términos y condiciones
    if (!terminos) {
        mostrarToast('Debes aceptar los términos y condiciones', 'warning');
        return;
    }
    
    // Verificar si el email ya existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailExiste = usuarios.some(u => u.email === email);
    
    if (emailExiste) {
        mostrarToast('Este correo ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario con seguimiento de actividad
    const nuevoUsuario = {
        id: Date.now(),
        nombre: nombre,
        apellido: apellido,
        email: email,
        telefono: telefono,
        ciudad: ciudad,
        password: password,
        notificaciones: notificaciones,
        fechaRegistro: new Date().toISOString(),
        ultimaConexion: new Date().toISOString(),
        enLinea: true,
        historialConexiones: [{
            tipo: 'registro',
            fecha: new Date().toISOString(),
            accion: 'Usuario registrado'
        }],
        compras: [],
        reservas: [],
        estadisticas: {
            totalCompras: 0,
            totalGastado: 0,
            totalReservas: 0,
            visitasAlSitio: 1
        }
    };
    
    // Guardar usuario
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Registrar actividad
    registrarActividadUsuario(nuevoUsuario.id, 'registro', 'Usuario registrado exitosamente');
    
    // Crear sesión automáticamente
    const sesion = {
        usuario: {
            nombre: nuevoUsuario.nombre,
            apellido: nuevoUsuario.apellido,
            email: nuevoUsuario.email,
            telefono: nuevoUsuario.telefono,
            ciudad: nuevoUsuario.ciudad
        },
        fechaLogin: new Date().toISOString(),
        recordar: true
    };
    
    localStorage.setItem('sesionActual', JSON.stringify(sesion));
    
    cerrarRegistro();
    mostrarToast(`¡Bienvenido a Sauna C y G, ${nombre}! Tu cuenta ha sido creada exitosamente`, 'success');
    
    // Recargar la página para actualizar la interfaz
    setTimeout(() => {
        location.reload();
    }, 1500);
}

// Función para cerrar el modal de registro (actualizada)
function cerrarRegistro() {
    const modal = document.getElementById('registro-modal');
    if (modal) {
        modal.style.display = 'none';
        
        // Limpiar formularios
        const loginForm = document.getElementById('login-form');
        const registroForm = document.getElementById('registro-form');
        
        if (loginForm) loginForm.reset();
        if (registroForm) registroForm.reset();
        
        // Resetear barra de fuerza de contraseña
        const strengthBar = document.querySelector('.strength-bar');
        if (strengthBar) {
            strengthBar.style.width = '0';
        }
    }
}

// Función para mostrar el modal de registro (actualizada)
function mostrarRegistro() {
    const modal = document.getElementById('registro-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Por defecto mostrar tab de registro
        cambiarTab('registro');
    }
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(event) {
    const modal = document.getElementById('registro-modal');
    if (modal && event.target === modal) {
        cerrarRegistro();
    }
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('registro-modal');
        if (modal && modal.style.display === 'flex') {
            cerrarRegistro();
        }
    }
});

// Animación de shake para errores
const shakeKeyframes = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Agregar keyframes si no existen
if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
}


// ==========================================
// SISTEMA DE SEGUIMIENTO DE ACTIVIDAD DE USUARIOS
// ==========================================

// Función para registrar actividad del usuario
function registrarActividadUsuario(usuarioId, tipo, descripcion) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (usuario) {
        // Inicializar historial si no existe
        if (!usuario.historialConexiones) {
            usuario.historialConexiones = [];
        }
        
        // Agregar nueva actividad
        usuario.historialConexiones.push({
            tipo: tipo,
            fecha: new Date().toISOString(),
            accion: descripcion
        });
        
        // Actualizar última conexión
        usuario.ultimaConexion = new Date().toISOString();
        usuario.enLinea = true;
        
        // Guardar cambios
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Función para marcar usuario como en línea
function marcarUsuarioEnLinea(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (usuario) {
        usuario.enLinea = true;
        usuario.ultimaConexion = new Date().toISOString();
        
        // Incrementar visitas
        if (!usuario.estadisticas) {
            usuario.estadisticas = {
                totalCompras: 0,
                totalGastado: 0,
                totalReservas: 0,
                visitasAlSitio: 0
            };
        }
        usuario.estadisticas.visitasAlSitio++;
        
        // Registrar actividad
        if (!usuario.historialConexiones) {
            usuario.historialConexiones = [];
        }
        usuario.historialConexiones.push({
            tipo: 'login',
            fecha: new Date().toISOString(),
            accion: 'Usuario inició sesión'
        });
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Función para marcar usuario como offline
function marcarUsuarioOffline(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (usuario) {
        usuario.enLinea = false;
        usuario.ultimaConexion = new Date().toISOString();
        
        // Registrar actividad
        if (!usuario.historialConexiones) {
            usuario.historialConexiones = [];
        }
        usuario.historialConexiones.push({
            tipo: 'logout',
            fecha: new Date().toISOString(),
            accion: 'Usuario cerró sesión'
        });
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

// Función para actualizar actividad del usuario actual
function actualizarActividadUsuarioActual(accion, descripcion) {
    const sesion = JSON.parse(localStorage.getItem('sesionActual'));
    
    if (sesion && sesion.usuario) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuario = usuarios.find(u => u.email === sesion.usuario.email);
        
        if (usuario) {
            registrarActividadUsuario(usuario.id, accion, descripcion);
        }
    }
}

// Función para obtener usuario actual
function obtenerUsuarioActual() {
    const sesion = JSON.parse(localStorage.getItem('sesionActual'));
    
    if (sesion && sesion.usuario) {
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        return usuarios.find(u => u.email === sesion.usuario.email);
    }
    
    return null;
}

// Actualizar el login para registrar actividad
const handleLoginOriginal = handleLogin;
handleLogin = function(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const recordar = document.getElementById('recordar').checked;
    
    if (!email || !password) {
        mostrarToast('Por favor completa todos los campos', 'warning');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast('Por favor ingresa un correo válido', 'warning');
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Marcar como en línea
        marcarUsuarioEnLinea(usuario.id);
        
        const sesion = {
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                ciudad: usuario.ciudad || ''
            },
            fechaLogin: new Date().toISOString(),
            recordar: recordar
        };
        
        localStorage.setItem('sesionActual', JSON.stringify(sesion));
        
        cerrarRegistro();
        mostrarToast(`¡Bienvenido de nuevo, ${usuario.nombre}!`, 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    } else {
        mostrarToast('Correo o contraseña incorrectos', 'error');
        
        const form = document.getElementById('login-form');
        if (form) {
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }
    }
};

// Heartbeat para mantener el estado en línea
let heartbeatInterval;

function iniciarHeartbeat() {
    const usuario = obtenerUsuarioActual();
    
    if (usuario) {
        // Actualizar cada 30 segundos
        heartbeatInterval = setInterval(() => {
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            const usuarioActual = usuarios.find(u => u.id === usuario.id);
            
            if (usuarioActual) {
                usuarioActual.ultimaConexion = new Date().toISOString();
                usuarioActual.enLinea = true;
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
            }
        }, 30000); // 30 segundos
    }
}

function detenerHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
}

// Iniciar heartbeat cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        marcarUsuarioEnLinea(usuario.id);
        iniciarHeartbeat();
    }
});

// Marcar como offline cuando se cierra la página
window.addEventListener('beforeunload', function() {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        marcarUsuarioOffline(usuario.id);
        detenerHeartbeat();
    }
});

// Registrar actividad en acciones importantes
const agregarModuloAlCarritoOriginal = agregarModuloAlCarrito;
agregarModuloAlCarrito = function() {
    agregarModuloAlCarritoOriginal();
    actualizarActividadUsuarioActual('reserva', 'Agregó una reserva al carrito');
};

// Registrar compra
const procesarPagoOriginal = procesarPago;
procesarPago = function(metodoPago, total, itemsCustom) {
    procesarPagoOriginal(metodoPago, total, itemsCustom);
    
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        // Actualizar estadísticas
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuarioActual = usuarios.find(u => u.id === usuario.id);
        
        if (usuarioActual) {
            if (!usuarioActual.estadisticas) {
                usuarioActual.estadisticas = {
                    totalCompras: 0,
                    totalGastado: 0,
                    totalReservas: 0,
                    visitasAlSitio: 0
                };
            }
            
            usuarioActual.estadisticas.totalCompras++;
            usuarioActual.estadisticas.totalGastado += total;
            
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }
        
        actualizarActividadUsuarioActual('compra', `Realizó una compra de ${total} Bs con ${metodoPago}`);
    }
};


// ==========================================
// APLICAR COLORES PERSONALIZADOS
// ==========================================

// Función para aplicar colores personalizados desde localStorage
function aplicarColoresPersonalizados() {
    const coloresGuardados = JSON.parse(localStorage.getItem('coloresPaginaPrincipal'));
    
    if (coloresGuardados) {
        console.log('🎨 Aplicando colores personalizados:', coloresGuardados);
        
        // Crear o actualizar variables CSS
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', coloresGuardados.primary);
        root.style.setProperty('--secondary-color', coloresGuardados.secondary);
        root.style.setProperty('--accent-color', coloresGuardados.accent);
        root.style.setProperty('--success-color', coloresGuardados.success);
        
        // Actualizar colores derivados
        root.style.setProperty('--primary-dark', ajustarBrilloColor(coloresGuardados.primary, -20));
        root.style.setProperty('--primary-light', ajustarBrilloColor(coloresGuardados.primary, 20));
        root.style.setProperty('--accent-dark', ajustarBrilloColor(coloresGuardados.accent, -20));
        root.style.setProperty('--accent-light', ajustarBrilloColor(coloresGuardados.accent, 20));
        
        console.log('✅ Colores personalizados aplicados correctamente');
    } else {
        console.log('ℹ️ No hay colores personalizados, usando colores por defecto');
    }
}

// Función auxiliar para ajustar brillo
function ajustarBrilloColor(color, porcentaje) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * porcentaje);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Aplicar colores al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarColoresPersonalizados();
});

// También aplicar inmediatamente si el DOM ya está listo
if (document.readyState !== 'loading') {
    aplicarColoresPersonalizados();
}

// Escuchar cambios en localStorage (para actualizar en tiempo real si se cambia desde otra pestaña)
window.addEventListener('storage', function(e) {
    if (e.key === 'coloresPaginaPrincipal') {
        console.log('🔄 Colores actualizados desde otra pestaña');
        aplicarColoresPersonalizados();
    }
});


// ==========================================
// SISTEMA DE NOTIFICACIONES PARA USUARIOS
// ==========================================

// Función para mostrar notificación al usuario
function mostrarNotificacionUsuario(notificacion) {
    // Crear contenedor de notificaciones si no existe
    let container = document.getElementById('notificaciones-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificaciones-container';
        container.className = 'notificaciones-container';
        document.body.appendChild(container);
    }
    
    // Crear elemento de notificación
    const notifElement = document.createElement('div');
    notifElement.className = 'notificacion-usuario show';
    notifElement.innerHTML = `
        <div class="notificacion-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="notificacion-content">
            <h4>${notificacion.titulo}</h4>
            <p>${notificacion.mensaje}</p>
            <small>${new Date(notificacion.fecha).toLocaleString('es-ES')}</small>
        </div>
        <button class="notificacion-close" onclick="cerrarNotificacion(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar al contenedor
    container.appendChild(notifElement);
    
    // Reproducir sonido (opcional)
    reproducirSonidoNotificacion();
    
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
        notifElement.classList.remove('show');
        setTimeout(() => {
            if (notifElement.parentElement) {
                notifElement.remove();
            }
        }, 300);
    }, 10000);
    
    // Marcar como leída
    if (notificacion.id) {
        setTimeout(() => {
            marcarNotificacionComoLeida(notificacion.id);
        }, 2000);
    }
}

// Función para cerrar notificación
function cerrarNotificacion(button) {
    const notif = button.closest('.notificacion-usuario');
    notif.classList.remove('show');
    setTimeout(() => {
        if (notif.parentElement) {
            notif.remove();
        }
    }, 300);
}

// Función para marcar notificación como leída
function marcarNotificacionComoLeida(notificacionId) {
    let notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    const index = notificaciones.findIndex(n => n.id === notificacionId);
    
    if (index !== -1) {
        notificaciones[index].leida = true;
        localStorage.setItem('notificacionesUsuarios', JSON.stringify(notificaciones));
    }
}

// Función para reproducir sonido de notificación
function reproducirSonidoNotificacion() {
    try {
        // Crear un sonido simple usando Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('No se pudo reproducir sonido de notificación');
    }
}

// Escuchar cambios en localStorage (notificaciones en tiempo real)
window.addEventListener('storage', function(e) {
    if (e.key === 'notificacionesUsuarios') {
        verificarNuevasNotificaciones();
    }
});

// Verificar nuevas notificaciones al cargar
function verificarNuevasNotificaciones() {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    const notificacionesNoLeidas = notificaciones.filter(n => !n.leida);
    
    // Mostrar notificaciones no leídas
    notificacionesNoLeidas.forEach(notif => {
        mostrarNotificacionUsuario(notif);
    });
}

// Verificar notificaciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarNuevasNotificaciones();
    
    // Verificar cada 5 segundos
    setInterval(verificarNuevasNotificaciones, 5000);
});

// También verificar inmediatamente si el DOM ya está listo
if (document.readyState !== 'loading') {
    verificarNuevasNotificaciones();
}

console.log('📢 Sistema de notificaciones de usuario activado');


// ==========================================
// MOSTRAR DISPONIBILIDAD DE SAUNAS EN TIEMPO REAL
// ==========================================

// Función para obtener disponibilidad actual
function obtenerDisponibilidadSaunas() {
    const disponibilidad = JSON.parse(localStorage.getItem('disponibilidadSaunas') || '{}');
    return disponibilidad;
}

// Función para actualizar la visualización de disponibilidad
function actualizarVisualizacionDisponibilidad() {
    const disponibilidad = obtenerDisponibilidadSaunas();
    
    // Actualizar cada card de módulo
    Object.keys(disponibilidad).forEach(tipo => {
        const info = disponibilidad[tipo];
        const card = document.querySelector(`[data-modulo="${tipo}"]`);
        
        if (card) {
            // Buscar o crear badge de disponibilidad
            let badge = card.querySelector('.disponibilidad-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'disponibilidad-badge';
                card.appendChild(badge);
            }
            
            // Actualizar contenido del badge
            if (info.disponibles === 0) {
                badge.innerHTML = `
                    <i class="fas fa-times-circle"></i>
                    <span>No Disponible</span>
                `;
                badge.className = 'disponibilidad-badge no-disponible';
                card.classList.add('modulo-no-disponible');
            } else if (info.disponibles <= 2) {
                badge.innerHTML = `
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${info.disponibles} Disponible${info.disponibles > 1 ? 's' : ''}</span>
                `;
                badge.className = 'disponibilidad-badge pocas-disponibles';
                card.classList.remove('modulo-no-disponible');
            } else {
                badge.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${info.disponibles} Disponibles</span>
                `;
                badge.className = 'disponibilidad-badge disponible';
                card.classList.remove('modulo-no-disponible');
            }
            
            // Deshabilitar botón si no hay disponibles
            const botonReservar = card.querySelector('.btn-reservar, button');
            if (botonReservar) {
                if (info.disponibles === 0) {
                    botonReservar.disabled = true;
                    botonReservar.textContent = 'No Disponible';
                    botonReservar.classList.add('btn-disabled');
                } else {
                    botonReservar.disabled = false;
                    botonReservar.textContent = 'Reservar Ahora';
                    botonReservar.classList.remove('btn-disabled');
                }
            }
        }
    });
    
    console.log('📊 Disponibilidad actualizada en la interfaz:', disponibilidad);
}

// Escuchar cambios en localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'disponibilidadSaunas' || e.key === 'configuracionModulos') {
        actualizarVisualizacionDisponibilidad();
    }
});

// Escuchar evento personalizado
window.addEventListener('disponibilidadActualizada', function(e) {
    actualizarVisualizacionDisponibilidad();
});

// Actualizar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarVisualizacionDisponibilidad();
    
    // Actualizar cada 10 segundos
    setInterval(actualizarVisualizacionDisponibilidad, 10000);
});

// También actualizar inmediatamente si el DOM ya está listo
if (document.readyState !== 'loading') {
    actualizarVisualizacionDisponibilidad();
}

console.log('📊 Sistema de disponibilidad en tiempo real activado');


// ==========================================
// MODO OSCURO / CLARO
// ==========================================

// Función para alternar entre modo claro y oscuro
function toggleTema() {
    const body = document.body;
    const temaActual = localStorage.getItem('tema') || 'claro';
    const nuevoTema = temaActual === 'claro' ? 'oscuro' : 'claro';
    
    // Aplicar tema
    aplicarTema(nuevoTema);
    
    // Guardar preferencia
    localStorage.setItem('tema', nuevoTema);
    
    console.log(`🎨 Tema cambiado a: ${nuevoTema}`);
}

// Función para aplicar tema
function aplicarTema(tema) {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    if (tema === 'oscuro') {
        body.classList.add('tema-oscuro');
        body.classList.remove('tema-claro');
        
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
        }
        if (themeText) {
            themeText.textContent = 'Modo Claro';
        }
    } else {
        body.classList.add('tema-claro');
        body.classList.remove('tema-oscuro');
        
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
        }
        if (themeText) {
            themeText.textContent = 'Modo Oscuro';
        }
    }
}

// Cargar tema guardado al iniciar
function cargarTemaGuardado() {
    const temaGuardado = localStorage.getItem('tema') || 'claro';
    aplicarTema(temaGuardado);
}

// Aplicar tema al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarTemaGuardado();
});

// También aplicar inmediatamente si el DOM ya está listo
if (document.readyState !== 'loading') {
    cargarTemaGuardado();
}

console.log('🌓 Sistema de tema claro/oscuro activado');
