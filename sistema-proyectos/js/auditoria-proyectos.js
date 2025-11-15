class SistemaAuditoriaProyectos {
    constructor() {
        this.auditorias = JSON.parse(localStorage.getItem('auditoriasProyectos')) || [];
        this.configuracion = {
            validarIntegridad: true,
            validarConsistencia: true,
            validarCumplimiento: true,
            notificarInconsistencias: true
        };
    }

    ejecutarAuditoriaCompleta() {
        const resultados = {
            fechaAuditoria: new Date().toISOString(),
            ejecutadaPor: sistema.usuarioActual?.id || 'sistema',
            estadisticas: {
                totalProyectos: sistema.proyectos.length,
                proyectosAuditados: 0,
                inconsistenciasEncontradas: 0,
                advertencias: 0
            },
            inconsistencias: [],
            advertencias: [],
            recomendaciones: []
        };

        if (this.configuracion.validarIntegridad) {
            this.validarIntegridadDatos(resultados);
        }

        if (this.configuracion.validarConsistencia) {
            this.validarConsistenciaDatos(resultados);
        }

        if (this.configuracion.validarCumplimiento) {
            this.validarCumplimientoNormas(resultados);
        }

        this.guardarAuditoria(resultados);

        return resultados;
    }

    validarIntegridadDatos(resultados) {
        sistema.proyectos.forEach(proyecto => {
            const errores = [];

            if (!proyecto.titulo || proyecto.titulo.trim() === '') {
                errores.push('Título del proyecto vacío o inválido');
            }

            if (!proyecto.descripcion || proyecto.descripcion.trim() === '') {
                errores.push('Descripción del proyecto vacía');
            }

            if (!proyecto.fechaInicio || !this.validarFecha(proyecto.fechaInicio)) {
                errores.push('Fecha de inicio inválida');
            }

            if (!proyecto.fechaFin || !this.validarFecha(proyecto.fechaFin)) {
                errores.push('Fecha de fin inválida');
            }

            if (proyecto.fechaInicio && proyecto.fechaFin) {
                const inicio = new Date(proyecto.fechaInicio);
                const fin = new Date(proyecto.fechaFin);

                if (inicio > fin) {
                    errores.push('Fecha de inicio posterior a fecha de fin');
                }
            }

            if (proyecto.progreso < 0 || proyecto.progreso > 100) {
                errores.push(`Progreso inválido: ${proyecto.progreso}%`);
            }

            if (proyecto.responsableId) {
                const responsable = sistema.usuarios.find(u => u.id === proyecto.responsableId);
                if (!responsable) {
                    errores.push('Responsable del proyecto no existe en el sistema');
                }
            }

            if (errores.length > 0) {
                resultados.inconsistencias.push({
                    tipo: 'integridad',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    errores: errores,
                    severidad: 'alta'
                });
                resultados.estadisticas.inconsistenciasEncontradas += errores.length;
            }

            resultados.estadisticas.proyectosAuditados++;
        });
    }

    validarConsistenciaDatos(resultados) {
        const titulos = {};
        sistema.proyectos.forEach(proyecto => {
            const tituloNormalizado = proyecto.titulo.toLowerCase().trim();

            if (titulos[tituloNormalizado]) {
                resultados.advertencias.push({
                    tipo: 'duplicado',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: `Posible duplicado con proyecto: ${titulos[tituloNormalizado]}`,
                    severidad: 'media'
                });
                resultados.estadisticas.advertencias++;
            } else {
                titulos[tituloNormalizado] = proyecto.titulo;
            }
        });

        sistema.proyectos.forEach(proyecto => {
            if (proyecto.estado === 'completado' && proyecto.progreso < 100) {
                resultados.advertencias.push({
                    tipo: 'estado_inconsistente',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: 'Proyecto marcado como completado pero progreso menor al 100%',
                    severidad: 'media'
                });
                resultados.estadisticas.advertencias++;
            }

            if (proyecto.estado === 'en_progreso' && proyecto.progreso === 0) {
                resultados.advertencias.push({
                    tipo: 'estado_inconsistente',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: 'Proyecto en progreso pero progreso en 0%',
                    severidad: 'baja'
                });
                resultados.estadisticas.advertencias++;
            }
        });
    }

    validarCumplimientoNormas(resultados) {
        sistema.proyectos.forEach(proyecto => {
            if (!proyecto.periodoAcademico || proyecto.periodoAcademico === 'No asignado') {
                resultados.advertencias.push({
                    tipo: 'periodo_no_asignado',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: 'Proyecto sin período académico asignado',
                    severidad: 'media'
                });
                resultados.estadisticas.advertencias++;
            }

            if (!proyecto.areaConocimiento || proyecto.areaConocimiento === 'General') {
                resultados.recomendaciones.push({
                    tipo: 'area_no_especificada',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: 'Considerar especificar área de conocimiento específica'
                });
            }

            if (!proyecto.equipo || proyecto.equipo.length === 0) {
                resultados.advertencias.push({
                    tipo: 'sin_equipo',
                    proyectoId: proyecto.id,
                    proyectoNombre: proyecto.titulo,
                    mensaje: 'Proyecto sin equipo asignado',
                    severidad: 'alta'
                });
                resultados.estadisticas.advertencias++;
            }
        });
    }

    validarFecha(fecha) {
        return !isNaN(new Date(fecha).getTime());
    }

    generarReporteAuditoria(resultados) {
        const reporte = {
            ...resultados,
            resumen: {
                proyectosConProblemas: resultados.inconsistencias.length + resultados.advertencias.length,
                problemasCriticos: resultados.inconsistencias.filter(i => i.severidad === 'alta').length,
                problemasMedios: resultados.advertencias.filter(a => a.severidad === 'media').length,
                tasaIntegridad: ((resultados.estadisticas.totalProyectos - resultados.inconsistencias.length) / resultados.estadisticas.totalProyectos * 100).toFixed(1)
            }
        };

        return reporte;
    }

    guardarAuditoria(resultados) {
        const auditoria = {
            id: this.auditorias.length + 1,
            ...resultados
        };

        this.auditorias.unshift(auditoria); // Agregar al inicio
        localStorage.setItem('auditoriasProyectos', JSON.stringify(this.auditorias));

        return auditoria;
    }

    obtenerAuditoriasRecientes(limite = 5) {
        return this.auditorias.slice(0, limite);
    }

    obtenerEstadisticasAuditorias() {
        const totalAuditorias = this.auditorias.length;
        const auditoriasExitosas = this.auditorias.filter(a =>
            a.estadisticas.inconsistenciasEncontradas === 0
        ).length;

        return {
            totalAuditorias,
            auditoriasExitosas,
            tasaExito: totalAuditorias > 0 ? (auditoriasExitosas / totalAuditorias * 100).toFixed(1) : 0,
            ultimaAuditoria: this.auditorias[0] || null
        };
    }
}

