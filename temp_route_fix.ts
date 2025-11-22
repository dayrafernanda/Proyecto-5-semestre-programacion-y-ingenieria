{ 
  path: 'novedades', 
  loadChildren: () => import('./modules/novedades/novedades.module').then(m => m.NovedadesModule) 
}
