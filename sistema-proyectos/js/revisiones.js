function cargarRevisiones() {
    const mainContent = document.getElementById('main-content');
    const revisiones = sistema.revisiones;

    mainContent.innerHTML = `
        <div class="gestion-revisiones">
            <h2>🔍 Sistema de Revisiones</h2>
            
            <div class="acciones-superiores">
                <button onclick="mostrarFormularioRevision()">➕ Nueva Revisión</button>
                <button onclick="verTodasRevisiones()">📋 Ver Todas</button>
            </div>
            
            <div class="revisiones-list">
                ${revisiones.slice(0, 10).map(revision => `
                    <div class="revision-card">
                        <h3>Revisión #${revision.id}</h3>
                        <p><strong>Proyecto:</strong> ${sistema.getProyecto(revision.proyectoId)?.titulo || 'N/A'}</p>
                        <p><strong>Tipo:</strong> ${revision.tipo}</p>
                        <div class="revision-info">
                            <span class="estado ${revision.estado}">${revision.estado}</span>
                            <small>${new Date(revision.fechaCreacion).toLocaleDateString()}</small>
                        </div>
                        <div class="revision-acciones">
                            <button onclick="verDetallesRevision(${revision.id})">👁️ Ver</button>
                            <button onclick="agregarComentarioRevision(${revision.id})">💬 Comentar</button>
                            ${revision.estado === 'pendiente' ? `
                                <button onclick="aprobarRevision(${revision.id})">✅ Aprobar</button>
                                <button onclick="rechazarRevision(${revision.id})">❌ Rechazar</button>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function mostrarFormularioRevision() {
    const proyectos = sistema.proyectos;
    const revisores = sistema.usuarios.filter(u => u.activo);

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="formulario-proyecto">
            <h2>➕ Nueva Revisión</h2>
            <form onsubmit="crearNuevaRevision(event)">
                <div class="form-group">
                    <label for="rev-proyecto">Proyecto:</label>
                    <select id="rev-proyecto" required>
                        ${proyectos.map(p => `<option value="${p.id}">${p.titulo}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="rev-tipo">Tipo de revisión:</label>
                    <select id="rev-tipo" required>
                        <option value="calidad">Control de Calidad</option>
                        <option value="avance">Revisión de Avance</option>
                        <option value="final">Revisión Final</option>
                        <option value="documentacion">Revisión de Documentación</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="rev-revisor">Revisor:</label>
                    <select id="rev-revisor" required>
                        ${revisores.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="rev-descripcion">Descripción:</label>
                    <textarea id="rev-descripcion" required placeholder="Descripción de la revisión..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit">📝 Crear Revisión</button>
                    <button type="button" onclick="cargarRevisiones()">← Volver</button>
                </div>
            </form>
        </div>
    `;
}

function crearNuevaRevision(event) {
    event.preventDefault();

    const datosRevision = {
        proyectoId: parseInt(document.getElementById('rev-proyecto').value),
        tipo: document.getElementById('rev-tipo').value,
        revisorId: parseInt(document.getElementById('rev-revisor').value),
        descripcion: document.getElementById('rev-descripcion').value
    };

    const resultado = sistema.crearRevision(datosRevision);
    if (resultado.success) {
        alert(resultado.mensaje);
        cargarRevisiones();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function aprobarRevision(id) {
    const comentarios = prompt('Comentarios de aprobación:');
    const resultado = sistema.aprobarRevision(id, comentarios);
    alert(resultado.mensaje);
    cargarRevisiones();
}

function rechazarRevision(id) {
    const motivo = prompt('Motivo del rechazo:');
    if (motivo) {
        const resultado = sistema.rechazarRevision(id, motivo);
        alert(resultado.mensaje);
        cargarRevisiones();
    }
}

function agregarComentarioRevision(id) {
    const comentario = prompt('Nuevo comentario:');
    if (comentario) {
        const resultado = sistema.agregarComentarioRevision(id, comentario);
        if (resultado.success) {
            // Notificar al creador de la revisión (propietario del proyecto)
            const revision = sistema.revisiones.find(r => r.id === id);
            if (revision) {
                const destinatario = revision.creadaPor || revision.creadorId || null;
                if (destinatario) {
                    sistema.crearNotificacion(
                        'revision',
                        destinatario,
                        'Nueva retroalimentación en tu revisión',
                        `Tu revisión para el proyecto "${sistema.getProyecto(revision.proyectoId)?.titulo || 'proyecto'}" recibió un nuevo comentario.`
                    );
                }
            }
        }
        alert(resultado.mensaje);
    }
}

function verDetallesRevision(id) {
    const revision = sistema.revisiones.find(r => r.id === id);
    if (!revision) return;

    const proyecto = sistema.getProyecto(revision.proyectoId);
    const revisor = sistema.usuarios.find(u => u.id === revision.revisorId);

    let contenido = `
        <h3>🔍 Detalles de Revisión #${revision.id}</h3>
        <div class="detalles-revision">
            <p><strong>Proyecto:</strong> ${proyecto?.titulo || 'N/A'}</p>
            <p><strong>Tipo:</strong> ${revision.tipo}</p>
            <p><strong>Revisor:</strong> ${revisor?.nombre || 'N/A'}</p>
            <p><strong>Estado:</strong> <span class="estado ${revision.estado}">${revision.estado}</span></p>
            <p><strong>Descripción:</strong> ${revision.descripcion}</p>
            <p><strong>Fecha creación:</strong> ${new Date(revision.fechaCreacion).toLocaleString()}</p>
        </div>
    `;

    if (revision.comentarios.length > 0) {
        contenido += `
            <div class="comentarios-revision">
                <h4>💬 Comentarios:</h4>
                ${revision.comentarios.map(comentario => `
                    <div class="comentario">
                        <strong>${comentario.autor}</strong> 
                        <small>${new Date(comentario.fecha).toLocaleString()}</small>
                        <p>${comentario.comentario}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    mostrarModal(contenido);
}


function cargarNotificaciones() {
    const mainContent = document.getElementById('main-content');
    const notificaciones = sistema.obtenerNotificacionesUsuario(sistema.usuarioActual?.id);

    mainContent.innerHTML = `
        <div class="gestion-notificaciones">
            <h2>🔔 Sistema de Notificaciones</h2>
            
            <div class="notificaciones-list">
                ${notificaciones.map(notif => `
                    <div class="notificacion-item ${notif.leida ? 'leida' : 'nueva'}">
                        <div class="notificacion-header">
                            <h4>${notif.titulo}</h4>
                            <span class="notificacion-tipo ${notif.tipo}">${notif.tipo}</span>
                            ${!notif.leida ? '<button onclick="marcarNotificacionLeida(' + notif.id + ')">📌 Marcar leída</button>' : ''}
                        </div>
                        <p>${notif.mensaje}</p>
                        <small>${new Date(notif.fecha).toLocaleString()}</small>
                    </div>
                `).join('')}
                
                ${notificaciones.length === 0 ? '<p class="sin-notificaciones">No hay notificaciones</p>' : ''}
            </div>
        </div>
    `;
}

function marcarNotificacionLeida(id) {
    sistema.marcarNotificacionLeida(id);
    cargarNotificaciones();
}