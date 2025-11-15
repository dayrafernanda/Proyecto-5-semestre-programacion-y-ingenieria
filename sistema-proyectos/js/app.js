class SistemaGestionProyectos {
    constructor() {
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || this.inicializarUsuarios();
        this.proyectos = JSON.parse(localStorage.getItem('proyectos')) || this.inicializarProyectos();
        this.revisiones = JSON.parse(localStorage.getItem('revisiones')) || [];
        this.notificaciones = JSON.parse(localStorage.getItem('notificaciones')) || [];
        this.usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;

        this.gestorPeriodos = new GestorPeriodosAcademicos();
        this.gestorAsignacion = new SistemaAsignacionRevisores();
        // Asegurar que existan usuarios demo esperados (por si el localStorage fue modificado)
        this.asegurarUsuariosDemo();
    }



    iniciarSesion(email, password) {
        const usuario = this.usuarios.find(u => u.email === email && u.password === password);
        if (usuario) {
            this.usuarioActual = usuario;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            return { success: true, usuario, mensaje: `Bienvenido ${usuario.nombre}` };
        }
        return { success: false, error: 'Credenciales incorrectas' };
    }

    cerrarSesion() {
        this.usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        return { success: true, mensaje: 'Sesión cerrada correctamente' };
    }

    registrarUsuario(nombre, email, password, rol = 'usuario') {
        if (this.usuarios.find(u => u.email === email)) {
            return { success: false, error: 'El usuario ya existe' };
        }

        const nuevoUsuario = {
            id: this.usuarios.length + 1,
            nombre,
            email,
            password,
            rol,
            fechaRegistro: new Date().toISOString(),
            activo: true
        };

        this.usuarios.push(nuevoUsuario);
        this.guardarDatos();
        this.crearNotificacion(
            'system',
            nuevoUsuario.id,
            '¡Bienvenido al sistema!',
            'Tu cuenta ha sido creada exitosamente'
        );

        return { success: true, usuario: nuevoUsuario, mensaje: 'Usuario registrado exitosamente' };
    }

    crearProyecto(datosProyecto) {
        if (!this.gestorPeriodos.esPeriodoEnviosActivo()) {
            return {
                success: false,
                error: 'No se pueden crear proyectos fuera del período de envíos activo'
            };
        }

        const nuevoProyecto = {
            id: this.proyectos.length + 1,
            ...datosProyecto,
            fechaCreacion: new Date().toISOString(),
            creadoPor: this.usuarioActual.id,
            estado: 'planificacion',
            progreso: 0,
            tareas: [],
            equipo: datosProyecto.equipo || [],
            periodoAcademico: this.gestorPeriodos.periodoActual?.nombre || 'No asignado',
            areaConocimiento: datosProyecto.areaConocimiento || 'General'
        };

        this.proyectos.push(nuevoProyecto);
        this.guardarDatos();

        nuevoProyecto.equipo.forEach(miembroId => {
            this.crearNotificacion(
                'proyecto',
                miembroId,
                'Nuevo proyecto asignado',
                `Has sido asignado al proyecto: ${nuevoProyecto.titulo}`
            );
        });

        return { success: true, proyecto: nuevoProyecto, mensaje: 'Proyecto creado exitosamente' };
    }


    editarProyecto(id, datosActualizados) {
        const proyectoIndex = this.proyectos.findIndex(p => p.id === id);
        if (proyectoIndex === -1) {
            return { success: false, error: 'Proyecto no encontrado' };
        }

        this.proyectos[proyectoIndex] = { ...this.proyectos[proyectoIndex], ...datosActualizados };
        this.guardarDatos();
        return { success: true, proyecto: this.proyectos[proyectoIndex], mensaje: 'Proyecto actualizado' };
    }

    eliminarProyecto(id) {
        const proyectoIndex = this.proyectos.findIndex(p => p.id === id);
        if (proyectoIndex === -1) {
            return { success: false, error: 'Proyecto no encontrado' };
        }

        const proyectoEliminado = this.proyectos.splice(proyectoIndex, 1)[0];
        this.guardarDatos();

        proyectoEliminado.equipo.forEach(miembroId => {
            this.crearNotificacion(
                'sistema',
                miembroId,
                'Proyecto eliminado',
                `El proyecto "${proyectoEliminado.titulo}" ha sido eliminado`
            );
        });

        return { success: true, mensaje: 'Proyecto eliminado correctamente' };
    }

    cambiarEstadoProyecto(id, nuevoEstado) {
        const proyecto = this.proyectos.find(p => p.id === id);
        if (!proyecto) {
            return { success: false, error: 'Proyecto no encontrado' };
        }

        proyecto.estado = nuevoEstado;
        proyecto.fechaActualizacion = new Date().toISOString();
        this.guardarDatos();

        this.crearNotificacion(
            'estado',
            proyecto.responsable,
            'Estado de proyecto actualizado',
            `El proyecto "${proyecto.titulo}" cambió a estado: ${nuevoEstado}`
        );

        return { success: true, proyecto, mensaje: `Estado cambiado a: ${nuevoEstado}` };
    }

    asignarResponsable(idProyecto, idUsuario) {
        const proyecto = this.proyectos.find(p => p.id === idProyecto);
        const usuario = this.usuarios.find(u => u.id === idUsuario);

        if (!proyecto || !usuario) {
            return { success: false, error: 'Proyecto o usuario no encontrado' };
        }

        proyecto.responsable = usuario.nombre;
        proyecto.responsableId = idUsuario;
        this.guardarDatos();

        this.crearNotificacion(
            'asignacion',
            idUsuario,
            'Nueva asignación',
            `Has sido asignado como responsable del proyecto: ${proyecto.titulo}`
        );

        return { success: true, proyecto, mensaje: `Responsable asignado: ${usuario.nombre}` };
    }

    gestionarEquipo(idProyecto, accion, idUsuario) {
        const proyecto = this.proyectos.find(p => p.id === idProyecto);
        const usuario = this.usuarios.find(u => u.id === idUsuario);

        if (!proyecto || !usuario) {
            return { success: false, error: 'Proyecto o usuario no encontrado' };
        }

        if (accion === 'agregar') {
            if (!proyecto.equipo.includes(idUsuario)) {
                proyecto.equipo.push(idUsuario);
                this.crearNotificacion(
                    'equipo',
                    idUsuario,
                    'Agregado al equipo',
                    `Has sido agregado al equipo del proyecto: ${proyecto.titulo}`
                );
            }
        } else if (accion === 'remover') {
            proyecto.equipo = proyecto.equipo.filter(id => id !== idUsuario);
            this.crearNotificacion(
                'equipo',
                idUsuario,
                'Removido del equipo',
                `Has sido removido del equipo del proyecto: ${proyecto.titulo}`
            );
        }

        this.guardarDatos();
        return { success: true, proyecto, mensaje: `Equipo actualizado: ${accion} ${usuario.nombre}` };
    }

    actualizarProgreso(id, nuevoProgreso) {
        const proyecto = this.proyectos.find(p => p.id === id);
        if (!proyecto) {
            return { success: false, error: 'Proyecto no encontrado' };
        }

        proyecto.progreso = Math.max(0, Math.min(100, nuevoProgreso));
        proyecto.fechaActualizacion = new Date().toISOString();
        this.guardarDatos();

        return { success: true, proyecto, mensaje: `Progreso actualizado: ${proyecto.progreso}%` };
    }

    buscarProyectos(filtros = {}) {
        let resultados = this.proyectos;

        if (filtros.estado) {
            resultados = resultados.filter(p => p.estado === filtros.estado);
        }

        if (filtros.responsable) {
            resultados = resultados.filter(p => p.responsable?.includes(filtros.responsable));
        }

        if (filtros.prioridad) {
            resultados = resultados.filter(p => p.prioridad === filtros.prioridad);
        }

        if (filtros.busqueda) {
            const termino = filtros.busqueda.toLowerCase();
            resultados = resultados.filter(p =>
                p.titulo.toLowerCase().includes(termino) ||
                p.descripcion.toLowerCase().includes(termino)
            );
        }

        return resultados;
    }


    crearRevision(datosRevision) {
        const nuevaRevision = {
            id: this.revisiones.length + 1,
            ...datosRevision,
            fechaCreacion: new Date().toISOString(),
            creadaPor: this.usuarioActual.id,
            estado: 'pendiente',
            comentarios: []
        };

        this.revisiones.push(nuevaRevision);
        this.guardarDatos();

        this.crearNotificacion(
            'revision',
            datosRevision.revisorId,
            'Nueva revisión asignada',
            `Tienes una nueva revisión pendiente para el proyecto: ${this.getProyecto(datosRevision.proyectoId)?.titulo}`
        );

        return { success: true, revision: nuevaRevision, mensaje: 'Revisión creada exitosamente' };
    }

    aprobarRevision(idRevision, comentarios = '') {
        const revision = this.revisiones.find(r => r.id === idRevision);
        if (!revision) {
            return { success: false, error: 'Revisión no encontrada' };
        }

        revision.estado = 'aprobada';
        revision.fechaAprobacion = new Date().toISOString();
        revision.aprobadaPor = this.usuarioActual.id;
        revision.comentarios.push({
            autor: this.usuarioActual.nombre,
            comentario: comentarios || 'Revisión aprobada',
            fecha: new Date().toISOString()
        });

        this.guardarDatos();

        this.crearNotificacion(
            'revision',
            revision.creadaPor,
            'Revisión aprobada',
            `Tu revisión para el proyecto ha sido aprobada`
        );

        return { success: true, revision, mensaje: 'Revisión aprobada exitosamente' };
    }

    rechazarRevision(idRevision, motivo) {
        const revision = this.revisiones.find(r => r.id === idRevision);
        if (!revision) {
            return { success: false, error: 'Revisión no encontrada' };
        }

        revision.estado = 'rechazada';
        revision.motivoRechazo = motivo;
        revision.fechaRechazo = new Date().toISOString();
        revision.comentarios.push({
            autor: this.usuarioActual.nombre,
            comentario: `Rechazada: ${motivo}`,
            fecha: new Date().toISOString()
        });

        this.guardarDatos();

        this.crearNotificacion(
            'revision',
            revision.creadaPor,
            'Revisión rechazada',
            `Tu revisión ha sido rechazada: ${motivo}`
        );

        return { success: true, revision, mensaje: 'Revisión rechazada' };
    }

    programarRevision(idRevision, fechaProgramada) {
        const revision = this.revisiones.find(r => r.id === idRevision);
        if (!revision) {
            return { success: false, error: 'Revisión no encontrada' };
        }

        revision.fechaProgramada = fechaProgramada;
        revision.estado = 'programada';
        this.guardarDatos();

        return { success: true, revision, mensaje: `Revisión programada para: ${fechaProgramada}` };
    }

    agregarComentarioRevision(idRevision, comentario) {
        const revision = this.revisiones.find(r => r.id === idRevision);
        if (!revision) {
            return { success: false, error: 'Revisión no encontrada' };
        }

        revision.comentarios.push({
            autor: this.usuarioActual.nombre,
            comentario: comentario,
            fecha: new Date().toISOString()
        });

        this.guardarDatos();
        return { success: true, revision, mensaje: 'Comentario agregado' };
    }

    obtenerHistorialRevisiones(idProyecto) {
        return this.revisiones.filter(r => r.proyectoId === idProyecto)
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    }


    crearNotificacion(tipo, usuarioId, titulo, mensaje) {
        const nuevaNotificacion = {
            id: this.notificaciones.length + 1,
            tipo,
            usuarioId,
            titulo,
            mensaje,
            fecha: new Date().toISOString(),
            leida: false
        };

        this.notificaciones.push(nuevaNotificacion);
        this.guardarDatos();
        try {
            if (typeof enqueueNotification === 'function') {
                enqueueNotification({
                    to: usuarioId,
                    titulo,
                    mensaje,
                    tipo,
                    fecha: nuevaNotificacion.fecha
                });
            }
        } catch (e) {
            console.warn('No se pudo encolar notificación (enqueueNotification no disponible)', e);
        }

        return nuevaNotificacion;
    }

    marcarNotificacionLeida(id) {
        const notificacion = this.notificaciones.find(n => n.id === id);
        if (notificacion) {
            notificacion.leida = true;
            this.guardarDatos();
        }
        return notificacion;
    }

    obtenerNotificacionesUsuario(usuarioId) {
        return this.notificaciones
            .filter(n => n.usuarioId === usuarioId)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }


    generarReporteProyectos(tipoReporte = 'general') {
        const reporte = {
            fechaGeneracion: new Date().toISOString(),
            generadoPor: this.usuarioActual.nombre,
            tipo: tipoReporte,
            estadisticas: {
                totalProyectos: this.proyectos.length,
                proyectosActivos: this.proyectos.filter(p => p.estado === 'en_progreso').length,
                proyectosCompletados: this.proyectos.filter(p => p.estado === 'completado').length,
                proyectosAtrasados: this.proyectos.filter(p => this.estaAtrasado(p)).length,
                promedioProgreso: this.proyectos.reduce((sum, p) => sum + p.progreso, 0) / this.proyectos.length
            },
            proyectos: this.proyectos
        };

        return reporte;
    }

    gestionarUsuarios(accion, datosUsuario) {
        if (!this.esAdministrador()) {
            return { success: false, error: 'No tienes permisos de administrador' };
        }

        if (accion === 'crear') {
            return this.registrarUsuario(datosUsuario.nombre, datosUsuario.email, datosUsuario.password, datosUsuario.rol);
        } else if (accion === 'desactivar') {
            const usuario = this.usuarios.find(u => u.id === datosUsuario.id);
            if (usuario) {
                usuario.activo = false;
                this.guardarDatos();
                return { success: true, mensaje: 'Usuario desactivado' };
            }
        }

        return { success: false, error: 'Acción no válida' };
    }


    inicializarUsuarios() {
        const usuarios = [
            { id: 1, nombre: 'Administrador', email: 'admin@proyectos.com', password: 'admin123', rol: 'admin', activo: true, fechaRegistro: new Date().toISOString() },
            { id: 2, nombre: 'Estudiante Demo', email: 'estudiante@proyectos.com', password: 'est123', rol: 'estudiante', activo: true, fechaRegistro: new Date().toISOString() },
            { id: 3, nombre: 'Responsable Demo', email: 'responsable@proyectos.com', password: 'resp123', rol: 'responsable', activo: true, fechaRegistro: new Date().toISOString() },
            { id: 4, nombre: 'Revisor Demo', email: 'revisor@proyectos.com', password: 'rev123', rol: 'revisor', activo: true, fechaRegistro: new Date().toISOString() },
            { id: 5, nombre: 'Usuario Público', email: 'usuario@proyectos.com', password: 'user123', rol: 'usuario', activo: true, fechaRegistro: new Date().toISOString() }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        return usuarios;
    }

    asegurarUsuariosDemo() {
        // Usuarios demo esperados
        const demo = [
            { nombre: 'Administrador', email: 'admin@proyectos.com', password: 'admin123', rol: 'admin' },
            { nombre: 'Estudiante Demo', email: 'estudiante@proyectos.com', password: 'est123', rol: 'estudiante' },
            { nombre: 'Responsable Demo', email: 'responsable@proyectos.com', password: 'resp123', rol: 'responsable' },
            { nombre: 'Revisor Demo', email: 'revisor@proyectos.com', password: 'rev123', rol: 'revisor' },
            { nombre: 'Usuario Público', email: 'usuario@proyectos.com', password: 'user123', rol: 'usuario' }
        ];

        let changed = false;
        demo.forEach(d => {
            const exists = this.usuarios.find(u => u.email === d.email);
            if (!exists) {
                const nuevo = {
                    id: this.usuarios.length + 1,
                    nombre: d.nombre,
                    email: d.email,
                    password: d.password,
                    rol: d.rol,
                    fechaRegistro: new Date().toISOString(),
                    activo: true
                };
                this.usuarios.push(nuevo);
                changed = true;
            }
        });

        if (changed) this.guardarDatos();
    }

    inicializarProyectos() {
        const proyectos = [
            {
                id: 1,
                titulo: "Sistema de Gestión Académica",
                descripcion: "Desarrollo de plataforma para gestión de estudiantes y calificaciones",
                estado: "en_progreso",
                fechaInicio: "2024-10-01",
                fechaFin: "2024-12-15",
                presupuesto: 50000,
                prioridad: "alta",
                responsable: "Administrador",
                responsableId: 1,
                equipo: [1, 2],
                progreso: 65,
                fechaCreacion: new Date().toISOString(),
                creadoPor: 1
            }
        ];
        localStorage.setItem('proyectos', JSON.stringify(proyectos));
        return proyectos;
    }

    getProyecto(id) {
        return this.proyectos.find(p => p.id === id);
    }

    estaAtrasado(proyecto) {
        return new Date(proyecto.fechaFin) < new Date() && proyecto.estado !== 'completado';
    }

    esAdministrador() {
        return this.usuarioActual && this.usuarioActual.rol === 'admin';
    }

    // Permisos granularizados por rol y por proyecto
    puedeCrearProyecto() {
        return this.usuarioActual && (this.usuarioActual.rol === 'responsable' || this.usuarioActual.rol === 'admin');
    }

    puedeEditarProyecto(proyecto) {
        if (!this.usuarioActual) return false;
        return this.usuarioActual.rol === 'admin' || proyecto?.responsableId === this.usuarioActual.id;
    }

    puedeEliminarProyecto(proyecto) {
        if (!this.usuarioActual) return false;
        // Solo administradores pueden eliminar proyectos
        return this.usuarioActual.rol === 'admin';
    }

    puedeGestionarEquipo(proyecto) {
        if (!this.usuarioActual) return false;
        return this.usuarioActual.rol === 'admin' || proyecto?.responsableId === this.usuarioActual.id;
    }

    puedeCambiarEstado(proyecto) {
        if (!this.usuarioActual) return false;
        return this.usuarioActual.rol === 'admin' || proyecto?.responsableId === this.usuarioActual.id;
    }

    puedeCrearRevision(proyecto) {
        if (!this.usuarioActual) return false;
        return this.usuarioActual.rol === 'admin' || proyecto?.responsableId === this.usuarioActual.id;
    }

    guardarDatos() {
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
        localStorage.setItem('proyectos', JSON.stringify(this.proyectos));
        localStorage.setItem('revisiones', JSON.stringify(this.revisiones));
        localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones));
    }

    async enviarParaRevision(id) {
        try {
            const proyecto = this.proyectos.find(p => p.id === id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            }

            proyecto.estado = 'en_revision';
            proyecto.fechaEnvioRevision = new Date().toISOString();
            this.guardarDatos();

            let mensajeAdicional = '';
            let revisionCreada = null;

            if (proyecto.areaConocimiento) {
                const resultadoAsignacion = await this.gestorAsignacion.asignarRevisorAutomatico(id, proyecto.areaConocimiento);

                if (resultadoAsignacion.success) {
                    revisionCreada = await this.crearRevision({
                        proyectoId: id,
                        tipo: 'inicial',
                        revisorId: resultadoAsignacion.asignacion.revisorId,
                        descripcion: 'Revisión inicial asignada automáticamente'
                    });

                    this.crearNotificacion(
                        'revision',
                        proyecto.creadoPor,
                        'Proyecto enviado para revisión',
                        `Tu proyecto "${proyecto.titulo}" ha sido enviado para revisión. Revisor asignado: ${resultadoAsignacion.asignacion.revisorNombre}`
                    );

                    mensajeAdicional = resultadoAsignacion.mensaje;
                }
            }

            return {
                success: true,
                proyecto: proyecto,
                mensaje: `Proyecto enviado para revisión. ${mensajeAdicional}`.trim(),
                revision: revisionCreada?.revision || null
            };

        } catch (error) {
            console.error('Error en enviarParaRevision:', error);
            return {
                success: false,
                error: error.message,
                proyecto: null,
                revision: null
            };
        }
    }
    async obtenerProyectosProximos() {
        try {
            const fechasProximas = await this.gestorPeriodos.obtenerFechasProximas();
            const proyectosProximos = [];

            this.proyectos.forEach(proyecto => {
                if (proyecto.estado !== 'completado') {
                    fechasProximas.forEach(fecha => {
                        if (fecha.tipo.includes('Entrega')) {
                            proyectosProximos.push({
                                proyecto: proyecto,
                                fechaLimite: fecha,
                                tipo: 'entrega',
                                diasRestantes: this.calcularDiasRestantes(fecha.fecha)
                            });
                        }
                    });
                }
            });

            return {
                success: true,
                data: proyectosProximos,
                total: proyectosProximos.length
            };

        } catch (error) {
            console.error('Error en obtenerProyectosProximos:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                total: 0
            };
        }
    }

    calcularDiasRestantes(fechaLimite) {
        const hoy = new Date();
        const fecha = new Date(fechaLimite);
        const diferencia = fecha.getTime() - hoy.getTime();
        return Math.ceil(diferencia / (1000 * 3600 * 24));
    }

    crearEntrega(proyectoId, datosEntrega) {
        const proyecto = this.getProyecto(proyectoId);
        if (!proyecto) {
            return { success: false, error: 'Proyecto no encontrado' };
        }

        if (!this.usuarioActual) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        if (!proyecto.entregas) proyecto.entregas = [];

        const nuevaEntrega = {
            id: proyecto.entregas.length + 1,
            proyectoId: proyectoId,
            proyecto: proyecto.titulo,
            estudianteId: this.usuarioActual.id,
            titulo: datosEntrega.titulo || `Entrega ${proyecto.entregas.length + 1}`,
            descripcion: datosEntrega.descripcion || '',
            enlace: datosEntrega.enlace || null,
            archivo: datosEntrega.archivo || null,
            comentarios: [],
            fechaEntrega: new Date().toISOString(),
            estado: 'pendiente_revision',
            calificacion: null
        };

        proyecto.entregas.push(nuevaEntrega);
        this.guardarDatos();

        // Notificar al responsable y/o revisor asignado
        try {
            const destinatarios = new Set();
            if (proyecto.responsableId) destinatarios.add(proyecto.responsableId);
            if (this.gestorAsignacion && Array.isArray(this.gestorAsignacion.asignaciones)) {
                const asign = this.gestorAsignacion.asignaciones.find(a => a.proyectoId === proyectoId);
                if (asign) destinatarios.add(asign.revisorId);
            }

            destinatarios.forEach(uid => {
                this.crearNotificacion(
                    'entrega',
                    uid,
                    `Nueva entrega: ${nuevaEntrega.titulo}`,
                    `El estudiante ${this.usuarioActual.nombre} subió una entrega para el proyecto ${proyecto.titulo}`
                );
            });
        } catch (e) {
            // no fatal
            console.warn('Error al notificar sobre nueva entrega', e);
        }

        return { success: true, entrega: nuevaEntrega, mensaje: 'Entrega subida exitosamente' };
    }

    obtenerEntregasEstudiante(usuarioId) {
        const entregas = [];

        this.proyectos.forEach(proyecto => {
            if (!proyecto.entregas) return;
            proyecto.entregas.forEach(entrega => {
                if (entrega.estudianteId === usuarioId) {
                    entregas.push(Object.assign({}, entrega, { proyecto: proyecto.titulo, proyectoId: proyecto.id }));
                }
            });
        });

        // Ordenar por fecha más reciente
        entregas.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega));
        return entregas;
    }

    obtenerEntregasPendientesRevisor(revisorId) {
        const pendientes = [];

        this.proyectos.forEach(proyecto => {
            if (!proyecto.entregas) return;

            // Determinar revisor asignado para el proyecto (si existe)
            let revisorAsignado = null;
            if (this.gestorAsignacion && Array.isArray(this.gestorAsignacion.asignaciones)) {
                const asign = this.gestorAsignacion.asignaciones.find(a => a.proyectoId === proyecto.id);
                if (asign) revisorAsignado = asign.revisorId;
            }

            proyecto.entregas.forEach(entrega => {
                if (entrega.estado === 'pendiente_revision') {
                    // Incluir si el revisor asignado coincide o si el responsable del proyecto es el revisor
                    if (revisorAsignado === revisorId || proyecto.responsableId === revisorId) {
                        pendientes.push(Object.assign({}, entrega, { proyecto: proyecto.titulo, proyectoId: proyecto.id }));
                    }
                }
            });
        });

        // Ordenar por fecha más reciente
        pendientes.sort((a, b) => new Date(b.fechaEntrega) - new Date(a.fechaEntrega));
        return pendientes;
    }

    calificarEntrega(proyectoId, entregaId, calificacion, comentario = '') {
        const proyecto = this.getProyecto(proyectoId);
        if (!proyecto || !proyecto.entregas) {
            return { success: false, error: 'Proyecto o entrega no encontrada' };
        }

        const entrega = proyecto.entregas.find(e => e.id === entregaId);
        if (!entrega) {
            return { success: false, error: 'Entrega no encontrada' };
        }

        if (!this.usuarioActual) {
            return { success: false, error: 'Usuario no autenticado' };
        }

        // Solo revisores o responsables pueden calificar (permitir responsable también)
        const rol = this.usuarioActual.rol;
        if (rol !== 'revisor' && rol !== 'responsable' && rol !== 'admin') {
            return { success: false, error: 'No tienes permisos para calificar esta entrega' };
        }

        entrega.calificacion = Number(calificacion);
        entrega.estado = 'calificado';

        if (!entrega.comentarios) entrega.comentarios = [];
        if (comentario && comentario.trim().length > 0) {
            entrega.comentarios.push({
                revisor: this.usuarioActual.nombre,
                comentario: comentario,
                fecha: new Date().toISOString()
            });
        }

        this.guardarDatos();

        // Notificar al estudiante
        try {
            this.crearNotificacion(
                'calificacion',
                entrega.estudianteId,
                `Entrega calificada: ${entrega.titulo}`,
                `Tu entrega para el proyecto ${proyecto.titulo} fue calificada con ${entrega.calificacion}`
            );
        } catch (e) {
            console.warn('No se pudo notificar la calificación', e);
        }

        return { success: true, entrega, mensaje: 'Calificación registrada' };
    }

}


