// Variables globales
let productos = [];
let transacciones = [];
let productoEditando = null;
let moduloConfigurando = null;
let temporizadores = {};

// Inicializar panel de administración
// document.addEventListener('DOMContentLoaded', function () {
//     inicializarAdmin();
// }

function inicializarAdmin() {
    cargarDatos();
    configurarEventListeners();
    cargarModulosAdmin();
    cargarProductosAdmin();
    cargarReservasAdmin();
    cargarIngresos();
    cargarUsuariosAdmin();
    cargarSolicitudesEnSeccion(); // Cargar solicitudes pendientes
    filtrarCajaAdmin(); // Cargar historial de caja

    // Configurar fecha de hoy por defecto
    document.getElementById('fecha-filtro').value = new Date().toISOString().split('T')[0];

    // Inicializar temporizadores
    inicializarTemporizadores();

    // Verificar estado de la página
    verificarEstadoPaginaAlCargar();

    // Configurar auto-hide del header (activado)
    configurarAutoHideHeader();

    // Actualizar datos cada 30 segundos
    setInterval(actualizarDatos, 30000);
}

function configurarEventListeners() {
    // Formulario de productos
    document.getElementById('producto-form').addEventListener('submit', guardarProducto);

    // Input de imagen de producto
    document.getElementById('producto-imagen').addEventListener('change', manejarImagenProducto);

    // Formulario de módulos
    document.getElementById('modulo-config-form').addEventListener('submit', guardarConfiguracionModulo);

    // Formularios de caja
    document.getElementById('saldo-inicial-form').addEventListener('submit', registrarSaldoInicial);
    document.getElementById('ingreso-form').addEventListener('submit', registrarIngreso);
    document.getElementById('retiro-form').addEventListener('submit', registrarRetiro);

    // Configurar cambio de estado en el formulario de módulo
    document.getElementById('modulo-estado').addEventListener('change', function () {
        const valor = this.value;
        const temporizadorGroup = document.getElementById('temporizador-group');
        const reservaGroup = document.getElementById('reserva-group');
        const motivoGroup = document.getElementById('motivo-group');

        // Ocultar todos los grupos primero
        temporizadorGroup.style.display = 'none';
        reservaGroup.style.display = 'none';
        motivoGroup.style.display = 'none';

        // Mostrar grupos según el estado seleccionado
        switch (valor) {
            case 'disponible':
                // No mostrar grupos adicionales
                break;
            case 'no-disponible':
                motivoGroup.style.display = 'block';
                break;
            case 'reservado':
                reservaGroup.style.display = 'block';
                motivoGroup.style.display = 'block';
                break;
            case 'mantenimiento':
                temporizadorGroup.style.display = 'block';
                motivoGroup.style.display = 'block';
                break;
        }
    });

    // Navegación suave
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.classList.contains('external')) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });
}

function actualizarDatos() {
    cargarDatos();
    cargarModulosAdmin();
    cargarReservasAdmin();
    cargarIngresos();
    cargarUsuariosAdmin();
    cargarSolicitudesEnSeccion(); // Actualizar solicitudes
}

// Funciones para gestión de módulos individuales
function cargarModulosAdmin() {
    const grid = document.getElementById('modulos-admin-grid');

    // Cargar configuración de módulos del localStorage
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');

    let html = '';

    // Módulos base del sistema (desde script.js)
    const modulosBase = {
        individual: {
            nombre: 'Individual',
            precio: 15,
            regaderas: 1,
            capacidad: '1 adulto o 1 adulto + 1 niño',
            disponibles: 2, // 2 individuales
            descripcion: 'Módulo individual perfecto para relajación personal'
        },
        doble: {
            nombre: 'Doble',
            precio: 25,
            regaderas: 1,
            capacidad: '2 adultos o 2 adultos + 1 niño',
            disponibles: 5, // 5 dobles
            descripcion: 'Módulo doble ideal para parejas'
        },
        semifamiliar: {
            nombre: 'Semifamiliar',
            precio: 35,
            regaderas: 2,
            capacidad: '2 adultos + 2 niños',
            disponibles: 2, // 2 semifamiliares
            descripcion: 'Módulo semifamiliar para familias pequeñas'
        },
        familiar: {
            nombre: 'Familiar',
            precio: 45,
            regaderas: 2,
            capacidad: '3-4 adultos y/o hasta 4 niños',
            disponibles: 3, // 3 familiares
            descripcion: 'Módulo familiar grande para grupos'
        }
    };

    let numeroSauna = 1;

    // Mostrar cada módulo individual
    Object.keys(modulosBase).forEach(tipo => {
        const modulo = modulosBase[tipo];

        // Crear cada unidad individual del módulo
        for (let i = 1; i <= modulo.disponibles; i++) {
            const saunaId = `${tipo}-${i}`;
            const config = configuracionModulos[saunaId] || { estado: 'disponible', motivo: '', tiempoMantenimiento: 0 };
            const reserva = reservasActuales[saunaId];

            let estadoClase = config.estado || 'disponible';
            let estadoTexto = 'Disponible';
            let estadoIcono = 'fas fa-check-circle';
            let temporizadorHtml = '';

            // Determinar estado y texto
            switch (estadoClase) {
                case 'disponible':
                    estadoTexto = 'Disponible';
                    estadoIcono = 'fas fa-check-circle';
                    break;
                case 'no-disponible':
                    estadoTexto = 'No Disponible';
                    estadoIcono = 'fas fa-times-circle';
                    break;
                case 'reservado':
                    estadoTexto = 'Reservado';
                    estadoIcono = 'fas fa-clock';
                    if (reserva && reserva.horaDisponible) {
                        const horaReserva = new Date(reserva.horaDisponible).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        temporizadorHtml = `
                            <div class="modulo-temporizador">
                                <div class="temporizador-display">${horaReserva}</div>
                                <div class="temporizador-label">Disponible a partir de</div>
                            </div>
                        `;
                    }
                    break;
                case 'mantenimiento':
                    estadoTexto = 'En Mantenimiento';
                    estadoIcono = 'fas fa-tools';
                    if (config.tiempoMantenimiento > 0 && temporizadores[saunaId]) {
                        const tiempoRestante = temporizadores[saunaId].tiempoRestante;
                        const horas = Math.floor(tiempoRestante / 60);
                        const minutos = tiempoRestante % 60;
                        temporizadorHtml = `
                            <div class="modulo-temporizador">
                                <div class="temporizador-display" id="temporizador-${saunaId}">
                                    ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}
                                </div>
                                <div class="temporizador-label">Tiempo restante de mantenimiento</div>
                            </div>
                        `;
                    }
                    break;
            }

            html += `
                <div class="modulo-admin-card ${estadoClase}">
                    <div class="modulo-admin-header">
                        <div class="modulo-admin-info">
                            <h3>Sauna #${numeroSauna} - ${modulo.nombre}</h3>
                            <div class="modulo-admin-tipo">${modulo.descripcion}</div>
                        </div>
                        <div class="modulo-status ${estadoClase}">
                            <i class="${estadoIcono}"></i>
                            ${estadoTexto}
                        </div>
                    </div>
                    
                    <div class="modulo-admin-details">
                        <div class="modulo-detail-row">
                            <span class="modulo-detail-label">ID:</span>
                            <span class="modulo-detail-value">${saunaId}</span>
                        </div>
                        <div class="modulo-detail-row">
                            <span class="modulo-detail-label">Precio:</span>
                            <span class="modulo-detail-value">${modulo.precio} Bs</span>
                        </div>
                        <div class="modulo-detail-row">
                            <span class="modulo-detail-label">Capacidad:</span>
                            <span class="modulo-detail-value">${modulo.capacidad}</span>
                        </div>
                        <div class="modulo-detail-row">
                            <span class="modulo-detail-label">Regaderas:</span>
                            <span class="modulo-detail-value">${modulo.regaderas}</span>
                        </div>
                        ${config.motivo ? `
                            <div class="modulo-detail-row">
                                <span class="modulo-detail-label">Motivo:</span>
                                <span class="modulo-detail-value">${config.motivo}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${temporizadorHtml}
                    
                    <div class="modulo-admin-actions">
                        ${estadoClase === 'mantenimiento' && config.tiempoMantenimiento > 0 ? `
                            <button class="btn-danger btn-cancelar" onclick="cancelarMantenimientoIndividual('${saunaId}')">
                                <i class="fas fa-stop"></i> Cancelar Mantenimiento
                            </button>
                        ` : ''}
                    </div>
                    
                    <!-- Botón de configuración flotante -->
                    <button class="btn-config-flotante" onclick="configurarModuloIndividual('${saunaId}', '${tipo}')" title="Configurar ${saunaId.toUpperCase()} - ${estadoTexto}">
                        <i class="fas fa-cog"></i>
                        <div class="config-indicator ${estadoClase}"></div>
                    </button>
                </div>
            `;

            numeroSauna++;
        }
    });

    // Mostrar saunas personalizadas/agregadas
    Object.keys(configuracionModulos).forEach(saunaId => {
        const config = configuracionModulos[saunaId];

        // Solo mostrar saunas que no sean parte de los módulos base
        const esModuloBase = Object.keys(modulosBase).some(tipo => {
            const modulo = modulosBase[tipo];
            for (let i = 1; i <= modulo.disponibles; i++) {
                if (`${tipo}-${i}` === saunaId) return true;
            }
            return false;
        });

        if (!esModuloBase && config.nombre) {
            const reserva = reservasActuales[saunaId];
            let estadoClase = config.estado || 'disponible';
            let estadoTexto = 'Disponible';
            let estadoIcono = 'fas fa-check-circle';
            let temporizadorHtml = '';

            // Determinar estado y texto
            switch (estadoClase) {
                case 'disponible':
                    estadoTexto = 'Disponible';
                    estadoIcono = 'fas fa-check-circle';
                    break;
                case 'no-disponible':
                    estadoTexto = 'No Disponible';
                    estadoIcono = 'fas fa-times-circle';
                    break;
                case 'reservado':
                    estadoTexto = 'Reservado';
                    estadoIcono = 'fas fa-clock';
                    if (reserva && reserva.horaDisponible) {
                        const horaDisponible = new Date(reserva.horaDisponible);
                        estadoTexto += ` hasta ${horaDisponible.toLocaleString()}`;
                    }
                    break;
                case 'mantenimiento':
                    estadoTexto = 'En Mantenimiento';
                    estadoIcono = 'fas fa-tools';
                    if (temporizadores[saunaId]) {
                        const tiempoRestante = temporizadores[saunaId].tiempoRestante;
                        const horas = Math.floor(tiempoRestante / 60);
                        const minutos = tiempoRestante % 60;
                        temporizadorHtml = `
                            <div class="temporizador-individual">
                                <i class="fas fa-hourglass-half"></i>
                                <span id="timer-${saunaId}">${horas}h ${minutos}m</span>
                            </div>
                        `;
                    }
                    break;
            }

            html += `
                <div class="modulo-admin-card ${estadoClase}">
                    <div class="modulo-admin-header">
                        <div class="modulo-info">
                            <h4>${config.nombre} <span class="badge-personalizada">PERSONALIZADA</span></h4>
                            <p class="modulo-tipo">${config.tipo.charAt(0).toUpperCase() + config.tipo.slice(1)}</p>
                        </div>
                        <div class="modulo-estado">
                            <i class="${estadoIcono}"></i>
                            <span>${estadoTexto}</span>
                        </div>
                    </div>
                    ${temporizadorHtml}
                    ${config.motivo ? `<div class="modulo-motivo"><strong>Motivo:</strong> ${config.motivo}</div>` : ''}
                    <div class="modulo-admin-actions">
                        <button class="btn-config-flotante" onclick="configurarModuloIndividual('${saunaId}', '${config.tipo}')" title="Configurar sauna">
                            <i class="fas fa-cog"></i>
                        </button>
                        <button class="btn-delete" onclick="eliminarSaunaPersonalizada('${saunaId}')" title="Eliminar sauna">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    });

    grid.innerHTML = html;
}

function configurarModuloIndividual(saunaId, tipo) {
    moduloConfigurando = saunaId;
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');
    const config = configuracionModulos[saunaId] || { estado: 'disponible', motivo: '', tiempoMantenimiento: 0, nombre: saunaId, tipo: tipo };
    const reserva = reservasActuales[saunaId];

    document.getElementById('modulo-config-title').textContent = `Configurar ${config.nombre || saunaId.toUpperCase()}`;

    // Establecer valores actuales
    document.getElementById('modulo-nombre').value = config.nombre || saunaId;
    document.getElementById('modulo-tipo').value = config.tipo || tipo;
    document.getElementById('modulo-estado').value = config.estado || 'disponible';

    // Configurar campos según el estado actual
    const temporizadorGroup = document.getElementById('temporizador-group');
    const reservaGroup = document.getElementById('reserva-group');
    const motivoGroup = document.getElementById('motivo-group');

    // Ocultar todos los grupos primero
    temporizadorGroup.style.display = 'none';
    reservaGroup.style.display = 'none';
    motivoGroup.style.display = 'none';

    // Mostrar y llenar campos según el estado
    switch (config.estado) {
        case 'disponible':
            break;
        case 'no-disponible':
            motivoGroup.style.display = 'block';
            break;
        case 'reservado':
            reservaGroup.style.display = 'block';
            motivoGroup.style.display = 'block';
            if (reserva && reserva.horaDisponible) {
                const fecha = new Date(reserva.horaDisponible);
                const fechaLocal = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
                document.getElementById('hora-disponible').value = fechaLocal.toISOString().slice(0, 16);
            }
            break;
        case 'mantenimiento':
            temporizadorGroup.style.display = 'block';
            motivoGroup.style.display = 'block';
            document.getElementById('tiempo-mantenimiento').value = config.tiempoMantenimiento || 30;
            break;
    }

    document.getElementById('motivo-estado').value = config.motivo || '';

    const modal = document.getElementById('modulo-config-modal');
    modal.style.display = 'block';
    modal.classList.add('show');

    // Agregar efecto de entrada
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'translateY(0) scale(1)';
    }, 10);
}

function guardarConfiguracionModulo(event) {
    event.preventDefault();

    const nombre = document.getElementById('modulo-nombre').value;
    const tipo = document.getElementById('modulo-tipo').value;
    const estado = document.getElementById('modulo-estado').value;
    const tiempoMantenimiento = parseInt(document.getElementById('tiempo-mantenimiento').value) || 0;
    const horaDisponible = document.getElementById('hora-disponible').value;
    const motivo = document.getElementById('motivo-estado').value;

    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');

    // Si es una nueva sauna, generar ID
    let saunaId = moduloConfigurando;
    if (!saunaId) {
        saunaId = obtenerSiguienteIdSauna(tipo);
        moduloConfigurando = saunaId;
    }

    // Guardar configuración del módulo
    configuracionModulos[saunaId] = {
        nombre: nombre,
        tipo: tipo,
        estado: estado,
        tiempoMantenimiento: estado === 'mantenimiento' ? tiempoMantenimiento : 0,
        motivo: motivo,
        fechaInicio: estado === 'mantenimiento' ? new Date().toISOString() : null,
        esNueva: !moduloConfigurando // Marcar si es una sauna nueva
    };

    // Manejar reservas actuales
    if (estado === 'reservado' && horaDisponible) {
        reservasActuales[moduloConfigurando] = {
            estado: 'reservado',
            horaDisponible: new Date(horaDisponible).toISOString(),
            tipo: moduloConfigurando.split('-')[0]
        };
    } else if (estado !== 'reservado' && reservasActuales[moduloConfigurando]) {
        delete reservasActuales[moduloConfigurando];
    }

    localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));
    localStorage.setItem('reservasActuales', JSON.stringify(reservasActuales));

    // Manejar temporizadores
    if (estado === 'mantenimiento' && tiempoMantenimiento > 0) {
        iniciarTemporizadorIndividual(moduloConfigurando, tiempoMantenimiento);
    } else {
        // Detener temporizador si existe
        if (temporizadores[moduloConfigurando]) {
            clearInterval(temporizadores[moduloConfigurando].intervalo);
            delete temporizadores[moduloConfigurando];
        }
    }

    cargarModulosAdmin();
    cerrarConfiguracionModulo();
    
    // ACTUALIZAR DISPONIBILIDAD EN TIEMPO REAL
    actualizarDisponibilidadTiempoReal();

    alert('Configuración del sauna guardada exitosamente');
}

function cerrarConfiguracionModulo() {
    const modal = document.getElementById('modulo-config-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Remover estado activo de todos los botones
    document.querySelectorAll('.btn-config-flotante').forEach(btn => {
        btn.classList.remove('modal-active');
    });

    // Agregar animación de salida
    modalContent.style.animation = 'slideOutToBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modalContent.style.animation = '';
        moduloConfigurando = null;
    }, 300);
}

function inicializarTemporizadores() {
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');

    Object.keys(configuracionModulos).forEach(tipo => {
        const config = configuracionModulos[tipo];
        if (config.tiempoMantenimiento > 0 && config.fechaInicio) {
            const fechaInicio = new Date(config.fechaInicio);
            const tiempoTranscurrido = Math.floor((new Date() - fechaInicio) / (1000 * 60)); // en minutos
            const tiempoRestante = config.tiempoMantenimiento - tiempoTranscurrido;

            if (tiempoRestante > 0) {
                iniciarTemporizador(tipo, tiempoRestante);
            } else {
                // El mantenimiento ya terminó, marcar como disponible
                config.disponible = true;
                config.tiempoMantenimiento = 0;
                config.fechaInicio = null;
                localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));
            }
        }
    });
}

function iniciarTemporizador(tipo, minutos) {
    // Limpiar temporizador existente si existe
    if (temporizadores[tipo]) {
        clearInterval(temporizadores[tipo].intervalo);
    }

    temporizadores[tipo] = {
        tiempoRestante: minutos,
        intervalo: setInterval(() => {
            temporizadores[tipo].tiempoRestante--;

            // Actualizar display
            const display = document.getElementById(`temporizador-${tipo}`);
            if (display) {
                const horas = Math.floor(temporizadores[tipo].tiempoRestante / 60);
                const mins = temporizadores[tipo].tiempoRestante % 60;
                display.textContent = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            }

            // Si el tiempo se agotó
            if (temporizadores[tipo].tiempoRestante <= 0) {
                clearInterval(temporizadores[tipo].intervalo);
                delete temporizadores[tipo];

                // Marcar módulo como disponible
                const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
                configuracionModulos[tipo].disponible = true;
                configuracionModulos[tipo].tiempoMantenimiento = 0;
                configuracionModulos[tipo].fechaInicio = null;
                localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));

                // Recargar vista
                cargarModulosAdmin();

                alert(`El mantenimiento del módulo ${tipo} ha terminado. Ahora está disponible.`);
            }
        }, 60000) // Actualizar cada minuto
    };
}

function cancelarMantenimiento(tipo) {
    if (confirm('¿Estás seguro de que quieres cancelar el mantenimiento de este módulo?')) {
        // Detener temporizador
        if (temporizadores[tipo]) {
            clearInterval(temporizadores[tipo].intervalo);
            delete temporizadores[tipo];
        }

        // Marcar como disponible
        const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
        configuracionModulos[tipo].disponible = true;
        configuracionModulos[tipo].tiempoMantenimiento = 0;
        configuracionModulos[tipo].fechaInicio = null;
        configuracionModulos[tipo].motivo = '';
        localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));

        cargarModulosAdmin();
        alert('Mantenimiento cancelado. El módulo ahora está disponible.');
    }
}

function actualizarEstadoModulos() {
    cargarModulosAdmin();
    alert('Estados de módulos actualizados');
}

function configurarMantenimiento() {
    alert('Selecciona un sauna específico para configurar su mantenimiento usando el botón "Configurar" en cada tarjeta.');
}

