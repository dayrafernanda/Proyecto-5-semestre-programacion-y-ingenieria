import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  knowledgeArea?: string;
  objectives?: string;
}

@Component({
  selector: 'app-mi-portafolio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="card shadow-sm">
        <div class="card-header bg-info text-white">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="mb-0">
              <i class="bi bi-folder me-2"></i>
              Mi Portafolio de Proyectos
            </h4>
            <span class="badge bg-light text-dark">
              {{ proyectosFiltrados.length }} proyecto(s)
            </span>
          </div>
        </div>
        <div class="card-body">
          
          <!-- Filtros y Estadísticas -->
          <div class="row mb-4">
            <div class="col-md-4">
              <label class="form-label">Filtrar por estado:</label>
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="filtrarProyectos()">
                <option value="todos">Todos los estados</option>
                <option value="borrador">��� Borradores</option>
                <option value="pendiente">⏳ En Revisión</option>
                <option value="aprobado">✅ Aprobados</option>
                <option value="rechazado">❌ Rechazados</option>
              </select>
            </div>
            <div class="col-md-8 text-end">
              <div class="btn-group">
                <button class="btn btn-success" routerLink="/nuevo-proyecto">
                  <i class="bi bi-plus-circle me-1"></i>
                  Nuevo Proyecto
                </button>
                <button class="btn btn-outline-secondary" (click)="toggleOrden()">
                  <i class="bi" [class.bi-sort-down]="ordenAscendente" [class.bi-sort-up]="!ordenAscendente"></i>
                  {{ ordenAscendente ? 'Más Antiguos' : 'Más Recientes' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Estadísticas Rápidas -->
          <div class="row mb-4">
            <div class="col-md-3">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h5 class="text-primary">{{ contarProyectosPorEstado('borrador') }}</h5>
                  <small class="text-muted">Borradores</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h5 class="text-warning">{{ contarProyectosPorEstado('pendiente') }}</h5>
                  <small class="text-muted">En Revisión</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h5 class="text-success">{{ contarProyectosPorEstado('aprobado') }}</h5>
                  <small class="text-muted">Aprobados</small>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card bg-light border-0">
                <div class="card-body text-center">
                  <h5 class="text-danger">{{ contarProyectosPorEstado('rechazado') }}</h5>
                  <small class="text-muted">Rechazados</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de Proyectos -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Título del Proyecto</th>
                  <th>Área</th>
                  <th>Estado</th>
                  <th>
                    <span (click)="toggleOrden()" class="sortable-header">
                      Fecha Creación 
                      <i class="bi ms-1" [class.bi-sort-down]="ordenAscendente" [class.bi-sort-up]="!ordenAscendente"></i>
                    </span>
                  </th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let proyecto of proyectosFiltrados" 
                    [class.table-warning]="proyecto.estado === 'pendiente'"
                    [class.table-success]="proyecto.estado === 'aprobado'"
                    [class.table-danger]="proyecto.estado === 'rechazado'"
                    [class.table-secondary]="proyecto.estado === 'borrador'">
                  <td>
                    <div>
                      <strong class="d-block">{{ proyecto.titulo }}</strong>
                      <small class="text-muted">{{ (proyecto.descripcion || proyecto.objectives) | slice:0:80 }}...</small>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary" *ngIf="proyecto.knowledgeArea">
                      {{ proyecto.knowledgeArea | slice:0:20 }}
                    </span>
                    <span class="badge bg-secondary" *ngIf="!proyecto.knowledgeArea">
                      Sin área
                    </span>
                  </td>
                  <td>
                    <span [class]="getBadgeClass(proyecto.estado)" class="badge">
                      <i [class]="getEstadoIcon(proyecto.estado)" class="me-1"></i>
                      {{ getEstadoTexto(proyecto.estado) }}
                    </span>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ proyecto.fechaCreacion | date:'dd/MM/yyyy' }}<br>
                      <span class="text-muted">{{ proyecto.fechaCreacion | date:'HH:mm' }}</span>
                    </small>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ proyecto.fechaActualizacion | date:'dd/MM/yyyy' }}<br>
                      <span class="text-muted">{{ proyecto.fechaActualizacion | date:'HH:mm' }}</span>
                    </small>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" [routerLink]="['/editar-proyecto', proyecto.id]" 
                              [disabled]="proyecto.estado !== 'borrador'">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-info" [routerLink]="['/detalle-proyecto', proyecto.id]">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-success" *ngIf="proyecto.estado === 'borrador'"
                              (click)="enviarParaRevision(proyecto)">
                        <i class="bi bi-send"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Mensaje si no hay proyectos -->
            <div *ngIf="proyectosFiltrados.length === 0" class="text-center py-5">
              <i class="bi bi-inbox display-4 text-muted"></i>
              <p class="mt-3 text-muted">No hay proyectos en tu portafolio</p>
              <button class="btn btn-success" routerLink="/nuevo-proyecto">
                <i class="bi bi-plus-circle me-1"></i>
                Crear tu primer proyecto
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .sortable-header {
      cursor: pointer;
      user-select: none;
    }
    .sortable-header:hover {
      color: #0d6efd;
    }
  `]
})
export class MiPortafolioComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  filtroEstado = 'todos';
  ordenAscendente = false; // false = más recientes primero

  ngOnInit() {
    this.cargarProyectos();
    this.filtrarProyectos();
  }

  cargarProyectos() {
    try {
      // Cargar proyectos desde localStorage
      const proyectosGuardados = localStorage.getItem('studentProjects');
      if (proyectosGuardados) {
        this.proyectos = JSON.parse(proyectosGuardados);
        
        // Convertir strings de fecha a objetos Date
        this.proyectos.forEach(proyecto => {
          proyecto.fechaCreacion = new Date(proyecto.fechaCreacion);
          proyecto.fechaActualizacion = new Date(proyecto.fechaActualizacion);
        });
        
        this.ordenarProyectos();
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
      this.proyectos = [];
    }
  }

  ordenarProyectos() {
    this.proyectos.sort((a, b) => {
      const fechaA = a.fechaCreacion.getTime();
      const fechaB = b.fechaCreacion.getTime();
      return this.ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
    });
    this.filtrarProyectos();
  }

  toggleOrden() {
    this.ordenAscendente = !this.ordenAscendente;
    this.ordenarProyectos();
  }

  filtrarProyectos() {
    if (this.filtroEstado === 'todos') {
      this.proyectosFiltrados = [...this.proyectos];
    } else {
      this.proyectosFiltrados = this.proyectos.filter(p => p.estado === this.filtroEstado);
    }
  }

  contarProyectosPorEstado(estado: string): number {
    return this.proyectos.filter(p => p.estado === estado).length;
  }

  getBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'borrador': 'bg-secondary',
      'pendiente': 'bg-warning',
      'aprobado': 'bg-success',
      'rechazado': 'bg-danger'
    };
    return clases[estado] || 'bg-secondary';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'borrador': 'bi-file-earmark',
      'pendiente': 'bi-clock',
      'aprobado': 'bi-check-circle',
      'rechazado': 'bi-x-circle'
    };
    return iconos[estado] || 'bi-question-circle';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'borrador': 'Borrador',
      'pendiente': 'En Revisión',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado'
    };
    return textos[estado] || estado;
  }

  enviarParaRevision(proyecto: Proyecto) {
    if (confirm('¿Estás seguro de que quieres enviar este proyecto para revisión? No podrás editarlo después.')) {
      proyecto.estado = 'pendiente';
      proyecto.fechaActualizacion = new Date();
      this.guardarProyectos();
      this.filtrarProyectos();
      alert('Proyecto enviado para revisión exitosamente.');
    }
  }

  private guardarProyectos() {
    localStorage.setItem('studentProjects', JSON.stringify(this.proyectos));
  }
}
