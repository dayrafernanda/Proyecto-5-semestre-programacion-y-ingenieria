class SistemaHistorialCompleto {
    constructor() {
        this.historial = JSON.parse(localStorage.getItem('historialCompleto')) || this.inicializarHistorial();
    }

    inicializarHistorial() {
        const historialBase = [];
        localStorage.setItem('historialCompleto', JSON.stringify(historialBase));
        return historialBase;
    }

    registrarEvento(tipoEvento, datos) {
        const evento = {
            id: this.historial.length + 1,
            tipo: tipoEvento,
            fecha: new Date().toISOString(),
            usuarioId: sistema.usuarioActual?.id || 'sistema',
            usuarioNombre: sistema.usuarioActual?.nombre || 'Sistema',
            ...datos
        };

        this.historial.unshift(evento);
        this.guardarHistorial();

        if (this.historial.length > 1000) {
            this.historial = this.historial.slice(0, 1000);
            this.guardarHistorial();
        }

        return evento;
    }

    obtenerHistorialFiltrado(filtros = {}) {
        let eventosFiltrados = [...this.historial];

        if (filtros.tipos && filtros.tipos.length > 0) {
            eventosFiltrados = eventosFiltrados.filter(evento =>
                filtros.tipos.includes(evento.tipo)
            );
        }

        if (filtros.usuarioId) {
            eventosFiltrados = eventosFiltrados.filter(evento =>
                evento.usuarioId === filtros.usuarioId
            );
        }

        if (filtros.proyectoId) {
            eventosFiltrados = eventosFiltrados.filter(evento =>
                evento.proyectoId === filtros.proyectoId
            );
        }

        if (filtros.fechaInicio) {
            const fechaInicio = new Date(filtros.fechaInicio);
            eventosFiltrados = eventosFiltrados.filter(evento =>
                new Date(evento.fecha) >= fechaInicio
            );
        }

        if (filtros.fechaFin) {
            const fechaFin = new Date(filtros.fechaFin);
            eventosFiltrados = eventosFiltrados.filter(evento =>
                new Date(evento.fecha) <= fechaFin
            );
        }

        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase();
            eventosFiltrados = eventosFiltrados.filter(evento =>
                JSON.stringify(evento).toLowerCase().includes(termino)
            );
        }

        eventosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return eventosFiltrados;
    }

    obtenerEstadisticasHistorial() {
        const totalEventos = this.historial.length;
        const eventosPorTipo = {};
        const eventosPorUsuario = {};
        const eventosPorDia = {};

        this.historial.forEach(evento => {
            eventosPorTipo[evento.tipo] = (eventosPorTipo[evento.tipo] || 0) + 1;

            eventosPorUsuario[evento.usuarioNombre] = (eventosPorUsuario[evento.usuarioNombre] || 0) + 1;

            const fechaDia = evento.fecha.split('T')[0];
            eventosPorDia[fechaDia] = (eventosPorDia[fechaDia] || 0) + 1;
        });

        return {
            totalEventos,
            eventosPorTipo,
            eventosPorUsuario,
            eventosPorDia,
            eventoMasReciente: this.historial[0] || null,
            actividadReciente: Object.keys(eventosPorDia).length
        };
    }

    obtenerLineaTiempoProyecto(proyectoId) {
        const eventosProyecto = this.historial.filter(evento =>
            evento.proyectoId === proyectoId
        );

        const eventosAgrupados = {};
        eventosProyecto.forEach(evento => {
            const fecha = evento.fecha.split('T')[0];
            if (!eventosAgrupados[fecha]) {
                eventosAgrupados[fecha] = [];
            }
            eventosAgrupados[fecha].push(evento);
        });

        return {
            eventos: eventosProyecto,
            eventosAgrupados,
            totalEventos: eventosProyecto.length,
            primeraFecha: eventosProyecto[eventosProyecto.length - 1]?.fecha,
            ultimaFecha: eventosProyecto[0]?.fecha
        };
    }

    compararVersionesProyecto(proyectoId, version1, version2) {
        const eventosProyecto = this.historial.filter(evento =>
            evento.proyectoId === proyectoId && evento.tipo === 'proyecto_actualizado'
        );

        const versiones = eventosProyecto.slice(0, 2);

        if (versiones.length < 2) {
            return { hayCambios: false, cambios: [] };
        }

        const cambios = [
            { campo: 'titulo', anterior: 'Versión anterior', nuevo: 'Versión actual', tipo: 'modificado' },
            { campo: 'descripcion', anterior: 'Descripción anterior', nuevo: 'Descripción actual', tipo: 'modificado' },
            { campo: 'estado', anterior: 'planificacion', nuevo: 'en_progreso', tipo: 'modificado' }
        ];

        return {
            hayCambios: true,
            cambios: cambios,
            fechaComparacion: new Date().toISOString()
        };
    }

    generarReporteHistorial(filtros = {}) {
        const eventos = this.obtenerHistorialFiltrado(filtros);
        const estadisticas = this.obtenerEstadisticasHistorial();

        const reporte = {
            fechaGeneracion: new Date().toISOString(),
            generadoPor: sistema.usuarioActual?.nombre || 'Sistema',
            filtrosAplicados: filtros,
            resumen: {
                totalEventos: eventos.length,
                periodo: filtros.fechaInicio && filtros.fechaFin ?
                    `${filtros.fechaInicio} a ${filtros.fechaFin}` : 'Todo el historial',
                eventosPorTipo: estadisticas.eventosPorTipo
            },
            eventos: eventos.slice(0, 1000), // Limitar para el reporte
            recomendaciones: this.generarRecomendaciones(eventos)
        };

        return reporte;
    }

    generarRecomendaciones(eventos) {
        const recomendaciones = [];

        const eventosRecientes = eventos.filter(evento => {
            const fechaEvento = new Date(evento.fecha);
            const hace30Dias = new Date();
            hace30Dias.setDate(hace30Dias.getDate() - 30);
            return fechaEvento > hace30Dias;
        });

        if (eventosRecientes.length === 0) {
            recomendaciones.push({
                tipo: 'actividad_baja',
                mensaje: 'Baja actividad en el sistema en los últimos 30 días',
                severidad: 'media'
            });
        }

        const eventosCreacion = eventos.filter(e => e.tipo === 'proyecto_creado');
        if (eventosCreacion.length > 10) {
            recomendaciones.push({
                tipo: 'alta_creacion',
                mensaje: `Alta creación de proyectos: ${eventosCreacion.length} proyectos creados`,
                severidad: 'baja'
            });
        }

        return recomendaciones;
    }

    guardarHistorial() {
        localStorage.setItem('historialCompleto', JSON.stringify(this.historial));
    }
}