function iniciarTemporizadorIndividual(saunaId, minutos) {
    // Limpiar temporizador existente si existe
    if (temporizadores[saunaId]) {
        clearInterval(temporizadores[saunaId].intervalo);
    }

    temporizadores[saunaId] = {
        tiempoRestante: minutos,
        intervalo: setInterval(() => {
            temporizadores[saunaId].tiempoRestante--;

            // Actualizar display
            const display = document.getElementById(`temporizador-${saunaId}`);
            if (display) {
                const horas = Math.floor(temporizadores[saunaId].tiempoRestante / 60);
                const mins = temporizadores[saunaId].tiempoRestante % 60;
                display.textContent = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            }

            // Si el tiempo se agotó
            if (temporizadores[saunaId].tiempoRestante <= 0) {
                clearInterval(temporizadores[saunaId].intervalo);
                delete temporizadores[saunaId];

                // Marcar sauna como disponible
                const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
                configuracionModulos[saunaId].estado = 'disponible';
                configuracionModulos[saunaId].tiempoMantenimiento = 0;
                configuracionModulos[saunaId].fechaInicio = null;
                configuracionModulos[saunaId].motivo = '';
                localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));

                // Recargar vista
                cargarModulosAdmin();

                alert(`El mantenimiento del sauna ${saunaId.toUpperCase()} ha terminado. Ahora está disponible.`);
            }
        }, 60000) // Actualizar cada minuto
    };
}

function cancelarMantenimientoIndividual(saunaId) {
    if (confirm('¿Estás seguro de que quieres cancelar el mantenimiento de este sauna?')) {
        // Detener temporizador
        if (temporizadores[saunaId]) {
            clearInterval(temporizadores[saunaId].intervalo);
            delete temporizadores[saunaId];
        }

        // Marcar como disponible
        const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
        configuracionModulos[saunaId].estado = 'disponible';
        configuracionModulos[saunaId].tiempoMantenimiento = 0;
        configuracionModulos[saunaId].fechaInicio = null;
        configuracionModulos[saunaId].motivo = '';
        localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));

        cargarModulosAdmin();
        alert('Mantenimiento cancelado. El sauna ahora está disponible.');
    }
}

// Funciones para auto-hide del header
function configurarAutoHideHeader() {
    let lastScrollTop = 0;
    let hideTimeout;
    const header = document.getElementById('admin-header');
    
    // Función para verificar si hay modales abiertos
    function hayModalAbierto() {
        const modales = document.querySelectorAll('.modal, .modal-exito, [id$="-modal"]');
        for (let modal of modales) {
            const display = window.getComputedStyle(modal).display;
            if (display !== 'none') {
                return true;
            }
        }
        return false;
    }
    
    // Función para mostrar el header
    function mostrarHeader() {
        if (!hayModalAbierto()) {
            header.classList.remove('hidden');
        }
    }
    
    // Función para ocultar el header
    function ocultarHeader() {
        if (!hayModalAbierto()) {
            header.classList.add('hidden');
        }
    }

    // Mostrar header al mover el mouse cerca del top
    document.addEventListener('mousemove', function (e) {
        if (e.clientY < 80) {
            mostrarHeader();
            clearTimeout(hideTimeout);
        }
    });

    // Ocultar header al hacer scroll hacia abajo
    window.addEventListener('scroll', function () {
        // Si hay modal abierto, mantener header visible
        if (hayModalAbierto()) {
            header.classList.remove('hidden');
            clearTimeout(hideTimeout);
            return;
        }
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - ocultar después de 1.5 segundos
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                ocultarHeader();
            }, 1500);
        } else {
            // Scrolling up - mostrar inmediatamente
            mostrarHeader();
            clearTimeout(hideTimeout);
        }

        lastScrollTop = scrollTop;
    });

    // Auto-hide después de 3 segundos de inactividad
    let inactivityTimeout;

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        mostrarHeader();

        inactivityTimeout = setTimeout(() => {
            if (window.pageYOffset > 100 && !hayModalAbierto()) {
                ocultarHeader();
            }
        }, 3000);
    }

    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    
    // Observer para detectar cuando se abren/cierran modales
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                if (hayModalAbierto()) {
                    // Si se abre un modal, mostrar header y cancelar timers
                    header.classList.remove('hidden');
                    clearTimeout(hideTimeout);
                    clearTimeout(inactivityTimeout);
                }
            }
        });
    });
    
    // Observar todos los modales
    const modales = document.querySelectorAll('.modal, .modal-exito, [id$="-modal"]');
    modales.forEach(modal => {
        observer.observe(modal, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    });
}

// Funciones de gestión de caja
function mostrarModalIngreso() {
    document.getElementById('ingreso-modal').style.display = 'block';
    modalAbiertoActualmente = true;
    document.body.classList.add('modal-open');
    const header = document.getElementById('admin-header');
    if (header) header.classList.remove('hidden');
}

function cerrarModalIngreso() {
    document.getElementById('ingreso-modal').style.display = 'none';
    document.getElementById('ingreso-form').reset();
    modalAbiertoActualmente = false;
    document.body.classList.remove('modal-open');
}

// Funciones para Saldo Inicial
function mostrarModalSaldoInicial() {
    document.getElementById('saldo-inicial-modal').style.display = 'block';
    modalAbiertoActualmente = true;
    document.body.classList.add('modal-open');
    const header = document.getElementById('admin-header');
    if (header) header.classList.remove('hidden');
}

function cerrarModalSaldoInicial() {
    document.getElementById('saldo-inicial-modal').style.display = 'none';
    document.getElementById('saldo-inicial-form').reset();
    modalAbiertoActualmente = false;
    document.body.classList.remove('modal-open');
}

function registrarSaldoInicial(event) {
    event.preventDefault();

    const monto = parseFloat(document.getElementById('monto-saldo-inicial').value);
    const descripcion = document.getElementById('descripcion-saldo-inicial').value;

    const movimiento = {
        id: Date.now(),
        tipo: 'ingreso',
        monto: monto,
        concepto: 'Saldo Inicial',
        descripcion: descripcion || 'Saldo inicial de caja para la jornada',
        metodoPago: 'efectivo',
        fecha: new Date().toISOString()
    };

    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimiento);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    // Actualizar balance de efectivo
    let balanceEfectivo = parseFloat(localStorage.getItem('balanceEfectivo') || '0');
    balanceEfectivo += monto;
    localStorage.setItem('balanceEfectivo', balanceEfectivo.toString());

    // Actualizar balance total
    let balanceCaja = parseFloat(localStorage.getItem('balanceCaja') || '0');
    balanceCaja += monto;
    localStorage.setItem('balanceCaja', balanceCaja.toString());

    cerrarModalSaldoInicial();
    filtrarCajaAdmin();
    mostrarToastAdmin(`✅ Saldo inicial de ${monto} Bs registrado exitosamente`, 'success');
}

function mostrarModalRetiro() {
    document.getElementById('retiro-modal').style.display = 'block';
    modalAbiertoActualmente = true;
    document.body.classList.add('modal-open');
    const header = document.getElementById('admin-header');
    if (header) header.classList.remove('hidden');
}

function cerrarModalRetiro() {
    document.getElementById('retiro-modal').style.display = 'none';
    document.getElementById('retiro-form').reset();
    modalAbiertoActualmente = false;
    document.body.classList.remove('modal-open');
}

function registrarIngreso(event) {
    event.preventDefault();

    const monto = parseFloat(document.getElementById('monto-ingreso').value);
    const concepto = document.getElementById('concepto-ingreso').value;
    const descripcion = document.getElementById('descripcion-ingreso').value;

    const movimiento = {
        id: Date.now(),
        tipo: 'ingreso',
        monto: monto,
        concepto: concepto,
        descripcion: descripcion,
        fecha: new Date().toISOString()
    };

    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimiento);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    cerrarModalIngreso();
    alert(`Ingreso de ${monto} Bs registrado exitosamente`);
}

function registrarRetiro(event) {
    event.preventDefault();

    const monto = parseFloat(document.getElementById('monto-retiro').value);
    const motivo = document.getElementById('motivo-retiro').value;
    const descripcion = document.getElementById('descripcion-retiro').value;

    const movimiento = {
        id: Date.now(),
        tipo: 'retiro',
        monto: monto,
        motivo: motivo,
        descripcion: descripcion,
        fecha: new Date().toISOString()
    };

    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimiento);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    cerrarModalRetiro();
    alert(`Retiro de ${monto} Bs registrado exitosamente`);
}

function verHistorialCaja() {
    const modal = document.getElementById('historial-caja-modal');
    cargarHistorialCaja();
    modal.style.display = 'block';
}

function cerrarHistorialCaja() {
    document.getElementById('historial-caja-modal').style.display = 'none';
}

function cargarHistorialCaja() {
    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    const content = document.getElementById('historial-caja-content');

    if (historialCaja.length === 0) {
        content.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">No hay movimientos registrados</p>';
        actualizarResumenCaja([], 0, 0, 0);
        return;
    }

    // Ordenar por fecha descendente
    const movimientosOrdenados = historialCaja.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = '';
    let totalIngresos = 0;
    let totalRetiros = 0;

    movimientosOrdenados.forEach(movimiento => {
        const fecha = new Date(movimiento.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        if (movimiento.tipo === 'ingreso') {
            totalIngresos += movimiento.monto;
        } else {
            totalRetiros += movimiento.monto;
        }

        const tipoTexto = movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Retiro';
        const conceptoTexto = movimiento.concepto || movimiento.motivo || 'Sin especificar';

        html += `
            <div class="movimiento-item">
                <div class="movimiento-info">
                    <div class="movimiento-tipo ${movimiento.tipo}">${tipoTexto} - ${conceptoTexto}</div>
                    <div class="movimiento-descripcion">${movimiento.descripcion || 'Sin descripción'}</div>
                    <div class="movimiento-fecha">${fechaFormateada} ${horaFormateada}</div>
                </div>
                <div class="movimiento-monto ${movimiento.tipo}">
                    ${movimiento.tipo === 'ingreso' ? '+' : '-'}${movimiento.monto} Bs
                </div>
            </div>
        `;
    });

    content.innerHTML = html;

    const saldoCaja = totalIngresos - totalRetiros;
    actualizarResumenCaja(movimientosOrdenados, totalIngresos, totalRetiros, saldoCaja);
}

function actualizarResumenCaja(movimientos, totalIngresos, totalRetiros, saldoCaja) {
    document.getElementById('total-ingresos-caja').textContent = `${totalIngresos} Bs`;
    document.getElementById('total-retiros-caja').textContent = `${totalRetiros} Bs`;
    document.getElementById('saldo-caja').textContent = `${saldoCaja} Bs`;

    // Cambiar color del saldo según si es positivo o negativo
    const saldoElement = document.getElementById('saldo-caja');
    saldoElement.className = `amount ${saldoCaja >= 0 ? 'positive' : 'negative'}`;
}

function filtrarHistorialCaja() {
    // Implementar filtrado si es necesario
    cargarHistorialCaja();
}

// ==========================================
// HISTORIAL DE RESERVAS
// ==========================================

function verHistorialReservas() {
    const modal = document.getElementById('historial-reservas-modal');
    cargarHistorialReservas();
    modal.style.display = 'block';
}

function cerrarHistorialReservas() {
    document.getElementById('historial-reservas-modal').style.display = 'none';
}

function cargarHistorialReservas() {
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const content = document.getElementById('historial-reservas-content');

    // Filtrar solo transacciones con reservas
    const reservas = transacciones.filter(t => t.items.some(item => item.tipo === 'reserva'));

    if (reservas.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-600);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No hay reservas registradas</h3>
                <p>Las reservas aparecerán aquí una vez que se realicen</p>
            </div>
        `;
        actualizarResumenReservas(0, 0, 0);
        return;
    }

    // Ordenar por fecha descendente
    const reservasOrdenadas = reservas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = '<div class="historial-reservas-lista">';
    let totalReservas = 0;
    let totalPersonas = 0;
    let totalIngresos = 0;

    reservasOrdenadas.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Procesar cada reserva en la transacción
        transaccion.items.forEach(item => {
            if (item.tipo === 'reserva') {
                totalReservas++;
                totalPersonas += item.personas || 0;
                totalIngresos += item.precio || 0;

                // Obtener el tipo de módulo
                const tipoModulo = obtenerTipoModulo(item.modulo);

                html += `
                    <div class="reserva-historial-card">
                        <div class="reserva-historial-header">
                            <div class="reserva-modulo-badge">
                                <i class="fas fa-hot-tub"></i>
                                <div class="modulo-badge-info">
                                    <span class="modulo-tipo">${tipoModulo}</span>
                                    <span class="modulo-numero">Módulo ${item.modulo}</span>
                                </div>
                            </div>
                            <div class="reserva-precio-badge">
                                ${item.precio} Bs
                            </div>
                        </div>
                        <div class="reserva-historial-body">
                            <div class="reserva-info-row">
                                <i class="fas fa-calendar"></i>
                                <span>${fechaFormateada}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-clock"></i>
                                <span>${horaFormateada}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-users"></i>
                                <span>${item.personas} persona${item.personas !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-credit-card"></i>
                                <span>${transaccion.metodoPago === 'qr' ? 'Pago QR' : 'Efectivo'}</span>
                            </div>
                            ${item.alergias && item.alergias !== 'Ninguna' && item.alergias !== 'Sin alergias' ? `
                                <div class="reserva-info-row alergias">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span><strong>Alergias:</strong> ${item.alergias}</span>
                                </div>
                            ` : ''}
                            ${item.segundaAdquisicion ? `
                                <div class="reserva-info-row segunda-adquisicion">
                                    <i class="fas fa-star"></i>
                                    <span>Segunda adquisición</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="reserva-historial-footer">
                            <span class="reserva-id">ID: ${transaccion.id}</span>
                        </div>
                    </div>
                `;
            }
        });
    });

    html += '</div>';
    content.innerHTML = html;

    actualizarResumenReservas(totalReservas, totalPersonas, totalIngresos);
}

function actualizarResumenReservas(totalReservas, totalPersonas, totalIngresos) {
    document.getElementById('total-reservas-historial').textContent = totalReservas;
    document.getElementById('total-personas-historial').textContent = totalPersonas;
    document.getElementById('ingresos-reservas-historial').textContent = `${totalIngresos} Bs`;
}

