import mongoose, { Schema, Document } from 'mongoose';

export interface ITipoNovedad extends Document {
  nombre: string;
  descripcion: string;
  categoria: 'academica' | 'disciplinaria' | 'medica' | 'administrativa' | 'permiso';
  flujoAprobacion: string[];
  camposPersonalizados: Array<{
    nombre: string;
    tipo: 'texto' | 'numero' | 'fecha' | 'select' | 'archivo';
    requerido: boolean;
    opciones?: string[];
  }>;
  activo: boolean;
  creadoPor: mongoose.Types.ObjectId;
}

const TipoNovedadSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    unique: true,
    trim: true
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción es requerida'] 
  },
  categoria: { 
    type: String, 
    enum: ['academica', 'disciplinaria', 'medica', 'administrativa', 'permiso'],
    required: true
  },
  flujoAprobacion: [{ 
    type: String, 
    enum: ['tutor', 'coordinador', 'director', 'admin'],
    required: true 
  }],
  camposPersonalizados: [{
    nombre: { type: String, required: true },
    tipo: { 
      type: String, 
      enum: ['texto', 'numero', 'fecha', 'select', 'archivo'],
      required: true 
    },
    requerido: { type: Boolean, default: false },
    opciones: [{ type: String }]
  }],
  activo: { 
    type: Boolean, 
    default: true 
  },
  creadoPor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<ITipoNovedad>('TipoNovedad', TipoNovedadSchema);
