class GestorPeriodosAcademicos {
    constructor() {
        this.periodos = JSON.parse(localStorage.getItem('periodosAcademicos')) || this.inicializarPeriodos();
        this.periodoActual = this.obtenerPeriodoActual();
    }

    inicializarPeriodos() {
        const periodos = [
            {
                id: 1,
                nombre: "2024-2",
                descripcion: "Segundo semestre 2024",
                fechaInicio: "2024-07-15",
                fechaFin: "2024-12-15",
                fechaInicioEnvios: "2024-08-01",
                fechaFinEnvios: "2024-10-30",
                fechaInicioRevision: "2024-09-01",
                fechaFinRevision: "2024-11-30",
                activo: true,
                fechasLimite: {
                    entregaAvance1: "2024-09-15",
                    entregaAvance2: "2024-10-15",
                    entregaFinal: "2024-11-15",
                    revisionAvance1: "2024-09-30",
                    revisionAvance2: "2024-10-30",
                    revisionFinal: "2024-11-30"
                }
            },
            {
                id: 2,
                nombre: "2025-1",
                descripcion: "Primer semestre 2025",
                fechaInicio: "2025-01-20",
                fechaFin: "2025-06-20",
                fechaInicioEnvios: "2025-02-01",
                fechaFinEnvios: "2025-04-30",
                fechaInicioRevision: "2025-03-01",
                fechaFinRevision: "2025-05-31",
                activo: false,
                fechasLimite: {
                    entregaAvance1: "2025-03-15",
                    entregaAvance2: "2025-04-15",
                    entregaFinal: "2025-05-15",
                    revisionAvance1: "2025-03-30",
                    revisionAvance2: "2025-04-30",
                    revisionFinal: "2025-05-30"
                }
            }
        ];

        localStorage.setItem('periodosAcademicos', JSON.stringify(periodos));
        return periodos;
    }

    obtenerPeriodoActual() {
        const hoy = new Date();
        return this.periodos.find(p => {
            const inicio = new Date(p.fechaInicio);
            const fin = new Date(p.fechaFin);
            return hoy >= inicio && hoy <= fin && p.activo;
        });
    }

    esPeriodoEnviosActivo() {
        if (!this.periodoActual) return false;

        const hoy = new Date();
        const inicioEnvios = new Date(this.periodoActual.fechaInicioEnvios);
        const finEnvios = new Date(this.periodoActual.fechaFinEnvios);

        return hoy >= inicioEnvios && hoy <= finEnvios;
    }

    obtenerFechasProximas() {
        if (!this.periodoActual) return [];

        const hoy = new Date();
        const fechasProximas = [];

        Object.entries(this.periodoActual.fechasLimite).forEach(([tipo, fecha]) => {
            const fechaLimite = new Date(fecha);
            const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

            if (diasRestantes >= 0 && diasRestantes <= 7) {
                fechasProximas.push({
                    tipo: this.obtenerNombreFechaLimite(tipo),
                    fecha: fechaLimite,
                    diasRestantes: diasRestantes,
                    urgente: diasRestantes <= 3
                });
            }
        });

        return fechasProximas.sort((a, b) => a.diasRestantes - b.diasRestantes);
    }

    obtenerNombreFechaLimite(tipo) {
        const nombres = {
            entregaAvance1: "Entrega Avance 1",
            entregaAvance2: "Entrega Avance 2",
            entregaFinal: "Entrega Final",
            revisionAvance1: "Revisión Avance 1",
            revisionAvance2: "Revisión Avance 2",
            revisionFinal: "Revisión Final"
        };

        return nombres[tipo] || tipo;
    }

    crearPeriodo(datosPeriodo) {
        const nuevoPeriodo = {
            id: this.periodos.length + 1,
            ...datosPeriodo,
            activo: true
        };

        this.periodos.push(nuevoPeriodo);
        this.guardarPeriodos();
        return { success: true, periodo: nuevoPeriodo };
    }

    guardarPeriodos() {
        localStorage.setItem('periodosAcademicos', JSON.stringify(this.periodos));
    }
}

const gestorPeriodos = new GestorPeriodosAcademicos();


