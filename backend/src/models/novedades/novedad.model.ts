import mongoose, { Schema, Document } from 'mongoose';

export interface INovedad extends Document {
  titulo: string;
  descripcion: string;
  tipo: mongoose.Types.ObjectId;
  estudiante: mongoose.Types.ObjectId;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada' | 'completada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  creadoPor: mongoose.Types.ObjectId;
  asignadoA?: mongoose.Types.ObjectId;
  seguimientos: mongoose.Types.ObjectId[];
  archivosAdjuntos?: string[];
  metadata: {
    categoria: string;
    impacto: string;
    requiereAprobacion: boolean;
    fechaLimite?: Date;
  };
}

const NovedadSchema: Schema = new Schema({
  titulo: { 
    type: String, 
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción es requerida'],
    trim: true 
  },
  tipo: { 
    type: Schema.Types.ObjectId, 
    ref: 'TipoNovedad', 
    required: true 
  },
  estudiante: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_revision', 'aprobada', 'rechazada', 'completada'],
    default: 'pendiente'
  },
  prioridad: { 
    type: String, 
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: { 
    type: Date, 
    default: Date.now 
  },
  creadoPor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  asignadoA: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  seguimientos: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Seguimiento' 
  }],
  archivosAdjuntos: [{ 
    type: String 
  }],
  metadata: {
    categoria: { type: String, default: 'general' },
    impacto: { type: String, enum: ['bajo', 'medio', 'alto'], default: 'medio' },
    requiereAprobacion: { type: Boolean, default: true },
    fechaLimite: { type: Date }
  }
});

// Actualizar fecha de actualización antes de guardar
NovedadSchema.pre('save', function(next) {
  this.fechaActualizacion = new Date();
  next();
});

export default mongoose.model<INovedad>('Novedad', NovedadSchema);
