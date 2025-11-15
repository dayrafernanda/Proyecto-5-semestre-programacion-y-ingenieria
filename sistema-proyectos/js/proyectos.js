function cargarProyectos() {
    const mainContent = document.getElementById('main-content');
    const proyectos = sistema.proyectos;

    mainContent.innerHTML = `
        <div class="gestion-proyectos">
            <h2>📋 Gestión de Proyectos</h2>
            
            <div class="acciones-superiores">
                <button onclick="mostrarFormularioProyecto()">➕ Crear Proyecto</button>
                <button onclick="generarReporteProyectos()">📊 Generar Reporte</button>
                <input type="text" id="buscar-proyectos" placeholder="🔍 Buscar proyectos..." onkeyup="filtrarProyectos()">
            </div>
            
            <div class="filtros">
                <select onchange="filtrarProyectos()">
                    <option value="">Todos los estados</option>
                    <option value="planificacion">Planificación</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completado">Completado</option>
                </select>
                
                <select onchange="filtrarProyectos()">
                    <option value="">Todas las prioridades</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>
            
            <div class="proyectos-grid" id="proyectos-grid">
                ${proyectos.map(proyecto => `
                    <div class="proyecto-card" data-estado="${proyecto.estado}" data-prioridad="${proyecto.prioridad}">
                        <h3>${proyecto.titulo}</h3>
                        <p>${proyecto.descripcion}</p>
                        
                        <div class="proyecto-info">
                            <span class="estado ${proyecto.estado}">${proyecto.estado}</span>
                            <span class="prioridad ${proyecto.prioridad}">${proyecto.prioridad}</span>
                            <span class="progreso">${proyecto.progreso}%</span>
                        </div>
                        
                        <div class="proyecto-meta">
                            <small><strong>Responsable:</strong> ${proyecto.responsable}</small>
                            <small><strong>Fin:</strong> ${new Date(proyecto.fechaFin).toLocaleDateString()}</small>
                            <small><strong>Presupuesto:</strong> $${proyecto.presupuesto}</small>
                        </div>
                        
                        <div class="proyecto-acciones">
                            <button onclick="editarProyecto(${proyecto.id})">✏️ Editar</button>
                            <button onclick="cambiarEstadoProyecto(${proyecto.id})">🔄 Estado</button>
                            <button onclick="gestionarEquipoProyecto(${proyecto.id})">👥 Equipo</button>
                            <button onclick="actualizarProgresoProyecto(${proyecto.id})">📈 Progreso</button>
                            <button onclick="crearRevisionProyecto(${proyecto.id})">🔍 Revisión</button>
                            <button onclick="eliminarProyecto(${proyecto.id})">🗑️ Eliminar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function mostrarFormularioProyecto() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="formulario-proyecto">
            <h2>➕ Crear Nuevo Proyecto</h2>
            <form onsubmit="crearNuevoProyecto(event)">
                <div class="form-group">
                    <label for="titulo">Título del proyecto:</label>
                    <input type="text" id="titulo" required placeholder="Nombre del proyecto">
                </div>
                
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" required placeholder="Descripción detallada del proyecto"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="fechaInicio">Fecha de inicio:</label>
                        <input type="date" id="fechaInicio" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="fechaFin">Fecha de fin:</label>
                        <input type="date" id="fechaFin" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="presupuesto">Presupuesto:</label>
                        <input type="number" id="presupuesto" required placeholder="0.00">
                    </div>
                    
                    <div class="form-group">
                        <label for="prioridad">Prioridad:</label>
                        <select id="prioridad" required>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit">🚀 Crear Proyecto</button>
                    <button type="button" onclick="cargarProyectos()">← Volver</button>
                </div>
            </form>
        </div>
    `;

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').min = hoy;
    document.getElementById('fechaFin').min = hoy;

    // Cargar borrador si existe (autosave)
    const userId = sistema.usuarioActual?.id;
    if (userId) {
        const draftKey = `borrador_proyecto_${userId}`;
        const draftJson = localStorage.getItem(draftKey);
        if (draftJson) {
            try {
                const draft = JSON.parse(draftJson);
                if (draft.titulo) document.getElementById('titulo').value = draft.titulo;
                if (draft.descripcion) document.getElementById('descripcion').value = draft.descripcion;
                if (draft.fechaInicio) document.getElementById('fechaInicio').value = draft.fechaInicio;
                if (draft.fechaFin) document.getElementById('fechaFin').value = draft.fechaFin;
                if (draft.presupuesto) document.getElementById('presupuesto').value = draft.presupuesto;
                if (draft.prioridad) document.getElementById('prioridad').value = draft.prioridad;
            } catch (e) {
                console.warn('Error parsing draft', e);
            }
        }

        // Autosave cada 2 minutos
        if (window._autosaveInterval) clearInterval(window._autosaveInterval);
        window._autosaveInterval = setInterval(() => {
            const draft = {
                titulo: document.getElementById('titulo').value,
                descripcion: document.getElementById('descripcion').value,
                fechaInicio: document.getElementById('fechaInicio').value,
                fechaFin: document.getElementById('fechaFin').value,
                presupuesto: document.getElementById('presupuesto').value,
                prioridad: document.getElementById('prioridad').value,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(draftKey, JSON.stringify(draft));
            console.log('Borrador guardado automáticamente');
        }, 2 * 60 * 1000);
    }
}

function crearNuevoProyecto(event) {
    event.preventDefault();

    const userId = sistema.usuarioActual?.id;

    const datosProyecto = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: document.getElementById('fechaFin').value,
        presupuesto: parseFloat(document.getElementById('presupuesto').value),
        prioridad: document.getElementById('prioridad').value,
        responsable: sistema.usuarioActual.nombre,
        responsableId: sistema.usuarioActual.id,
        equipo: [sistema.usuarioActual.id]
    };
    // Intentar crear proyecto
    const resultado = sistema.crearProyecto(datosProyecto);
    if (resultado.success) {
        alert(resultado.mensaje);
        // Limpiar borrador si existía
        if (userId) localStorage.removeItem(`borrador_proyecto_${userId}`);
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function editarProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;

    // Verificar lock de edición
    const now = Date.now();
    if (proyecto.lockedBy && proyecto.lockedBy !== sistema.usuarioActual.id && proyecto.lockedUntil && new Date(proyecto.lockedUntil).getTime() > now) {
        const usuarioLock = sistema.usuarios.find(u => u.id === proyecto.lockedBy);
        alert(`Este proyecto está siendo editado por ${usuarioLock?.nombre || 'otro usuario'}. Intenta más tarde.`);
        return;
    }

    // Colocar lock temporal (10 minutos)
    proyecto.lockedBy = sistema.usuarioActual.id;
    proyecto.lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    sistema.editarProyecto(id, { lockedBy: proyecto.lockedBy, lockedUntil: proyecto.lockedUntil });

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="formulario-proyecto">
            <h2>✏️ Editar Proyecto</h2>
            <form onsubmit="actualizarProyecto(event, ${id})">
                <input type="text" id="edit-titulo" value="${proyecto.titulo}" required>
                <textarea id="edit-descripcion" required>${proyecto.descripcion}</textarea>
                <input type="number" id="edit-presupuesto" value="${proyecto.presupuesto}" required>
                <select id="edit-prioridad" required>
                    <option value="baja" ${proyecto.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                    <option value="media" ${proyecto.prioridad === 'media' ? 'selected' : ''}>Media</option>
                    <option value="alta" ${proyecto.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                </select>
                <button type="submit">💾 Guardar Cambios</button>
                <button type="button" onclick="cancelarEdicionProyecto(${id})">❌ Cancelar</button>
            </form>
        </div>
    `;
}

