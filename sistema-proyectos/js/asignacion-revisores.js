class SistemaAsignacionRevisores {
    constructor() {
        this.areasConocimiento = JSON.parse(localStorage.getItem('areasConocimiento')) || this.inicializarAreas();
        this.asignaciones = JSON.parse(localStorage.getItem('asignacionesRevisores')) || [];
    }

    inicializarAreas() {
        const areas = [
            { id: 1, nombre: "Ingeniería de Software", codigo: "ISW" },
            { id: 2, nombre: "Inteligencia Artificial", codigo: "IA" },
            { id: 3, nombre: "Base de Datos", codigo: "BD" },
            { id: 4, nombre: "Redes y Comunicaciones", codigo: "RED" },
            { id: 5, nombre: "Seguridad Informática", codigo: "SEG" },
            { id: 6, nombre: "Sistemas Distribuidos", codigo: "SD" }
        ];

        localStorage.setItem('areasConocimiento', JSON.stringify(areas));
        return areas;
    }

    asignarRevisorAutomatico(proyectoId, areaConocimiento) {
        const docentesArea = sistema.usuarios.filter(usuario =>
            usuario.rol === 'revisor' &&
            usuario.activo &&
            usuario.areasEspecializacion?.includes(areaConocimiento)
        );

        if (docentesArea.length === 0) {
            return {
                success: false,
                error: `No hay revisores disponibles en el área: ${areaConocimiento}`
            };
        }

        const docentesConCarga = docentesArea.map(docente => {
            const revisionesPendientes = sistema.revisiones.filter(rev =>
                rev.revisorId === docente.id && rev.estado === 'pendiente'
            ).length;

            return {
                ...docente,
                cargaTrabajo: revisionesPendientes,
                puntuacion: this.calcularPuntuacionDocente(docente, revisionesPendientes)
            };
        });

        docentesConCarga.sort((a, b) => b.puntuacion - a.puntuacion);

        const revisorAsignado = docentesConCarga[0];

        const asignacion = {
            id: this.asignaciones.length + 1,
            proyectoId: proyectoId,
            revisorId: revisorAsignado.id,
            revisorNombre: revisorAsignado.nombre,
            areaConocimiento: areaConocimiento,
            fechaAsignacion: new Date().toISOString(),
            metodo: 'automatica',
            puntuacionAsignacion: revisorAsignado.puntuacion
        };

        this.asignaciones.push(asignacion);
        this.guardarAsignaciones();

        const proyecto = sistema.getProyecto(proyectoId);
        sistema.crearNotificacion(
            'asignacion',
            revisorAsignado.id,
            'Nuevo proyecto asignado para revisión',
            `Se te ha asignado el proyecto "${proyecto?.titulo}" en el área de ${areaConocimiento}`
        );

        return {
            success: true,
            asignacion: asignacion,
            mensaje: `Revisor asignado: ${revisorAsignado.nombre}`
        };
    }

    calcularPuntuacionDocente(docente, cargaTrabajo) {
        let puntuacion = 100;

        puntuacion -= cargaTrabajo * 10;

        if (docente.especializacionPrincipal === docente.areasEspecializacion?.[0]) {
            puntuacion += 20;
        }

        if (docente.ultimaRevision) {
            const diasDesdeUltimaRevision = Math.floor(
                (new Date() - new Date(docente.ultimaRevision)) / (1000 * 60 * 60 * 24)
            );
            if (diasDesdeUltimaRevision < 7) {
                puntuacion += 15;
            }
        }

        return Math.max(0, puntuacion);
    }

    obtenerEstadisticasAsignacion() {
        const totalAsignaciones = this.asignaciones.length;
        const asignacionesPorArea = {};
        const cargaPorRevisor = {};

        this.asignaciones.forEach(asignacion => {
            asignacionesPorArea[asignacion.areaConocimiento] =
                (asignacionesPorArea[asignacion.areaConocimiento] || 0) + 1;

            cargaPorRevisor[asignacion.revisorId] =
                (cargaPorRevisor[asignacion.revisorId] || 0) + 1;
        });

        return {
            totalAsignaciones,
            asignacionesPorArea,
            cargaPorRevisor,
            eficiencia: this.calcularEficienciaAsignacion()
        };
    }

    calcularEficienciaAsignacion() {
        if (this.asignaciones.length === 0) return 100;

        const asignacionesExitosas = this.asignaciones.filter(a =>
            sistema.revisiones.find(r =>
                r.proyectoId === a.proyectoId &&
                r.revisorId === a.revisorId &&
                r.estado === 'aprobada'
            )
        ).length;

        return (asignacionesExitosas / this.asignaciones.length) * 100;
    }

    redistribuirCarga() {
        const revisoresActivos = sistema.usuarios.filter(u =>
            u.rol === 'revisor' && u.activo
        );

        const estadisticas = this.obtenerEstadisticasAsignacion();
        const cargaPromedio = Math.floor(
            Object.values(estadisticas.cargaPorRevisor).reduce((a, b) => a + b, 0) / revisoresActivos.length
        );

        const redistribuciones = [];

        revisoresActivos.forEach(revisor => {
            const cargaActual = estadisticas.cargaPorRevisor[revisor.id] || 0;

            if (cargaActual > cargaPromedio + 2) {
                redistribuciones.push({
                    revisorId: revisor.id,
                    revisorNombre: revisor.nombre,
                    cargaActual: cargaActual,
                    cargaDeseada: cargaPromedio,
                    exceso: cargaActual - cargaPromedio
                });
            }
        });

        return redistribuciones;
    }

    guardarAsignaciones() {
        localStorage.setItem('asignacionesRevisores', JSON.stringify(this.asignaciones));
    }
}