const sistema = new SistemaGestionProyectos();


function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const resultado = sistema.iniciarSesion(email, password);
    if (resultado.success) {
        alert(resultado.mensaje);
        window.location.href = 'index.html';
    } else {
        alert('Error: ' + resultado.error);
    }
}

function handleLogout() {
    const resultado = sistema.cerrarSesion();
    alert(resultado.mensaje);
    window.location.href = 'login.html';
}

function mostrarRegistro() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function handleRegister(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const rol = document.getElementById('reg-rol').value;

    const resultado = sistema.registrarUsuario(nombre, email, password, rol);
    if (resultado.success) {
        alert(resultado.mensaje);
        mostrarLogin();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function actualizarInfoUsuario() {
    const userInfo = document.getElementById('user-info');
    if (sistema.usuarioActual) {
        userInfo.innerHTML = `
            <span>👤 ${sistema.usuarioActual.nombre} (${sistema.usuarioActual.rol})</span>
            <button class="logout-btn" onclick="handleLogout()">🚪 Logout</button>
        `;
    }
}

function cargarProyectos() {
    const mainContent = document.getElementById('main-content');
    const proyectos = sistema.proyectos;

    mainContent.innerHTML = `
        <div class="gestion-proyectos">
            <h2>📋 Gestión de Proyectos</h2>
            
            <div class="acciones-superiores">
                ${sistema.puedeCrearProyecto() ? `<button onclick="mostrarFormularioProyecto()">➕ Crear Proyecto</button>` : ''}
                ${sistema.esAdministrador() ? `<button onclick="generarReporteProyectos()">📊 Generar Reporte</button>` : ''}
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
                            ${sistema.puedeEditarProyecto(proyecto) ? `<button onclick="editarProyecto(${proyecto.id})">✏️ Editar</button>` : ''}
                            ${sistema.puedeCambiarEstado(proyecto) ? `<button onclick="cambiarEstadoProyecto(${proyecto.id})">🔄 Estado</button>` : ''}
                            ${sistema.puedeGestionarEquipo(proyecto) ? `<button onclick="gestionarEquipoProyecto(${proyecto.id})">👥 Equipo</button>` : ''}
                            <button onclick="actualizarProgresoProyecto(${proyecto.id})">📈 Progreso</button>
                            ${sistema.puedeCrearRevision(proyecto) ? `<button onclick="crearRevisionProyecto(${proyecto.id})">🔍 Revisión</button>` : ''}
                            ${sistema.puedeEliminarProyecto(proyecto) ? `<button onclick="eliminarProyecto(${proyecto.id})">🗑️ Eliminar</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function mostrarFormularioProyecto() {
    if (!sistema.puedeCrearProyecto()) {
        alert('No tienes permisos para crear proyectos');
        return;
    }
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
}

function crearNuevoProyecto(event) {
    event.preventDefault();

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

    const resultado = sistema.crearProyecto(datosProyecto);
    if (resultado.success) {
        alert(resultado.mensaje);
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function editarProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;
    if (!sistema.puedeEditarProyecto(proyecto)) {
        alert('No tienes permisos para editar este proyecto');
        return;
    }

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
                <button type="button" onclick="cargarProyectos()">❌ Cancelar</button>
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
        cargarProyectos();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function eliminarProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;
    if (!sistema.puedeEliminarProyecto(proyecto)) {
        alert('No tienes permisos para eliminar este proyecto');
        return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
        const resultado = sistema.eliminarProyecto(id);
        alert(resultado.mensaje);
        cargarProyectos();
    }
}

function cambiarEstadoProyecto(id) {
    const proyecto = sistema.getProyecto(id);
    if (!proyecto) return;
    if (!sistema.puedeCambiarEstado(proyecto)) {
        alert('No tienes permisos para cambiar el estado de este proyecto');
        return;
    }

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
    if (!sistema.puedeCrearRevision(proyecto)) {
        alert('No tienes permisos para crear una revisión para este proyecto');
        return;
    }

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
    if (!sistema.puedeGestionarEquipo(proyecto)) {
        alert('No tienes permisos para gestionar el equipo de este proyecto');
        return;
    }

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
    // Solo responsables o administradores pueden crear revisiones desde este formulario
    if (!sistema.usuarioActual || (sistema.usuarioActual.rol !== 'admin' && sistema.usuarioActual.rol !== 'responsable')) {
        alert('Solo responsables o administradores pueden crear revisiones');
        return;
    }

    const proyectos = sistema.proyectos;
    const revisores = sistema.usuarios.filter(u => u.activo && u.rol === 'revisor');

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

    if (!sistema.usuarioActual || (sistema.usuarioActual.rol !== 'admin' && sistema.usuarioActual.rol !== 'responsable')) {
        alert('No tienes permisos para crear revisiones');
        return;
    }

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
            
            <div class="admin-acciones-rapidas">
                <h3>🚀 Acciones Rápidas</h3>
                <div class="admin-grid-acciones">
                    <div class="admin-accion-card" onclick="cargarConfiguracionPeriodos()">
                        <h4>📅 Periodos Académicos</h4>
                        <p>Gestionar periodos y fechas límite</p>
                    </div>
                    <div class="admin-accion-card" onclick="cargarPanelAsignacionRevisores()">
                        <h4>🔍 Asignación Revisores</h4>
                        <p>Asignación automática y balance</p>
                    </div>
                    <div class="admin-accion-card" onclick="gestionarNotificacionesSistema()">
                        <h4>🔔 Notificaciones</h4>
                        <p>Configurar sistema de alertas</p>
                    </div>
                    <div class="admin-accion-card" onclick="generarReporteProyectos()">
                        <h4>📊 Reportes</h4>
                        <p>Generar reportes del sistema</p>
                    </div>
                </div>
            </div>
            
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

function gestionarNotificacionesSistema() {
    const proyectosProximos = sistema.obtenerProyectosConPlazosProximos();

    let contenido = `
        <h3>🔔 Sistema de Notificaciones</h3>
        <div class="notificaciones-sistema">
            <h4>📅 Próximos Plazos</h4>
            ${proyectosProximos.length > 0 ? `
                <div class="proyectos-proximos">
                    ${proyectosProximos.map(item => `
                        <div class="proyecto-proximo ${item.fechaLimite.urgente ? 'urgente' : 'advertencia'}">
                            <h5>${item.proyecto.titulo}</h5>
                            <p><strong>${item.fechaLimite.tipo}:</strong> ${item.fechaLimite.fecha.toLocaleDateString()}</p>
                            <p><strong>Días restantes:</strong> ${item.fechaLimite.diasRestantes}</p>
                            <button onclick="notificarProyectoProximo(${item.proyecto.id}, '${item.fechaLimite.tipo}')">📢 Notificar</button>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No hay plazos próximos</p>'}
            
            <div class="configuracion-notificaciones">
                <h4>⚙️ Configuración</h4>
                <button onclick="configurarRecordatorios()">⏰ Configurar Recordatorios</button>
                <button onclick="probarSistemaNotificaciones()">🧪 Probar Notificaciones</button>
            </div>
        </div>
    `;

    mostrarModal(contenido);
}

function notificarProyectoProximo(proyectoId, tipoFechaLimite) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto) return;

    // Notificar a todos los miembros del equipo
    proyecto.equipo.forEach(miembroId => {
        sistema.crearNotificacion(
            'recordatorio',
            miembroId,
            `Recordatorio: ${tipoFechaLimite}`,
            `El proyecto "${proyecto.titulo}" tiene un plazo próximo: ${tipoFechaLimite}`
        );
    });

    alert(`Notificaciones enviadas al equipo del proyecto: ${proyecto.titulo}`);
}

function configurarRecordatorios() {
    let contenido = `
        <h3>⏰ Configuración de Recordatorios</h3>
        <form onsubmit="guardarConfiguracionRecordatorios(event)">
            <div class="form-group">
                <label>Recordatorio para entregas:</label>
                <select id="recordatorio-entregas">
                    <option value="7">7 días antes</option>
                    <option value="3">3 días antes</option>
                    <option value="1">1 día antes</option>
                    <option value="0">El mismo día</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Recordatorio para revisiones:</label>
                <select id="recordatorio-revisiones">
                    <option value="5">5 días antes</option>
                    <option value="3">3 días antes</option>
                    <option value="1">1 día antes</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="notificaciones-email"> Enviar notificaciones por email
                </label>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" id="notificaciones-push"> Notificaciones push en el sistema
                </label>
            </div>
            
            <div class="form-actions">
                <button type="submit">💾 Guardar Configuración</button>
            </div>
        </form>
    `;

    mostrarModal(contenido);
}

function guardarConfiguracionRecordatorios(event) {
    event.preventDefault();
    alert('Configuración de recordatorios guardada exitosamente');
    cerrarModal();
}

function probarSistemaNotificaciones() {
    sistema.crearNotificacion(
        'sistema',
        sistema.usuarioActual.id,
        'Prueba del Sistema de Notificaciones',
        'Esta es una notificación de prueba del sistema. El sistema está funcionando correctamente.'
    );

    alert('Notificación de prueba enviada. Revisa tu panel de notificaciones.');
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
    if (!sistema.esAdministrador()) {
        alert('Solo administradores pueden descargar reportes');
        return;
    }
    const reporte = sistema.generarReporteProyectos();
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-proyectos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
    const welcomeSection = document.getElementById('welcome-section');

    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }

    if (sistema.usuarioActual) {
        switch (sistema.usuarioActual.rol) {
            case 'estudiante':
                cargarDashboardEstudiante();
                break;

            case 'admin':
                cargarDashboardAdministrador();
                break;

            case 'responsable':
                cargarDashboardResponsable();
                break;

            case 'revisor':
                cargarDashboardRevisor();
                break;

            default:
                cargarDashboardGeneral();
                break;
        }
    } else {
        cargarDashboardPublico();
    }
}

function cargarDashboardAdministrador() {
    const mainContent = document.getElementById('main-content');
    const proyectos = sistema.proyectos;
    const usuarios = sistema.usuarios;
    const notificaciones = sistema.obtenerNotificacionesUsuario(sistema.usuarioActual.id);

    mainContent.innerHTML = `
        <div class="dashboard">
            <h2>⚙️ Panel de Administrador</h2>
            
            <div class="welcome-banner">
                <h3>¡Bienvenido, Administrador ${sistema.usuarioActual.nombre}!</h3>
                <p>Tienes control total sobre el sistema</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>📋 Total Proyectos</h3>
                    <p>${proyectos.length}</p>
                </div>
                <div class="stat-card" onclick="cargarAdministracion()" style="cursor: pointer;">
                    <h3>👥 Total Usuarios</h3>
                    <p>${usuarios.length}</p>
                </div>
                <div class="stat-card" onclick="cargarAdministracion()" style="cursor: pointer;">
                    <h3>🔍 Revisiones Activas</h3>
                    <p>${sistema.revisiones.filter(r => r.estado === 'pendiente').length}</p>
                </div>
                <div class="stat-card" onclick="cargarAdministracion()" style="cursor: pointer;">
                    <h3>📊 Reportes</h3>
                    <p>${sistema.revisiones.length}</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>🚀 Acciones Rápidas</h3>
                    <div class="acciones-rapidas">
                        <button onclick="mostrarFormularioNuevoUsuario()" class="btn-primary">➕ Nuevo Usuario</button>
                        <button onclick="generarReporteProyectos()" class="btn-secondary">📊 Generar Reporte</button>
                        <button onclick="cargarAdministracion()" class="btn-info">⚙️ Panel Admin</button>
                    </div>
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
                        ${notificaciones.length === 0 ? '<p class="sin-notificaciones">No hay notificaciones</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function cargarDashboardResponsable() {
    const mainContent = document.getElementById('main-content');
    const proyectosResponsable = sistema.proyectos.filter(p =>
        p.responsableId === sistema.usuarioActual.id
    );
    const notificaciones = sistema.obtenerNotificacionesUsuario(sistema.usuarioActual.id);

    mainContent.innerHTML = `
        <div class="dashboard">
            <h2>👨‍💼 Panel del Responsable</h2>
            
            <div class="welcome-banner">
                <h3>¡Bienvenido, ${sistema.usuarioActual.nombre}!</h3>
                <p>Gestiona los proyectos bajo tu responsabilidad</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>📋 Mis Proyectos</h3>
                    <p>${proyectosResponsable.length}</p>
                </div>
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>🚀 En Progreso</h3>
                    <p>${proyectosResponsable.filter(p => p.estado === 'en_progreso').length}</p>
                </div>
                <div class="stat-card" onclick="cargarProyectos()" style="cursor: pointer;">
                    <h3>✅ Completados</h3>
                    <p>${proyectosResponsable.filter(p => p.estado === 'completado').length}</p>
                </div>
                <div class="stat-card" onclick="cargarRevisiones()" style="cursor: pointer;">
                    <h3>🔍 Revisiones</h3>
                    <p>${sistema.revisiones.filter(r =>
        proyectosResponsable.some(p => p.id === r.proyectoId)
    ).length}</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>📋 Mis Proyectos Recientes</h3>
                    <div class="proyectos-recientes">
                        ${proyectosResponsable.slice(0, 5).map(proyecto => `
                            <div class="proyecto-mini">
                                <h4>${proyecto.titulo}</h4>
                                <span class="estado-mini ${proyecto.estado}">${proyecto.estado}</span>
                                <span class="progreso-mini">${proyecto.progreso}%</span>
                                <button onclick="editarProyecto(${proyecto.id})" class="btn-small">✏️</button>
                            </div>
                        `).join('')}
                        ${proyectosResponsable.length === 0 ?
            '<p>No tienes proyectos asignados.</p>' :
            '<button onclick="cargarProyectos()">Ver todos mis proyectos</button>'
        }
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>🔔 Notificaciones</h3>
                    <div class="notificaciones-recientes">
                        ${notificaciones.slice(0, 5).map(notif => `
                            <div class="notificacion-mini ${notif.leida ? 'leida' : 'nueva'}">
                                <strong>${notif.titulo}</strong>
                                <p>${notif.mensaje}</p>
                                <small>${new Date(notif.fecha).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                        ${notificaciones.length === 0 ? '<p class="sin-notificaciones">No hay notificaciones</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function cargarDashboardRevisor() {
    const mainContent = document.getElementById('main-content');
    const revisionesPendientes = sistema.revisiones.filter(r =>
        r.revisorId === sistema.usuarioActual.id && r.estado === 'pendiente'
    );
    const notificaciones = sistema.obtenerNotificacionesUsuario(sistema.usuarioActual.id);

    mainContent.innerHTML = `
        <div class="dashboard">
            <h2>🔍 Panel del Revisor</h2>
            
            <div class="welcome-banner">
                <h3>¡Bienvenido, ${sistema.usuarioActual.nombre}!</h3>
                <p>Revisa y evalúa los trabajos del equipo</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card" onclick="cargarRevisiones()" style="cursor: pointer;">
                    <h3>📋 Revisiones Pendientes</h3>
                    <p>${revisionesPendientes.length}</p>
                </div>
                <div class="stat-card" onclick="cargarEntregasPendientesRevisor()" style="cursor: pointer;">
                    <h3>📬 Entregas Pendientes</h3>
                    <p>${sistema.obtenerEntregasPendientesRevisor(sistema.usuarioActual.id).length}</p>
                </div>
                <div class="stat-card" onclick="cargarRevisiones()" style="cursor: pointer;">
                    <h3>✅ Revisiones Completadas</h3>
                    <p>${sistema.revisiones.filter(r =>
        r.revisorId === sistema.usuarioActual.id && r.estado !== 'pendiente'
    ).length}</p>
                </div>
                <div class="stat-card">
                    <h3>📊 Proyectos Revisados</h3>
                    <p>${new Set(sistema.revisiones
        .filter(r => r.revisorId === sistema.usuarioActual.id)
        .map(r => r.proyectoId)
    ).size}</p>
                </div>
                <div class="stat-card">
                    <h3>⭐ Calificaciones</h3>
                    <p>${sistema.revisiones.filter(r =>
        r.revisorId === sistema.usuarioActual.id && r.estado === 'aprobada'
    ).length}</p>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <h3>📝 Revisiones Pendientes</h3>
                    <div class="revisiones-pendientes">
                        ${revisionesPendientes.slice(0, 5).map(revision => {
        const proyecto = sistema.getProyecto(revision.proyectoId);
        return `
                                <div class="revision-mini">
                                    <h4>${proyecto?.titulo || 'Proyecto no encontrado'}</h4>
                                    <p><strong>Tipo:</strong> ${revision.tipo}</p>
                                    <small>${new Date(revision.fechaCreacion).toLocaleDateString()}</small>
                                    <button onclick="verDetallesRevision(${revision.id})" class="btn-small">👁️ Revisar</button>
                                </div>
                            `;
    }).join('')}
                        ${revisionesPendientes.length === 0 ?
            '<p>No tienes revisiones pendientes.</p>' :
            '<button onclick="cargarRevisiones()">Ver todas las revisiones</button>'
        }
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>🔔 Notificaciones</h3>
                    <div class="notificaciones-recientes">
                        ${notificaciones.slice(0, 5).map(notif => `
                            <div class="notificacion-mini ${notif.leida ? 'leida' : 'nueva'}">
                                <strong>${notif.titulo}</strong>
                                <p>${notif.mensaje}</p>
                                <small>${new Date(notif.fecha).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                        ${notificaciones.length === 0 ? '<p class="sin-notificaciones">No hay notificaciones</p>' : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Vista para que el revisor vea las entregas pendientes que debe revisar
function cargarEntregasPendientesRevisor() {
    if (!sistema.usuarioActual || sistema.usuarioActual.rol !== 'revisor') {
        alert('Solo los revisores pueden acceder a esta sección');
        return;
    }

    const entregas = sistema.obtenerEntregasPendientesRevisor(sistema.usuarioActual.id);
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="entregas-pendientes-revisor">
            <h2>📬 Entregas pendientes para revisión</h2>
            <div class="lista-entregas">
                ${entregas.length === 0 ? '<p>No hay entregas pendientes.</p>' : ''}
                ${entregas.map(entrega => `
                    <div class="entrega-item">
                        <h4>${entrega.titulo}</h4>
                        <p><strong>Proyecto:</strong> ${entrega.proyecto}</p>
                        <p><strong>Estudiante ID:</strong> ${entrega.estudianteId}</p>
                        <p><small>Fecha: ${new Date(entrega.fechaEntrega).toLocaleString()}</small></p>
                        <div class="acciones">
                            <button onclick="verDetalleEntregaRevisor(${entrega.proyectoId}, ${entrega.id})">👁️ Ver</button>
                            <button onclick="abrirModalCalificarEntrega(${entrega.proyectoId}, ${entrega.id})">📝 Calificar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function verDetalleEntregaRevisor(proyectoId, entregaId) {
    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto || !proyecto.entregas) return;
    const entrega = proyecto.entregas.find(e => e.id === entregaId);
    if (!entrega) return;

    let contenido = `
        <h3>Detalles de la entrega</h3>
        <p><strong>Título:</strong> ${entrega.titulo}</p>
        <p><strong>Proyecto:</strong> ${proyecto.titulo}</p>
        <p><strong>Estudiante ID:</strong> ${entrega.estudianteId}</p>
        <p><strong>Descripción:</strong> ${entrega.descripcion || 'N/A'}</p>
        <p><strong>Enlace:</strong> ${entrega.enlace ? `<a href="${entrega.enlace}" target="_blank">Abrir</a>` : 'N/A'}</p>
        <p><strong>Fecha entrega:</strong> ${new Date(entrega.fechaEntrega).toLocaleString()}</p>
    `;

    if (entrega.comentarios && entrega.comentarios.length > 0) {
        contenido += `<div class="comentarios"><h4>Comentarios:</h4>${entrega.comentarios.map(c => `<div><strong>${c.revisor || c.autor || 'Usuario'}</strong> <small>${new Date(c.fecha).toLocaleString()}</small><p>${c.comentario || ''}</p></div>`).join('')}</div>`;
    }

    contenido += `<div class="form-actions"><button onclick="abrirModalCalificarEntrega(${proyectoId}, ${entregaId})">📝 Calificar</button></div>`;

    mostrarModal(contenido);
}

function abrirModalCalificarEntrega(proyectoId, entregaId) {
    if (!sistema.usuarioActual || (sistema.usuarioActual.rol !== 'revisor' && sistema.usuarioActual.rol !== 'responsable' && sistema.usuarioActual.rol !== 'admin')) {
        alert('No tienes permisos para calificar esta entrega');
        return;
    }

    const proyecto = sistema.getProyecto(proyectoId);
    if (!proyecto || !proyecto.entregas) return;
    const entrega = proyecto.entregas.find(e => e.id === entregaId);
    if (!entrega) return;

    const contenido = `
        <h3>Calificar entrega: ${entrega.titulo}</h3>
        <form onsubmit="submitCalificacion(event, ${proyectoId}, ${entregaId})">
            <div class="form-group">
                <label>Calificación (0-100):</label>
                <input type="number" id="calificacion-input" min="0" max="100" required>
            </div>
            <div class="form-group">
                <label>Comentario:</label>
                <textarea id="calificacion-comentario" placeholder="Comentarios para el estudiante..."></textarea>
            </div>
            <div class="form-actions">
                <button type="submit">💾 Guardar Calificación</button>
                <button type="button" onclick="cerrarModal()">Cancelar</button>
            </div>
        </form>
    `;

    mostrarModal(contenido);
}

function submitCalificacion(event, proyectoId, entregaId) {
    event.preventDefault();
    const calificacion = document.getElementById('calificacion-input').value;
    const comentario = document.getElementById('calificacion-comentario').value;

    const resultado = sistema.calificarEntrega(proyectoId, entregaId, calificacion, comentario);
    if (resultado.success) {
        alert(resultado.mensaje);
        cerrarModal();
        // si estamos en la vista de entregas pendientes, recargarla
        if (document.querySelector('.entregas-pendientes-revisor')) cargarEntregasPendientesRevisor();
    } else {
        alert('Error: ' + resultado.error);
    }
}

function cargarDashboardGeneral() {
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
                        ${notificaciones.length === 0 ? '<p class="sin-notificaciones">No hay notificaciones</p>' : ''}
                    </div>
                    <button onclick="cargarNotificaciones()">Ver todas las notificaciones</button>
                </div>
            </div>
        </div>
    `;
}

function cargarDashboardPublico() {
    const mainContent = document.getElementById('main-content');

    mainContent.innerHTML = `
        <div class="dashboard-publico">
            <h2>🚀 Sistema de Gestión de Proyectos</h2>
            
            <div class="welcome-banner">
                <h3>Bienvenido al Sistema</h3>
                <p>Gestiona tus proyectos de manera eficiente - 21 Casos de Uso Implementados</p>
                <a href="login.html" class="btn-primary">🔐 Iniciar Sesión</a>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <h3>👨‍💼 Para Responsables</h3>
                    <p>Crea y gestiona proyectos, asigna equipos y supervisa el progreso</p>
                </div>
                <div class="feature-card">
                    <h3>🎓 Para Estudiantes</h3>
                    <p>Sube entregas, revisa calificaciones y recibe feedback</p>
                </div>
                <div class="feature-card">
                    <h3>🔍 Para Revisores</h3>
                    <p>Evalúa trabajos, proporciona feedback y aprueba entregas</p>
                </div>
                <div class="feature-card">
                    <h3>⚙️ Para Administradores</h3>
                    <p>Gestiona usuarios, genera reportes y supervisa el sistema</p>
                </div>
            </div>
            
            <div class="demo-credentials">
                <h4>🔑 Credenciales de Demo:</h4>
                <div class="credentials-grid">
                    <div class="credential-item">
                        <strong>Administrador:</strong><br>
                        admin@proyectos.com / admin123
                    </div>
                    <div class="credential-item">
                        <strong>Estudiante:</strong><br>
                        estudiante@proyectos.com / est123
                    </div>
                    <div class="credential-item">
                        <strong>Responsable:</strong><br>
                        responsable@proyectos.com / resp123
                    </div>
                    <div class="credential-item">
                        <strong>Revisor:</strong><br>
                        revisor@proyectos.com / rev123
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mostrarModal(contenido) {
    document.getElementById('modal-body').innerHTML = contenido;
    document.getElementById('modal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    actualizarInfoUsuario();

    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
        }
    }
});