function filtrarHistorialReservas() {
    const fechaDesde = document.getElementById('fecha-reservas-desde').value;
    const fechaHasta = document.getElementById('fecha-reservas-hasta').value;
    const moduloFiltro = document.getElementById('modulo-filtro').value;

    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const content = document.getElementById('historial-reservas-content');

    // Filtrar transacciones con reservas
    let reservasFiltradas = transacciones.filter(t => t.items.some(item => item.tipo === 'reserva'));

    // Aplicar filtro de fecha
    if (fechaDesde) {
        const fechaDesdeObj = new Date(fechaDesde);
        reservasFiltradas = reservasFiltradas.filter(t => new Date(t.fecha) >= fechaDesdeObj);
    }

    if (fechaHasta) {
        const fechaHastaObj = new Date(fechaHasta);
        fechaHastaObj.setHours(23, 59, 59, 999);
        reservasFiltradas = reservasFiltradas.filter(t => new Date(t.fecha) <= fechaHastaObj);
    }

    // Aplicar filtro de módulo
    if (moduloFiltro !== 'todos') {
        reservasFiltradas = reservasFiltradas.filter(t =>
            t.items.some(item => item.tipo === 'reserva' && item.modulo == moduloFiltro)
        );
    }

    if (reservasFiltradas.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-600);">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No se encontraron reservas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        actualizarResumenReservas(0, 0, 0);
        return;
    }

    // Renderizar resultados filtrados (reutilizar lógica de cargarHistorialReservas)
    const reservasOrdenadas = reservasFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = '<div class="historial-reservas-lista">';
    let totalReservas = 0;
    let totalPersonas = 0;
    let totalIngresos = 0;

    reservasOrdenadas.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        transaccion.items.forEach(item => {
            if (item.tipo === 'reserva') {
                // Aplicar filtro de módulo a nivel de item
                if (moduloFiltro !== 'todos' && item.modulo != moduloFiltro) {
                    return;
                }

                totalReservas++;
                totalPersonas += item.personas || 0;
                totalIngresos += item.precio || 0;

                // Obtener el tipo de módulo
                const tipoModulo = obtenerTipoModulo(item.modulo);

                html += `
                    <div class="reserva-historial-card">
                        <div class="reserva-historial-header">
                            <div class="reserva-modulo-badge">
                                <i class="fas fa-hot-tub"></i>
                                <div class="modulo-badge-info">
                                    <span class="modulo-tipo">${tipoModulo}</span>
                                    <span class="modulo-numero">Módulo ${item.modulo}</span>
                                </div>
                            </div>
                            <div class="reserva-precio-badge">
                                ${item.precio} Bs
                            </div>
                        </div>
                        <div class="reserva-historial-body">
                            <div class="reserva-info-row">
                                <i class="fas fa-calendar"></i>
                                <span>${fechaFormateada}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-clock"></i>
                                <span>${horaFormateada}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-users"></i>
                                <span>${item.personas} persona${item.personas !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="reserva-info-row">
                                <i class="fas fa-credit-card"></i>
                                <span>${transaccion.metodoPago === 'qr' ? 'Pago QR' : 'Efectivo'}</span>
                            </div>
                            ${item.alergias && item.alergias !== 'Ninguna' && item.alergias !== 'Sin alergias' ? `
                                <div class="reserva-info-row alergias">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span><strong>Alergias:</strong> ${item.alergias}</span>
                                </div>
                            ` : ''}
                            ${item.segundaAdquisicion ? `
                                <div class="reserva-info-row segunda-adquisicion">
                                    <i class="fas fa-star"></i>
                                    <span>Segunda adquisición</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="reserva-historial-footer">
                            <span class="reserva-id">ID: ${transaccion.id}</span>
                        </div>
                    </div>
                `;
            }
        });
    });

    html += '</div>';
    content.innerHTML = html;

    actualizarResumenReservas(totalReservas, totalPersonas, totalIngresos);
}

function exportarHistorialReservas() {
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const reservas = transacciones.filter(t => t.items.some(item => item.tipo === 'reserva'));

    if (reservas.length === 0) {
        alert('No hay reservas para exportar');
        return;
    }

    let csv = 'Fecha,Hora,Módulo,Personas,Precio,Método de Pago,Alergias,Segunda Adquisición,ID Transacción\n';

    reservas.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        transaccion.items.forEach(item => {
            if (item.tipo === 'reserva') {
                csv += `${fechaStr},${horaStr},${item.modulo},${item.personas},${item.precio},${transaccion.metodoPago},"${item.alergias || 'Ninguna'}",${item.segundaAdquisicion ? 'Sí' : 'No'},${transaccion.id}\n`;
            }
        });
    });

    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_reservas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarToastAdmin('✅ Historial exportado exitosamente', 'success');
}

// Funciones de configuración
function limpiarHistorialReservas() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial de reservas? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('transacciones');
        localStorage.removeItem('reservasHorarios');
        localStorage.removeItem('reservasActuales');

        // Recargar datos
        cargarReservasAdmin();
        cargarIngresos();

        alert('Historial de reservas eliminado exitosamente. Se ha iniciado un nuevo historial.');
    }
}

function limpiarHistorialCaja() {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial de caja? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('historialCaja');
        alert('Historial de caja eliminado exitosamente. Se ha iniciado un nuevo historial.');
    }
}

function resetearSistema() {
    if (confirm('¿ADVERTENCIA! Esto eliminará TODOS los datos del sistema (reservas, productos, configuraciones, etc.). ¿Estás completamente seguro?')) {
        if (confirm('Esta es tu última oportunidad. ¿Realmente quieres resetear todo el sistema?')) {
            // Limpiar todo el localStorage
            localStorage.clear();

            // Recargar la página
            location.reload();
        }
    }
}

function exportarReservas() {
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');

    if (transacciones.length === 0) {
        alert('No hay reservas para exportar');
        return;
    }

    let csv = 'Fecha,Hora,Tipo,Módulo,Personas,Total,Método de Pago\n';

    transacciones.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');

        transaccion.items.forEach(item => {
            if (item.tipo === 'reserva') {
                csv += `${fechaStr},${horaStr},Reserva,${item.modulo},${item.personas},${item.precio},${transaccion.metodoPago}\n`;
            }
        });
    });

    descargarCSV(csv, 'reservas_sauna_cyg.csv');
}

function exportarIngresos() {
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');

    let csv = 'Fecha,Hora,Tipo,Concepto,Descripción,Monto\n';

    // Agregar transacciones de reservas y productos
    transacciones.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');

        csv += `${fechaStr},${horaStr},Venta,${transaccion.metodoPago},"${transaccion.items.map(i => i.nombre).join(', ')}",${transaccion.total}\n`;
    });

    // Agregar movimientos de caja
    historialCaja.forEach(movimiento => {
        const fecha = new Date(movimiento.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');
        const concepto = movimiento.concepto || movimiento.motivo || 'Sin especificar';

        csv += `${fechaStr},${horaStr},${movimiento.tipo},${concepto},"${movimiento.descripcion || ''}",${movimiento.tipo === 'ingreso' ? movimiento.monto : -movimiento.monto}\n`;
    });

    descargarCSV(csv, 'ingresos_sauna_cyg.csv');
}

function exportarInventario() {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');

    if (productos.length === 0) {
        alert('No hay productos para exportar');
        return;
    }

    let csv = 'ID,Nombre,Categoría,Precio,Stock\n';

    productos.forEach(producto => {
        csv += `${producto.id},${producto.nombre},${producto.categoria},${producto.precio},${producto.stock}\n`;
    });

    descargarCSV(csv, 'inventario_sauna_cyg.csv');
}

function descargarCSV(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nombreArchivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Función para cargar datos del localStorage
function cargarDatos() {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
        productos = JSON.parse(productosGuardados);
    } else {
        // Productos por defecto si no hay datos
        productos = [
            { id: 1, nombre: 'Maltin', categoria: 'refrescos', precio: 8, stock: 50 },
            { id: 2, nombre: 'Malta', categoria: 'refrescos', precio: 7, stock: 100 },
            { id: 3, nombre: 'Champú Ballerina Bebe', categoria: 'shampus', precio: 3, stock: 36 },
            { id: 4, nombre: 'Champú Sedal Anticaspa', categoria: 'shampus', precio: 5, stock: 15 },
            { id: 5, nombre: 'Coca Cola Retornable 2,5l', categoria: 'refrescos', precio: 15, stock: 80 },
            { id: 6, nombre: 'Agua vital', categoria: 'refrescos', precio: 10, stock: 100 },
            { id: 7, nombre: 'Toalla', categoria: 'implementos', precio: 25, stock: 30 },
            { id: 8, nombre: 'Chinelas', categoria: 'implementos', precio: 35, stock: 1 }
        ];
        guardarProductos();
    }

    const transaccionesGuardadas = localStorage.getItem('transacciones');
    if (transaccionesGuardadas) {
        transacciones = JSON.parse(transaccionesGuardadas);
    }
}

// Función para guardar productos en localStorage
function guardarProductos() {
    localStorage.setItem('productos', JSON.stringify(productos));
}

// Función para cargar productos en el admin
function cargarProductosAdmin() {
    const grid = document.getElementById('productos-admin-grid');

    if (productos.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No hay productos registrados</h3>
                <p>Comienza agregando tu primer producto al inventario</p>
                <button onclick="mostrarFormularioProducto()" class="btn-primary">
                    <i class="fas fa-plus"></i> Agregar Producto
                </button>
            </div>
        `;
        return;
    }

    let html = '';

    productos.forEach(producto => {
        const stockClase = producto.stock < 10 ? 'stock-bajo' : '';
        const categoriaLabel = getCategoriaLabel(producto.categoria);

        html += `
            <div class="producto-admin-card">
                ${producto.imagen ? `<div class="producto-imagen"><img src="${producto.imagen}" alt="${producto.nombre}"></div>` : '<div class="producto-sin-imagen"><i class="fas fa-image"></i><span>Sin imagen</span></div>'}
                <div class="producto-admin-header">
                    <div class="producto-admin-info">
                        <h3>${producto.nombre}</h3>
                        <span class="producto-admin-categoria">${categoriaLabel}</span>
                    </div>
                </div>
                <div class="producto-admin-precio">${producto.precio} Bs</div>
                <div class="producto-admin-stock ${stockClase}">
                    <i class="fas fa-boxes"></i> Stock: ${producto.stock} unidades
                    ${producto.stock < 10 ? '<br><strong><i class="fas fa-exclamation-triangle"></i> ¡Stock bajo!</strong>' : ''}
                    ${producto.stock === 0 ? '<br><strong style="color: var(--admin-danger);"><i class="fas fa-times-circle"></i> ¡Agotado!</strong>' : ''}
                </div>
                <div class="producto-admin-actions">
                    <button class="btn-edit" onclick="editarProducto(${producto.id})" title="Editar producto">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-primary" onclick="agregarStock(${producto.id})" title="Agregar stock">
                        <i class="fas fa-plus"></i> Stock
                    </button>
                    <button class="btn-danger" onclick="eliminarProducto(${producto.id})" title="Eliminar producto">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
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

// Función para mostrar formulario de producto
function mostrarFormularioProducto() {
    productoEditando = null;
    document.getElementById('producto-modal-title').textContent = 'Agregar Producto';
    document.getElementById('producto-form').reset();
    document.getElementById('producto-modal').style.display = 'block';
}

// Función para cerrar formulario de producto
function cerrarFormularioProducto() {
    document.getElementById('producto-modal').style.display = 'none';
    document.getElementById('producto-form').reset();
    removerImagenPreview();
    productoEditando = null;
}

// Función para editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    productoEditando = producto;
    document.getElementById('producto-modal-title').textContent = 'Editar Producto';
    document.getElementById('producto-nombre').value = producto.nombre;
    document.getElementById('producto-categoria').value = producto.categoria;
    document.getElementById('producto-precio').value = producto.precio;
    document.getElementById('producto-stock').value = producto.stock;

    // Mostrar imagen existente si la hay
    const preview = document.getElementById('imagen-preview');
    const img = document.getElementById('preview-img');
    if (producto.imagen) {
        img.src = producto.imagen;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('producto-modal').style.display = 'block';
}

// Función para guardar producto
async function guardarProducto(event) {
    event.preventDefault();

    const nombre = document.getElementById('producto-nombre').value.trim();
    const categoria = document.getElementById('producto-categoria').value;
    const precio = parseFloat(document.getElementById('producto-precio').value);
    const stock = parseInt(document.getElementById('producto-stock').value);
    const imagenFile = document.getElementById('producto-imagen').files[0];

    // Validaciones
    if (!nombre) {
        mostrarNotificacion('El nombre del producto es obligatorio', 'error');
        return;
    }

    if (precio <= 0) {
        mostrarNotificacion('El precio debe ser mayor a 0', 'error');
        return;
    }

    if (stock < 0) {
        mostrarNotificacion('El stock no puede ser negativo', 'error');
        return;
    }

    let imagenBase64 = null;
    if (imagenFile) {
        try {
            imagenBase64 = await convertirImagenABase64(imagenFile);
        } catch (error) {
            mostrarNotificacion('Error al procesar la imagen', 'error');
            return;
        }
    }

    if (productoEditando) {
        // Editar producto existente
        productoEditando.nombre = nombre;
        productoEditando.categoria = categoria;
        productoEditando.precio = precio;
        productoEditando.stock = stock;
        if (imagenBase64) {
            productoEditando.imagen = imagenBase64;
        }
        mostrarNotificacion('Producto actualizado exitosamente', 'success');
    } else {
        // Agregar nuevo producto
        const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
        productos.push({
            id: nuevoId,
            nombre: nombre,
            categoria: categoria,
            precio: precio,
            stock: stock,
            imagen: imagenBase64
        });
        mostrarNotificacion('Producto agregado exitosamente', 'success');
    }

    guardarProductos();
    cargarProductosAdmin();
    cerrarFormularioProducto();
}

// Función para eliminar producto
function eliminarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`)) {
        productos = productos.filter(p => p.id !== id);
        guardarProductos();
        cargarProductosAdmin();
        mostrarNotificacion('Producto eliminado exitosamente', 'success');
    }
}

// Función para agregar stock
function agregarStock(id) {
    const producto = productos.find(p => p.id === id);
    const cantidad = prompt(`¿Cuántas unidades quieres agregar al stock de "${producto.nombre}"?\nStock actual: ${producto.stock} unidades`);

    if (cantidad && !isNaN(cantidad) && parseInt(cantidad) > 0) {
        const cantidadNum = parseInt(cantidad);
        producto.stock += cantidadNum;
        guardarProductos();
        cargarProductosAdmin();
        mostrarNotificacion(`Se agregaron ${cantidadNum} unidades al stock de ${producto.nombre}`, 'success');
    } else if (cantidad !== null) {
        mostrarNotificacion('Por favor ingresa una cantidad válida', 'error');
    }
}

// Función para cargar reservas del admin
// Función auxiliar para obtener el tipo de módulo basado en el ID
function obtenerTipoModulo(moduloId) {
    // Si el moduloId es un string como "individual-1", "doble-2", etc.
    if (typeof moduloId === 'string' && moduloId.includes('-')) {
        const tipo = moduloId.split('-')[0];
        const tiposNombres = {
            'individual': 'Sauna Individual',
            'doble': 'Sauna Doble',
            'semifamiliar': 'Sauna Semifamiliar',
            'familiar': 'Sauna Familiar'
        };
        return tiposNombres[tipo] || `Módulo ${moduloId}`;
    }
    
    // Si es un número, intentar determinar el tipo por el precio
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    
    // Buscar en la configuración
    for (const [saunaId, config] of Object.entries(configuracionModulos)) {
        if (saunaId.includes(moduloId) || config.nombre === moduloId) {
            if (config.tipo) {
                const tiposNombres = {
                    'individual': 'Sauna Individual',
                    'doble': 'Sauna Doble',
                    'semifamiliar': 'Sauna Semifamiliar',
                    'familiar': 'Sauna Familiar'
                };
                return tiposNombres[config.tipo] || config.nombre || `Módulo ${moduloId}`;
            }
        }
    }
    
    // Fallback: retornar el ID del módulo
    return `Módulo ${moduloId}`;
}

function cargarReservasAdmin() {
    // Cargar con fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('reservas-fecha-desde').value = hoy;
    document.getElementById('reservas-fecha-hasta').value = hoy;
    
    filtrarReservasAdmin();
}

function filtrarReservasAdmin() {
    const grid = document.getElementById('reservas-admin-grid');
    const fechaDesde = document.getElementById('reservas-fecha-desde').value;
    const fechaHasta = document.getElementById('reservas-fecha-hasta').value;
    const estadoFiltro = document.getElementById('reservas-estado-filtro').value;
    const moduloFiltro = document.getElementById('reservas-modulo-filtro').value;

    // Obtener solicitudes pendientes con pago QR (reservas)
    const todasSolicitudes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    let solicitudesQR = todasSolicitudes.filter(s => 
        s.metodoPago === 'qr' && 
        s.items.some(item => item.tipo === 'reserva' || item.nombre?.toLowerCase().includes('sauna'))
    );

    // Obtener todas las reservas confirmadas
    let reservasConfirmadas = transacciones.filter(t => 
        t.items.some(item => item.tipo === 'reserva') &&
        t.metodoPago === 'qr'
    );

    // Aplicar filtros de fecha
    if (fechaDesde) {
        const fechaDesdeObj = new Date(fechaDesde);
        solicitudesQR = solicitudesQR.filter(s => new Date(s.fecha) >= fechaDesdeObj);
        reservasConfirmadas = reservasConfirmadas.filter(t => new Date(t.fecha) >= fechaDesdeObj);
    }

    if (fechaHasta) {
        const fechaHastaObj = new Date(fechaHasta);
        fechaHastaObj.setHours(23, 59, 59, 999);
        solicitudesQR = solicitudesQR.filter(s => new Date(s.fecha) <= fechaHastaObj);
        reservasConfirmadas = reservasConfirmadas.filter(t => new Date(t.fecha) <= fechaHastaObj);
    }

    // Aplicar filtro de estado
    if (estadoFiltro === 'pendiente') {
        reservasConfirmadas = [];
    } else if (estadoFiltro === 'confirmado') {
        solicitudesQR = [];
    }

    // Aplicar filtro de módulo
    if (moduloFiltro !== 'todos') {
        solicitudesQR = solicitudesQR.filter(s => 
            s.items.some(item => {
                const moduloId = String(item.modulo || '');
                return moduloId.toLowerCase().includes(moduloFiltro);
            })
        );
        reservasConfirmadas = reservasConfirmadas.filter(t =>
            t.items.some(item => {
                const moduloId = String(item.modulo || '');
                return moduloId.toLowerCase().includes(moduloFiltro);
            })
        );
    }

    // Actualizar estadísticas
    let totalReservas = solicitudesQR.length + reservasConfirmadas.length;
    let totalPersonas = 0;
    let totalIngresos = 0;

    solicitudesQR.forEach(s => {
        s.items.forEach(item => {
            if (item.tipo === 'reserva') {
                totalPersonas += item.personas || 0;
                totalIngresos += item.precio || s.total;
            }
        });
    });

    reservasConfirmadas.forEach(t => {
        t.items.forEach(item => {
            if (item.tipo === 'reserva') {
                totalPersonas += item.personas || 0;
                totalIngresos += item.precio || 0;
            }
        });
    });

    document.getElementById('total-reservas-mostradas').textContent = totalReservas;
    document.getElementById('total-personas-mostradas').textContent = totalPersonas;
    document.getElementById('total-ingresos-reservas').textContent = totalIngresos + ' Bs';

    if (solicitudesQR.length === 0 && reservasConfirmadas.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron reservas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }

    let html = '';

    // Primero mostrar solicitudes QR pendientes de confirmación
    if (solicitudesQR.length > 0) {
        html += '<div class="reservas-pendientes-qr"><h3><i class="fas fa-clock"></i> Pendientes de Confirmación de Pago QR</h3>';
        
        solicitudesQR.forEach(solicitud => {
            const fecha = new Date(solicitud.fecha);
            const fechaFormateada = fecha.toLocaleDateString('es-ES');
            const horaFormateada = fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const reservas = solicitud.items.filter(item => item.tipo === 'reserva' || item.nombre?.toLowerCase().includes('sauna'));
            
            reservas.forEach(reserva => {
                const tipoModulo = obtenerTipoModulo(reserva.modulo || reserva.nombre);

                html += `
                    <div class="reserva-admin-card pendiente-qr">
                        <div class="reserva-admin-header">
                            <div class="reserva-modulo-info">
                                <span class="reserva-tipo">${tipoModulo}</span>
                                <span class="reserva-numero">Módulo ${reserva.modulo || 'N/A'}</span>
                            </div>
                            <span class="reserva-precio">${reserva.precio || solicitud.total} Bs</span>
                        </div>
                        <div class="reserva-detalles">
                            <strong>Cliente:</strong> ${solicitud.cliente}
                        </div>
                        <div class="reserva-detalles">
                            <strong>Fecha:</strong> ${fechaFormateada} ${horaFormateada}
                        </div>
                        <div class="reserva-detalles">
                            <strong>Personas:</strong> ${reserva.personas || 'N/A'}
                        </div>
                        <div class="reserva-detalles">
                            <strong>Método de pago:</strong> <span class="badge-qr">QR - Pendiente</span>
                        </div>
                        <div class="reserva-actions">
                            <button onclick="confirmarPagoQRAdmin('${solicitud.id}')" class="btn-confirmar-qr">
                                <i class="fas fa-check-circle"></i> Confirmar Pago QR
                            </button>
                            <button onclick="rechazarSolicitud('${solicitud.id}')" class="btn-rechazar">
                                <i class="fas fa-times-circle"></i> Rechazar
                            </button>
                        </div>
                    </div>
                `;
            });
        });
        
        html += '</div>';
    }

    // Luego mostrar reservas confirmadas
    if (reservasConfirmadas.length > 0) {
        html += '<div class="reservas-confirmadas"><h3><i class="fas fa-check-circle"></i> Reservas Confirmadas (Pago QR)</h3>';
    }

    reservasConfirmadas.forEach(transaccion => {
        const reservas = transaccion.items.filter(item => item.tipo === 'reserva');

        reservas.forEach(reserva => {
            const fecha = new Date(transaccion.fecha);
            const horaFormateada = fecha.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Obtener el tipo de módulo
            const tipoModulo = obtenerTipoModulo(reserva.modulo);

            html += `
                <div class="reserva-admin-card confirmada">
                    <div class="reserva-admin-header">
                        <div class="reserva-modulo-info">
                            <span class="reserva-tipo">${tipoModulo}</span>
                            <span class="reserva-numero">Módulo ${reserva.modulo}</span>
                        </div>
                        <span class="reserva-precio">${reserva.precio} Bs</span>
                    </div>
                    <div class="reserva-detalles">
                        <strong>Personas:</strong> ${reserva.personas}
                    </div>
                    <div class="reserva-detalles">
                        <strong>Hora de reserva:</strong> ${horaFormateada}
                    </div>
                    <div class="reserva-detalles">
                        <strong>Método de pago:</strong> <span class="badge-qr-confirmado">QR - Confirmado</span>
                    </div>
                    ${reserva.segundaAdquisicion ? '<div class="reserva-detalles"><strong>Segunda adquisición</strong></div>' : ''}
                    <div class="reserva-alergias">
                        <strong>Alergias:</strong> ${reserva.alergias}
                    </div>
                </div>
            `;
        });
    });

    if (reservasConfirmadas.length > 0) {
        html += '</div>';
    }

    grid.innerHTML = html;
}

// Función para confirmar pago QR desde el admin
function confirmarPagoQRAdmin(solicitudId) {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitud = solicitudesPendientes.find(s => s.id === solicitudId);
    
    if (!solicitud) {
        mostrarToastAdmin('❌ Solicitud no encontrada', 'error');
        return;
    }
    
    // Crear transacción confirmada
    const transaccion = {
        id: 'TXN-' + Date.now(),
        fecha: new Date().toISOString(),
        items: solicitud.items,
        total: solicitud.total,
        metodoPago: 'qr',
        cliente: solicitud.cliente
    };
    
    // Guardar transacción
    let transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    transacciones.push(transaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
    
    // Registrar en historial de caja
    const movimientoCaja = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: 'ingreso',
        concepto: `Pago QR - ${solicitud.cliente}`,
        descripcion: `Solicitud #${solicitud.id} - Reserva confirmada`,
        monto: solicitud.total,
        metodoPago: 'qr',
        solicitudId: solicitud.id
    };

    let historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimientoCaja);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    // Actualizar balance QR
    let balanceQR = parseFloat(localStorage.getItem('balanceQR') || '0');
    balanceQR += solicitud.total;
    localStorage.setItem('balanceQR', balanceQR.toString());

    // Actualizar balance total de caja
    let balanceCaja = parseFloat(localStorage.getItem('balanceCaja') || '0');
    balanceCaja += solicitud.total;
    localStorage.setItem('balanceCaja', balanceCaja.toString());
    
    // Eliminar de solicitudes pendientes
    const nuevasSolicitudes = solicitudesPendientes.filter(s => s.id !== solicitudId);
    localStorage.setItem('solicitudesPendientes', JSON.stringify(nuevasSolicitudes));
    
    // Recargar vistas
    filtrarReservasAdmin();
    cargarIngresos();
    cargarSolicitudesEnSeccion();
    filtrarCajaAdmin();
    
    mostrarToastAdmin('✅ Pago QR confirmado y registrado en caja', 'success');
}