function actualizarProyecto(event, id) {
    event.preventDefault();

    const datosActualizados = {
        titulo: document.getElementById('edit-titulo').value,
        descripcion: document.getElementById('edit-descripcion').value,
        presupuesto: parseFloat(document.getElementById('edit-presupuesto').value),
        prioridad: document.getElementById('edit-prioridad').value
    };

    const resultado = sistema.editarProyecto(id, datosActualizados);
    if (resultado.success) {
        alert(resultado.mensaje);
        // Liberar lock
        const proyecto = sistema.getProyecto(id);
        if (proyecto) {
            delete proyecto.lockedBy;
            delete proyecto.lockedUntil;
            sistema.guardarDatos();
        }
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function cancelarEdicionProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (proyecto && proyecto.lockedBy === sistema.usuarioActual.id) {
        delete proyecto.lockedBy;
        delete proyecto.lockedUntil;
        sistema.guardarDatos();
    }
    cargarProyectos();
}

function eliminarProyecto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        const resultado = sistema.eliminarProyecto(id);
        alert(resultado.mensaje);
        cargarProyectos();
    }
}

function cambiarEstadoProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;

    const nuevoEstado = prompt(
        'Cambiar estado del proyecto:\n(planificacion, en_progreso, completado, pendiente)',
        proyecto.estado
    );

    if (nuevoEstado) {
        const resultado = sistema.cambiarEstadoProyecto(id, nuevoEstado);
        alert(resultado.mensaje);
        cargarProyectos();
    }
}

function crearRevisionProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;

    const revisores = sistema.usuarios.filter(u => u.activo && u.id !== sistema.usuarioActual.id);

    let contenido = `
        <h3>🔍 Crear Revisión para: ${proyecto.titulo}</h3>
        <form onsubmit="crearRevisionDesdeProyecto(event, ${id})">
            <div class="form-group">
                <label>Tipo de revisión:</label>
                <select id="rev-tipo-modal" required>
                    <option value="calidad">Control de Calidad</option>
                    <option value="avance">Revisión de Avance</option>
                    <option value="final">Revisión Final</option>
                </select>
            </div>
            <div class="form-group">
                <label>Revisor:</label>
                <select id="rev-revisor-modal" required>
                    ${revisores.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Descripción:</label>
                <textarea id="rev-descripcion-modal" required placeholder="Descripción de la revisión..."></textarea>
            </div>
            <button type="submit">📝 Crear Revisión</button>
        </form>
    `;

    mostrarModal(contenido);
}

function crearRevisionDesdeProyecto(event, proyectoId) {
    event.preventDefault();

    const datosRevision = {
        proyectoId: proyectoId,
        tipo: document.getElementById('rev-tipo-modal').value,
        revisorId: parseInt(document.getElementById('rev-revisor-modal').value),
        descripcion: document.getElementById('rev-descripcion-modal').value
    };

    const resultado = sistema.crearRevision(datosRevision);
    if (resultado.success) {
        alert(resultado.mensaje);
        cerrarModal();
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function gestionarEquipoProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;

    const usuariosDisponibles = sistema.usuarios.filter(u => u.activo);

    let contenido = `
        <h3>👥 Gestionar Equipo - ${proyecto.titulo}</h3>
        <div class="equipo-actual">
            <h4>Miembros actuales:</h4>
            ${proyecto.equipo.map(userId => {
        const usuario = sistema.usuarios.find(u => u.id === userId);
        return usuario ? `<div>${usuario.nombre} <button onclick="removerDelEquipo(${id}, ${userId})">❌</button></div>` : '';
    }).join('')}
        </div>
        <div class="agregar-miembro">
            <h4>Agregar miembro:</h4>
            <select id="nuevo-miembro">
                ${usuariosDisponibles.map(u => `<option value="${u.id}">${u.nombre} (${u.email})</option>`).join('')}
            </select>
            <button onclick="agregarAlEquipo(${id})">➕ Agregar</button>
        </div>
    `;

    mostrarModal(contenido);
}

function agregarAlEquipo(idProyecto) {
    const idUsuario = parseInt(document.getElementById('nuevo-miembro').value);
    const resultado = sistema.gestionarEquipo(idProyecto, 'agregar', idUsuario);
    alert(resultado.mensaje);
    cerrarModal();
    gestionarEquipoProyecto(idProyecto);
}

function removerDelEquipo(idProyecto, idUsuario) {
    const resultado = sistema.gestionarEquipo(idProyecto, 'remover', idUsuario);
    alert(resultado.mensaje);
    gestionarEquipoProyecto(idProyecto);
}

function actualizarProgresoProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;

    const nuevoProgreso = parseInt(prompt('Nuevo progreso (0-100):', proyecto.progreso));
    if (!isNaN(nuevoProgreso)) {
        const resultado = sistema.actualizarProgreso(id, nuevoProgreso);
        alert(resultado.mensaje);
        cargarProyectos();
    }
}

function filtrarProyectos() {
    const busqueda = document.getElementById('buscar-proyectos').value.toLowerCase();
    const proyectos = document.querySelectorAll('.proyecto-card');

    proyectos.forEach(proyecto => {
        const titulo = proyecto.querySelector('h3').textContent.toLowerCase();
        const descripcion = proyecto.querySelector('p').textContent.toLowerCase();
        const estado = proyecto.dataset.estado;
        const prioridad = proyecto.dataset.prioridad;

        const coincideBusqueda = titulo.includes(busqueda) || descripcion.includes(busqueda);

        if (coincideBusqueda) {
            proyecto.style.display = 'block';
        } else {
            proyecto.style.display = 'none';
        }
    });
}