const gestorAsignacion = new SistemaAsignacionRevisores();


function cargarPanelAsignacionRevisores() {
    if (!sistema.esAdministrador()) {
        alert('Solo los administradores pueden acceder a esta sección');
        return;
    }

    const mainContent = document.getElementById('main-content');
    const estadisticas = gestorAsignacion.obtenerEstadisticasAsignacion();
    const redistribuciones = gestorAsignacion.redistribuirCarga();

    mainContent.innerHTML = `
        <div class="gestion-asignacion">
            <h2>🔍 Sistema de Asignación Automática de Revisores</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📊 Total Asignaciones</h3>
                    <p>${estadisticas.totalAsignaciones}</p>
                </div>
                <div class="stat-card">
                    <h3>⭐ Eficiencia</h3>
                    <p>${estadisticas.eficiencia.toFixed(1)}%</p>
                </div>
                <div class="stat-card">
                    <h3>👥 Revisores Activos</h3>
                    <p>${sistema.usuarios.filter(u => u.rol === 'revisor' && u.activo).length}</p>
                </div>
                <div class="stat-card">
                    <h3>⚠️ Necesita Balance</h3>
                    <p>${redistribuciones.length}</p>
                </div>
            </div>

            <div class="asignacion-acciones">
                <h3>🚀 Acciones Rápidas</h3>
                <div class="acciones-rapidas">
                    <button onclick="ejecutarAsignacionAutomatica()" class="btn-primary">🔄 Ejecutar Asignación Automática</button>
                    <button onclick="mostrarRedistribucionCarga()" class="btn-secondary">⚖️ Ver Balance de Carga</button>
                    <button onclick="mostrarEstadisticasDetalladas()" class="btn-info">📈 Estadísticas Detalladas</button>
                </div>
            </div>

            <div class="asignacion-secciones">
                <div class="asignacion-section">
                    <h3>📋 Proyectos Pendientes de Asignación</h3>
                    <div class="proyectos-pendientes">
                        ${sistema.proyectos.filter(p =>
        p.estado === 'en_revision' &&
        !gestorAsignacion.asignaciones.find(a => a.proyectoId === p.id)
    ).map(proyecto => `
                            <div class="proyecto-pendiente">
                                <h4>${proyecto.titulo}</h4>
                                <p><strong>Área:</strong> ${proyecto.areaConocimiento || 'No definida'}</p>
                                <p><strong>Prioridad:</strong> <span class="prioridad ${proyecto.prioridad}">${proyecto.prioridad}</span></p>
                                <button onclick="asignarRevisorManual(${proyecto.id})">👤 Asignar Manualmente</button>
                                <button onclick="asignarRevisorAutomaticoUI(${proyecto.id})">🤖 Asignar Automáticamente</button>
                            </div>
                        `).join('')}
                        
                        ${sistema.proyectos.filter(p =>
        p.estado === 'en_revision' &&
        !gestorAsignacion.asignaciones.find(a => a.proyectoId === p.id)
    ).length === 0 ? '<p>No hay proyectos pendientes de asignación</p>' : ''}
                    </div>
                </div>

                <div class="asignacion-section">
                    <h3>📊 Distribución por Área de Conocimiento</h3>
                    <div class="distribucion-areas">
                        ${Object.entries(estadisticas.asignacionesPorArea).map(([area, cantidad]) => `
                            <div class="area-item">
                                <span class="area-nombre">${area}</span>
                                <div class="area-bar">
                                    <div class="area-progress" style="width: ${(cantidad / estadisticas.totalAsignaciones) * 100}%"></div>
                                </div>
                                <span class="area-cantidad">${cantidad}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            ${redistribuciones.length > 0 ? `
                <div class="alerta-balance">
                    <h3>⚠️ Alerta: Desbalance de Carga Detectado</h3>
                    <p>Se recomienda redistribuir la carga de trabajo entre revisores</p>
                    <div class="revisores-carga">
                        ${redistribuciones.map(rev => `
                            <div class="revisor-carga">
                                <strong>${rev.revisorNombre}</strong>: 
                                ${rev.cargaActual} proyectos (${rev.exceso} por encima del promedio)
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function asignarRevisorAutomaticoUI(proyectoId) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto) return;

    const areaConocimiento = proyecto.areaConocimiento || prompt(
        'Ingresa el área de conocimiento para este proyecto:',
        proyecto.areaConocimiento || 'Ingeniería de Software'
    );

    if (!areaConocimiento) return;

    const resultado = gestorAsignacion.asignarRevisorAutomatico(proyectoId, areaConocimiento);

    if (resultado.success) {
        alert(`✅ ${resultado.mensaje}`);
        cargarPanelAsignacionRevisores();
    } else {
        alert(`❌ Error: ${resultado.error}`);
    }
}

