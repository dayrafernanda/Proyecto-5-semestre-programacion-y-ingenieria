export interface Novedad {
  _id?: string;
  titulo: string;
  descripcion: string;
  tipo: TipoNovedad | string;
  estudiante: Usuario | string;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'completada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: Usuario | string;
  asignadoA?: Usuario | string;
  seguimientos: Seguimiento[];
  archivosAdjuntos?: string[];
  metadata: {
    categoria: string;
    impacto: 'bajo' | 'medio' | 'alto';
    requiereAprobacion: boolean;
    fechaLimite?: Date;
  };
}

export interface TipoNovedad {
  _id?: string;
  nombre: string;
  descripcion: string;
  categoria: 'academica' | 'disciplinaria' | 'medica' | 'administrativa' | 'permiso';
  flujoAprobacion: ('tutor' | 'coordinador' | 'director' | 'admin')[];
  camposPersonalizados: CampoPersonalizado[];
  activo: boolean;
}

export interface CampoPersonalizado {
  nombre: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'select' | 'archivo';
  requerido: boolean;
  opciones?: string[];
}

export interface Seguimiento {
  _id?: string;
  novedad: string;
  usuario: Usuario;
  accion: string;
  comentario: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  fecha: Date;
  metadata: {
    tipo: 'comentario' | 'cambio_estado' | 'asignacion' | 'archivo';
    notificar: boolean;
  };
}

export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'coordinator' | 'tutor';
}

export interface FiltroNovedades {
  estado?: string;
  prioridad?: string;
  tipo?: string;
  categoria?: string;
  estudiante?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}

export interface EstadisticasNovedades {
  total: number;
  porEstado: { estado: string; cantidad: number }[];
  porPrioridad: { prioridad: string; cantidad: number }[];
  porCategoria: { categoria: string; cantidad: number }[];
  tendenciaMensual: { mes: string; cantidad: number }[];
}