// Funciones auxiliares para filtros de reservas
function limpiarFiltrosReservas() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('reservas-fecha-desde').value = hoy;
    document.getElementById('reservas-fecha-hasta').value = hoy;
    document.getElementById('reservas-estado-filtro').value = 'todos';
    document.getElementById('reservas-modulo-filtro').value = 'todos';
    filtrarReservasAdmin();
}

function exportarReservasActuales() {
    const fechaDesde = document.getElementById('reservas-fecha-desde').value;
    const fechaHasta = document.getElementById('reservas-fecha-hasta').value;
    
    const todasSolicitudes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitudesQR = todasSolicitudes.filter(s => s.metodoPago === 'qr');
    const reservasConfirmadas = transacciones.filter(t => 
        t.items.some(item => item.tipo === 'reserva') && t.metodoPago === 'qr'
    );
    
    let csv = 'Fecha,Hora,Cliente,Módulo,Tipo,Personas,Precio,Estado,Alergias\n';
    
    // Exportar pendientes
    solicitudesQR.forEach(s => {
        const fecha = new Date(s.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');
        
        s.items.forEach(item => {
            if (item.tipo === 'reserva') {
                const tipoModulo = obtenerTipoModulo(item.modulo);
                csv += `${fechaStr},${horaStr},${s.cliente},${item.modulo},${tipoModulo},${item.personas},${item.precio},Pendiente,"${item.alergias || 'Ninguna'}"\n`;
            }
        });
    });
    
    // Exportar confirmadas
    reservasConfirmadas.forEach(t => {
        const fecha = new Date(t.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');
        
        t.items.forEach(item => {
            if (item.tipo === 'reserva') {
                const tipoModulo = obtenerTipoModulo(item.modulo);
                csv += `${fechaStr},${horaStr},${t.cliente || 'N/A'},${item.modulo},${tipoModulo},${item.personas},${item.precio},Confirmado,"${item.alergias || 'Ninguna'}"\n`;
            }
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_${fechaDesde || 'todas'}_${fechaHasta || 'todas'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin('✅ Reservas exportadas exitosamente', 'success');
}

// Funciones para gestión de caja integrada
function filtrarCajaAdmin() {
    const lista = document.getElementById('caja-movimientos-lista');
    const fechaDesde = document.getElementById('caja-fecha-desde').value;
    const fechaHasta = document.getElementById('caja-fecha-hasta').value;
    const tipoFiltro = document.getElementById('caja-tipo-filtro').value;
    
    let historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    
    // Aplicar filtros de fecha
    if (fechaDesde) {
        const fechaDesdeObj = new Date(fechaDesde);
        historialCaja = historialCaja.filter(m => new Date(m.fecha) >= fechaDesdeObj);
    }
    
    if (fechaHasta) {
        const fechaHastaObj = new Date(fechaHasta);
        fechaHastaObj.setHours(23, 59, 59, 999);
        historialCaja = historialCaja.filter(m => new Date(m.fecha) <= fechaHastaObj);
    }
    
    // Aplicar filtro de tipo
    if (tipoFiltro !== 'todos') {
        historialCaja = historialCaja.filter(m => m.tipo === tipoFiltro);
    }
    
    // Calcular totales
    let totalIngresos = 0;
    let totalRetiros = 0;
    let totalEfectivo = 0;
    let totalQR = 0;
    
    historialCaja.forEach(m => {
        if (m.tipo === 'ingreso') {
            totalIngresos += m.monto;
            // Separar por método de pago
            if (m.metodoPago === 'efectivo') {
                totalEfectivo += m.monto;
            } else if (m.metodoPago === 'qr') {
                totalQR += m.monto;
            }
        } else {
            totalRetiros += m.monto;
        }
    });
    
    const saldo = totalIngresos - totalRetiros;
    
    // Actualizar resumen
    document.getElementById('caja-efectivo').textContent = totalEfectivo + ' Bs';
    document.getElementById('caja-qr').textContent = totalQR + ' Bs';
    document.getElementById('caja-total-ingresos').textContent = totalIngresos + ' Bs';
    document.getElementById('caja-total-retiros').textContent = totalRetiros + ' Bs';
    document.getElementById('caja-saldo-actual').textContent = saldo + ' Bs';
    
    // Cambiar color del saldo
    const saldoElement = document.getElementById('caja-saldo-actual');
    saldoElement.style.color = saldo >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    
    if (historialCaja.length === 0) {
        lista.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No se encontraron movimientos</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha descendente
    historialCaja.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '';
    
    historialCaja.forEach(movimiento => {
        const fecha = new Date(movimiento.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        const tipoClase = movimiento.tipo === 'ingreso' ? 'ingreso' : 'retiro';
        const tipoIcono = movimiento.tipo === 'ingreso' ? 'fa-arrow-up' : 'fa-arrow-down';
        const tipoTexto = movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Retiro';
        const signo = movimiento.tipo === 'ingreso' ? '+' : '-';
        
        html += `
            <div class="movimiento-card ${tipoClase}">
                <div class="movimiento-icon">
                    <i class="fas ${tipoIcono}"></i>
                </div>
                <div class="movimiento-info">
                    <div class="movimiento-tipo">${tipoTexto}</div>
                    <div class="movimiento-concepto">${movimiento.concepto || movimiento.motivo || 'Sin especificar'}</div>
                    <div class="movimiento-descripcion">${movimiento.descripcion || ''}</div>
                    <div class="movimiento-fecha">${fechaFormateada} ${horaFormateada}</div>
                </div>
                <div class="movimiento-monto ${tipoClase}">
                    ${signo}${movimiento.monto} Bs
                </div>
            </div>
        `;
    });
    
    lista.innerHTML = html;
}

function limpiarFiltrosCaja() {
    document.getElementById('caja-fecha-desde').value = '';
    document.getElementById('caja-fecha-hasta').value = '';
    document.getElementById('caja-tipo-filtro').value = 'todos';
    filtrarCajaAdmin();
}

function exportarCajaActual() {
    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    
    if (historialCaja.length === 0) {
        mostrarToastAdmin('❌ No hay movimientos para exportar', 'error');
        return;
    }
    
    let csv = 'Fecha,Hora,Tipo,Concepto,Descripción,Monto\n';
    
    historialCaja.forEach(m => {
        const fecha = new Date(m.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES');
        const horaStr = fecha.toLocaleTimeString('es-ES');
        const concepto = m.concepto || m.motivo || 'Sin especificar';
        const descripcion = m.descripcion || '';
        
        csv += `${fechaStr},${horaStr},${m.tipo},${concepto},"${descripcion}",${m.monto}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `caja_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin('✅ Movimientos de caja exportados exitosamente', 'success');
}

// Función para cargar ingresos
function cargarIngresos() {
    const hoy = new Date().toDateString();

    // Filtrar transacciones del día
    const transaccionesHoy = transacciones.filter(t => {
        const fechaTransaccion = new Date(t.fecha).toDateString();
        return fechaTransaccion === hoy;
    });

    // Calcular ingresos del día
    const ingresosDia = transaccionesHoy.reduce((total, t) => total + t.total, 0);

    // Contar reservas completadas
    const reservasCompletadas = transaccionesHoy.filter(t =>
        t.items.some(item => item.tipo === 'reserva')
    ).length;

    // Contar productos vendidos
    const productosVendidos = transaccionesHoy.reduce((total, t) => {
        return total + t.items.filter(item => item.tipo === 'producto')
            .reduce((sum, item) => sum + item.cantidad, 0);
    }, 0);

    // Actualizar UI
    document.getElementById('ingresos-dia').textContent = `${ingresosDia} Bs`;
    document.getElementById('reservas-completadas').textContent = reservasCompletadas;
    document.getElementById('productos-vendidos').textContent = productosVendidos;

    // Cargar lista de transacciones
    cargarTransacciones();
}

// Función para cargar transacciones
function cargarTransacciones() {
    const lista = document.getElementById('transacciones-lista');

    if (transacciones.length === 0) {
        lista.innerHTML = '<p>No hay transacciones registradas</p>';
        return;
    }

    // Ordenar por fecha descendente
    const transaccionesOrdenadas = [...transacciones].sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
    );

    let html = '';

    transaccionesOrdenadas.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determinar tipo principal de transacción
        const tieneReserva = transaccion.items.some(item => item.tipo === 'reserva');
        const tipoTransaccion = tieneReserva ? 'Reserva + Productos' : 'Solo Productos';

        // Crear resumen de items
        const resumenItems = transaccion.items.map(item =>
            `${item.nombre} (${item.cantidad})`
        ).join(', ');

        html += `
            <div class="transaccion-item">
                <div class="transaccion-info">
                    <div class="transaccion-tipo">${tipoTransaccion}</div>
                    <div class="transaccion-detalles">${resumenItems}</div>
                    <div class="transaccion-fecha">${fechaFormateada} ${horaFormateada} - ${transaccion.metodoPago.toUpperCase()}</div>
                </div>
                <div class="transaccion-precio">${transaccion.total} Bs</div>
            </div>
        `;
    });

    lista.innerHTML = html;
}

// Función para filtrar transacciones
function filtrarTransacciones() {
    const fechaFiltro = document.getElementById('fecha-filtro').value;
    const tipoFiltro = document.getElementById('tipo-filtro').value;

    let transaccionesFiltradas = [...transacciones];

    // Filtrar por fecha
    if (fechaFiltro) {
        const fechaSeleccionada = new Date(fechaFiltro).toDateString();
        transaccionesFiltradas = transaccionesFiltradas.filter(t => {
            const fechaTransaccion = new Date(t.fecha).toDateString();
            return fechaTransaccion === fechaSeleccionada;
        });
    }

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
        if (tipoFiltro === 'reservas') {
            transaccionesFiltradas = transaccionesFiltradas.filter(t =>
                t.items.some(item => item.tipo === 'reserva')
            );
        } else if (tipoFiltro === 'productos') {
            transaccionesFiltradas = transaccionesFiltradas.filter(t =>
                t.items.every(item => item.tipo === 'producto')
            );
        }
    }

    // Actualizar lista con transacciones filtradas
    const lista = document.getElementById('transacciones-lista');

    if (transaccionesFiltradas.length === 0) {
        lista.innerHTML = '<p>No hay transacciones que coincidan con los filtros</p>';
        return;
    }

    // Ordenar por fecha descendente
    const transaccionesOrdenadas = transaccionesFiltradas.sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
    );

    let html = '';

    transaccionesOrdenadas.forEach(transaccion => {
        const fecha = new Date(transaccion.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const tieneReserva = transaccion.items.some(item => item.tipo === 'reserva');
        const tipoTransaccion = tieneReserva ? 'Reserva + Productos' : 'Solo Productos';

        const resumenItems = transaccion.items.map(item =>
            `${item.nombre} (${item.cantidad})`
        ).join(', ');

        html += `
            <div class="transaccion-item">
                <div class="transaccion-info">
                    <div class="transaccion-tipo">${tipoTransaccion}</div>
                    <div class="transaccion-detalles">${resumenItems}</div>
                    <div class="transaccion-fecha">${fechaFormateada} ${horaFormateada} - ${transaccion.metodoPago.toUpperCase()}</div>
                </div>
                <div class="transaccion-precio">${transaccion.total} Bs</div>
            </div>
        `;
    });

    lista.innerHTML = html;
}

// Event listeners para cerrar modales
window.onclick = function (event) {
    const productoModal = document.getElementById('producto-modal');

    if (event.target === productoModal) {
        cerrarFormularioProducto();
    }
}

// Funciones adicionales
function exportarInventario() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "ID,Nombre,Categoría,Precio,Stock\n"
        + productos.map(p => `${p.id},${p.nombre},${p.categoria},${p.precio},${p.stock}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function limpiarFiltros() {
    document.getElementById('fecha-filtro').value = '';
    document.getElementById('tipo-filtro').value = 'todos';
    cargarTransacciones();
}

// Función para mostrar notificaciones (similar a la del cliente)
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación si no existe
    let notification = document.getElementById('admin-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'admin-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 3000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Configurar estilo según tipo
    switch (tipo) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            break;
    }

    notification.textContent = mensaje;
    notification.style.transform = 'translateX(0)';

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}
// ==========================================
// FUNCIONES PARA SOLICITUDES PENDIENTES
// ==========================================

// Función para mostrar el modal de solicitudes pendientes
function mostrarSolicitudesPendientes() {
    const modal = document.getElementById('solicitudes-modal');
    modal.style.display = 'block';
    cargarSolicitudesPendientes();
    actualizarEstadisticasSolicitudes();
}

// Función para cerrar el modal de solicitudes
function cerrarSolicitudesModal() {
    document.getElementById('solicitudes-modal').style.display = 'none';
}

// Función para cargar y mostrar las solicitudes pendientes
function cargarSolicitudesPendientes() {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const lista = document.getElementById('solicitudes-lista');

    if (solicitudesPendientes.length === 0) {
        lista.innerHTML = `
            <div class="solicitudes-vacio">
                <i class="fas fa-inbox"></i>
                <h4>No hay solicitudes pendientes</h4>
                <p>Todas las solicitudes han sido procesadas</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha (más recientes primero)
    solicitudesPendientes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    lista.innerHTML = solicitudesPendientes.map(solicitud => {
        const fecha = new Date(solicitud.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const estadoClass = solicitud.estado === 'procesando' ? 'estado-procesando' : 'estado-pendiente';
        const estadoTexto = solicitud.estado === 'procesando' ? 'Procesando' : 'Pendiente';

        // Obtener información del cliente (puede no estar disponible en solicitudes antiguas)
        const clienteNombre = solicitud.cliente ? solicitud.cliente.nombre : 'Cliente Anónimo';
        const clienteTelefono = solicitud.cliente ? solicitud.cliente.telefono : 'No disponible';

        // Contar items en la solicitud
        const totalItems = solicitud.items ? solicitud.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

        return `
            <div class="solicitud-item" data-id="${solicitud.id}">
                <div class="solicitud-info">
                    <div class="solicitud-header">
                        <span class="solicitud-id">ID: ${solicitud.id}</span>
                        <span class="solicitud-estado ${estadoClass}">${estadoTexto}</span>
                    </div>
                    <div class="solicitud-cliente">${clienteNombre}</div>
                    <div class="solicitud-detalles">
                        <span class="solicitud-monto">${solicitud.total} Bs</span>
                        <span class="solicitud-fecha">${fechaFormateada}</span>
                        <span>${totalItems} productos</span>
                        ${clienteTelefono !== 'No disponible' ? `<span>Tel: ${clienteTelefono}</span>` : ''}
                    </div>
                </div>
                <div class="solicitud-acciones">
                    <button class="btn-ver-detalles" onclick="verDetallesSolicitud('${solicitud.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${solicitud.estado !== 'procesando' ? `
                        <button class="btn-aprobar" onclick="aprobarSolicitud('${solicitud.id}')">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn-rechazar" onclick="rechazarSolicitud('${solicitud.id}')">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : `
                        <button class="btn-aprobar" onclick="completarSolicitud('${solicitud.id}')">
                            <i class="fas fa-check-double"></i> Completar
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Función para actualizar las estadísticas de solicitudes
function actualizarEstadisticasSolicitudes() {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const totalSolicitudes = solicitudesPendientes.length;
    const montoTotal = solicitudesPendientes.reduce((sum, solicitud) => sum + solicitud.total, 0);

    document.getElementById('total-solicitudes').textContent = totalSolicitudes;
    document.getElementById('monto-total-solicitudes').textContent = `${montoTotal} Bs`;

    // Actualizar badge de notificación en el header
    const badge = document.getElementById('solicitudes-badge');
    if (totalSolicitudes > 0) {
        badge.textContent = totalSolicitudes;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

// Función para filtrar solicitudes
function filtrarSolicitudes() {
    const busqueda = document.getElementById('buscar-solicitud').value.toLowerCase();
    const estadoFiltro = document.getElementById('filtro-estado-solicitud').value;
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');

    let solicitudesFiltradas = solicitudesPendientes;

    // Filtrar por búsqueda
    if (busqueda) {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud => {
            const clienteNombre = solicitud.cliente ? solicitud.cliente.nombre.toLowerCase() : 'cliente anónimo';
            const clienteTelefono = solicitud.cliente ? solicitud.cliente.telefono : '';
            const solicitudId = solicitud.id.toString();

            return clienteNombre.includes(busqueda) ||
                solicitudId.includes(busqueda) ||
                clienteTelefono.includes(busqueda);
        });
    }

    // Filtrar por estado
    if (estadoFiltro !== 'todas') {
        solicitudesFiltradas = solicitudesFiltradas.filter(solicitud =>
            solicitud.estado === estadoFiltro
        );
    }

    // Mostrar resultados filtrados
    mostrarSolicitudesFiltradas(solicitudesFiltradas);
}

// Función para mostrar solicitudes filtradas
function mostrarSolicitudesFiltradas(solicitudes) {
    const lista = document.getElementById('solicitudes-lista');

    if (solicitudes.length === 0) {
        lista.innerHTML = `
            <div class="solicitudes-vacio">
                <i class="fas fa-search"></i>
                <h4>No se encontraron solicitudes</h4>
                <p>Intenta con otros criterios de búsqueda</p>
            </div>
        `;
        return;
    }

    // Usar la misma lógica de renderizado que cargarSolicitudesPendientes
    solicitudes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    lista.innerHTML = solicitudes.map(solicitud => {
        const fecha = new Date(solicitud.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const estadoClass = solicitud.estado === 'procesando' ? 'estado-procesando' : 'estado-pendiente';
        const estadoTexto = solicitud.estado === 'procesando' ? 'Procesando' : 'Pendiente';

        // Obtener información del cliente (puede no estar disponible en solicitudes antiguas)
        const clienteNombre = solicitud.cliente ? solicitud.cliente.nombre : 'Cliente Anónimo';
        const clienteTelefono = solicitud.cliente ? solicitud.cliente.telefono : 'No disponible';

        // Contar items en la solicitud
        const totalItems = solicitud.items ? solicitud.items.reduce((sum, item) => sum + item.cantidad, 0) : 0;

        return `
            <div class="solicitud-item" data-id="${solicitud.id}">
                <div class="solicitud-info">
                    <div class="solicitud-header">
                        <span class="solicitud-id">ID: ${solicitud.id}</span>
                        <span class="solicitud-estado ${estadoClass}">${estadoTexto}</span>
                    </div>
                    <div class="solicitud-cliente">${clienteNombre}</div>
                    <div class="solicitud-detalles">
                        <span class="solicitud-monto">${solicitud.total} Bs</span>
                        <span class="solicitud-fecha">${fechaFormateada}</span>
                        <span>${totalItems} productos</span>
                        ${clienteTelefono !== 'No disponible' ? `<span>Tel: ${clienteTelefono}</span>` : ''}
                    </div>
                </div>
                <div class="solicitud-acciones">
                    <button class="btn-ver-detalles" onclick="verDetallesSolicitud('${solicitud.id}')">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    ${solicitud.estado !== 'procesando' ? `
                        <button class="btn-aprobar" onclick="aprobarSolicitud('${solicitud.id}')">
                            <i class="fas fa-check"></i> Aprobar
                        </button>
                        <button class="btn-rechazar" onclick="rechazarSolicitud('${solicitud.id}')">
                            <i class="fas fa-times"></i> Rechazar
                        </button>
                    ` : `
                        <button class="btn-aprobar" onclick="completarSolicitud('${solicitud.id}')">
                            <i class="fas fa-check-double"></i> Completar
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Función para ver detalles de una solicitud
function verDetallesSolicitud(solicitudId) {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitud = solicitudesPendientes.find(s => s.id == solicitudId);

    if (!solicitud) {
        alert('Solicitud no encontrada');
        return;
    }

    const fecha = new Date(solicitud.fecha);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let detallesProductos = '';
    if (solicitud.items && solicitud.items.length > 0) {
        detallesProductos = solicitud.items.map(item =>
            `• ${item.nombre} x${item.cantidad} - ${(item.precio * item.cantidad).toFixed(2)} Bs`
        ).join('\n');
    }

    // Información del cliente
    const clienteNombre = solicitud.cliente ? solicitud.cliente.nombre : 'Cliente Anónimo';
    const clienteTelefono = solicitud.cliente ? solicitud.cliente.telefono : 'No disponible';
    const clienteEmail = solicitud.cliente ? (solicitud.cliente.email || 'No proporcionado') : 'No disponible';

    // Información técnica
    let infoTecnica = '';
    if (solicitud.clienteInfo) {
        infoTecnica = `\nINFORMACIÓN TÉCNICA:\nNavegador: ${solicitud.clienteInfo.navegador || 'No disponible'}\nPantalla: ${solicitud.clienteInfo.pantalla || 'No disponible'}`;
    }

    const mensaje = `
DETALLES DE LA SOLICITUD

ID: ${solicitud.id}
Cliente: ${clienteNombre}
Teléfono: ${clienteTelefono}
Email: ${clienteEmail}
Fecha: ${fechaFormateada}
Estado: ${solicitud.estado.toUpperCase()}
Método de Pago: ${solicitud.metodoPago || 'Efectivo'}

${detallesProductos ? 'PRODUCTOS SOLICITADOS:\n' + detallesProductos + '\n' : 'Sin productos'}

TOTAL A PAGAR: ${solicitud.total} Bs
${infoTecnica}
    `.trim();

    alert(mensaje);
}

// Función para aprobar una solicitud
function aprobarSolicitud(solicitudId) {
    if (!confirm('¿Estás seguro de que quieres aprobar esta solicitud de pago?')) {
        return;
    }

    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitudIndex = solicitudesPendientes.findIndex(s => s.id == solicitudId);

    if (solicitudIndex === -1) {
        alert('Solicitud no encontrada');
        return;
    }

    const solicitud = solicitudesPendientes[solicitudIndex];

    // Cambiar estado a aprobado/completado
    solicitudesPendientes[solicitudIndex].estado = 'aprobado';
    solicitudesPendientes[solicitudIndex].fechaAprobacion = new Date().toISOString();

    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

    // ENVIAR NOTIFICACIÓN AL USUARIO
    enviarNotificacionUsuario({
        tipo: 'compra_aprobada',
        titulo: '✅ ¡Compra Aprobada!',
        mensaje: `Tu compra por ${solicitud.total} Bs ha sido aprobada exitosamente.`,
        solicitudId: solicitudId,
        cliente: solicitud.cliente,
        total: solicitud.total,
        items: solicitud.items,
        fecha: new Date().toISOString()
    });

    // Actualizar la vista
    cargarSolicitudesPendientes();
    actualizarEstadisticasSolicitudes();

    mostrarToastAdmin('Solicitud aprobada y notificación enviada al usuario', 'success');
}

// Función para completar una solicitud (marcar como pagada)
function completarSolicitud(solicitudId) {
    if (!confirm('¿Confirmas que el pago ha sido recibido y quieres completar esta solicitud?')) {
        return;
    }

    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitudIndex = solicitudesPendientes.findIndex(s => s.id == solicitudId);

    if (solicitudIndex === -1) {
        alert('Solicitud no encontrada');
        return;
    }

    const solicitud = solicitudesPendientes[solicitudIndex];

    // Registrar la transacción
    const clienteNombre = solicitud.cliente ? solicitud.cliente.nombre : 'Cliente Anónimo';
    const transaccion = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: 'pago-efectivo',
        descripcion: `Pago en efectivo - Solicitud #${solicitud.id}`,
        cliente: clienteNombre,
        monto: solicitud.total,
        productos: solicitud.items || [],
        metodoPago: 'efectivo'
    };

    // Guardar transacción
    let transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    transacciones.push(transaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));

    // Registrar en historial de caja
    const movimientoCaja = {
        id: Date.now() + 1,
        fecha: new Date().toISOString(),
        tipo: 'ingreso',
        concepto: 'pago-reserva',
        monto: solicitud.total,
        descripcion: `Pago en efectivo - Solicitud #${solicitud.id} - ${clienteNombre}`,
        usuario: 'Administrador'
    };

    let historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimientoCaja);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    // Remover solicitud de pendientes
    solicitudesPendientes.splice(solicitudIndex, 1);
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

    // Actualizar la vista
    cargarSolicitudesPendientes();
    actualizarEstadisticasSolicitudes();

    alert('Solicitud completada exitosamente. El pago ha sido registrado.');
}

// Función para rechazar una solicitud
function rechazarSolicitud(solicitudId) {
    const motivo = prompt('¿Por qué motivo rechazas esta solicitud?\n(Este mensaje se enviará al cliente)');

    if (motivo === null) {
        return; // Usuario canceló
    }

    if (!motivo.trim()) {
        alert('Debes proporcionar un motivo para rechazar la solicitud');
        return;
    }

    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitudIndex = solicitudesPendientes.findIndex(s => s.id == solicitudId);

    if (solicitudIndex === -1) {
        alert('Solicitud no encontrada');
        return;
    }

    const solicitud = solicitudesPendientes[solicitudIndex];

    // Guardar en historial de solicitudes rechazadas (opcional)
    let solicitudesRechazadas = JSON.parse(localStorage.getItem('solicitudesRechazadas') || '[]');
    solicitud.fechaRechazo = new Date().toISOString();
    solicitud.motivoRechazo = motivo;
    solicitud.estado = 'rechazada';
    solicitudesRechazadas.push(solicitud);
    localStorage.setItem('solicitudesRechazadas', JSON.stringify(solicitudesRechazadas));

    // Remover de pendientes
    solicitudesPendientes.splice(solicitudIndex, 1);
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

    // Actualizar la vista
    cargarSolicitudesPendientes();
    actualizarEstadisticasSolicitudes();

    alert(`Solicitud rechazada. Motivo: ${motivo}`);
}

// Función para actualizar solicitudes
function actualizarSolicitudes() {
    cargarSolicitudesPendientes();
    actualizarEstadisticasSolicitudes();
    alert('Solicitudes actualizadas');
}

// Modificar la función inicializarAdmin para incluir las solicitudes
function inicializarAdminConSolicitudes() {
    // Llamar a la función original
    inicializarAdmin();

    // Agregar event listener para el botón de solicitudes
    const navSolicitudes = document.getElementById('nav-solicitudes');
    if (navSolicitudes) {
        navSolicitudes.addEventListener('click', function (e) {
            e.preventDefault();
            mostrarSolicitudesPendientes();
        });
    }

    // Agregar botón de prueba
    setTimeout(agregarBotonPrueba, 1000);

    // Actualizar badge de solicitudes cada 30 segundos
    setInterval(actualizarEstadisticasSolicitudes, 30000);

    // Actualizar badge inicial
    actualizarEstadisticasSolicitudes();
}

// Reemplazar la inicialización original
document.addEventListener('DOMContentLoaded', function () {
    inicializarAdminConSolicitudes();
});

// ==========================================
// FUNCIÓN PARA CREAR DATOS DE PRUEBA
// ==========================================

// Función para crear solicitudes de prueba (solo para demostración)
function crearSolicitudesPrueba() {
    const solicitudesPrueba = [
        {
            id: Date.now() - 300000, // 5 minutos atrás
            fecha: new Date(Date.now() - 300000).toISOString(),
            items: [
                { nombre: 'Coca Cola', cantidad: 2, precio: 5 },
                { nombre: 'Champú Herbal', cantidad: 1, precio: 15 }
            ],
            total: 25,
            metodoPago: 'efectivo',
            estado: 'pendiente',
            cliente: {
                nombre: 'María González',
                telefono: '70123456',
                email: 'maria@email.com'
            },
            clienteInfo: {
                timestamp: Date.now() - 300000,
                navegador: 'Chrome/120.0.0.0',
                pantalla: '1920x1080'
            }
        },
        {
            id: Date.now() - 600000, // 10 minutos atrás
            fecha: new Date(Date.now() - 600000).toISOString(),
            items: [
                { nombre: 'Refresco Natural', cantidad: 3, precio: 8 },
                { nombre: 'Toalla Premium', cantidad: 2, precio: 20 }
            ],
            total: 64,
            metodoPago: 'efectivo',
            estado: 'procesando',
            cliente: {
                nombre: 'Carlos Mendoza',
                telefono: '75987654',
                email: 'carlos@email.com'
            },
            clienteInfo: {
                timestamp: Date.now() - 600000,
                navegador: 'Firefox/121.0',
                pantalla: '1366x768'
            }
        },
        {
            id: Date.now() - 900000, // 15 minutos atrás
            fecha: new Date(Date.now() - 900000).toISOString(),
            items: [
                { nombre: 'Agua Mineral', cantidad: 1, precio: 3 },
                { nombre: 'Snack Saludable', cantidad: 2, precio: 12 }
            ],
            total: 27,
            metodoPago: 'efectivo',
            estado: 'pendiente',
            clienteInfo: {
                timestamp: Date.now() - 900000,
                navegador: 'Safari/17.0',
                pantalla: '1440x900'
            }
        }
    ];

    // Guardar solicitudes de prueba
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPrueba));

    // Actualizar la vista si está abierta
    if (document.getElementById('solicitudes-modal').style.display === 'block') {
        cargarSolicitudesPendientes();
        actualizarEstadisticasSolicitudes();
    }

    // Actualizar badge
    actualizarEstadisticasSolicitudes();

    alert('Se han creado 3 solicitudes de prueba para demostrar el funcionamiento del sistema.');
}

// Agregar botón de prueba al panel de configuración (solo para desarrollo)
function agregarBotonPrueba() {
    const configSection = document.getElementById('configuracion');
    if (configSection && !document.getElementById('btn-prueba-solicitudes')) {
        const configGrid = configSection.querySelector('.config-grid');
        if (configGrid) {
            const pruebaCard = document.createElement('div');
            pruebaCard.className = 'config-card';
            pruebaCard.innerHTML = `
                <h3><i class="fas fa-flask"></i> Datos de Prueba</h3>
                <p>Crear solicitudes de ejemplo para probar el sistema</p>
                <div class="config-actions">
                    <button id="btn-prueba-solicitudes" onclick="crearSolicitudesPrueba()" class="btn-info">
                        <i class="fas fa-plus"></i> Crear Solicitudes de Prueba
                    </button>
                </div>
            `;
            configGrid.appendChild(pruebaCard);
        }
    }
}

// Función para mostrar formulario de nueva sauna
function mostrarFormularioNuevaSauna() {
    moduloConfigurando = null; // Indicar que es una nueva sauna

    document.getElementById('modulo-config-title').textContent = 'Agregar Nueva Sauna';

    // Limpiar campos
    document.getElementById('modulo-nombre').value = '';
    document.getElementById('modulo-tipo').value = 'individual';
    document.getElementById('modulo-estado').value = 'disponible';

    // Ocultar todos los grupos adicionales
    document.getElementById('temporizador-group').style.display = 'none';
    document.getElementById('reserva-group').style.display = 'none';
    document.getElementById('motivo-group').style.display = 'none';

    const modal = document.getElementById('modulo-config-modal');
    modal.style.display = 'block';
    modal.classList.add('show');
}

// Función para obtener el siguiente ID disponible para una sauna
function obtenerSiguienteIdSauna(tipo) {
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    let maxId = 0;

    // Buscar el ID más alto para este tipo
    Object.keys(configuracionModulos).forEach(saunaId => {
        if (saunaId.startsWith(tipo + '-')) {
            const numero = parseInt(saunaId.split('-')[1]);
            if (numero > maxId) {
                maxId = numero;
            }
        }
    });

    // También revisar los módulos base
    const modulosBase = {
        individual: { disponibles: 2 },
        doble: { disponibles: 5 },
        semifamiliar: { disponibles: 2 },
        familiar: { disponibles: 3 }
    };

    if (modulosBase[tipo] && modulosBase[tipo].disponibles > maxId) {
        maxId = modulosBase[tipo].disponibles;
    }

    return `${tipo}-${maxId + 1}`;
}

// Función para eliminar sauna personalizada
function eliminarSaunaPersonalizada(saunaId) {
    if (confirm(`¿Estás seguro de que deseas eliminar la sauna "${saunaId}"?`)) {
        const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
        const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');

        // Eliminar de configuración
        delete configuracionModulos[saunaId];

        // Eliminar de reservas si existe
        if (reservasActuales[saunaId]) {
            delete reservasActuales[saunaId];
        }

        // Eliminar temporizador si existe
        if (temporizadores[saunaId]) {
            clearInterval(temporizadores[saunaId].intervalo);
            delete temporizadores[saunaId];
        }

        localStorage.setItem('configuracionModulos', JSON.stringify(configuracionModulos));
        localStorage.setItem('reservasActuales', JSON.stringify(reservasActuales));

        cargarModulosAdmin();
        alert('Sauna eliminada exitosamente');
    }
}

// Función para manejar la imagen del producto
function manejarImagenProducto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('imagen-preview');
            const img = document.getElementById('preview-img');

            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Función para remover la imagen preview
function removerImagenPreview() {
    document.getElementById('producto-imagen').value = '';
    document.getElementById('imagen-preview').style.display = 'none';
    document.getElementById('preview-img').src = '';
}

// Función para convertir imagen a base64
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}// ==========================================
// FUNCIONES PARA CONTROL DE PÁGINA
// ==========================================

// Función para alternar el estado de la página (bloquear/desbloquear)
function toggleEstadoPagina() {
    const estadoActual = localStorage.getItem('paginaBloqueada') === 'true';
    const nuevoEstado = !estadoActual;

    if (nuevoEstado) {
        // Bloquear página
        if (confirm('¿Estás seguro de que quieres BLOQUEAR la página principal? Los usuarios no podrán acceder al sistema de reservas.')) {
            localStorage.setItem('paginaBloqueada', 'true');
            const fechaBloqueo = new Date().toISOString();
            localStorage.setItem('fechaBloqueo', fechaBloqueo);
            localStorage.setItem('adminQueBloqueo', 'Administrador');

            actualizarInterfazEstadoPagina(true);
            mostrarNotificacion('Página bloqueada exitosamente', 'warning');
        }
    } else {
        // Desbloquear página
        if (confirm('¿Confirmas que quieres DESBLOQUEAR la página principal? Los usuarios podrán acceder nuevamente.')) {
            localStorage.setItem('paginaBloqueada', 'false');
            localStorage.removeItem('fechaBloqueo');
            localStorage.removeItem('adminQueBloqueo');

            actualizarInterfazEstadoPagina(false);
            mostrarNotificacion('Página desbloqueada exitosamente', 'success');
        }
    }
}

// Función para actualizar la interfaz según el estado de la página
function actualizarInterfazEstadoPagina(bloqueada) {
    const boton = document.getElementById('btn-toggle-pagina');
    const textoBoton = document.getElementById('texto-estado-pagina');
    const estadoIndicador = document.getElementById('estado-actual-pagina');

    if (bloqueada) {
        // Página bloqueada
        boton.className = 'btn-success desbloquear';
        boton.innerHTML = '<i class="fas fa-unlock"></i> <span id="texto-estado-pagina">Desbloquear Página</span>';

        estadoIndicador.className = 'estado-pagina bloqueada';
        estadoIndicador.innerHTML = '<i class="fas fa-lock"></i> Página Bloqueada';
    } else {
        // Página activa
        boton.className = 'btn-warning bloquear';
        boton.innerHTML = '<i class="fas fa-lock"></i> <span id="texto-estado-pagina">Bloquear Página</span>';

        estadoIndicador.className = 'estado-pagina activa';
        estadoIndicador.innerHTML = '<i class="fas fa-unlock"></i> Página Activa';
    }
}

// Función para configurar el mensaje de bloqueo personalizado
function configurarMensajeBloqueo() {
    const mensajeActual = localStorage.getItem('mensajeBloqueo') || 'El sistema está temporalmente fuera de servicio por mantenimiento. Disculpe las molestias.';

    const nuevoMensaje = prompt('Configura el mensaje que verán los usuarios cuando la página esté bloqueada:', mensajeActual);

    if (nuevoMensaje !== null && nuevoMensaje.trim() !== '') {
        localStorage.setItem('mensajeBloqueo', nuevoMensaje.trim());
        mostrarNotificacion('Mensaje de bloqueo actualizado', 'success');
    }
}

// Función para verificar el estado de la página al cargar el admin
function verificarEstadoPaginaAlCargar() {
    const paginaBloqueada = localStorage.getItem('paginaBloqueada') === 'true';
    actualizarInterfazEstadoPagina(paginaBloqueada);

    if (paginaBloqueada) {
        const fechaBloqueo = localStorage.getItem('fechaBloqueo');
        if (fechaBloqueo) {
            const fecha = new Date(fechaBloqueo);
            const fechaFormateada = fecha.toLocaleString('es-ES');
            console.log(`Página bloqueada desde: ${fechaFormateada}`);
        }
    }
}

// Función para obtener estadísticas de bloqueo
function obtenerEstadisticasBloqueo() {
    const paginaBloqueada = localStorage.getItem('paginaBloqueada') === 'true';
    const fechaBloqueo = localStorage.getItem('fechaBloqueo');
    const adminQueBloqueo = localStorage.getItem('adminQueBloqueo');

    return {
        bloqueada: paginaBloqueada,
        fechaBloqueo: fechaBloqueo ? new Date(fechaBloqueo) : null,
        admin: adminQueBloqueo || 'Desconocido',
        tiempoBloqueada: fechaBloqueo ? Date.now() - new Date(fechaBloqueo).getTime() : 0
    };
}

// ==========================================
// GESTIÓN DE USUARIOS REGISTRADOS
// ==========================================

function cargarUsuariosAdmin() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Actualizar estadísticas
    actualizarEstadisticasUsuarios(usuarios);
    
    // Cargar tabla de usuarios
    cargarTablaUsuarios(usuarios);
}

function actualizarEstadisticasUsuarios(usuarios) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date();
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    
    // Total usuarios
    document.getElementById('total-usuarios').textContent = usuarios.length;
    
    // Usuarios registrados hoy
    const usuariosHoy = usuarios.filter(u => {
        const fechaRegistro = new Date(u.fechaRegistro);
        fechaRegistro.setHours(0, 0, 0, 0);
        return fechaRegistro.getTime() === hoy.getTime();
    }).length;
    document.getElementById('usuarios-hoy').textContent = usuariosHoy;
    
    // Usuarios esta semana
    const usuariosSemana = usuarios.filter(u => {
        const fechaRegistro = new Date(u.fechaRegistro);
        return fechaRegistro >= inicioSemana;
    }).length;
    document.getElementById('usuarios-semana').textContent = usuariosSemana;
    
    // Usuarios activos (con al menos una reserva)
    const usuariosActivos = usuarios.filter(u => u.reservasRealizadas > 0).length;
    document.getElementById('usuarios-activos').textContent = usuariosActivos;
}

function cargarTablaUsuarios(usuarios = null) {
    if (!usuarios) {
        usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    }
    
    const tbody = document.getElementById('usuarios-tbody');
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No hay usuarios registrados aún</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por estado en línea primero, luego por fecha
    usuarios.sort((a, b) => {
        if (a.enLinea && !b.enLinea) return -1;
        if (!a.enLinea && b.enLinea) return 1;
        return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
    });
    
    let html = '';
    
    usuarios.forEach(usuario => {
        const fechaRegistro = new Date(usuario.fechaRegistro);
        const fechaFormateada = fechaRegistro.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const horaFormateada = fechaRegistro.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Calcular tiempo desde última conexión
        const ultimaConexion = usuario.ultimaConexion ? new Date(usuario.ultimaConexion) : fechaRegistro;
        const tiempoDesdeConexion = calcularTiempoTranscurrido(ultimaConexion);
        
        // Determinar si está realmente en línea (menos de 2 minutos)
        const minutosDesdeConexion = (new Date() - ultimaConexion) / 1000 / 60;
        const estaEnLinea = usuario.enLinea && minutosDesdeConexion < 2;
        
        const estadoEnLinea = estaEnLinea 
            ? '<span class="estado-online"><i class="fas fa-circle"></i> En línea</span>'
            : `<span class="estado-offline"><i class="fas fa-circle"></i> ${tiempoDesdeConexion}</span>`;
        
        const notificacionesIcono = usuario.notificaciones 
            ? '<i class="fas fa-bell" style="color: #4CAF50;" title="Acepta notificaciones"></i>' 
            : '<i class="fas fa-bell-slash" style="color: #999;" title="No acepta notificaciones"></i>';
        
        // Estadísticas del usuario
        const stats = usuario.estadisticas || {
            totalCompras: 0,
            totalGastado: 0,
            totalReservas: 0,
            visitasAlSitio: 0
        };
        
        html += `
            <tr class="${estaEnLinea ? 'usuario-online' : ''}">
                <td><strong>#${usuario.id}</strong></td>
                <td>
                    <div class="usuario-nombre">
                        <i class="fas fa-user-circle"></i>
                        ${usuario.nombre} ${usuario.apellido}
                    </div>
                </td>
                <td>
                    <a href="mailto:${usuario.email}" class="usuario-email">
                        <i class="fas fa-envelope"></i> ${usuario.email}
                    </a>
                </td>
                <td>
                    <a href="https://wa.me/591${usuario.telefono}" target="_blank" class="usuario-telefono">
                        <i class="fab fa-whatsapp"></i> ${usuario.telefono}
                    </a>
                </td>
                <td>
                    <span class="badge-ciudad">${usuario.ciudad || 'No especificada'}</span>
                </td>
                <td>
                    <div class="fecha-registro">
                        <div>${fechaFormateada}</div>
                        <small>${horaFormateada}</small>
                    </div>
                </td>
                <td>
                    ${estadoEnLinea}
                </td>
                <td>
                    <div class="usuario-stats-mini">
                        <span title="Compras"><i class="fas fa-shopping-bag"></i> ${stats.totalCompras}</span>
                        <span title="Visitas"><i class="fas fa-eye"></i> ${stats.visitasAlSitio}</span>
                    </div>
                </td>
                <td>
                    <span class="badge-reservas ${stats.totalReservas > 0 ? 'activo' : ''}">
                        ${stats.totalReservas || 0}
                    </span>
                </td>
                <td style="text-align: center;">
                    ${notificacionesIcono}
                </td>
                <td>
                    <div class="acciones-usuario">
                        <button onclick="verDetalleUsuario(${usuario.id})" class="btn-icon" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editarUsuario(${usuario.id})" class="btn-icon" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarUsuario(${usuario.id})" class="btn-icon btn-danger" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function filtrarUsuarios() {
    const busqueda = document.getElementById('buscar-usuario').value.toLowerCase();
    const ciudadFiltro = document.getElementById('filtro-ciudad').value;
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Filtrar por búsqueda
    if (busqueda) {
        usuarios = usuarios.filter(u => {
            const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
            return nombreCompleto.includes(busqueda) ||
                   u.email.toLowerCase().includes(busqueda) ||
                   u.telefono.includes(busqueda);
        });
    }
    
    // Filtrar por ciudad
    if (ciudadFiltro) {
        usuarios = usuarios.filter(u => u.ciudad === ciudadFiltro);
    }
    
    cargarTablaUsuarios(usuarios);
}

function verDetalleUsuario(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    const fechaRegistro = new Date(usuario.fechaRegistro).toLocaleString('es-ES');
    const ultimaVisita = usuario.ultimaVisita 
        ? new Date(usuario.ultimaVisita).toLocaleString('es-ES')
        : 'Nunca';
    
    const detalles = `
╔════════════════════════════════════════╗
║       DETALLES DEL USUARIO            ║
╚════════════════════════════════════════╝

👤 INFORMACIÓN PERSONAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: #${usuario.id}
Nombre: ${usuario.nombre} ${usuario.apellido}
Email: ${usuario.email}
Teléfono: ${usuario.telefono}
Ciudad: ${usuario.ciudad || 'No especificada'}

📊 ESTADÍSTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reservas realizadas: ${usuario.reservasRealizadas || 0}
Total gastado: ${usuario.totalGastado || 0} Bs
Fecha de registro: ${fechaRegistro}
Última visita: ${ultimaVisita}

🔔 PREFERENCIAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Notificaciones: ${usuario.notificaciones ? 'Activadas ✓' : 'Desactivadas ✗'}
Estado: ${usuario.activo ? 'Activo ✓' : 'Inactivo ✗'}
    `.trim();
    
    alert(detalles);
}

function editarUsuario(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    const nuevoNombre = prompt('Nombre:', usuario.nombre);
    if (nuevoNombre === null) return;
    
    const nuevoApellido = prompt('Apellido:', usuario.apellido);
    if (nuevoApellido === null) return;
    
    const nuevoTelefono = prompt('Teléfono:', usuario.telefono);
    if (nuevoTelefono === null) return;
    
    const nuevaCiudad = prompt('Ciudad:', usuario.ciudad);
    if (nuevaCiudad === null) return;
    
    // Actualizar usuario
    usuario.nombre = nuevoNombre.trim();
    usuario.apellido = nuevoApellido.trim();
    usuario.nombreCompleto = `${nuevoNombre.trim()} ${nuevoApellido.trim()}`;
    usuario.telefono = nuevoTelefono.trim();
    usuario.ciudad = nuevaCiudad.trim();
    
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    cargarUsuariosAdmin();
    
    alert('Usuario actualizado exitosamente');
}

function eliminarUsuario(usuarioId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?\n\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    const confirmacion = confirm(
        `Vas a eliminar a:\n\n` +
        `${usuario.nombre} ${usuario.apellido}\n` +
        `${usuario.email}\n\n` +
        `¿Confirmas la eliminación?`
    );
    
    if (confirmacion) {
        usuarios = usuarios.filter(u => u.id !== usuarioId);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        cargarUsuariosAdmin();
        alert('Usuario eliminado exitosamente');
    }
}

function exportarUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    if (usuarios.length === 0) {
        alert('No hay usuarios para exportar');
        return;
    }
    
    // Crear CSV
    let csv = 'ID,Nombre,Apellido,Email,Teléfono,Ciudad,Fecha Registro,Reservas,Total Gastado,Notificaciones\n';
    
    usuarios.forEach(usuario => {
        const fechaRegistro = new Date(usuario.fechaRegistro).toLocaleString('es-ES');
        csv += `${usuario.id},"${usuario.nombre}","${usuario.apellido}","${usuario.email}","${usuario.telefono}","${usuario.ciudad || ''}","${fechaRegistro}",${usuario.reservasRealizadas || 0},${usuario.totalGastado || 0},${usuario.notificaciones ? 'Sí' : 'No'}\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_sauna_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Lista de usuarios exportada exitosamente');
}

// La inicialización se maneja en inicializarAdminConSolicitudes()

// ==========================================
// FUNCIONES PARA SOLICITUDES EN SECCIÓN PRINCIPAL
// ==========================================

// Función para cargar solicitudes en la sección principal
function cargarSolicitudesEnSeccion() {
    const todasSolicitudes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const container = document.getElementById('solicitudes-container');
    
    if (!container) return;
    
    // FILTRAR SOLO SOLICITUDES DE EFECTIVO
    const solicitudesPendientes = todasSolicitudes.filter(s => s.metodoPago === 'efectivo');
    
    // Actualizar badge de notificación (solo efectivo)
    const badge = document.getElementById('solicitudes-badge');
    if (badge) {
        if (solicitudesPendientes.length > 0) {
            badge.style.display = 'flex';
            badge.textContent = solicitudesPendientes.length;
        } else {
            badge.style.display = 'none';
        }
    }
    
    if (solicitudesPendientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No hay solicitudes de pago en efectivo pendientes</h3>
                <p>Todas las solicitudes de pago en efectivo han sido procesadas</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha (más recientes primero)
    solicitudesPendientes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    let html = '<div class="solicitudes-grid">';
    
    solicitudesPendientes.forEach(solicitud => {
        const fecha = new Date(solicitud.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const estadoClase = solicitud.estado === 'pendiente' ? 'pendiente' : 'procesando';
        const estadoTexto = solicitud.estado === 'pendiente' ? 'Pendiente' : 'En Proceso';
        const estadoIcono = solicitud.estado === 'pendiente' ? 'fa-clock' : 'fa-spinner';
        
        html += `
            <div class="solicitud-card ${estadoClase}">
                <div class="solicitud-header">
                    <div class="solicitud-id">
                        <i class="fas fa-hashtag"></i>
                        <span>Solicitud #${solicitud.id}</span>
                    </div>
                    <div class="solicitud-estado ${estadoClase}">
                        <i class="fas ${estadoIcono}"></i>
                        <span>${estadoTexto}</span>
                    </div>
                </div>
                
                <div class="solicitud-info">
                    <div class="info-row">
                        <i class="fas fa-user"></i>
                        <span><strong>Cliente:</strong> ${solicitud.cliente}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-calendar"></i>
                        <span><strong>Fecha:</strong> ${fechaFormateada}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-credit-card"></i>
                        <span><strong>Método:</strong> ${solicitud.metodoPago === 'qr' ? 'Pago QR' : 'Efectivo'}</span>
                    </div>
                </div>
                
                <div class="solicitud-items">
                    <h4><i class="fas fa-shopping-bag"></i> Items (${solicitud.items.length})</h4>
                    <ul>
                        ${solicitud.items.slice(0, 3).map(item => `
                            <li>${item.nombre} x${item.cantidad} - ${item.precio * item.cantidad} Bs</li>
                        `).join('')}
                        ${solicitud.items.length > 3 ? `<li class="more-items">+ ${solicitud.items.length - 3} más...</li>` : ''}
                    </ul>
                </div>
                
                <div class="solicitud-total">
                    <span>Total:</span>
                    <span class="total-amount">${solicitud.total} Bs</span>
                </div>
                
                <div class="solicitud-actions">
                    ${solicitud.estado === 'pendiente' ? `
                        <button onclick="procesarSolicitud('${solicitud.id}')" class="btn-procesar">
                            <i class="fas fa-check"></i> Procesar
                        </button>
                    ` : ''}
                    <button onclick="pagoRecibido('${solicitud.id}')" class="btn-pago-recibido">
                        <i class="fas fa-money-bill-wave"></i> Pago Recibido
                    </button>
                    <button onclick="aprobarSolicitud('${solicitud.id}')" class="btn-aprobar">
                        <i class="fas fa-check-circle"></i> Aprobar
                    </button>
                    <button onclick="rechazarSolicitud('${solicitud.id}')" class="btn-rechazar">
                        <i class="fas fa-times-circle"></i> Rechazar
                    </button>
                    <button onclick="verDetallesSolicitud('${solicitud.id}')" class="btn-detalles">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Función para procesar solicitud (cambiar estado a procesando)
function procesarSolicitud(solicitudId) {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitud = solicitudesPendientes.find(s => s.id === solicitudId);
    
    if (solicitud) {
        solicitud.estado = 'procesando';
        localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));
        cargarSolicitudesEnSeccion();
        mostrarToastAdmin('Solicitud marcada como en proceso', 'info');
    }
}

// Función para ver detalles de solicitud
function verDetallesSolicitud(solicitudId) {
    const solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitud = solicitudesPendientes.find(s => s.id === solicitudId);
    
    if (!solicitud) return;
    
    const fecha = new Date(solicitud.fecha);
    const fechaFormateada = fecha.toLocaleString('es-ES');
    
    let detallesHTML = `
        <div class="detalles-solicitud">
            <h3>Detalles de Solicitud #${solicitud.id}</h3>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-user"></i> Información del Cliente</h4>
                <p><strong>Nombre:</strong> ${solicitud.cliente}</p>
                <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                <p><strong>Estado:</strong> ${solicitud.estado === 'pendiente' ? 'Pendiente' : 'En Proceso'}</p>
            </div>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-credit-card"></i> Método de Pago</h4>
                <p>${solicitud.metodoPago === 'qr' ? 'Pago con QR' : 'Pago en Efectivo'}</p>
            </div>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-shopping-bag"></i> Items del Pedido</h4>
                <table class="tabla-items">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${solicitud.items.map(item => `
                            <tr>
                                <td>${item.nombre}</td>
                                <td>${item.cantidad}</td>
                                <td>${item.precio} Bs</td>
                                <td>${item.precio * item.cantidad} Bs</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>TOTAL</strong></td>
                            <td><strong>${solicitud.total} Bs</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    // Mostrar en un modal o alert (puedes crear un modal personalizado)
    alert(detallesHTML.replace(/<[^>]*>/g, '\n').replace(/&nbsp;/g, ' '));
}

// Función para mostrar toast en admin
function mostrarToastAdmin(mensaje, tipo = 'info') {
    // Crear elemento toast si no existe
    let toast = document.getElementById('admin-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = 'admin-toast';
        document.body.appendChild(toast);
    }
    
    // Configurar clase según tipo
    toast.className = `admin-toast ${tipo}`;
    toast.textContent = mensaje;
    toast.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Actualizar la función inicializarAdmin para incluir solicitudes
const inicializarAdminOriginal = inicializarAdmin;
inicializarAdmin = function() {
    inicializarAdminOriginal();
    cargarSolicitudesEnSeccion();
    
    // Actualizar solicitudes cada 30 segundos
    setInterval(cargarSolicitudesEnSeccion, 30000);
};


// ==========================================
// FUNCIÓN PARA CREAR SOLICITUDES DE PRUEBA
// ==========================================

// Función para crear solicitudes de prueba (ejecutar una vez)
function crearSolicitudesDePrueba() {
    const solicitudesPrueba = [
        {
            id: 'SOL-' + Date.now() + '-1',
            cliente: 'Juan Pérez',
            fecha: new Date().toISOString(),
            metodoPago: 'qr',
            estado: 'pendiente',
            total: 85,
            items: [
                { nombre: 'Reserva Sauna Doble', cantidad: 1, precio: 25 },
                { nombre: 'Coca Cola 500ml', cantidad: 2, precio: 8 },
                { nombre: 'Toalla Premium', cantidad: 1, precio: 35 },
                { nombre: 'Chocolate Premium', cantidad: 3, precio: 5 }
            ]
        },
        {
            id: 'SOL-' + Date.now() + '-2',
            cliente: 'María González',
            fecha: new Date(Date.now() - 3600000).toISOString(),
            metodoPago: 'efectivo',
            estado: 'procesando',
            total: 120,
            items: [
                { nombre: 'Reserva Sauna Familiar', cantidad: 1, precio: 45 },
                { nombre: 'Champú Herbal Orgánico', cantidad: 2, precio: 18 },
                { nombre: 'Agua Mineral Premium', cantidad: 4, precio: 5 },
                { nombre: 'Kit de Relajación', cantidad: 1, precio: 50 }
            ]
        },
        {
            id: 'SOL-' + Date.now() + '-3',
            cliente: 'Carlos Rodríguez',
            fecha: new Date(Date.now() - 7200000).toISOString(),
            metodoPago: 'qr',
            estado: 'pendiente',
            total: 58,
            items: [
                { nombre: 'Reserva Sauna Individual', cantidad: 1, precio: 15 },
                { nombre: 'Jugo Natural', cantidad: 2, precio: 12 },
                { nombre: 'Chinelas Antideslizantes', cantidad: 1, precio: 25 }
            ]
        }
    ];
    
    // Guardar en localStorage
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPrueba));
    
    // Recargar la vista
    cargarSolicitudesEnSeccion();
    
    alert('✅ Se han creado 3 solicitudes de prueba. Recarga la página para verlas.');
}

// Descomentar la siguiente línea para crear solicitudes de prueba automáticamente
// setTimeout(crearSolicitudesDePrueba, 2000);


// ==========================================
// FUNCIONES PARA GESTIÓN DE IMÁGENES
// ==========================================

// Variable global para almacenar la imagen seleccionada
let imagenProductoSeleccionada = null;

// Función para cambiar entre métodos de imagen
function cambiarMetodoImagen(metodo) {
    // Actualizar tabs
    document.querySelectorAll('.imagen-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Ocultar todos los métodos
    document.querySelectorAll('.metodo-imagen').forEach(div => {
        div.classList.remove('active');
    });
    
    // Mostrar el método seleccionado
    const metodoDiv = document.getElementById(`metodo-${metodo}`);
    if (metodoDiv) {
        metodoDiv.classList.add('active');
    }
}

// Función para cargar imagen desde URL
function cargarImagenDesdeURL() {
    const url = document.getElementById('producto-imagen-url').value.trim();
    
    if (!url) {
        alert('Por favor ingresa una URL válida');
        return;
    }
    
    // Validar que sea una URL de imagen
    if (!url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
        if (!confirm('La URL no parece ser una imagen. ¿Deseas intentar cargarla de todos modos?')) {
            return;
        }
    }
    
    // Mostrar preview
    mostrarPreviewImagen(url);
    imagenProductoSeleccionada = url;
    
    mostrarToastAdmin('Imagen cargada desde URL', 'success');
}

// Función para buscar imágenes en Unsplash
async function buscarImagenes() {
    const query = document.getElementById('buscar-imagen-query').value.trim();
    
    if (!query) {
        alert('Por favor ingresa un término de búsqueda');
        return;
    }
    
    const resultadosDiv = document.getElementById('resultados-busqueda');
    resultadosDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Buscando imágenes...</div>';
    
    try {
        // Usar API de Unsplash (requiere API key)
        // Para demo, usaremos Picsum Photos (imágenes aleatorias)
        const imagenesDemo = generarImagenesDemo(query);
        
        let html = '<div class="imagenes-grid">';
        imagenesDemo.forEach((img, index) => {
            html += `
                <div class="imagen-resultado" onclick="seleccionarImagenBuscada('${img.url}', '${img.autor}')">
                    <img src="${img.url}" alt="${query}">
                    <div class="imagen-info">
                        <small>Por ${img.autor}</small>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        resultadosDiv.innerHTML = html;
        
    } catch (error) {
        resultadosDiv.innerHTML = '<div class="error">Error al buscar imágenes. Intenta de nuevo.</div>';
        console.error('Error:', error);
    }
}

// Función para generar imágenes demo (simulación)
function generarImagenesDemo(query) {
    const imagenes = [];
    const categorias = {
        'sauna': 'nature',
        'toalla': 'fashion',
        'champú': 'nature',
        'chocolate': 'food',
        'refresco': 'food',
        'agua': 'nature',
        'default': 'nature'
    };
    
    const categoria = categorias[query.toLowerCase()] || categorias['default'];
    
    for (let i = 0; i < 9; i++) {
        const seed = query + i;
        imagenes.push({
            url: `https://picsum.photos/seed/${seed}/300/300`,
            autor: 'Unsplash'
        });
    }
    
    return imagenes;
}

// Función para seleccionar imagen buscada
function seleccionarImagenBuscada(url, autor) {
    mostrarPreviewImagen(url);
    imagenProductoSeleccionada = url;
    mostrarToastAdmin(`Imagen seleccionada (${autor})`, 'success');
}

// Función para mostrar preview de imagen
function mostrarPreviewImagen(url) {
    const preview = document.getElementById('imagen-preview');
    const img = document.getElementById('preview-img');
    
    img.src = url;
    preview.style.display = 'block';
}

// Función para remover preview de imagen
function removerImagenPreview() {
    const preview = document.getElementById('imagen-preview');
    const img = document.getElementById('preview-img');
    
    img.src = '';
    preview.style.display = 'none';
    imagenProductoSeleccionada = null;
    
    // Limpiar inputs
    document.getElementById('producto-imagen').value = '';
    document.getElementById('producto-imagen-url').value = '';
}

// Actualizar la función de guardar producto para incluir la imagen
const guardarProductoOriginal = guardarProducto;
guardarProducto = function(event) {
    event.preventDefault();
    
    // Si hay una imagen seleccionada desde URL o búsqueda, usarla
    if (imagenProductoSeleccionada) {
        // Guardar la URL de la imagen en el producto
        const producto = {
            // ... otros datos del producto
            imagen: imagenProductoSeleccionada
        };
    }
    
    // Llamar a la función original
    guardarProductoOriginal(event);
};


// ==========================================
// FUNCIONES PARA GESTIÓN DE USUARIOS Y ACTIVIDAD
// ==========================================

// Función para calcular tiempo transcurrido
function calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const entonces = new Date(fecha);
    const diferencia = ahora - entonces;
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (segundos < 60) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`;
    if (dias < 365) return `Hace ${Math.floor(dias / 30)} meses`;
    return `Hace ${Math.floor(dias / 365)} años`;
}

// Función para ver detalles del usuario
function verDetallesUsuario(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === parseInt(usuarioId));
    
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    
    const fechaRegistro = new Date(usuario.fechaRegistro).toLocaleString('es-ES');
    const ultimaConexion = usuario.ultimaConexion 
        ? new Date(usuario.ultimaConexion).toLocaleString('es-ES')
        : 'Nunca';
    
    const stats = usuario.estadisticas || {
        totalCompras: 0,
        totalGastado: 0,
        totalReservas: 0,
        visitasAlSitio: 0
    };
    
    // Crear modal con detalles
    const modalHTML = `
        <div class="modal-detalles-usuario">
            <h3><i class="fas fa-user"></i> ${usuario.nombre} ${usuario.apellido}</h3>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
                <p><strong>Email:</strong> ${usuario.email}</p>
                <p><strong>Teléfono:</strong> ${usuario.telefono}</p>
                <p><strong>Ciudad:</strong> ${usuario.ciudad || 'No especificada'}</p>
                <p><strong>Notificaciones:</strong> ${usuario.notificaciones ? 'Sí' : 'No'}</p>
            </div>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-clock"></i> Actividad</h4>
                <p><strong>Fecha de Registro:</strong> ${fechaRegistro}</p>
                <p><strong>Última Conexión:</strong> ${ultimaConexion}</p>
                <p><strong>Estado:</strong> ${usuario.enLinea ? '🟢 En línea' : '⚫ Offline'}</p>
            </div>
            
            <div class="detalle-seccion">
                <h4><i class="fas fa-chart-bar"></i> Estadísticas</h4>
                <p><strong>Total Compras:</strong> ${stats.totalCompras}</p>
                <p><strong>Total Gastado:</strong> ${stats.totalGastado} Bs</p>
                <p><strong>Total Reservas:</strong> ${stats.totalReservas}</p>
                <p><strong>Visitas al Sitio:</strong> ${stats.visitasAlSitio}</p>
            </div>
            
            ${usuario.historialConexiones && usuario.historialConexiones.length > 0 ? `
                <div class="detalle-seccion">
                    <h4><i class="fas fa-history"></i> Historial de Actividad (Últimas 10)</h4>
                    <div class="historial-actividad">
                        ${usuario.historialConexiones.slice(-10).reverse().map(actividad => {
                            const fecha = new Date(actividad.fecha).toLocaleString('es-ES');
                            const iconos = {
                                'registro': 'fa-user-plus',
                                'login': 'fa-sign-in-alt',
                                'logout': 'fa-sign-out-alt',
                                'reserva': 'fa-calendar-plus',
                                'compra': 'fa-shopping-cart'
                            };
                            const icono = iconos[actividad.tipo] || 'fa-circle';
                            
                            return `
                                <div class="actividad-item">
                                    <i class="fas ${icono}"></i>
                                    <div>
                                        <strong>${actividad.accion}</strong>
                                        <small>${fecha}</small>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Mostrar en alert (puedes crear un modal personalizado)
    const ventana = window.open('', 'Detalles del Usuario', 'width=600,height=800');
    ventana.document.write(`
        <html>
        <head>
            <title>Detalles del Usuario</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 2rem;
                    background: #f5f5f5;
                }
                .modal-detalles-usuario {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                h3 {
                    color: #2c3e50;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #3498db;
                }
                .detalle-seccion {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .detalle-seccion h4 {
                    color: #3498db;
                    margin-bottom: 1rem;
                }
                .detalle-seccion p {
                    margin: 0.5rem 0;
                    color: #555;
                }
                .historial-actividad {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .actividad-item {
                    display: flex;
                    gap: 1rem;
                    padding: 0.75rem;
                    margin-bottom: 0.5rem;
                    background: white;
                    border-radius: 6px;
                    border-left: 3px solid #3498db;
                }
                .actividad-item i {
                    color: #3498db;
                    font-size: 1.2rem;
                }
                .actividad-item strong {
                    display: block;
                    color: #2c3e50;
                }
                .actividad-item small {
                    color: #999;
                    font-size: 0.85rem;
                }
            </style>
        </head>
        <body>
            ${modalHTML}
        </body>
        </html>
    `);
}

// Actualizar la tabla de usuarios cada 30 segundos
setInterval(() => {
    if (document.getElementById('usuarios-tbody')) {
        cargarUsuariosAdmin();
    }
}, 30000);


// ==========================================
// AUTO-INICIALIZACIÓN DE SOLICITUDES DE PRUEBA
// ==========================================

// Función para crear solicitudes automáticamente si no existen
function inicializarSolicitudesPrueba() {
    const solicitudesExistentes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    
    // Solo crear si no hay solicitudes
    if (solicitudesExistentes.length === 0) {
        const ahora = Date.now();
        const solicitudesPrueba = [
            {
                id: 'SOL-' + ahora + '-001',
                cliente: 'María González',
                email: 'maria.gonzalez@email.com',
                telefono: '71234567',
                fecha: new Date(ahora - 600000).toISOString(), // 10 min atrás
                metodoPago: 'qr',
                estado: 'pendiente',
                total: 95,
                items: [
                    { nombre: 'Reserva Sauna Familiar', cantidad: 1, precio: 45 },
                    { nombre: 'Champú Herbal Orgánico', cantidad: 2, precio: 18 },
                    { nombre: 'Toalla Premium', cantidad: 1, precio: 32 }
                ]
            },
            {
                id: 'SOL-' + ahora + '-002',
                cliente: 'Carlos Rodríguez',
                email: 'carlos.rodriguez@email.com',
                telefono: '72345678',
                fecha: new Date(ahora - 1800000).toISOString(), // 30 min atrás
                metodoPago: 'efectivo',
                estado: 'procesando',
                total: 67,
                items: [
                    { nombre: 'Reserva Sauna Doble', cantidad: 1, precio: 25 },
                    { nombre: 'Coca Cola 500ml', cantidad: 3, precio: 8 },
                    { nombre: 'Chocolate Premium', cantidad: 3, precio: 6 }
                ]
            },
            {
                id: 'SOL-' + ahora + '-003',
                cliente: 'Ana Martínez',
                email: 'ana.martinez@email.com',
                telefono: '73456789',
                fecha: new Date(ahora - 3600000).toISOString(), // 1 hora atrás
                metodoPago: 'qr',
                estado: 'pendiente',
                total: 128,
                items: [
                    { nombre: 'Reserva Sauna Semifamiliar', cantidad: 1, precio: 35 },
                    { nombre: 'Kit de Relajación Completo', cantidad: 1, precio: 65 },
                    { nombre: 'Agua Mineral Premium', cantidad: 4, precio: 7 }
                ]
            },
            {
                id: 'SOL-' + ahora + '-004',
                cliente: 'Luis Fernández',
                email: 'luis.fernandez@email.com',
                telefono: '74567890',
                fecha: new Date(ahora - 7200000).toISOString(), // 2 horas atrás
                metodoPago: 'qr',
                estado: 'pendiente',
                total: 43,
                items: [
                    { nombre: 'Reserva Sauna Individual', cantidad: 1, precio: 15 },
                    { nombre: 'Jugo Natural de Naranja', cantidad: 2, precio: 14 }
                ]
            },
            {
                id: 'SOL-' + ahora + '-005',
                cliente: 'Patricia Silva',
                email: 'patricia.silva@email.com',
                telefono: '75678901',
                fecha: new Date(ahora - 300000).toISOString(), // 5 min atrás
                metodoPago: 'qr',
                estado: 'pendiente',
                total: 156,
                items: [
                    { nombre: 'Reserva Sauna Familiar', cantidad: 2, precio: 45 },
                    { nombre: 'Masaje Relajante 60min', cantidad: 1, precio: 50 },
                    { nombre: 'Aceite Esencial Lavanda', cantidad: 2, precio: 8 }
                ]
            }
        ];
        
        localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPrueba));
        console.log('✅ Se crearon ' + solicitudesPrueba.length + ' solicitudes de prueba automáticamente');
        return true;
    }
    
    console.log('ℹ️ Ya existen ' + solicitudesExistentes.length + ' solicitudes en el sistema');
    return false;
}

// Ejecutar al cargar la página del admin
if (window.location.pathname.includes('admin.html')) {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            inicializarSolicitudesPrueba();
        });
    } else {
        inicializarSolicitudesPrueba();
    }
}


// ==========================================
// GESTIÓN DE MODALES Y HEADER
// ==========================================

// Variable global para rastrear estado de modales
let modalAbiertoActualmente = false;

// Función para abrir modal y bloquear header
function abrirModalConHeader(modalId) {
    const modal = document.getElementById(modalId);
    const header = document.getElementById('admin-header');
    
    if (modal) {
        modal.style.display = 'flex';
        modalAbiertoActualmente = true;
        document.body.classList.add('modal-open');
        
        // Asegurar que el header esté visible
        if (header) {
            header.classList.remove('hidden');
        }
    }
}

// Función para cerrar modal y liberar header
function cerrarModalConHeader(modalId) {
    const modal = document.getElementById(modalId);
    
    if (modal) {
        modal.style.display = 'none';
        modalAbiertoActualmente = false;
        document.body.classList.remove('modal-open');
    }
}

// Sobrescribir funciones de modal existentes para integrar con header
const abrirModalOriginal = window.abrirModal;
if (typeof abrirModalOriginal === 'function') {
    window.abrirModal = function(modalId) {
        abrirModalConHeader(modalId);
    };
}

const cerrarModalOriginal = window.cerrarModal;
if (typeof cerrarModalOriginal === 'function') {
    window.cerrarModal = function(modalId) {
        cerrarModalConHeader(modalId);
    };
}

// Función mejorada para detectar modales abiertos
function verificarModalAbierto() {
    // Verificar variable global primero
    if (modalAbiertoActualmente) {
        return true;
    }
    
    // Verificar clase en body
    if (document.body.classList.contains('modal-open')) {
        return true;
    }
    
    // Verificar todos los modales en el DOM
    const selectores = [
        '.modal[style*="display: flex"]',
        '.modal[style*="display: block"]',
        '.modal-exito[style*="display: flex"]',
        '.modal-exito[style*="display: block"]',
        '[id$="-modal"][style*="display: flex"]',
        '[id$="-modal"][style*="display: block"]'
    ];
    
    for (let selector of selectores) {
        if (document.querySelector(selector)) {
            return true;
        }
    }
    
    return false;
}

// Actualizar funciones de modales existentes
const funcionesModales = [
    'mostrarModalIngreso',
    'mostrarModalRetiro',
    'mostrarModalProducto',
    'mostrarModalReserva',
    'mostrarModalUsuario',
    'mostrarModalExitoProducto',
    'mostrarModalExitoEdicion'
];

funcionesModales.forEach(nombreFuncion => {
    const funcionOriginal = window[nombreFuncion];
    if (typeof funcionOriginal === 'function') {
        window[nombreFuncion] = function(...args) {
            modalAbiertoActualmente = true;
            document.body.classList.add('modal-open');
            const header = document.getElementById('admin-header');
            if (header) {
                header.classList.remove('hidden');
            }
            return funcionOriginal.apply(this, args);
        };
    }
});

// Interceptar cerrar modal de éxito
const cerrarModalExitoOriginal = window.cerrarModalExito;
if (typeof cerrarModalExitoOriginal === 'function') {
    window.cerrarModalExito = function() {
        const resultado = cerrarModalExitoOriginal();
        setTimeout(() => {
            if (!verificarModalAbierto()) {
                modalAbiertoActualmente = false;
                document.body.classList.remove('modal-open');
            }
        }, 300);
        return resultado;
    };
}


// ==========================================
// FORZAR CARGA DE SOLICITUDES AL INICIAR
// ==========================================

// Ejecutar inmediatamente al cargar el script
(function() {
    console.log('🔄 Inicializando sistema de solicitudes...');
    
    // Verificar si estamos en la página de admin
    if (window.location.pathname.includes('admin.html') || document.getElementById('solicitudes-container')) {
        
        // Crear solicitudes de prueba si no existen
        const solicitudesExistentes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
        
        if (solicitudesExistentes.length === 0) {
            console.log('📝 No hay solicitudes, creando solicitudes de prueba...');
            
            const ahora = Date.now();
            const solicitudesPrueba = [
                {
                    id: 'SOL-' + ahora + '-001',
                    cliente: 'María González',
                    email: 'maria.gonzalez@email.com',
                    telefono: '71234567',
                    fecha: new Date(ahora - 300000).toISOString(), // 5 min atrás
                    metodoPago: 'qr',
                    estado: 'pendiente',
                    total: 95,
                    items: [
                        { nombre: 'Reserva Sauna Familiar', cantidad: 1, precio: 45 },
                        { nombre: 'Champú Herbal Orgánico', cantidad: 2, precio: 18 },
                        { nombre: 'Toalla Premium', cantidad: 1, precio: 32 }
                    ]
                },
                {
                    id: 'SOL-' + ahora + '-002',
                    cliente: 'Carlos Rodríguez',
                    email: 'carlos.rodriguez@email.com',
                    telefono: '72345678',
                    fecha: new Date(ahora - 1800000).toISOString(), // 30 min atrás
                    metodoPago: 'efectivo',
                    estado: 'procesando',
                    total: 67,
                    items: [
                        { nombre: 'Reserva Sauna Doble', cantidad: 1, precio: 25 },
                        { nombre: 'Coca Cola 500ml', cantidad: 3, precio: 8 },
                        { nombre: 'Chocolate Premium', cantidad: 3, precio: 6 }
                    ]
                },
                {
                    id: 'SOL-' + ahora + '-003',
                    cliente: 'Ana Martínez',
                    email: 'ana.martinez@email.com',
                    telefono: '73456789',
                    fecha: new Date(ahora - 3600000).toISOString(), // 1 hora atrás
                    metodoPago: 'qr',
                    estado: 'pendiente',
                    total: 128,
                    items: [
                        { nombre: 'Reserva Sauna Semifamiliar', cantidad: 1, precio: 35 },
                        { nombre: 'Kit de Relajación Completo', cantidad: 1, precio: 65 },
                        { nombre: 'Agua Mineral Premium', cantidad: 4, precio: 7 }
                    ]
                }
            ];
            
            localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPrueba));
            console.log('✅ Se crearon ' + solicitudesPrueba.length + ' solicitudes de prueba');
        } else {
            console.log('ℹ️ Ya existen ' + solicitudesExistentes.length + ' solicitudes');
        }
        
        // Cargar solicitudes cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    if (typeof cargarSolicitudesEnSeccion === 'function') {
                        console.log('🔄 Cargando solicitudes en la interfaz...');
                        cargarSolicitudesEnSeccion();
                        console.log('✅ Solicitudes cargadas correctamente');
                    }
                }, 500);
            });
        } else {
            setTimeout(function() {
                if (typeof cargarSolicitudesEnSeccion === 'function') {
                    console.log('🔄 Cargando solicitudes en la interfaz...');
                    cargarSolicitudesEnSeccion();
                    console.log('✅ Solicitudes cargadas correctamente');
                }
            }, 500);
        }
    }
})();

// Función de diagnóstico para verificar el estado
function diagnosticarSolicitudes() {
    console.log('=== DIAGNÓSTICO DE SOLICITUDES ===');
    
    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    console.log('📊 Total de solicitudes:', solicitudes.length);
    
    const container = document.getElementById('solicitudes-container');
    console.log('📦 Contenedor existe:', !!container);
    
    const badge = document.getElementById('solicitudes-badge');
    console.log('🔔 Badge existe:', !!badge);
    if (badge) {
        console.log('🔔 Badge visible:', badge.style.display !== 'none');
        console.log('🔔 Badge valor:', badge.textContent);
    }
    
    console.log('📋 Solicitudes:');
    solicitudes.forEach((sol, index) => {
        console.log(`  ${index + 1}. ${sol.cliente} - ${sol.total} Bs (${sol.estado})`);
    });
    
    console.log('=================================');
    
    return {
        totalSolicitudes: solicitudes.length,
        containerExiste: !!container,
        badgeExiste: !!badge,
        solicitudes: solicitudes
    };
}

// Hacer la función disponible globalmente
window.diagnosticarSolicitudes = diagnosticarSolicitudes;

console.log('💡 Tip: Ejecuta diagnosticarSolicitudes() en la consola para ver el estado del sistema');


// ==========================================
// EDITOR DE COLORES PARA PÁGINA PRINCIPAL
// ==========================================

// Colores por defecto
const coloresDefecto = {
    primary: '#2c3e50',
    secondary: '#34495e',
    accent: '#3498db',
    success: '#2ecc71'
};

// Presets de colores
const presetsColores = {
    default: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        success: '#2ecc71'
    },
    ocean: {
        primary: '#006994',
        secondary: '#0088b8',
        accent: '#00a8e8',
        success: '#00c9a7'
    },
    forest: {
        primary: '#2d5016',
        secondary: '#3d6b1f',
        accent: '#4d8629',
        success: '#6ab04c'
    },
    sunset: {
        primary: '#d35400',
        secondary: '#e67e22',
        accent: '#f39c12',
        success: '#f1c40f'
    },
    purple: {
        primary: '#6c3483',
        secondary: '#8e44ad',
        accent: '#9b59b6',
        success: '#2ecc71'
    },
    elegant: {
        primary: '#1a1a1a',
        secondary: '#2d2d2d',
        accent: '#c0392b',
        success: '#27ae60'
    }
};

// Abrir editor de colores
function abrirEditorColores() {
    const modal = document.getElementById('modal-editor-colores');
    modal.style.display = 'flex';
    
    // Cargar colores actuales
    cargarColoresActuales();
    
    // Configurar listeners para actualización en tiempo real
    configurarListenersColores();
    
    // Actualizar vista previa
    actualizarVistaPrevia();
}

// Cerrar editor de colores
function cerrarEditorColores() {
    const modal = document.getElementById('modal-editor-colores');
    modal.style.display = 'none';
}

// Cargar colores actuales desde localStorage
function cargarColoresActuales() {
    const coloresGuardados = JSON.parse(localStorage.getItem('coloresPaginaPrincipal')) || coloresDefecto;
    
    // Cargar en los inputs
    document.getElementById('color-primary').value = coloresGuardados.primary;
    document.getElementById('color-primary-hex').value = coloresGuardados.primary;
    
    document.getElementById('color-secondary').value = coloresGuardados.secondary;
    document.getElementById('color-secondary-hex').value = coloresGuardados.secondary;
    
    document.getElementById('color-accent').value = coloresGuardados.accent;
    document.getElementById('color-accent-hex').value = coloresGuardados.accent;
    
    document.getElementById('color-success').value = coloresGuardados.success;
    document.getElementById('color-success-hex').value = coloresGuardados.success;
    
    // Actualizar preview en la tarjeta de configuración
    actualizarPreviewConfiguracion(coloresGuardados);
}

// Configurar listeners para actualización en tiempo real
function configurarListenersColores() {
    const colores = ['primary', 'secondary', 'accent', 'success'];
    
    colores.forEach(color => {
        const picker = document.getElementById(`color-${color}`);
        const hex = document.getElementById(`color-${color}-hex`);
        
        // Listener para el color picker
        picker.addEventListener('input', function() {
            hex.value = this.value;
            actualizarVistaPrevia();
        });
        
        // Listener para el input de texto
        hex.addEventListener('input', function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                picker.value = this.value;
                actualizarVistaPrevia();
            }
        });
    });
}

