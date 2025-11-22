import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-detalle-novedad',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="card">
        <div class="card-header bg-info text-white">
          <h4 class="mb-0">
            <i class="bi bi-eye me-2"></i>
            Detalle de Novedad
          </h4>
        </div>
        <div class="card-body">
          <p class="text-muted">Vista detallada de novedad - En desarrollo</p>
          <button class="btn btn-secondary" routerLink="../">
            <i class="bi bi-arrow-left me-1"></i>
            Volver a la lista
          </button>
        </div>
      </div>
    </div>
  `
})
export class DetalleNovedadComponent { }