const gestorAuditoria = new SistemaAuditoriaProyectos();


function cargarModuloAuditoria() {
    if (!sistema.esAdministrador()) {
        alert('Solo los administradores pueden acceder al módulo de auditoría');
        return;
    }

    const mainContent = document.getElementById('main-content');
    const estadisticas = gestorAuditoria.obtenerEstadisticasAuditorias();
    const auditoriasRecientes = gestorAuditoria.obtenerAuditoriasRecientes(3);

    mainContent.innerHTML = `
        <div class="gestion-auditoria">
            <h2>🔍 Módulo de Auditoría y Validación de Proyectos</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>📊 Total Auditorías</h3>
                    <p>${estadisticas.totalAuditorias}</p>
                </div>
                <div class="stat-card">
                    <h3>✅ Auditorías Exitosas</h3>
                    <p>${estadisticas.auditoriasExitosas}</p>
                </div>
                <div class="stat-card">
                    <h3>⭐ Tasa de Éxito</h3>
                    <p>${estadisticas.tasaExito}%</p>
                </div>
                <div class="stat-card">
                    <h3>🕐 Última Auditoría</h3>
                    <p>${estadisticas.ultimaAuditoria ? new Date(estadisticas.ultimaAuditoria.fechaAuditoria).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            <div class="auditoria-acciones">
                <h3>🚀 Acciones de Auditoría</h3>
                <div class="acciones-rapidas">
                    <button onclick="ejecutarAuditoriaCompleta()" class="btn-primary">🔍 Ejecutar Auditoría Completa</button>
                    <button onclick="configurarAuditoria()" class="btn-secondary">⚙️ Configurar Auditoría</button>
                    <button onclick="verReportesAuditoria()" class="btn-info">📈 Ver Reportes</button>
                    <button onclick="exportarDatosAuditoria()" class="btn-warning">📤 Exportar Datos</button>
                </div>
            </div>

            <div class="auditoria-secciones">
                <div class="auditoria-section">
                    <h3>📋 Auditorías Recientes</h3>
                    <div class="auditorias-list">
                        ${auditoriasRecientes.map(auditoria => `
                            <div class="auditoria-card">
                                <h4>Auditoría #${auditoria.id}</h4>
                                <p><strong>Fecha:</strong> ${new Date(auditoria.fechaAuditoria).toLocaleString()}</p>
                                <p><strong>Proyectos auditados:</strong> ${auditoria.estadisticas.proyectosAuditados}</p>
                                <p><strong>Inconsistencias:</strong> <span class="${auditoria.estadisticas.inconsistenciasEncontradas > 0 ? 'error' : 'success'}">${auditoria.estadisticas.inconsistenciasEncontradas}</span></p>
                                <p><strong>Advertencias:</strong> ${auditoria.estadisticas.advertencias}</p>
                                <button onclick="verDetallesAuditoria(${auditoria.id})">👁️ Ver Detalles</button>
                            </div>
                        `).join('')}
                        
                        ${auditoriasRecientes.length === 0 ? '<p>No hay auditorías recientes</p>' : ''}
                    </div>
                </div>

                <div class="auditoria-section">
                    <h3>⚠️ Problemas Comunes Detectados</h3>
                    <div class="problemas-comunes">
                        <div class="problema-item">
                            <span class="problema-tipo">📝 Datos Incompletos</span>
                            <span class="problema-desc">Proyectos sin información esencial</span>
                        </div>
                        <div class="problema-item">
                            <span class="problema-tipo">🕐 Fechas Inconsistentes</span>
                            <span class="problema-desc">Fechas de inicio posteriores a fin</span>
                        </div>
                        <div class="problema-item">
                            <span class="problema-tipo">👥 Sin Equipo</span>
                            <span class="problema-desc">Proyectos sin miembros asignados</span>
                        </div>
                        <div class="problema-item">
                            <span class="problema-tipo">📅 Sin Período</span>
                            <span class="problema-desc">Proyectos sin período académico</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function ejecutarAuditoriaCompleta() {
    if (!confirm('¿Estás seguro de que quieres ejecutar una auditoría completa del sistema? Esto puede tomar algunos minutos.')) {
        return;
    }

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="auditoria-progreso">
            <h2>🔍 Ejecutando Auditoría del Sistema</h2>
            <div class="progreso-bar">
                <div class="progreso-fill" id="progreso-auditoria"></div>
            </div>
            <p id="estado-auditoria">Iniciando validación de integridad de datos...</p>
        </div>
    `;

    let progreso = 0;
    const intervalo = setInterval(() => {
        progreso += 25;
        document.getElementById('progreso-auditoria').style.width = `${progreso}%`;

        const estados = [
            'Validando integridad de datos...',
            'Verificando consistencia...',
            'Validando cumplimiento de normas...',
            'Generando reporte final...'
        ];

        document.getElementById('estado-auditoria').textContent = estados[Math.floor(progreso / 25) - 1] || 'Completando...';

        if (progreso >= 100) {
            clearInterval(intervalo);

            setTimeout(() => {
                const resultados = gestorAuditoria.ejecutarAuditoriaCompleta();
                const reporte = gestorAuditoria.generarReporteAuditoria(resultados);
                mostrarResultadosAuditoria(reporte);
            }, 500);
        }
    }, 800);
}

