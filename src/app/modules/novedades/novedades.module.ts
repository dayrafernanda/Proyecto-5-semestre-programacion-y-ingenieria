import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListaNovedadesComponent } from './pages/lista-novedades.component';
import { CrearNovedadComponent } from './pages/crear-novedad.component';

const routes: Routes = [
  { path: '', component: ListaNovedadesComponent },
  { path: 'crear', component: CrearNovedadComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ListaNovedadesComponent,
    CrearNovedadComponent
  ]
})
export class NovedadesModule { }