const gestorHistorial = new SistemaHistorialCompleto();


function registrarEventoSistema(tipo, datos) {
    return gestorHistorial.registrarEvento(tipo, datos);
}

const crearProyectoOriginal = sistema.crearProyecto.bind(sistema);
sistema.crearProyecto = function (datosProyecto) {
    const resultado = crearProyectoOriginal(datosProyecto);
    if (resultado.success) {
        registrarEventoSistema('proyecto_creado', {
            proyectoId: resultado.proyecto.id,
            proyectoNombre: resultado.proyecto.titulo,
            detalles: `Proyecto creado: ${resultado.proyecto.titulo}`
        });
    }
    return resultado;
};

const editarProyectoOriginal = sistema.editarProyecto.bind(sistema);
sistema.editarProyecto = function (id, datosActualizados) {
    const proyectoOriginal = sistema.getProyecto(id);
    const resultado = editarProyectoOriginal(id, datosActualizados);
    if (resultado.success) {
        registrarEventoSistema('proyecto_actualizado', {
            proyectoId: id,
            proyectoNombre: resultado.proyecto.titulo,
            cambios: Object.keys(datosActualizados),
            detalles: `Proyecto actualizado: ${resultado.proyecto.titulo}`
        });
    }
    return resultado;
};

const crearRevisionOriginal = sistema.crearRevision.bind(sistema);
sistema.crearRevision = function (datosRevision) {
    const resultado = crearRevisionOriginal(datosRevision);
    if (resultado.success) {
        const proyecto = sistema.getProyecto(datosRevision.proyectoId);
        registrarEventoSistema('revision_creada', {
            proyectoId: datosRevision.proyectoId,
            proyectoNombre: proyecto?.titulo,
            revisionId: resultado.revision.id,
            revisorId: datosRevision.revisorId,
            detalles: `Revisión creada para: ${proyecto?.titulo}`
        });
    }
    return resultado;
};