// Actualizar vista previa en tiempo real
function actualizarVistaPrevia() {
    const colores = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        accent: document.getElementById('color-accent').value,
        success: document.getElementById('color-success').value
    };
    
    // Actualizar demo header
    const demoHeader = document.getElementById('demo-header');
    demoHeader.style.background = `linear-gradient(135deg, ${colores.primary} 0%, ${colores.secondary} 100%)`;
    
    // Actualizar demo button
    const demoButton = document.getElementById('demo-button');
    demoButton.style.background = `linear-gradient(135deg, ${colores.accent}, ${ajustarBrillo(colores.accent, -20)})`;
    
    // Actualizar demo link
    const demoLink = document.getElementById('demo-link');
    demoLink.style.color = colores.accent;
    
    // Actualizar demo success
    const demoSuccess = document.getElementById('demo-success');
    demoSuccess.style.background = `${colores.success}20`;
    demoSuccess.style.color = colores.success;
    demoSuccess.style.borderLeft = `4px solid ${colores.success}`;
}

// Función auxiliar para ajustar brillo de color
function ajustarBrillo(color, porcentaje) {
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

// Aplicar preset de colores
function aplicarPreset(presetName) {
    const preset = presetsColores[presetName];
    
    if (preset) {
        document.getElementById('color-primary').value = preset.primary;
        document.getElementById('color-primary-hex').value = preset.primary;
        
        document.getElementById('color-secondary').value = preset.secondary;
        document.getElementById('color-secondary-hex').value = preset.secondary;
        
        document.getElementById('color-accent').value = preset.accent;
        document.getElementById('color-accent-hex').value = preset.accent;
        
        document.getElementById('color-success').value = preset.success;
        document.getElementById('color-success-hex').value = preset.success;
        
        actualizarVistaPrevia();
        
        mostrarToastAdmin(`Tema "${presetName}" aplicado`, 'info');
    }
}

// Guardar colores
function guardarColores() {
    const colores = {
        primary: document.getElementById('color-primary').value,
        secondary: document.getElementById('color-secondary').value,
        accent: document.getElementById('color-accent').value,
        success: document.getElementById('color-success').value
    };
    
    // Guardar en localStorage
    localStorage.setItem('coloresPaginaPrincipal', JSON.stringify(colores));
    
    // Actualizar preview en configuración
    actualizarPreviewConfiguracion(colores);
    
    // Cerrar modal
    cerrarEditorColores();
    
    // Mostrar confirmación
    mostrarToastAdmin('Colores guardados exitosamente. Los cambios se verán en la página principal.', 'success', 4000);
    
    console.log('✅ Colores guardados:', colores);
}

// Actualizar preview en la tarjeta de configuración
function actualizarPreviewConfiguracion(colores) {
    const previewPrimary = document.getElementById('preview-primary');
    const previewSecondary = document.getElementById('preview-secondary');
    const previewAccent = document.getElementById('preview-accent');
    
    if (previewPrimary) previewPrimary.style.background = colores.primary;
    if (previewSecondary) previewSecondary.style.background = colores.secondary;
    if (previewAccent) previewAccent.style.background = colores.accent;
}

// Restaurar colores por defecto
function restaurarColoresDefecto() {
    if (confirm('¿Estás seguro de que quieres restaurar los colores por defecto? Esta acción no se puede deshacer.')) {
        localStorage.setItem('coloresPaginaPrincipal', JSON.stringify(coloresDefecto));
        actualizarPreviewConfiguracion(coloresDefecto);
        mostrarToastAdmin('Colores restaurados a los valores por defecto', 'success');
        console.log('✅ Colores restaurados a valores por defecto');
    }
}

// Cargar preview al iniciar
document.addEventListener('DOMContentLoaded', function() {
    const coloresGuardados = JSON.parse(localStorage.getItem('coloresPaginaPrincipal')) || coloresDefecto;
    actualizarPreviewConfiguracion(coloresGuardados);
});


// ==========================================
// RESTAURAR COLORES INMEDIATAMENTE
// ==========================================

// Función para restaurar colores sin confirmación (para uso directo)
function restaurarColoresInmediato() {
    const coloresDefecto = {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#3498db',
        success: '#2ecc71'
    };
    
    localStorage.removeItem('coloresPaginaPrincipal');
    console.log('✅ Colores restaurados a valores por defecto');
    console.log('Colores por defecto:', coloresDefecto);
    
    return coloresDefecto;
}

// Ejecutar restauración automáticamente
console.log('🎨 Restaurando colores por defecto...');
restaurarColoresInmediato();


// ==========================================
// SISTEMA DE NOTIFICACIONES EN TIEMPO REAL
// ==========================================

// Función para enviar notificación al usuario
function enviarNotificacionUsuario(notificacion) {
    // Obtener notificaciones existentes
    let notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    
    // Agregar nueva notificación
    notificacion.id = 'NOTIF-' + Date.now();
    notificacion.leida = false;
    notificacion.timestamp = Date.now();
    
    notificaciones.push(notificacion);
    
    // Guardar en localStorage
    localStorage.setItem('notificacionesUsuarios', JSON.stringify(notificaciones));
    
    // Disparar evento personalizado para actualización en tiempo real
    window.dispatchEvent(new CustomEvent('nuevaNotificacion', { 
        detail: notificacion 
    }));
    
    console.log('📢 Notificación enviada al usuario:', notificacion);
    
    return notificacion;
}

// Función para obtener notificaciones de un usuario
function obtenerNotificacionesUsuario(clienteEmail) {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    
    if (clienteEmail) {
        return notificaciones.filter(n => n.cliente === clienteEmail);
    }
    
    return notificaciones;
}

// Función para marcar notificación como leída
function marcarNotificacionLeida(notificacionId) {
    let notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    const index = notificaciones.findIndex(n => n.id === notificacionId);
    
    if (index !== -1) {
        notificaciones[index].leida = true;
        localStorage.setItem('notificacionesUsuarios', JSON.stringify(notificaciones));
    }
}

// Función para limpiar notificaciones antiguas (más de 7 días)
function limpiarNotificacionesAntiguas() {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesUsuarios') || '[]');
    const ahora = Date.now();
    const sieteDias = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
    
    const notificacionesActuales = notificaciones.filter(n => {
        return (ahora - n.timestamp) < sieteDias;
    });
    
    localStorage.setItem('notificacionesUsuarios', JSON.stringify(notificacionesActuales));
}


// ==========================================
// SISTEMA DE DISPONIBILIDAD EN TIEMPO REAL
// ==========================================

// Función para calcular saunas disponibles por tipo
function calcularDisponibilidadSaunas() {
    const modulosBase = {
        individual: { total: 2 },
        doble: { total: 5 },
        semifamiliar: { total: 2 },
        familiar: { total: 3 }
    };
    
    const configuracionModulos = JSON.parse(localStorage.getItem('configuracionModulos') || '{}');
    const reservasActuales = JSON.parse(localStorage.getItem('reservasActuales') || '{}');
    
    const disponibilidad = {};
    
    // Calcular para cada tipo de módulo
    Object.keys(modulosBase).forEach(tipo => {
        const total = modulosBase[tipo].total;
        let disponibles = 0;
        let noDisponibles = 0;
        let reservadas = 0;
        
        // Revisar cada sauna de este tipo
        for (let i = 1; i <= total; i++) {
            const saunaId = `${tipo}-${i}`;
            const config = configuracionModulos[saunaId] || { estado: 'disponible' };
            const reserva = reservasActuales[saunaId];
            
            if (config.estado === 'no-disponible' || config.estado === 'mantenimiento') {
                noDisponibles++;
            } else if (reserva && reserva.activa) {
                reservadas++;
            } else {
                disponibles++;
            }
        }
        
        disponibilidad[tipo] = {
            total: total,
            disponibles: disponibles,
            reservadas: reservadas,
            noDisponibles: noDisponibles,
            porcentajeDisponible: Math.round((disponibles / total) * 100)
        };
    });
    
    // Guardar en localStorage para que los clientes puedan verlo
    localStorage.setItem('disponibilidadSaunas', JSON.stringify(disponibilidad));
    
    console.log('📊 Disponibilidad actualizada:', disponibilidad);
    
    return disponibilidad;
}

// Actualizar disponibilidad cuando cambia el estado de un módulo
function actualizarDisponibilidadTiempoReal() {
    const disponibilidad = calcularDisponibilidadSaunas();
    
    // Disparar evento para que la página del cliente se actualice
    window.dispatchEvent(new CustomEvent('disponibilidadActualizada', {
        detail: disponibilidad
    }));
    
    return disponibilidad;
}

// Ejecutar al cargar el admin
document.addEventListener('DOMContentLoaded', function() {
    calcularDisponibilidadSaunas();
    
    // Actualizar cada 30 segundos
    setInterval(calcularDisponibilidadSaunas, 30000);
});


// ==========================================
// FUNCIÓN PAGO RECIBIDO
// ==========================================

// Función para marcar pago como recibido
function pagoRecibido(solicitudId) {
    if (!confirm('¿Confirmas que has recibido el pago de esta solicitud?')) {
        return;
    }

    let solicitudesPendientes = JSON.parse(localStorage.getItem('solicitudesPendientes') || '[]');
    const solicitudIndex = solicitudesPendientes.findIndex(s => s.id == solicitudId);

    if (solicitudIndex === -1) {
        mostrarToastAdmin('Solicitud no encontrada', 'error');
        return;
    }

    const solicitud = solicitudesPendientes[solicitudIndex];

    // ELIMINAR la solicitud de pendientes (ya no estará pendiente)
    solicitudesPendientes.splice(solicitudIndex, 1);

    // Registrar la transacción en caja
    const transaccion = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: solicitud.metodoPago === 'qr' ? 'pago-qr' : 'pago-efectivo',
        descripcion: `Pago recibido - Solicitud #${solicitud.id}`,
        cliente: solicitud.cliente,
        monto: solicitud.total,
        productos: solicitud.items || [],
        metodoPago: solicitud.metodoPago,
        solicitudId: solicitud.id
    };

    // Guardar transacción
    let transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    transacciones.push(transaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));

    // Registrar en historial de caja
    const movimientoCaja = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: 'ingreso',
        concepto: `Pago ${solicitud.metodoPago === 'efectivo' ? 'Efectivo' : 'QR'} - ${solicitud.cliente}`,
        descripcion: `Solicitud #${solicitud.id} - ${solicitud.items.length} items`,
        monto: solicitud.total,
        metodoPago: solicitud.metodoPago, // 'efectivo' o 'qr'
        solicitudId: solicitud.id
    };

    let historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    historialCaja.push(movimientoCaja);
    localStorage.setItem('historialCaja', JSON.stringify(historialCaja));

    // Actualizar balances separados
    if (solicitud.metodoPago === 'efectivo') {
        let balanceEfectivo = parseFloat(localStorage.getItem('balanceEfectivo') || '0');
        balanceEfectivo += solicitud.total;
        localStorage.setItem('balanceEfectivo', balanceEfectivo.toString());
    } else if (solicitud.metodoPago === 'qr') {
        let balanceQR = parseFloat(localStorage.getItem('balanceQR') || '0');
        balanceQR += solicitud.total;
        localStorage.setItem('balanceQR', balanceQR.toString());
    }

    // Actualizar balance total de caja
    let balanceCaja = parseFloat(localStorage.getItem('balanceCaja') || '0');
    balanceCaja += solicitud.total;
    localStorage.setItem('balanceCaja', balanceCaja.toString());

    // Guardar solicitudes actualizadas
    localStorage.setItem('solicitudesPendientes', JSON.stringify(solicitudesPendientes));

    // ENVIAR NOTIFICACIÓN AL USUARIO
    enviarNotificacionUsuario({
        tipo: 'pago_recibido',
        titulo: '💰 Pago Recibido',
        mensaje: `Hemos recibido tu pago de ${solicitud.total} Bs. Tu pedido está siendo procesado.`,
        solicitudId: solicitudId,
        cliente: solicitud.cliente,
        total: solicitud.total,
        fecha: new Date().toISOString()
    });

    // Actualizar la vista
    cargarSolicitudesEnSeccion();
    
    // Actualizar estadísticas si existen
    if (typeof actualizarEstadisticasSolicitudes === 'function') {
        actualizarEstadisticasSolicitudes();
    }
    
    // Actualizar ingresos si la función existe
    if (typeof cargarIngresos === 'function') {
        cargarIngresos();
    }

    mostrarToastAdmin(`Pago recibido: ${solicitud.total} Bs registrado en caja`, 'success');
    
    console.log('💰 Pago recibido registrado:', {
        solicitudId: solicitud.id,
        cliente: solicitud.cliente,
        monto: solicitud.total,
        metodoPago: solicitud.metodoPago
    });
}