function cargarConfiguracionPeriodos() {
    if (!sistema.esAdministrador()) {
        alert('Solo los administradores pueden acceder a esta sección');
        return;
    }

    const mainContent = document.getElementById('main-content');
    const periodos = gestorPeriodos.periodos;
    const periodoActual = gestorPeriodos.periodoActual;

    mainContent.innerHTML = `
        <div class="gestion-periodos">
            <h2>⚙️ Configuración de Periodos Académicos</h2>
            
            <div class="acciones-superiores">
                <button onclick="mostrarFormularioPeriodo()">➕ Nuevo Periodo</button>
                <button onclick="generarPeriodoSiguiente()">🔄 Generar Siguiente Periodo</button>
            </div>

            <div class="periodo-actual-section">
                <h3>📅 Periodo Académico Actual</h3>
                ${periodoActual ? `
                    <div class="periodo-card actual">
                        <h4>${periodoActual.nombre} - ${periodoActual.descripcion}</h4>
                        <div class="periodo-info">
                            <p><strong>Envíos:</strong> ${new Date(periodoActual.fechaInicioEnvios).toLocaleDateString()} - ${new Date(periodoActual.fechaFinEnvios).toLocaleDateString()}</p>
                            <p><strong>Revisiones:</strong> ${new Date(periodoActual.fechaInicioRevision).toLocaleDateString()} - ${new Date(periodoActual.fechaFinRevision).toLocaleDateString()}</p>
                            <p><strong>Estado:</strong> <span class="estado activo">Activo</span></p>
                        </div>
                        <div class="fechas-limite">
                            <h5>📋 Fechas Límite:</h5>
                            <ul>
                                ${Object.entries(periodoActual.fechasLimite).map(([tipo, fecha]) => `
                                    <li>${gestorPeriodos.obtenerNombreFechaLimite(tipo)}: ${new Date(fecha).toLocaleDateString()}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                ` : '<p class="sin-periodo">No hay periodo académico activo</p>'}
            </div>

            <div class="periodos-historicos">
                <h3>📚 Periodos Académicos</h3>
                <div class="periodos-grid">
                    ${periodos.map(periodo => `
                        <div class="periodo-card ${periodo.activo ? 'activo' : 'inactivo'}">
                            <h4>${periodo.nombre}</h4>
                            <p>${periodo.descripcion}</p>
                            <div class="periodo-meta">
                                <small><strong>Inicio:</strong> ${new Date(periodo.fechaInicio).toLocaleDateString()}</small>
                                <small><strong>Fin:</strong> ${new Date(periodo.fechaFin).toLocaleDateString()}</small>
                                <small><strong>Estado:</strong> ${periodo.activo ? '🟢 Activo' : '🔴 Inactivo'}</small>
                            </div>
                            <div class="periodo-acciones">
                                <button onclick="editarPeriodo(${periodo.id})">✏️ Editar</button>
                                ${!periodo.activo ? `<button onclick="activarPeriodo(${periodo.id})">✅ Activar</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function mostrarFormularioPeriodo() {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="formulario-periodo">
            <h2>➕ Crear Nuevo Periodo Académico</h2>
            <form onsubmit="crearNuevoPeriodo(event)">
                <div class="form-group">
                    <label for="periodo-nombre">Nombre del periodo:</label>
                    <input type="text" id="periodo-nombre" required placeholder="Ej: 2025-1">
                </div>
                
                <div class="form-group">
                    <label for="periodo-descripcion">Descripción:</label>
                    <input type="text" id="periodo-descripcion" required placeholder="Ej: Primer semestre 2025">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="periodo-inicio">Fecha inicio periodo:</label>
                        <input type="date" id="periodo-inicio" required>
                    </div>
                    <div class="form-group">
                        <label for="periodo-fin">Fecha fin periodo:</label>
                        <input type="date" id="periodo-fin" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="periodo-inicio-envios">Fecha inicio envíos:</label>
                        <input type="date" id="periodo-inicio-envios" required>
                    </div>
                    <div class="form-group">
                        <label for="periodo-fin-envios">Fecha fin envíos:</label>
                        <input type="date" id="periodo-fin-envios" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="periodo-inicio-revision">Fecha inicio revisiones:</label>
                        <input type="date" id="periodo-inicio-revision" required>
                    </div>
                    <div class="form-group">
                        <label for="periodo-fin-revision">Fecha fin revisiones:</label>
                        <input type="date" id="periodo-fin-revision" required>
                    </div>
                </div>
                
                <h4>📅 Fechas Límite Específicas</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="fecha-avance1">Entrega Avance 1:</label>
                        <input type="date" id="fecha-avance1" required>
                    </div>
                    <div class="form-group">
                        <label for="fecha-avance2">Entrega Avance 2:</label>
                        <input type="date" id="fecha-avance2" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="fecha-final">Entrega Final:</label>
                        <input type="date" id="fecha-final" required>
                    </div>
                    <div class="form-group">
                        <label for="fecha-revision-final">Revisión Final:</label>
                        <input type="date" id="fecha-revision-final" required>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit">🚀 Crear Periodo</button>
                    <button type="button" onclick="cargarConfiguracionPeriodos()">← Volver</button>
                </div>
            </form>
        </div>
    `;
}

function crearNuevoPeriodo(event) {
    event.preventDefault();

    const datosPeriodo = {
        nombre: document.getElementById('periodo-nombre').value,
        descripcion: document.getElementById('periodo-descripcion').value,
        fechaInicio: document.getElementById('periodo-inicio').value,
        fechaFin: document.getElementById('periodo-fin').value,
        fechaInicioEnvios: document.getElementById('periodo-inicio-envios').value,
        fechaFinEnvios: document.getElementById('periodo-fin-envios').value,
        fechaInicioRevision: document.getElementById('periodo-inicio-revision').value,
        fechaFinRevision: document.getElementById('periodo-fin-revision').value,
        fechasLimite: {
            entregaAvance1: document.getElementById('fecha-avance1').value,
            entregaAvance2: document.getElementById('fecha-avance2').value,
            entregaFinal: document.getElementById('fecha-final').value,
            revisionFinal: document.getElementById('fecha-revision-final').value
        }
    };

    const resultado = gestorPeriodos.crearPeriodo(datosPeriodo);
    if (resultado.success) {
        alert('Periodo académico creado exitosamente');
        cargarConfiguracionPeriodos();
    }
}

function generarPeriodoSiguiente() {
    const periodoActual = gestorPeriodos.periodoActual;
    if (!periodoActual) {
        alert('No hay periodo actual para basar el siguiente');
        return;
    }

    const siguientePeriodo = {
        nombre: "2025-2",
        descripcion: "Segundo semestre 2025",
        fechaInicio: "2025-07-15",
        fechaFin: "2025-12-15",
        fechaInicioEnvios: "2025-08-01",
        fechaFinEnvios: "2025-10-30",
        fechaInicioRevision: "2025-09-01",
        fechaFinRevision: "2025-11-30",
        fechasLimite: {
            entregaAvance1: "2025-09-15",
            entregaAvance2: "2025-10-15",
            entregaFinal: "2025-11-15",
            revisionFinal: "2025-11-30"
        }
    };

    const resultado = gestorPeriodos.crearPeriodo(siguientePeriodo);
    if (resultado.success) {
        alert('Siguiente periodo académico generado automáticamente');
        cargarConfiguracionPeriodos();
    }
}

function editarPeriodo(id) {
    const periodo = gestorPeriodos.periodos.find(p => p.id === id);
    if (!periodo) return;

    alert(`Editar periodo: ${periodo.nombre}\n\nEsta funcionalidad está en desarrollo.`);
}

function activarPeriodo(id) {
    gestorPeriodos.periodos.forEach(p => p.activo = false);
    const periodo = gestorPeriodos.periodos.find(p => p.id === id);
    if (periodo) {
        periodo.activo = true;
        gestorPeriodos.guardarPeriodos();
        gestorPeriodos.periodoActual = periodo;
        alert(`Periodo ${periodo.nombre} activado`);
        cargarConfiguracionPeriodos();
    }
}


function validarPeriodoParaCreacionProyecto() {
    // Verificar período de envíos
    if (!gestorPeriodos.esPeriodoEnviosActivo()) {
        const periodoActual = gestorPeriodos.periodoActual;
        let mensaje = 'Período de envío cerrado';

        if (periodoActual) {
            mensaje += `\n\nPróximo período:\nInicio: ${new Date(periodoActual.fechaInicioEnvios).toLocaleDateString()}\nFin: ${new Date(periodoActual.fechaFinEnvios).toLocaleDateString()}`;
        }

        alert(mensaje);
        return false;
    }

    // Verificar rol: debe ser estudiante
    if (!sistema.usuarioActual || sistema.usuarioActual.rol !== 'estudiante') {
        alert('Solo estudiantes pueden crear proyectos de grado');
        return false;
    }

    // Verificar que no tenga revisiones pendientes
    const usuarioId = sistema.usuarioActual.id;
    const revisionesPendientes = sistema.revisiones.filter(r => r.creadaPor === usuarioId && r.estado === 'pendiente').length;
    if (revisionesPendientes > 0) {
        alert('No puedes crear un nuevo proyecto si tienes revisiones pendientes');
        return false;
    }

    // Límite de proyectos simultáneos por estudiante (ej. 3)
    const maxProyectos = 3;
    const proyectosActivos = sistema.proyectos.filter(p => p.equipo && p.equipo.includes(usuarioId) && p.estado !== 'completado').length;
    if (proyectosActivos >= maxProyectos) {
        alert(`Has alcanzado el límite de proyectos simultáneos (${maxProyectos}).`);
        return false;
    }

    return true;
}

function crearNuevoProyecto(event) {
    event.preventDefault();

    if (!validarPeriodoParaCreacionProyecto()) {
        return;
    }

    const datosProyecto = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: document.getElementById('fechaFin').value,
        presupuesto: parseFloat(document.getElementById('presupuesto').value),
        prioridad: document.getElementById('prioridad').value,
        responsable: sistema.usuarioActual.nombre,
        responsableId: sistema.usuarioActual.id,
        equipo: [sistema.usuarioActual.id],
        periodoAcademico: gestorPeriodos.periodoActual.nombre
    };

    const resultado = sistema.crearProyecto(datosProyecto);
    if (resultado.success) {
        alert(resultado.mensaje);
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}