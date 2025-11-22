import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-crear-novedad',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <div class="card">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">Crear Nueva Novedad</h4>
        </div>
        <div class="card-body">
          <p>Formulario para crear novedad - En desarrollo</p>
          <button class="btn btn-secondary" routerLink="../">
            Volver
          </button>
        </div>
      </div>
    </div>
  `
})
export class CrearNovedadComponent { }
