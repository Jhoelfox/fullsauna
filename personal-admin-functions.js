// ==========================================
// GESTIÓN DE PERSONAL - FUNCIONES ACTUALIZADAS
// ==========================================

let solicitudActual = null;

// Cargar solicitudes y personal al iniciar
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('solicitudes-personal-lista')) {
        cargarSolicitudesPendientes();
        cargarPersonalAdmin();
        actualizarEstadisticasPersonal();
    }
});

// ============= SOLICITUDES PENDIENTES =============

function cargarSolicitudesPendientes() {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPersonal')) || [];
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
    const lista = document.getElementById('solicitudes-personal-lista');

    if (!lista) return;

    if (pendientes.length === 0) {
        lista.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: #e8f5e9; border-radius: 12px; border-left: 4px solid #27ae60;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: #27ae60; margin-bottom: 1rem;"></i>
                <h3 style="color: #27ae60; margin-bottom: 0.5rem;">No hay solicitudes pendientes</h3>
                <p style="color: #7f8c8d; margin: 0;">
                    El personal que se registra con código de acceso aparece directamente en la tabla de personal registrado.
                </p>
            </div>
        `;
        return;
    }

    lista.innerHTML = pendientes.map(solicitud => `
        <div class="solicitud-card">
            <div class="solicitud-header">
                <h4><i class="fas fa-user"></i> ${solicitud.nombre}</h4>
                <span class="solicitud-fecha">${new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES')}</span>
            </div>
            <div class="solicitud-datos">
                <p><strong>C.I.:</strong> ${solicitud.ci}</p>
                <p><strong>Email:</strong> ${solicitud.correo}</p>
                <p><strong>Teléfono:</strong> ${solicitud.telefono}</p>
            </div>
            <div class="solicitud-acciones">
                <button onclick="abrirModalAprobar('${solicitud.id}')" class="btn-success">
                    <i class="fas fa-check"></i> Aprobar
                </button>
                <button onclick="rechazarSolicitudDirecta('${solicitud.id}')" class="btn-danger">
                    <i class="fas fa-times"></i> Rechazar
                </button>
            </div>
        </div>
    `).join('');
}

function abrirModalAprobar(solicitudId) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPersonal')) || [];
    const solicitud = solicitudes.find(s => s.id === solicitudId);

    if (!solicitud) return;

    solicitudActual = solicitud;

    // Mostrar datos de la solicitud
    document.getElementById('datos-solicitud').innerHTML = `
        <p><strong>Nombre:</strong> ${solicitud.nombre}</p>
        <p><strong>C.I.:</strong> ${solicitud.ci}</p>
        <p><strong>Email:</strong> ${solicitud.correo}</p>
        <p><strong>Teléfono:</strong> ${solicitud.telefono}</p>
        <p><strong>Fecha de Solicitud:</strong> ${new Date(solicitud.fechaSolicitud).toLocaleString('es-ES')}</p>
    `;

    // Generar código automáticamente
    generarCodigoAleatorio();

    document.getElementById('aprobar-solicitud-modal').style.display = 'block';
}

function generarCodigoAleatorio() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';

    for (let i = 0; i < 8; i++) {
        if (i === 4) codigo += '-';
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Verificar que el código no exista ya
    const codigosDisponibles = JSON.parse(localStorage.getItem('codigosAccesoDisponibles')) || [];
    const codigoExiste = codigosDisponibles.some(c => c.codigo === codigo);

    if (codigoExiste) {
        // Si existe, generar otro
        return generarCodigoAleatorio();
    }

    document.getElementById('codigo-generado').value = codigo;
    return codigo;
}

function confirmarAprobacion() {
    if (!solicitudActual) return;

    const codigo = document.getElementById('codigo-generado').value;

    if (!confirm(`¿Aprobar solicitud de ${solicitudActual.nombre} y enviar código ${codigo}?`)) return;

    // Crear personal aprobado
    const nuevoPersonal = {
        id: Date.now().toString(),
        nombre: solicitudActual.nombre,
        ci: solicitudActual.ci,
        email: solicitudActual.correo,
        telefono: solicitudActual.telefono,
        codigo: codigo,
        activo: true,
        bloqueado: false,
        fechaRegistro: new Date().toISOString(),
        fechaAprobacion: new Date().toISOString()
    };

    // Guardar en personal registrado
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    personalRegistrado.push(nuevoPersonal);
    localStorage.setItem('personalRegistrado', JSON.stringify(personalRegistrado));

    // Actualizar estado de solicitud
    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPersonal')) || [];
    const index = solicitudes.findIndex(s => s.id === solicitudActual.id);
    if (index !== -1) {
        solicitudes[index].estado = 'aprobado';
        solicitudes[index].codigo = codigo;
        solicitudes[index].fechaAprobacion = new Date().toISOString();
    }
    localStorage.setItem('solicitudesPersonal', JSON.stringify(solicitudes));

    // Simular envío de email
    enviarCodigoEmail(nuevoPersonal);

    mostrarNotificacion('Solicitud aprobada y código enviado', 'success');
    cerrarModalAprobarSolicitud();
    cargarSolicitudesPendientes();
    cargarPersonalAdmin();
    actualizarEstadisticasPersonal();
}

function rechazarSolicitud() {
    if (!solicitudActual) return;

    if (!confirm(`¿Rechazar solicitud de ${solicitudActual.nombre}?`)) return;

    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPersonal')) || [];
    const index = solicitudes.findIndex(s => s.id === solicitudActual.id);
    if (index !== -1) {
        solicitudes[index].estado = 'rechazado';
        solicitudes[index].fechaRechazo = new Date().toISOString();
    }
    localStorage.setItem('solicitudesPersonal', JSON.stringify(solicitudes));

    mostrarNotificacion('Solicitud rechazada', 'success');
    cerrarModalAprobarSolicitud();
    cargarSolicitudesPendientes();
}

function rechazarSolicitudDirecta(solicitudId) {
    const solicitudes = JSON.parse(localStorage.getItem('solicitudesPersonal')) || [];
    const solicitud = solicitudes.find(s => s.id === solicitudId);

    if (!solicitud) return;

    if (!confirm(`¿Rechazar solicitud de ${solicitud.nombre}?`)) return;

    const index = solicitudes.findIndex(s => s.id === solicitudId);
    if (index !== -1) {
        solicitudes[index].estado = 'rechazado';
        solicitudes[index].fechaRechazo = new Date().toISOString();
    }
    localStorage.setItem('solicitudesPersonal', JSON.stringify(solicitudes));

    mostrarNotificacion('Solicitud rechazada', 'success');
    cargarSolicitudesPendientes();
}

function cerrarModalAprobarSolicitud() {
    document.getElementById('aprobar-solicitud-modal').style.display = 'none';
    solicitudActual = null;
}

// ============= GESTIÓN DE PERSONAL =============

function cargarPersonalAdmin() {
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const accesos = JSON.parse(localStorage.getItem('accesosPersonal')) || [];
    const tbody = document.getElementById('personal-tbody');

    if (!tbody) return;

    if (personalRegistrado.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: #7f8c8d;">No hay personal registrado</td></tr>';
        return;
    }

    tbody.innerHTML = personalRegistrado.map(personal => {
        // Buscar último acceso
        const accesosPersonal = accesos.filter(a => a.personalId === personal.id);
        const ultimoAcceso = accesosPersonal.length > 0
            ? new Date(accesosPersonal[accesosPersonal.length - 1].fecha).toLocaleString('es-ES')
            : 'Nunca';

        let estadoBadge;
        if (personal.bloqueado) {
            estadoBadge = '<span class="badge-bloqueado"><i class="fas fa-lock"></i> Bloqueado</span>';
        } else if (personal.activo) {
            estadoBadge = '<span class="badge-activo"><i class="fas fa-check-circle"></i> Activo</span>';
        } else {
            estadoBadge = '<span class="badge-inactivo"><i class="fas fa-times-circle"></i> Inactivo</span>';
        }

        return `
            <tr>
                <td><code style="font-weight: 600; letter-spacing: 1px;">${personal.codigo}</code></td>
                <td>${personal.nombre}</td>
                <td>${personal.ci}</td>
                <td>${personal.email}</td>
                <td>${personal.telefono}</td>
                <td>${new Date(personal.fechaRegistro).toLocaleDateString('es-ES')}</td>
                <td>${ultimoAcceso}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button onclick="toggleBloqueoPersonal('${personal.id}')" class="btn-small ${personal.bloqueado ? 'btn-success' : 'btn-warning'}" title="${personal.bloqueado ? 'Desbloquear' : 'Bloquear'}">
                        <i class="fas fa-${personal.bloqueado ? 'unlock' : 'lock'}"></i>
                    </button>
                    <button onclick="verActividadPersonal('${personal.id}')" class="btn-small btn-primary" title="Ver actividad">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button onclick="reenviarCodigoPersonal('${personal.id}')" class="btn-small btn-secondary" title="Reenviar código">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button onclick="eliminarPersonal('${personal.id}')" class="btn-small btn-danger" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarEstadisticasPersonal() {
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const accesos = JSON.parse(localStorage.getItem('accesosPersonal')) || [];
    const hoy = new Date().toDateString();

    const totalPersonal = personalRegistrado.length;
    const personalActivo = personalRegistrado.filter(p => p.activo && !p.bloqueado).length;
    const personalBloqueado = personalRegistrado.filter(p => p.bloqueado).length;
    const accesosHoy = accesos.filter(a => new Date(a.fecha).toDateString() === hoy).length;

    const totalEl = document.getElementById('total-personal');
    const activoEl = document.getElementById('personal-activo');
    const bloqueadoEl = document.getElementById('personal-bloqueado');
    const accesosEl = document.getElementById('accesos-hoy');

    if (totalEl) totalEl.textContent = totalPersonal;
    if (activoEl) activoEl.textContent = personalActivo;
    if (bloqueadoEl) bloqueadoEl.textContent = personalBloqueado;
    if (accesosEl) accesosEl.textContent = accesosHoy;
}

function toggleBloqueoPersonal(personalId) {
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const index = personalRegistrado.findIndex(p => p.id === personalId);

    if (index !== -1) {
        const personal = personalRegistrado[index];
        personal.bloqueado = !personal.bloqueado;

        if (personal.bloqueado) {
            personal.activo = false;
            // Cerrar sesión activa si existe
            const sesion = JSON.parse(localStorage.getItem('sesionPersonal'));
            if (sesion && sesion.personalId === personalId) {
                localStorage.removeItem('sesionPersonal');
            }
        }

        localStorage.setItem('personalRegistrado', JSON.stringify(personalRegistrado));

        const estado = personal.bloqueado ? 'bloqueado' : 'desbloqueado';
        mostrarNotificacion(`Personal ${estado} correctamente`, 'success');

        cargarPersonalAdmin();
        actualizarEstadisticasPersonal();
    }
}

function eliminarPersonal(personalId) {
    if (!confirm('¿Estás seguro de eliminar este personal? Esta acción no se puede deshacer.')) return;

    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const nuevosPersonal = personalRegistrado.filter(p => p.id !== personalId);

    localStorage.setItem('personalRegistrado', JSON.stringify(nuevosPersonal));
    mostrarNotificacion('Personal eliminado correctamente', 'success');

    cargarPersonalAdmin();
    actualizarEstadisticasPersonal();
}

function reenviarCodigoPersonal(personalId) {
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const personal = personalRegistrado.find(p => p.id === personalId);

    if (personal) {
        enviarCodigoEmail(personal);
        mostrarNotificacion('Código reenviado al email del personal', 'success');
    }
}

function enviarCodigoEmail(personal) {
    console.log('📧 Enviando código por email...');
    console.log('Para:', personal.email);
    console.log('Código:', personal.codigo);
    console.log('Nombre:', personal.nombre);

    const mensaje = `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-envelope-open-text" style="font-size: 4rem; color: #27ae60; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 1rem;">Código Generado y Enviado</h3>
            <p style="margin-bottom: 1.5rem;">El código de acceso para <strong>${personal.nombre}</strong> es:</p>
            <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <code style="font-size: 2rem; font-weight: 700; letter-spacing: 3px; color: #27ae60;">${personal.codigo}</code>
            </div>
            <p style="color: #7f8c8d; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> 
                Este código ha sido enviado al email: <strong>${personal.email}</strong>
            </p>
            <p style="color: #7f8c8d; font-size: 0.9rem; margin-top: 1rem;">
                El personal puede usar este código para acceder al sistema.
            </p>
        </div>
    `;

    const modalTemp = document.createElement('div');
    modalTemp.className = 'modal';
    modalTemp.style.display = 'block';
    modalTemp.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            ${mensaje}
            <button onclick="this.closest('.modal').remove()" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                <i class="fas fa-check"></i> Entendido
            </button>
        </div>
    `;
    document.body.appendChild(modalTemp);
}

// ============= REGISTRO DE ACTIVIDAD =============

function verRegistroActividad() {
    cargarActividadCompleta();
    document.getElementById('actividad-modal').style.display = 'block';
}

function verActividadPersonal(personalId) {
    cargarActividadPersonalEspecifico(personalId);
    document.getElementById('actividad-modal').style.display = 'block';
}

function cargarActividadCompleta() {
    const accesos = JSON.parse(localStorage.getItem('accesosPersonal')) || [];
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const lista = document.getElementById('actividad-lista');

    // Llenar selector de personal
    const selector = document.getElementById('filtro-personal-actividad');
    selector.innerHTML = '<option value="todos">Todo el Personal</option>';
    personalRegistrado.forEach(p => {
        selector.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });

    if (accesos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7f8c8d;">No hay actividad registrada</p>';
        return;
    }

    lista.innerHTML = accesos.reverse().map(acceso => `
        <div class="actividad-item">
            <div class="actividad-info">
                <strong>${acceso.nombre}</strong>
                <span>${new Date(acceso.fecha).toLocaleString('es-ES')}</span>
            </div>
            <div class="actividad-badge">
                <i class="fas fa-sign-in-alt"></i> Acceso
            </div>
        </div>
    `).join('');
}

function cargarActividadPersonalEspecifico(personalId) {
    const accesos = JSON.parse(localStorage.getItem('accesosPersonal')) || [];
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];
    const personal = personalRegistrado.find(p => p.id === personalId);
    const lista = document.getElementById('actividad-lista');

    const accesosPersonal = accesos.filter(a => a.personalId === personalId);

    if (accesosPersonal.length === 0) {
        lista.innerHTML = `<p style="text-align: center; padding: 2rem; color: #7f8c8d;">No hay actividad registrada para ${personal.nombre}</p>`;
        return;
    }

    lista.innerHTML = `
        <h4 style="margin-bottom: 1rem;">Actividad de ${personal.nombre}</h4>
        ${accesosPersonal.reverse().map(acceso => `
            <div class="actividad-item">
                <div class="actividad-info">
                    <span>${new Date(acceso.fecha).toLocaleString('es-ES')}</span>
                </div>
                <div class="actividad-badge">
                    <i class="fas fa-sign-in-alt"></i> Acceso
                </div>
            </div>
        `).join('')}
    `;
}

function filtrarActividad() {
    const personalId = document.getElementById('filtro-personal-actividad').value;
    const fecha = document.getElementById('filtro-fecha-actividad').value;

    if (personalId !== 'todos') {
        cargarActividadPersonalEspecifico(personalId);
    } else {
        cargarActividadCompleta();
    }
}

function cerrarModalActividad() {
    document.getElementById('actividad-modal').style.display = 'none';
}

function exportarPersonal() {
    const personalRegistrado = JSON.parse(localStorage.getItem('personalRegistrado')) || [];

    if (personalRegistrado.length === 0) {
        mostrarNotificacion('No hay personal para exportar', 'error');
        return;
    }

    let csv = 'Código,Nombre,C.I.,Email,Teléfono,Estado,Bloqueado,Fecha Registro\n';

    personalRegistrado.forEach(personal => {
        const estado = personal.activo ? 'Activo' : 'Inactivo';
        const bloqueado = personal.bloqueado ? 'Sí' : 'No';
        csv += `${personal.codigo},${personal.nombre},${personal.ci},${personal.email},${personal.telefono},${estado},${bloqueado},${new Date(personal.fechaRegistro).toLocaleDateString('es-ES')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    mostrarNotificacion('Personal exportado correctamente', 'success');
}

function exportarActividad() {
    const accesos = JSON.parse(localStorage.getItem('accesosPersonal')) || [];

    if (accesos.length === 0) {
        mostrarNotificacion('No hay actividad para exportar', 'error');
        return;
    }

    let csv = 'Nombre,Fecha y Hora\n';

    accesos.forEach(acceso => {
        csv += `${acceso.nombre},${new Date(acceso.fecha).toLocaleString('es-ES')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `actividad_personal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    mostrarNotificacion('Actividad exportada correctamente', 'success');
}


// ============= GENERACIÓN DE CÓDIGOS DE ACCESO =============

function generarCodigosAcceso() {
    const cantidad = parseInt(document.getElementById('cantidad-codigos').value) || 1;

    if (cantidad < 1 || cantidad > 50) {
        mostrarNotificacion('La cantidad debe estar entre 1 y 50', 'error');
        return;
    }

    const codigosDisponibles = JSON.parse(localStorage.getItem('codigosAccesoDisponibles')) || [];
    const nuevosCodigos = [];

    for (let i = 0; i < cantidad; i++) {
        const codigo = generarCodigoUnico();
        const nuevoCodigo = {
            codigo: codigo,
            fechaGeneracion: new Date().toISOString(),
            usado: false,
            fechaUso: null
        };
        codigosDisponibles.push(nuevoCodigo);
        nuevosCodigos.push(codigo);
    }

    localStorage.setItem('codigosAccesoDisponibles', JSON.stringify(codigosDisponibles));

    console.log('Códigos generados y guardados:', nuevosCodigos);
    console.log('Total códigos disponibles:', codigosDisponibles);

    // Mostrar códigos generados
    const lista = document.getElementById('codigos-generados-lista');
    lista.style.display = 'block';
    lista.innerHTML = `
        <div style="background: #e8f5e9; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #27ae60;">
            <h4 style="margin-bottom: 1rem; color: #27ae60;">
                <i class="fas fa-check-circle"></i> ${cantidad} Código${cantidad > 1 ? 's' : ''} Generado${cantidad > 1 ? 's' : ''}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                ${nuevosCodigos.map(codigo => `
                    <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <code style="font-size: 1.2rem; font-weight: 700; color: #27ae60; letter-spacing: 2px;">${codigo}</code>
                        <button onclick="copiarCodigo('${codigo}')" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: #f5f5f5; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                            <i class="fas fa-copy"></i> Copiar
                        </button>
                    </div>
                `).join('')}
            </div>
            <p style="margin-top: 1rem; color: #7f8c8d; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> Comparte estos códigos con el personal para que puedan registrarse
            </p>
        </div>
    `;

    mostrarNotificacion(`${cantidad} código${cantidad > 1 ? 's' : ''} generado${cantidad > 1 ? 's' : ''} exitosamente`, 'success');
}

function generarCodigoUnico() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';

    for (let i = 0; i < 8; i++) {
        if (i === 4) codigo += '-';
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Verificar que no exista
    const codigosDisponibles = JSON.parse(localStorage.getItem('codigosAccesoDisponibles')) || [];
    const existe = codigosDisponibles.some(c => c.codigo === codigo);

    if (existe) {
        return generarCodigoUnico(); // Generar otro si existe
    }

    return codigo;
}

function copiarCodigo(codigo) {
    navigator.clipboard.writeText(codigo).then(() => {
        mostrarNotificacion('Código copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback para navegadores antiguos
        const input = document.createElement('input');
        input.value = codigo;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        mostrarNotificacion('Código copiado al portapapeles', 'success');
    });
}

function verCodigosDisponibles() {
    const codigosDisponibles = JSON.parse(localStorage.getItem('codigosAccesoDisponibles')) || [];
    const disponibles = codigosDisponibles.filter(c => !c.usado);
    const usados = codigosDisponibles.filter(c => c.usado);

    if (codigosDisponibles.length === 0) {
        mostrarNotificacion('No hay códigos generados', 'info');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h3><i class="fas fa-key"></i> Códigos de Acceso</h3>
            
            <div style="margin-bottom: 2rem;">
                <h4 style="color: #27ae60; margin-bottom: 1rem;">
                    <i class="fas fa-check-circle"></i> Disponibles (${disponibles.length})
                </h4>
                ${disponibles.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                        ${disponibles.map(c => `
                            <div style="background: #e8f5e9; padding: 1rem; border-radius: 8px; text-align: center;">
                                <code style="font-size: 1.1rem; font-weight: 700; color: #27ae60; letter-spacing: 2px;">${c.codigo}</code>
                                <div style="font-size: 0.75rem; color: #7f8c8d; margin-top: 0.5rem;">
                                    ${new Date(c.fechaGeneracion).toLocaleDateString('es-ES')}
                                </div>
                                <button onclick="copiarCodigo('${c.codigo}')" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; background: white; border: 1px solid #27ae60; border-radius: 4px; cursor: pointer; font-size: 0.8rem; color: #27ae60;">
                                    <i class="fas fa-copy"></i> Copiar
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #7f8c8d; text-align: center;">No hay códigos disponibles</p>'}
            </div>
            
            <div>
                <h4 style="color: #e74c3c; margin-bottom: 1rem;">
                    <i class="fas fa-times-circle"></i> Usados (${usados.length})
                </h4>
                ${usados.length > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${usados.map(c => `
                            <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                                <code style="font-weight: 600; color: #7f8c8d; letter-spacing: 1px;">${c.codigo}</code>
                                <span style="font-size: 0.85rem; color: #7f8c8d;">
                                    Usado: ${new Date(c.fechaUso).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #7f8c8d; text-align: center;">No hay códigos usados</p>'}
            </div>
            
            <div style="margin-top: 2rem; text-align: center;">
                <button onclick="this.closest('.modal').remove()" class="btn-primary">
                    <i class="fas fa-check"></i> Cerrar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}
