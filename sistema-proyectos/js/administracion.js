function cargarAdministracion() {
    if (!sistema.esAdministrador()) {
        alert('Solo los administradores pueden acceder a esta sección');
        cargarDashboard();
        return;
    }

    const mainContent = document.getElementById('main-content');
    const usuarios = sistema.usuarios;
    const reporte = sistema.generarReporteProyectos();

    mainContent.innerHTML = `
        <div class="gestion-administracion">
            <h2>⚙️ Panel de Administración</h2>
            
            <div class="admin-section">
                <h3>📊 Reporte del Sistema</h3>
                <div class="reporte-stats">
                    <div class="stat-card">
                        <h4>Total Proyectos</h4>
                        <p>${reporte.estadisticas.totalProyectos}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Proyectos Activos</h4>
                        <p>${reporte.estadisticas.proyectosActivos}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Proyectos Completados</h4>
                        <p>${reporte.estadisticas.proyectosCompletados}</p>
                    </div>
                    <div class="stat-card">
                        <h4>Proyectos Atrasados</h4>
                        <p>${reporte.estadisticas.proyectosAtrasados}</p>
                    </div>
                </div>
                
                <button onclick="descargarReporte()">📥 Descargar Reporte</button>
                <button onclick="exportarBackup()">🗄️ Exportar Backup</button>
            </div>
            
            <div class="admin-section">
                <h3>👥 Gestión de Usuarios</h3>
                <button onclick="mostrarFormularioNuevoUsuario()">➕ Nuevo Usuario</button>
                
                <div class="usuarios-list">
                    ${usuarios.map(usuario => `
                        <div class="usuario-card">
                            <h4>${usuario.nombre}</h4>
                            <p>${usuario.email} - ${usuario.rol}</p>
                            <small>Registrado: ${new Date(usuario.fechaRegistro).toLocaleDateString()}</small>
                            <div class="usuario-acciones">
                                ${usuario.activo ?
            `<button onclick="desactivarUsuario(${usuario.id})">🚫 Desactivar</button>` :
            `<button onclick="activarUsuario(${usuario.id})">✅ Activar</button>`
        }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generarReporteProyectos() {
    const reporte = sistema.generarReporteProyectos();
    let contenido = `
        <h3>📊 Reporte de Proyectos</h3>
        <div class="reporte-detallado">
            <p><strong>Generado por:</strong> ${reporte.generadoPor}</p>
            <p><strong>Fecha:</strong> ${new Date(reporte.fechaGeneracion).toLocaleString()}</p>
            
            <h4>Estadísticas:</h4>
            <ul>
                <li>Total de proyectos: ${reporte.estadisticas.totalProyectos}</li>
                <li>Proyectos activos: ${reporte.estadisticas.proyectosActivos}</li>
                <li>Proyectos completados: ${reporte.estadisticas.proyectosCompletados}</li>
                <li>Proyectos atrasados: ${reporte.estadisticas.proyectosAtrasados}</li>
                <li>Progreso promedio: ${reporte.estadisticas.promedioProgreso.toFixed(1)}%</li>
            </ul>
        </div>
    `;

    mostrarModal(contenido);
}

function descargarReporte() {
    const reporte = sistema.generarReporteProyectos();
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-proyectos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportarBackup() {
    if (!confirm('Exportar backup completo del sistema? Esto descargará un archivo JSON con todos los datos.')) return;

    const backup = {
        usuarios: sistema.usuarios,
        proyectos: sistema.proyectos,
        revisiones: sistema.revisiones,
        notificaciones: sistema.notificaciones,
        periodos: gestorPeriodos.periodos,
        asignaciones: gestorAsignacion.asignaciones,
        auditorias: gestorAuditoria.auditorias,
        historial: gestorHistorial.historial,
        fechaExport: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-sistema-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Backup exportado');
}

function mostrarFormularioNuevoUsuario() {
    mostrarRegistro();
    cargarAdministracion();
}

function desactivarUsuario(id) {
    const resultado = sistema.gestionarUsuarios('desactivar', { id });
    if (resultado.success) {
        alert(resultado.mensaje);
        cargarAdministracion();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function activarUsuario(id) {
    const usuario = sistema.usuarios.find(u => u.id === id);
    if (usuario) {
        usuario.activo = true;
        sistema.guardarDatos();
        alert('Usuario activado');
        cargarAdministracion();
    }
}

function cargarDashboard() {
    const mainContent = document.getElementById('main-content');
    const proyectos = sistema.proyectos;
    const notificaciones = sistema.obtenerNotificacionesUsuario(sistema.usuarioActual?.id);
    const revisionesPendientes = sistema.revisiones.filter(r => r.estado === 'pendiente').length;

    mainContent.innerHTML = `
        <div class="dashboard">
            <h2>📊 Dashboard Principal</h2>
            
            <div class="welcome-banner">
                <h3>¡Bienvenido, ${sistema.usuarioActual?.nombre || 'Invitado'}!</h3>
                <p>Sistema de Gestión de Proyectos - 21 Casos de Uso Implementados</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>📋 Total Proyectos</h3>
                    <p>${proyectos.length}</p>
                </div>
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>🚀 En Progreso</h3>
                    <p>${proyectos.filter(p => p.estado === 'en_progreso').length}</p>
                </div>
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>✅ Completados</h3>
                    <p>${proyectos.filter(p => p.estado === 'completado').length}</p>
                </div>
                <div class="stat-card" onclick="cargarRevisiones()" style="cursor: pointer;">
                    <h3>🔍 Revisiones Pendientes</h3>
                    <p>${revisionesPendientes}</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>📋 Proyectos Recientes</h3>
                    <div class="proyectos-recientes">
                        ${proyectos.slice(0, 5).map(proyecto => `
                            <div class="proyecto-mini">
                                <h4>${proyecto.titulo}</h4>
                                <span class="estado-mini ${proyecto.estado}">${proyecto.estado}</span>
                                <span class="progreso-mini">${proyecto.progreso}%</span>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="cargarProyectos()">Ver todos los proyectos</button>
                </div>
                
                <div class="dashboard-section">
                    <h3>🔔 Notificaciones Recientes</h3>
                    <div class="notificaciones-recientes">
                        ${notificaciones.slice(0, 5).map(notif => `
                            <div class="notificacion-mini ${notif.leida ? 'leida' : 'nueva'}">
                                <strong>${notif.titulo}</strong>
                                <p>${notif.mensaje}</p>
                                <small>${new Date(notif.fecha).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="cargarNotificaciones()">Ver todas las notificaciones</button>
                </div>
            </div>
        </div>
    `;
}