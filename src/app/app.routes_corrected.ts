import { Routes } from '@angular/router';

// Copia todas tus rutas existentes aquí y agrega:
export const routes: Routes = [
  // ... tus rutas existentes ...
  
  // Ruta de novedades - formato correcto
  { 
    path: 'novedades', 
    loadChildren: () => import('./modules/novedades/novedades.module').then(m => m.NovedadesModule) 
  }
];