function mostrarResultadosAuditoria(reporte) {
    let contenido = `
        <h3>📊 Resultados de la Auditoría</h3>
        <div class="resultados-auditoria">
            <div class="resumen-auditoria">
                <h4>📈 Resumen General</h4>
                <p><strong>Fecha:</strong> ${new Date(reporte.fechaAuditoria).toLocaleString()}</p>
                <p><strong>Proyectos auditados:</strong> ${reporte.estadisticas.proyectosAuditados}</p>
                <p><strong>Inconsistencias encontradas:</strong> <span class="${reporte.estadisticas.inconsistenciasEncontradas > 0 ? 'error' : 'success'}">${reporte.estadisticas.inconsistenciasEncontradas}</span></p>
                <p><strong>Advertencias:</strong> ${reporte.estadisticas.advertencias}</p>
                <p><strong>Tasa de integridad:</strong> ${reporte.resumen.tasaIntegridad}%</p>
            </div>
    `;

    if (reporte.inconsistencias.length > 0) {
        contenido += `
            <div class="inconsistencias-seccion">
                <h4>❌ Inconsistencias Críticas</h4>
                ${reporte.inconsistencias.map(inc => `
                    <div class="inconsistencia-item ${inc.severidad}">
                        <h5>${inc.proyectoNombre} (ID: ${inc.proyectoId})</h5>
                        <p><strong>Tipo:</strong> ${inc.tipo}</p>
                        <ul>
                            ${inc.errores.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (reporte.advertencias.length > 0) {
        contenido += `
            <div class="advertencias-seccion">
                <h4>⚠️ Advertencias</h4>
                ${reporte.advertencias.map(adv => `
                    <div class="advertencia-item ${adv.severidad}">
                        <h5>${adv.proyectoNombre}</h5>
                        <p>${adv.mensaje}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    if (reporte.recomendaciones.length > 0) {
        contenido += `
            <div class="recomendaciones-seccion">
                <h4>💡 Recomendaciones</h4>
                ${reporte.recomendaciones.map(rec => `
                    <div class="recomendacion-item">
                        <h5>${rec.proyectoNombre}</h5>
                        <p>${rec.mensaje}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    contenido += `
        <div class="acciones-resultados">
            <button onclick="exportarReporteAuditoria(${reporte.id})">📥 Exportar Reporte</button>
            <button onclick="cargarModuloAuditoria()">← Volver al Módulo</button>
        </div>
    </div>`;

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = contenido;
}

function configurarAuditoria() {
    let contenido = `
        <h3>⚙️ Configuración de Auditoría</h3>
        <form onsubmit="guardarConfiguracionAuditoria(event)">
            <div class="config-group">
                <h4>🔍 Tipos de Validación</h4>
                <label>
                    <input type="checkbox" id="validar-integridad" ${gestorAuditoria.configuracion.validarIntegridad ? 'checked' : ''}>
                    Validar Integridad de Datos
                </label>
                <label>
                    <input type="checkbox" id="validar-consistencia" ${gestorAuditoria.configuracion.validarConsistencia ? 'checked' : ''}>
                    Validar Consistencia
                </label>
                <label>
                    <input type="checkbox" id="validar-cumplimiento" ${gestorAuditoria.configuracion.validarCumplimiento ? 'checked' : ''}>
                    Validar Cumplimiento de Normas
                </label>
            </div>
            
            <div class="config-group">
                <h4>🔔 Notificaciones</h4>
                <label>
                    <input type="checkbox" id="notificar-inconsistencias" ${gestorAuditoria.configuracion.notificarInconsistencias ? 'checked' : ''}>
                    Notificar Inconsistencias Críticas
                </label>
            </div>
            
            <div class="form-actions">
                <button type="submit">💾 Guardar Configuración</button>
                <button type="button" onclick="cargarModuloAuditoria()">← Volver</button>
            </div>
        </form>
    `;

    mostrarModal(contenido);
}

function guardarConfiguracionAuditoria(event) {
    event.preventDefault();

    gestorAuditoria.configuracion = {
        validarIntegridad: document.getElementById('validar-integridad').checked,
        validarConsistencia: document.getElementById('validar-consistencia').checked,
        validarCumplimiento: document.getElementById('validar-cumplimiento').checked,
        notificarInconsistencias: document.getElementById('notificar-inconsistencias').checked
    };

    alert('Configuración de auditoría guardada exitosamente');
    cerrarModal();
}

function verDetallesAuditoria(id) {
    const auditoria = gestorAuditoria.auditorias.find(a => a.id === id);
    if (!auditoria) return;

    mostrarResultadosAuditoria(auditoria);
}

function exportarReporteAuditoria(id) {
    const auditoria = gestorAuditoria.auditorias.find(a => a.id === id);
    if (!auditoria) return;

    const blob = new Blob([JSON.stringify(auditoria, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-proyectos-${auditoria.id}-${new Date(auditoria.fechaAuditoria).toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Reporte de auditoría exportado exitosamente');
}