function ejecutarAsignacionAutomatica() {
    const proyectosPendientes = sistema.proyectos.filter(p =>
        p.estado === 'en_revision' &&
        !gestorAsignacion.asignaciones.find(a => a.proyectoId === p.id)
    );

    if (proyectosPendientes.length === 0) {
        alert('No hay proyectos pendientes de asignación');
        return;
    }

    let asignacionesExitosas = 0;
    let errores = [];

    proyectosPendientes.forEach(proyecto => {
        const areaConocimiento = proyecto.areaConocimiento || 'Ingeniería de Software';
        const resultado = gestorAsignacion.asignarRevisorAutomatico(proyecto.id, areaConocimiento);

        if (resultado.success) {
            asignacionesExitosas++;
        } else {
            errores.push(`${proyecto.titulo}: ${resultado.error}`);
        }
    });

    let mensaje = `✅ ${asignacionesExitosas} asignaciones realizadas exitosamente`;
    if (errores.length > 0) {
        mensaje += `\n\n❌ Errores:\n${errores.join('\n')}`;
    }

    alert(mensaje);
    cargarPanelAsignacionRevisores();
}

function mostrarRedistribucionCarga() {
    const redistribuciones = gestorAsignacion.redistribuirCarga();

    if (redistribuciones.length === 0) {
        alert('✅ La carga de trabajo está bien balanceada entre los revisores');
        return;
    }

    let contenido = '<h3>⚖️ Redistribución de Carga Recomendada</h3><ul>';

    redistribuciones.forEach(rev => {
        contenido += `<li><strong>${rev.revisorNombre}</strong>: ${rev.cargaActual} proyectos (${rev.exceso} por encima del promedio)</li>`;
    });

    contenido += '</ul><p><em>El sistema asignará automáticamente nuevos proyectos a revisores con menor carga.</em></p>';

    mostrarModal(contenido);
}

function mostrarEstadisticasDetalladas() {
    const estadisticas = gestorAsignacion.obtenerEstadisticasAsignacion();
    const revisores = sistema.usuarios.filter(u => u.rol === 'revisor' && u.activo);

    let contenido = `
        <h3>📈 Estadísticas Detalladas de Asignación</h3>
        
        <div class="estadisticas-detalladas">
            <p><strong>Eficiencia del Sistema:</strong> ${estadisticas.eficiencia.toFixed(1)}%</p>
            <p><strong>Total de Asignaciones:</strong> ${estadisticas.totalAsignaciones}</p>
            
            <h4>👥 Carga de Trabajo por Revisor:</h4>
            <ul>
                ${revisores.map(revisor => {
        const carga = estadisticas.cargaPorRevisor[revisor.id] || 0;
        return `<li>${revisor.nombre}: ${carga} proyectos asignados</li>`;
    }).join('')}
            </ul>
            
            <h4>📊 Distribución por Área:</h4>
            <ul>
                ${Object.entries(estadisticas.asignacionesPorArea).map(([area, cantidad]) => `
                    <li>${area}: ${cantidad} asignaciones</li>
                `).join('')}
            </ul>
        </div>
    `;

    mostrarModal(contenido);
}


function crearRevisionDesdeProyecto(event, proyectoId) {
    event.preventDefault();

    const proyecto = sistema.getProyecto(proyectoId);
    if (proyecto && proyecto.areaConocimiento) {
        const resultadoAsignacion = gestorAsignacion.asignarRevisorAutomatico(
            proyectoId,
            proyecto.areaConocimiento
        );

        if (resultadoAsignacion.success) {
            const datosRevision = {
                proyectoId: proyectoId,
                tipo: document.getElementById('rev-tipo-modal').value,
                revisorId: resultadoAsignacion.asignacion.revisorId,
                descripcion: document.getElementById('rev-descripcion-modal').value
            };

            const resultado = sistema.crearRevision(datosRevision);
            if (resultado.success) {
                alert(`✅ ${resultado.mensaje}\nRevisor asignado: ${resultadoAsignacion.asignacion.revisorNombre}`);
                cerrarModal();
                cargarProyectos();
                return;
            }
        }
    }

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