// ==========================================
// SISTEMA DE EXPORTACIÓN CON SELECCIÓN DE PERÍODO
// ==========================================

// Variable global para almacenar el tipo de exportación
let tipoExportacionActual = null;

// Función para abrir modal de selección de período
function abrirModalPeriodo(tipoExportacion) {
    tipoExportacionActual = tipoExportacion;
    const modal = document.getElementById('modal-periodo-exportar');
    modal.style.display = 'flex';
    
    console.log('📅 Modal de período abierto para:', tipoExportacion);
}

// Función para cerrar modal de período
function cerrarModalPeriodo() {
    const modal = document.getElementById('modal-periodo-exportar');
    modal.style.display = 'none';
    tipoExportacionActual = null;
}

// Función para confirmar exportación con período seleccionado
function confirmarExportacion(periodo) {
    if (!tipoExportacionActual) {
        mostrarToastAdmin('Error: No se ha seleccionado tipo de exportación', 'error');
        return;
    }
    
    console.log(`📊 Exportando ${tipoExportacionActual} - Período: ${periodo}`);
    
    // Cerrar modal
    cerrarModalPeriodo();
    
    // Ejecutar exportación según el tipo
    switch(tipoExportacionActual) {
        case 'reservas':
            exportarReservasConPeriodo(periodo);
            break;
        case 'ingresos':
            exportarIngresosConPeriodo(periodo);
            break;
        case 'inventario':
            exportarInventarioConPeriodo(periodo);
            break;
        case 'usuarios':
            exportarUsuariosConPeriodo(periodo);
            break;
        default:
            mostrarToastAdmin('Tipo de exportación no reconocido', 'error');
    }
}

