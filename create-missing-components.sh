#!/bin/bash

echo "���️ Creando todos los componentes faltantes..."

# Lista de componentes a crear
components=(
  "portfolio"
  "project-review" 
  "audit"
  "user-management"
  "academic-periods"
  "repository"
)

# Crear cada componente con contenido básico
for component in "${components[@]}"; do
  echo "��� Creando: $component"
  
  # Crear archivo TypeScript
  cat > src/app/components/${component}/${component}.component.ts << COMPONENT_EOF
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${component}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './${component}.component.html',
  styleUrl: './${component}.component.scss'
})
export class ${component^}Component {
  title = '${component^}';
}
COMPONENT_EOF

  # Crear template HTML básico
  cat > src/app/components/${component}/${component}.component.html << HTML_EOF
<div class="container mt-4">
  <div class="row">
    <div class="col-12">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">
            <i class="bi bi-grid me-2"></i>
            {{ title }}
          </h4>
        </div>
        <div class="card-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Módulo <strong>{{ title }}</strong> en desarrollo. 
            Esta funcionalidad estará disponible próximamente.
          </div>
          
          <div class="text-center py-4">
            <i class="bi bi-tools display-1 text-muted"></i>
            <h5 class="mt-3 text-muted">Página en construcción</h5>
            <p class="text-muted">Estamos trabajando para implementar todas las funcionalidades.</p>
            <a routerLink="/dashboard" class="btn btn-success">
              <i class="bi bi-arrow-left me-1"></i>Volver al Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
HTML_EOF

  # Crear archivo SCSS vacío
  touch src/app/components/${component}/${component}.component.scss
  echo "/* ${component^} component styles */" > src/app/components/${component}/${component}.component.scss
  
done

# Asegurarnos de que project-form también esté correcto
if [ ! -f "src/app/components/project-form/project-form.component.ts" ]; then
  echo "��� Creando project-form..."
  cat > src/app/components/project-form/project-form.component.ts << 'PROJECT_FORM_EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss'
})
export class ProjectFormComponent {
  projectForm: FormGroup;
  knowledgeAreas = [
    'Desarrollo de Software',
    'Redes y Telecomunicaciones',
    'Automatización Industrial',
    'Gestión Empresarial',
    'Diseño Gráfico',
    'Mecánica Industrial'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      knowledgeArea: ['', Validators.required],
      summary: ['', [Validators.required, Validators.minLength(100)]],
      objectives: ['', Validators.required],
      methodology: [''],
      expectedResults: ['']
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      alert('Proyecto creado exitosamente. Será enviado para revisión.');
      this.router.navigate(['/mi-portafolio']);
    }
  }

  saveDraft() {
    alert('Borrador guardado exitosamente.');
  }
}
PROJECT_FORM_EOF
fi

# Crear template para project-form si no existe
if [ ! -f "src/app/components/project-form/project-form.component.html" ]; then
  cat > src/app/components/project-form/project-form.component.html << 'PROJECT_HTML_EOF'
<div class="container mt-4">
  <div class="row">
    <div class="col-12">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">
            <i class="bi bi-plus-circle me-2"></i>
            Nuevo Proyecto de Grado
          </h4>
        </div>
        <div class="card-body">
          <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-12 mb-3">
                <label class="form-label">Título del Proyecto *</label>
                <input type="text" class="form-control" formControlName="title" 
                       placeholder="Ingrese el título completo del proyecto">
                <div *ngIf="projectForm.get('title')?.invalid && projectForm.get('title')?.touched" 
                     class="text-danger small">
                  El título es requerido y debe tener al menos 10 caracteres
                </div>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Área de Conocimiento *</label>
                <select class="form-select" formControlName="knowledgeArea">
                  <option value="">Seleccione un área</option>
                  <option *ngFor="let area of knowledgeAreas" [value]="area">{{ area }}</option>
                </select>
                <div *ngIf="projectForm.get('knowledgeArea')?.invalid && projectForm.get('knowledgeArea')?.touched" 
                     class="text-danger small">
                  Debe seleccionar un área de conocimiento
                </div>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Resumen Ejecutivo *</label>
                <textarea class="form-control" formControlName="summary" rows="5"
                          placeholder="Describa brevemente el proyecto, objetivos, metodología y resultados esperados..."></textarea>
                <div *ngIf="projectForm.get('summary')?.invalid && projectForm.get('summary')?.touched" 
                     class="text-danger small">
                  El resumen es requerido y debe tener al menos 100 caracteres
                </div>
                <small class="text-muted">Mínimo 100 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Objetivos *</label>
                <textarea class="form-control" formControlName="objectives" rows="4"
                          placeholder="Especifique los objetivos generales y específicos del proyecto..."></textarea>
                <div *ngIf="projectForm.get('objectives')?.invalid && projectForm.get('objectives')?.touched" 
                     class="text-danger small">
                  Los objetivos son requeridos
                </div>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Metodología</label>
                <textarea class="form-control" formControlName="methodology" rows="3"
                          placeholder="Describa la metodología que utilizará..."></textarea>
              </div>

              <div class="col-12 mb-4">
                <label class="form-label">Resultados Esperados</label>
                <textarea class="form-control" formControlName="expectedResults" rows="3"
                          placeholder="Describa los resultados esperados..."></textarea>
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-outline-secondary" (click)="saveDraft()">
                <i class="bi bi-save me-1"></i>Guardar Borrador
              </button>
              <a routerLink="/dashboard" class="btn btn-outline-dark">
                <i class="bi bi-x-circle me-1"></i>Cancelar
              </a>
              <button type="submit" class="btn btn-success" [disabled]="projectForm.invalid">
                <i class="bi bi-send me-1"></i>Enviar para Revisión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
PROJECT_HTML_EOF
fi

# Crear SCSS para project-form si no existe
touch src/app/components/project-form/project-form.component.scss
echo "/* Project form styles */" > src/app/components/project-form/project-form.component.scss

echo "✅ Todos los componentes creados exitosamente!"
echo "��� Componentes creados:"
for component in "${components[@]}"; do
  echo "   ✅ $component"
done
echo "   ✅ project-form (actualizado)"
