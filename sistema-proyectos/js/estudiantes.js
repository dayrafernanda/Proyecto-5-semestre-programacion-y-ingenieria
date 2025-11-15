function cargarDashboardEstudiante() {
    const mainContent = document.getElementById('main-content');
    const entregas = sistema.obtenerEntregasEstudiante(sistema.usuarioActual.id);
    const proyectos = sistema.proyectos.filter(p =>
        p.equipo && p.equipo.includes(sistema.usuarioActual.id)
    );

    mainContent.innerHTML = `
        <div class="dashboard-estudiante">
            <h2>🎓 Panel del Estudiante</h2>
            
            <div class="welcome-banner">
                <h3>¡Bienvenido, ${sistema.usuarioActual.nombre}!</h3>
                <p>Aquí puedes gestionar tus entregas y proyectos</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📁 Proyectos Asignados</h3>
                    <p>${proyectos.length}</p>
                </div>
                <div class="stat-card">
                    <h3>📤 Entregas Realizadas</h3>
                    <p>${entregas.length}</p>
                </div>
                <div class="stat-card">
                    <h3>✅ Entregas Calificadas</h3>
                    <p>${entregas.filter(e => e.estado === 'calificado').length}</p>
                </div>
                <div class="stat-card">
                    <h3>⏳ Pendientes</h3>
                    <p>${entregas.filter(e => e.estado === 'pendiente_revision').length}</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>📋 Mis Proyectos</h3>
                    <div class="proyectos-list">
                        ${proyectos.map(proyecto => `
                            <div class="proyecto-estudiante">
                                <h4>${proyecto.titulo}</h4>
                                <p>${proyecto.descripcion}</p>
                                <div class="proyecto-acciones">
                                    <button onclick="verDetallesProyectoEstudiante(${proyecto.id})">👁️ Ver Detalles</button>
                                    <button onclick="mostrarFormularioEntrega(${proyecto.id})">📤 Subir Entrega</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>📝 Mis Últimas Entregas</h3>
                    <div class="entregas-list">
                        ${entregas.slice(0, 5).map(entrega => `
                            <div class="entrega-item ${entrega.estado}">
                                <h4>${entrega.proyecto}</h4>
                                <p><strong>Fecha:</strong> ${new Date(entrega.fechaEntrega).toLocaleDateString()}</p>
                                <p><strong>Estado:</strong> <span class="estado-entrega ${entrega.estado}">${entrega.estado}</span></p>
                                ${entrega.calificacion ? `<p><strong>Calificación:</strong> ${entrega.calificacion}/100</p>` : ''}
                                <button onclick="verDetallesEntrega(${entrega.proyectoId}, ${entrega.id})">📋 Ver Detalles</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mostrarFormularioEntrega(proyectoId) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto) return;

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="formulario-entrega">
            <h2>📤 Subir Entrega - ${proyecto.titulo}</h2>
            <form onsubmit="subirEntrega(event, ${proyectoId})">
                <div class="form-group">
                    <label for="titulo-entrega">Título de la entrega:</label>
                    <input type="text" id="titulo-entrega" required placeholder="Ej: Primera entrega - Módulo de autenticación">
                </div>
                
                <div class="form-group">
                    <label for="descripcion-entrega">Descripción:</label>
                    <textarea id="descripcion-entrega" required placeholder="Describe qué incluye esta entrega..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="enlace-entrega">Enlace o URL (opcional):</label>
                    <input type="url" id="enlace-entrega" placeholder="https://github.com/usuario/proyecto">
                </div>
                
                <div class="form-group">
                    <label for="archivo-entrega">Archivos (simulado):</label>
                    <input type="text" id="archivo-entrega" placeholder="Nombre del archivo...">
                    <small>Nota: En un sistema real aquí iría un input type="file"</small>
                </div>
                
                <div class="form-group">
                    <label for="comentarios-entrega">Comentarios adicionales:</label>
                    <textarea id="comentarios-entrega" placeholder="Algún comentario para el revisor..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit">🚀 Subir Entrega</button>
                    <button type="button" onclick="cargarDashboardEstudiante()">← Volver</button>
                </div>
            </form>
        </div>
    `;
}

function subirEntrega(event, proyectoId) {
    event.preventDefault();

    const datosEntrega = {
        titulo: document.getElementById('titulo-entrega').value,
        descripcion: document.getElementById('descripcion-entrega').value,
        enlace: document.getElementById('enlace-entrega').value || null,
        archivo: document.getElementById('archivo-entrega').value || null,
        comentarios: document.getElementById('comentarios-entrega').value || ''
    };

    const resultado = sistema.crearEntrega(proyectoId, datosEntrega);
    if (resultado.success) {
        alert(resultado.mensaje);
        cargarDashboardEstudiante();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function verDetallesEntrega(proyectoId, entregaId) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto || !proyecto.entregas) return;

    const entrega = proyecto.entregas.find(e => e.id === entregaId);
    if (!entrega) return;

    let contenido = `
        <h3>📋 Detalles de Entrega</h3>
        <div class="detalles-entrega">
            <p><strong>Proyecto:</strong> ${proyecto.titulo}</p>
            <p><strong>Título:</strong> ${entrega.titulo}</p>
            <p><strong>Descripción:</strong> ${entrega.descripcion}</p>
            <p><strong>Fecha de entrega:</strong> ${new Date(entrega.fechaEntrega).toLocaleString()}</p>
            <p><strong>Estado:</strong> <span class="estado-entrega ${entrega.estado}">${entrega.estado}</span></p>
            ${entrega.enlace ? `<p><strong>Enlace:</strong> <a href="${entrega.enlace}" target="_blank">${entrega.enlace}</a></p>` : ''}
            ${entrega.archivo ? `<p><strong>Archivo:</strong> ${entrega.archivo}</p>` : ''}
            ${entrega.calificacion ? `<p><strong>Calificación:</strong> ${entrega.calificacion}/100</p>` : ''}
        </div>
    `;

    if (entrega.comentarios.length > 0) {
        contenido += `
            <div class="comentarios-entrega">
                <h4>💬 Comentarios del Revisor:</h4>
                ${entrega.comentarios.map(comentario => `
                    <div class="comentario">
                        <strong>${comentario.revisor}</strong> 
                        <small>${new Date(comentario.fecha).toLocaleString()}</small>
                        <p>${comentario.comentario}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Si el usuario actual es revisor o responsable (o admin) y no es el estudiante autor, mostrar formulario de calificación
    const rolActual = sistema.usuarioActual?.rol;
    const esAutorizadoACalificar = rolActual === 'revisor' || rolActual === 'responsable' || rolActual === 'admin';
    const noEsAutor = sistema.usuarioActual && sistema.usuarioActual.id !== entrega.estudianteId;

    if (esAutorizadoACalificar && noEsAutor) {
        contenido += `
            <div class="formulario-calificacion">
                <h4>🧾 Calificar Entrega</h4>
                <div class="form-group">
                    <label for="calificacion-input">Calificación (0-100):</label>
                    <input type="number" id="calificacion-input" min="0" max="100" value="${entrega.calificacion || ''}">
                </div>
                <div class="form-group">
                    <label for="calificacion-comentario">Comentarios para el estudiante (opcional):</label>
                    <textarea id="calificacion-comentario" placeholder="Feedback, observaciones..."></textarea>
                </div>
                <div class="form-actions">
                    <button onclick="calificarEntregaFromModal(${proyectoId}, ${entregaId})">💾 Enviar Calificación</button>
                </div>
            </div>
        `;
    }

    mostrarModal(contenido);
}

function calificarEntregaFromModal(proyectoId, entregaId) {
    const input = document.getElementById('calificacion-input');
    const comentario = document.getElementById('calificacion-comentario')?.value || '';
    if (!input) return alert('No se encontró el formulario de calificación');

    const calificacion = Number(input.value);
    if (isNaN(calificacion) || calificacion < 0 || calificacion > 100) {
        return alert('Ingrese una calificación válida entre 0 y 100');
    }

    const resultado = sistema.calificarEntrega(proyectoId, entregaId, calificacion, comentario);
    if (resultado.success) {
        alert(resultado.mensaje);
        cerrarModal();
        // Refrescar dashboard correspondiente
        cargarDashboard();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function verDetallesProyectoEstudiante(proyectoId) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto) return;

    const entregasProyecto = proyecto.entregas ?
        proyecto.entregas.filter(e => e.estudianteId === sistema.usuarioActual.id) : [];

    let contenido = `
        <h3>📁 Detalles del Proyecto</h3>
        <div class="detalles-proyecto-estudiante">
            <p><strong>Título:</strong> ${proyecto.titulo}</p>
            <p><strong>Descripción:</strong> ${proyecto.descripcion}</p>
            <p><strong>Responsable:</strong> ${proyecto.responsable}</p>
            <p><strong>Estado:</strong> <span class="estado ${proyecto.estado}">${proyecto.estado}</span></p>
            <p><strong>Fecha fin:</strong> ${new Date(proyecto.fechaFin).toLocaleDateString()}</p>
        </div>
        
        <div class="entregas-proyecto">
            <h4>📝 Mis Entregas para este Proyecto</h4>
            ${entregasProyecto.length > 0 ? `
                <div class="lista-entregas">
                    ${entregasProyecto.map(entrega => `
                        <div class="entrega-item ${entrega.estado}">
                            <h5>${entrega.titulo}</h5>
                            <p><strong>Fecha:</strong> ${new Date(entrega.fechaEntrega).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> <span class="estado-entrega ${entrega.estado}">${entrega.estado}</span></p>
                            ${entrega.calificacion ? `<p><strong>Calificación:</strong> ${entrega.calificacion}/100</p>` : ''}
                            <button onclick="verDetallesEntrega(${proyectoId}, ${entrega.id})">👁️ Ver Detalles</button>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No hay entregas para este proyecto.</p>'}
        </div>
        
        <div class="acciones-proyecto">
            <button onclick="mostrarFormularioEntrega(${proyectoId})" class="btn-primary">📤 Nueva Entrega</button>
        </div>
    `;

    mostrarModal(contenido);
}