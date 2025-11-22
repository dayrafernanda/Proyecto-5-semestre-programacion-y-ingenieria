import { Request, Response } from 'express';

export const crearNovedad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, descripcion, tipo, estudiante, prioridad, metadata } = req.body;
    
    // Simulación temporal - reemplazar con modelo real
    const nuevaNovedad = {
      _id: 'temp-id',
      titulo,
      descripcion,
      tipo,
      estudiante,
      prioridad,
      metadata,
      creadoPor: (req as any).user?._id || 'unknown',
      estado: 'pendiente',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    res.status(201).json({
      success: true,
      data: nuevaNovedad,
      message: 'Novedad creada exitosamente (modo simulación)'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al crear novedad',
      error: error.message
    });
  }
};

export const obtenerNovedades = async (req: Request, res: Response): Promise<void> => {
  try {
    // Datos de ejemplo para desarrollo
    const novedadesEjemplo = [
      {
        _id: '1',
        titulo: 'Solicitud de cambio de horario',
        descripcion: 'Necesito cambiar del grupo A al B por conflicto de trabajo',
        tipo: { _id: '1', nombre: 'Cambio Académico', categoria: 'academica' },
        estudiante: { _id: '1', nombre: 'Juan Pérez', email: 'juan@email.com' },
        estado: 'pendiente',
        prioridad: 'media',
        fechaCreacion: new Date(),
        creadoPor: { _id: '1', nombre: 'Sistema', email: 'sistema@email.com' }
      },
      {
        _id: '2', 
        titulo: 'Permiso médico',
        descripcion: 'Incapacidad por 3 días por gripe',
        tipo: { _id: '2', nombre: 'Permiso Médico', categoria: 'medica' },
        estudiante: { _id: '2', nombre: 'María García', email: 'maria@email.com' },
        estado: 'aprobada',
        prioridad: 'alta',
        fechaCreacion: new Date(),
        creadoPor: { _id: '2', nombre: 'María García', email: 'maria@email.com' }
      }
    ];

    res.json({
      success: true,
      data: novedadesEjemplo,
      paginacion: {
        pagina: 1,
        limite: 10,
        total: 2,
        paginas: 1
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener novedades',
      error: error.message
    });
  }
};

export const obtenerNovedadPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const novedadEjemplo = {
      _id: req.params.id,
      titulo: 'Solicitud de ejemplo',
      descripcion: 'Esta es una novedad de ejemplo',
      tipo: { _id: '1', nombre: 'Tipo Ejemplo', categoria: 'academica' },
      estudiante: { _id: '1', nombre: 'Estudiante Ejemplo', email: 'estudiante@email.com', role: 'student' },
      estado: 'pendiente',
      prioridad: 'media',
      fechaCreacion: new Date(),
      creadoPor: { _id: '1', nombre: 'Sistema', email: 'sistema@email.com' },
      seguimientos: []
    };

    res.json({
      success: true,
      data: novedadEjemplo
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener novedad',
      error: error.message
    });
  }
};

export const actualizarEstadoNovedad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estado, comentario } = req.body;
    
    const novedadActualizada = {
      _id: req.params.id,
      estado,
      fechaActualizacion: new Date()
    };

    res.json({
      success: true,
      data: novedadActualizada,
      message: 'Estado actualizado exitosamente (modo simulación)'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

export const obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
  try {
    const estadisticas = {
      total: [{ count: 10 }],
      porEstado: [
        { _id: 'pendiente', count: 5 },
        { _id: 'aprobada', count: 3 },
        { _id: 'rechazada', count: 2 }
      ],
      porPrioridad: [
        { _id: 'media', count: 6 },
        { _id: 'alta', count: 3 },
        { _id: 'baja', count: 1 }
      ],
      porCategoria: [
        { _id: 'academica', count: 6 },
        { _id: 'medica', count: 3 },
        { _id: 'administrativa', count: 1 }
      ]
    };

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};
