import mongoose, { Schema, Document } from 'mongoose';

export interface ISeguimiento extends Document {
  novedad: mongoose.Types.ObjectId;
  usuario: mongoose.Types.ObjectId;
  accion: string;
  comentario: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  fecha: Date;
  metadata: {
    tipo: 'comentario' | 'cambio_estado' | 'asignacion' | 'archivo';
    notificar: boolean;
    usuariosNotificar: mongoose.Types.ObjectId[];
  };
}

const SeguimientoSchema: Schema = new Schema({
  novedad: { 
    type: Schema.Types.ObjectId, 
    ref: 'Novedad', 
    required: true 
  },
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  accion: { 
    type: String, 
    required: [true, 'La acción es requerida'],
    trim: true
  },
  comentario: { 
    type: String, 
    required: [true, 'El comentario es requerido'],
    trim: true
  },
  estadoAnterior: { 
    type: String 
  },
  estadoNuevo: { 
    type: String 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    tipo: { 
      type: String, 
      enum: ['comentario', 'cambio_estado', 'asignacion', 'archivo'],
      default: 'comentario'
    },
    notificar: { type: Boolean, default: false },
    usuariosNotificar: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  }
});

export default mongoose.model<ISeguimiento>('Seguimiento', SeguimientoSchema);
