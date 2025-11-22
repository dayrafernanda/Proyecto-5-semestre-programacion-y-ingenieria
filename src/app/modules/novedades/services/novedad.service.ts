import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NovedadService {
  
  obtenerNovedades(): Observable<any> {
    return of({
      success: true,
      data: [
        {
          _id: '1',
          titulo: 'Solicitud de ejemplo',
          descripcion: 'Esta es una novedad de ejemplo',
          estado: 'pendiente',
          prioridad: 'media',
          fechaCreacion: new Date()
        }
      ]
    });
  }
}