// Función para filtrar datos por período
function filtrarPorPeriodo(datos, periodo, campoFecha = 'fecha') {
    if (periodo === 'todo') {
        return datos;
    }
    
    const ahora = new Date();
    let fechaLimite;
    
    switch(periodo) {
        case '1dia':
            fechaLimite = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));
            break;
        case '1semana':
            fechaLimite = new Date(ahora.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        case '1mes':
            fechaLimite = new Date(ahora.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
        case '1ano':
            fechaLimite = new Date(ahora.getTime() - (365 * 24 * 60 * 60 * 1000));
            break;
        default:
            return datos;
    }
    
    return datos.filter(item => {
        const fechaItem = new Date(item[campoFecha]);
        return fechaItem >= fechaLimite;
    });
}

// Función para obtener nombre del período
function obtenerNombrePeriodo(periodo) {
    const nombres = {
        '1dia': '1 Día',
        '1semana': '1 Semana',
        '1mes': '1 Mes',
        '1ano': '1 Año',
        'todo': 'Todos los Registros'
    };
    return nombres[periodo] || periodo;
}

// Exportar Reservas con Período
function exportarReservasConPeriodo(periodo) {
    const transacciones = JSON.parse(localStorage.getItem('transacciones') || '[]');
    const datosFiltrados = filtrarPorPeriodo(transacciones, periodo, 'fecha');
    
    if (datosFiltrados.length === 0) {
        mostrarToastAdmin(`No hay reservas en el período seleccionado (${obtenerNombrePeriodo(periodo)})`, 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Fecha,Cliente,Tipo,Monto,Método de Pago\n";
    
    datosFiltrados.forEach(t => {
        const fecha = new Date(t.fecha).toLocaleString('es-ES');
        csvContent += `${t.id},"${fecha}","${t.cliente}","${t.tipo}",${t.monto},"${t.metodoPago}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reservas_${periodo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin(`Reservas exportadas: ${datosFiltrados.length} registros (${obtenerNombrePeriodo(periodo)})`, 'success');
}

// Exportar Ingresos con Período
function exportarIngresosConPeriodo(periodo) {
    const historialCaja = JSON.parse(localStorage.getItem('historialCaja') || '[]');
    const datosFiltrados = filtrarPorPeriodo(historialCaja, periodo, 'fecha');
    
    if (datosFiltrados.length === 0) {
        mostrarToastAdmin(`No hay ingresos en el período seleccionado (${obtenerNombrePeriodo(periodo)})`, 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Fecha,Tipo,Concepto,Monto,Método de Pago\n";
    
    datosFiltrados.forEach(m => {
        const fecha = new Date(m.fecha).toLocaleString('es-ES');
        csvContent += `${m.id},"${fecha}","${m.tipo}","${m.concepto}",${m.monto},"${m.metodoPago || 'N/A'}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ingresos_${periodo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin(`Ingresos exportados: ${datosFiltrados.length} registros (${obtenerNombrePeriodo(periodo)})`, 'success');
}

// Exportar Inventario con Período (basado en última actualización)
function exportarInventarioConPeriodo(periodo) {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    // Para inventario, exportamos todos los productos actuales
    // pero podemos filtrar por fecha de última actualización si existe
    let datosFiltrados = productos;
    
    if (periodo !== 'todo' && productos.some(p => p.fechaActualizacion)) {
        datosFiltrados = filtrarPorPeriodo(productos, periodo, 'fechaActualizacion');
    }
    
    if (datosFiltrados.length === 0) {
        mostrarToastAdmin(`No hay productos en el período seleccionado (${obtenerNombrePeriodo(periodo)})`, 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombre,Categoría,Precio,Stock,Disponible\n";
    
    datosFiltrados.forEach(p => {
        csvContent += `${p.id},"${p.nombre}","${p.categoria}",${p.precio},${p.stock},"${p.disponible ? 'Sí' : 'No'}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_${periodo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin(`Inventario exportado: ${datosFiltrados.length} productos (${obtenerNombrePeriodo(periodo)})`, 'success');
}

// Exportar Usuarios con Período
function exportarUsuariosConPeriodo(periodo) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const datosFiltrados = filtrarPorPeriodo(usuarios, periodo, 'fechaRegistro');
    
    if (datosFiltrados.length === 0) {
        mostrarToastAdmin(`No hay usuarios en el período seleccionado (${obtenerNombrePeriodo(periodo)})`, 'warning');
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nombre,Email,Teléfono,Fecha Registro\n";
    
    datosFiltrados.forEach(u => {
        const fecha = u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleString('es-ES') : 'N/A';
        csvContent += `${u.id},"${u.nombre}","${u.email}","${u.telefono || 'N/A'}","${fecha}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_${periodo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToastAdmin(`Usuarios exportados: ${datosFiltrados.length} registros (${obtenerNombrePeriodo(periodo)})`, 'success');
}

// Sobrescribir funciones originales de exportar para usar el modal
const exportarReservasOriginal = exportarReservas;
exportarReservas = function() {
    abrirModalPeriodo('reservas');
};

const exportarIngresosOriginal = exportarIngresos;
exportarIngresos = function() {
    abrirModalPeriodo('ingresos');
};

const exportarInventarioOriginal = exportarInventario;
exportarInventario = function() {
    abrirModalPeriodo('inventario');
};

const exportarUsuariosOriginal = exportarUsuarios;
exportarUsuarios = function() {
    abrirModalPeriodo('usuarios');
};

console.log('📊 Sistema de exportación con períodos activado');
