#!/bin/bash

echo "í´§ ReparaciÃ³n completa del sistema..."

# 1. Parar todos los procesos de Angular
echo "í»‘ Parando procesos..."
taskkill /f /im node.exe 2>nul

# 2. Limpiar cache
echo "í·¹ Limpiando cache..."
rm -rf .angular
rm -rf node_modules/.cache
rm -rf dist

# 3. Verificar estructura crÃ­tica
echo "í³ Verificando estructura..."
mkdir -p src/app/components/login
mkdir -p src/app/components/dashboard

# 4. Asegurar que app.component.ts sea correcto
cat > src/app/app.component.ts << 'APP_EOF'
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: \`<router-outlet></router-outlet>\`,
  styles: []
})
export class AppComponent {
  title = 'Sistema de GestiÃ³n de Proyectos';
}
APP_EOF

# 5. Asegurar que main.ts sea correcto
cat > src/main.ts << 'MAIN_EOF'
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
MAIN_EOF

# 6. Asegurar rutas bÃ¡sicas
cat > src/app/app.routes.ts << 'ROUTES_EOF'
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];
ROUTES_EOF

# 7. Asegurar configuraciÃ³n bÃ¡sica
cat > src/app/app.config.ts << 'CONFIG_EOF'
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withHashLocation()),
    provideHttpClient()
  ]
};
CONFIG_EOF

echo "âœ… ReparaciÃ³n completada"
echo "íº€ Ejecuta: ng serve --port 4200 --open"
