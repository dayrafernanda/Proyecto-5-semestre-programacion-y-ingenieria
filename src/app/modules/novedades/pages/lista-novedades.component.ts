import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NovedadService } from '../services/novedad.service';

@Component({
  selector: 'app-lista-novedades',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">
            <i class="bi bi-list-check me-2"></i>
            Gestión de Novedades
          </h4>
        </div>
        <div class="card-body">
          <p>Módulo de novedades funcionando correctamente!</p>
          <button class="btn btn-success" routerLink="crear">
            Crear Nueva Novedad
          </button>
        </div>
      </div>
    </div>
  `
})
export class ListaNovedadesComponent implements OnInit {
  
  constructor(private novedadService: NovedadService) {}

  ngOnInit() {
    this.novedadService.obtenerNovedades().subscribe(data => {
      console.log('Datos de novedades:', data);
    });
  }
}
