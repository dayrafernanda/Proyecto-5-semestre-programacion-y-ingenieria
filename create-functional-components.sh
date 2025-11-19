#!/bin/bash

echo "���️ Creando componentes funcionales..."

# Componente de formulario de proyecto
cat > src/app/components/project-form/project-form.component.ts << 'PROJECT_FORM_EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

# Template del formulario de proyecto
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
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Área de Conocimiento *</label>
                <select class="form-select" formControlName="knowledgeArea">
                  <option value="">Seleccione un área</option>
                  <option *ngFor="let area of knowledgeAreas" [value]="area">{{ area }}</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Resumen Ejecutivo *</label>
                <textarea class="form-control" formControlName="summary" rows="5"
                          placeholder="Describa brevemente el proyecto, objetivos, metodología y resultados esperados..."></textarea>
                <small class="text-muted">Mínimo 100 caracteres</small>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label">Objetivos *</label>
                <textarea class="form-control" formControlName="objectives" rows="4"
                          placeholder="Especifique los objetivos generales y específicos del proyecto..."></textarea>
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

# Crear SCSS vacío
touch src/app/components/project-form/project-form.component.scss

echo "✅ Componentes funcionales creados"
echo "��� Reinicia el servidor para ver los cambios"