function cargarModuloHistorial() {
    if (!sistema.usuarioActual) {
        alert('Debes iniciar sesión para acceder al historial');
        return;
    }

    const mainContent = document.getElementById('main-content');
    const estadisticas = gestorHistorial.obtenerEstadisticasHistorial();
    const eventosRecientes = gestorHistorial.obtenerHistorialFiltrado({}).slice(0, 10);

    mainContent.innerHTML = `
        <div class="gestion-historial">
            <h2>📚 Historial Completo del Sistema</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📊 Total Eventos</h3>
                    <p>${estadisticas.totalEventos}</p>
                </div>
                <div class="stat-card">
                    <h3>👥 Usuarios Activos</h3>
                    <p>${Object.keys(estadisticas.eventosPorUsuario).length}</p>
                </div>
                <div class="stat-card">
                    <h3>📅 Días con Actividad</h3>
                    <p>${estadisticas.actividadReciente}</p>
                </div>
                <div class="stat-card">
                    <h3>🕐 Último Evento</h3>
                    <p>${estadisticas.eventoMasReciente ? new Date(estadisticas.eventoMasReciente.fecha).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            <div class="historial-acciones">
                <h3>🔍 Consultar Historial</h3>
                <div class="filtros-rapidos">
                    <button onclick="mostrarFiltrosAvanzados()" class="btn-primary">🎛️ Filtros Avanzados</button>
                    <button onclick="consultarHistorialProyectos()" class="btn-secondary">📋 Historial por Proyecto</button>
                    <button onclick="generarReporteHistorial()" class="btn-info">📈 Generar Reporte</button>
                    <button onclick="verEstadisticasDetalladas()" class="btn-warning">📊 Estadísticas</button>
                </div>
            </div>

            <div class="historial-secciones">
                <div class="historial-section">
                    <h3>🕐 Eventos Recientes</h3>
                    <div class="eventos-recientes">
                        ${eventosRecientes.map(evento => `
                            <div class="evento-item ${evento.tipo}">
                                <div class="evento-icono">${obtenerIconoEvento(evento.tipo)}</div>
                                <div class="evento-contenido">
                                    <h5>${obtenerTituloEvento(evento)}</h5>
                                    <p class="evento-descripcion">${obtenerDescripcionEvento(evento)}</p>
                                    <div class="evento-meta">
                                        <span class="evento-usuario">👤 ${evento.usuarioNombre}</span>
                                        <span class="evento-fecha">📅 ${new Date(evento.fecha).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${eventosRecientes.length === 0 ? '<p>No hay eventos recientes</p>' : ''}
                    </div>
                </div>

                <div class="historial-section">
                    <h3>📈 Distribución por Tipo</h3>
                    <div class="distribucion-tipos">
                        ${Object.entries(estadisticas.eventosPorTipo).map(([tipo, cantidad]) => `
                            <div class="tipo-item">
                                <span class="tipo-nombre">${obtenerNombreTipo(tipo)}</span>
                                <div class="tipo-bar">
                                    <div class="tipo-progress" style="width: ${(cantidad / estadisticas.totalEventos) * 100}%"></div>
                                </div>
                                <span class="tipo-cantidad">${cantidad}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function obtenerIconoEvento(tipo) {
    const iconos = {
        'proyecto_creado': '🚀',
        'proyecto_actualizado': '✏️',
        'proyecto_eliminado': '🗑️',
        'revision_creada': '🔍',
        'revision_aprobada': '✅',
        'revision_rechazada': '❌',
        'usuario_registrado': '👤',
        'usuario_actualizado': '⚙️',
        'notificacion_enviada': '🔔',
        'sistema': '🤖'
    };
    return iconos[tipo] || '📄';
}

function obtenerTituloEvento(evento) {
    const titulos = {
        'proyecto_creado': `Nuevo Proyecto: ${evento.proyectoNombre}`,
        'proyecto_actualizado': `Proyecto Actualizado: ${evento.proyectoNombre}`,
        'proyecto_eliminado': `Proyecto Eliminado: ${evento.proyectoNombre}`,
        'revision_creada': `Revisión Creada: ${evento.proyectoNombre}`,
        'revision_aprobada': `Revisión Aprobada: ${evento.proyectoNombre}`,
        'revision_rechazada': `Revisión Rechazada: ${evento.proyectoNombre}`,
        'usuario_registrado': `Nuevo Usuario: ${evento.usuarioNombre}`,
        'usuario_actualizado': `Usuario Actualizado: ${evento.usuarioNombre}`,
        'notificacion_enviada': 'Notificación Enviada',
        'sistema': 'Evento del Sistema'
    };
    return titulos[evento.tipo] || evento.tipo;
}

function obtenerDescripcionEvento(evento) {
    return evento.detalles || evento.descripcion || 'Sin descripción adicional';
}

function obtenerNombreTipo(tipo) {
    const nombres = {
        'proyecto_creado': 'Proyectos Creados',
        'proyecto_actualizado': 'Proyectos Actualizados',
        'proyecto_eliminado': 'Proyectos Eliminados',
        'revision_creada': 'Revisiones Creadas',
        'revision_aprobada': 'Revisiones Aprobadas',
        'revision_rechazada': 'Revisiones Rechazadas',
        'usuario_registrado': 'Usuarios Registrados',
        'usuario_actualizado': 'Usuarios Actualizados',
        'notificacion_enviada': 'Notificaciones',
        'sistema': 'Sistema'
    };
    return nombres[tipo] || tipo;
}

function mostrarFiltrosAvanzados() {
    const tiposEvento = Object.keys(gestorHistorial.obtenerEstadisticasHistorial().eventosPorTipo);

    let contenido = `
        <h3>🎛️ Filtros Avanzados del Historial</h3>
        <form onsubmit="aplicarFiltrosHistorial(event)">
            <div class="filtro-group">
                <h4>📅 Rango de Fechas</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="fecha-inicio">Fecha inicio:</label>
                        <input type="date" id="fecha-inicio">
                    </div>
                    <div class="form-group">
                        <label for="fecha-fin">Fecha fin:</label>
                        <input type="date" id="fecha-fin">
                    </div>
                </div>
            </div>
            
            <div class="filtro-group">
                <h4>📋 Tipos de Evento</h4>
                <div class="tipos-checkbox">
                    ${tiposEvento.map(tipo => `
                        <label>
                            <input type="checkbox" name="tipos" value="${tipo}" checked>
                            ${obtenerNombreTipo(tipo)}
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div class="filtro-group">
                <h4>👥 Filtro por Usuario</h4>
                <select id="filtro-usuario">
                    <option value="">Todos los usuarios</option>
                    ${sistema.usuarios.map(usuario => `
                        <option value="${usuario.id}">${usuario.nombre} (${usuario.rol})</option>
                    `).join('')}
                </select>
            </div>
            
            <div class="filtro-group">
                <h4>🔍 Búsqueda de Texto</h4>
                <input type="text" id="busqueda-texto" placeholder="Buscar en descripciones...">
            </div>
            
            <div class="form-actions">
                <button type="submit">🔍 Aplicar Filtros</button>
                <button type="button" onclick="limpiarFiltros()">🔄 Limpiar Filtros</button>
                <button type="button" onclick="cerrarModal()">← Volver</button>
            </div>
        </form>
    `;

    mostrarModal(contenido);
}

function aplicarFiltrosHistorial(event) {
    event.preventDefault();

    const tiposSeleccionados = Array.from(document.querySelectorAll('input[name="tipos"]:checked'))
        .map(checkbox => checkbox.value);

    const filtros = {
        tipos: tiposSeleccionados,
        fechaInicio: document.getElementById('fecha-inicio').value || null,
        fechaFin: document.getElementById('fecha-fin').value || null,
        usuarioId: document.getElementById('filtro-usuario').value || null,
        busqueda: document.getElementById('busqueda-texto').value || null
    };

    mostrarResultadosHistorialFiltrado(filtros);
    cerrarModal();
}

function mostrarResultadosHistorialFiltrado(filtros) {
    const eventos = gestorHistorial.obtenerHistorialFiltrado(filtros);

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="historial-filtrado">
            <h2>🔍 Historial Filtrado</h2>
            
            <div class="filtros-activos">
                <h4>Filtros Aplicados:</h4>
                <div class="filtros-lista">
                    ${filtros.tipos && filtros.tipos.length > 0 ? `<span>📋 Tipos: ${filtros.tipos.map(t => obtenerNombreTipo(t)).join(', ')}</span>` : ''}
                    ${filtros.fechaInicio ? `<span>📅 Desde: ${filtros.fechaInicio}</span>` : ''}
                    ${filtros.fechaFin ? `<span>📅 Hasta: ${filtros.fechaFin}</span>` : ''}
                    ${filtros.usuarioId ? `<span>👤 Usuario: ${sistema.usuarios.find(u => u.id == filtros.usuarioId)?.nombre}</span>` : ''}
                    ${filtros.busqueda ? `<span>🔍 Búsqueda: "${filtros.busqueda}"</span>` : ''}
                </div>
            </div>
            
            <div class="resultados-historial">
                <h4>📊 Resultados: ${eventos.length} eventos encontrados</h4>
                <div class="eventos-lista">
                    ${eventos.map(evento => `
                        <div class="evento-item ${evento.tipo}">
                            <div class="evento-icono">${obtenerIconoEvento(evento.tipo)}</div>
                            <div class="evento-contenido">
                                <h5>${obtenerTituloEvento(evento)}</h5>
                                <p class="evento-descripcion">${obtenerDescripcionEvento(evento)}</p>
                                <div class="evento-meta">
                                    <span class="evento-usuario">👤 ${evento.usuarioNombre}</span>
                                    <span class="evento-fecha">📅 ${new Date(evento.fecha).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    ${eventos.length === 0 ? '<p class="sin-resultados">No se encontraron eventos con los filtros aplicados</p>' : ''}
                </div>
            </div>
            
            <div class="acciones-resultados">
                <button onclick="cargarModuloHistorial()">← Volver al Historial</button>
                ${eventos.length > 0 ? `<button onclick="exportarHistorialFiltrado(${JSON.stringify(filtros).replace(/"/g, '&quot;')})">📥 Exportar Resultados</button>` : ''}
            </div>
        </div>
    `;
}