#!/bin/bash

echo "Ì¥ß Corrigiendo nombres de componentes..."

# Componentes con nombres corregidos
components=(
  "portfolio:PortfolioComponent"
  "project-review:ProjectReviewComponent" 
  "audit:AuditComponent"
  "user-management:UserManagementComponent"
  "academic-periods:AcademicPeriodsComponent"
  "repository:RepositoryComponent"
)

# Corregir cada componente
for component_pair in "${components[@]}"; do
  component_dir="${component_pair%:*}"
  component_class="${component_pair#*:}"
  
  echo "Ì≥ù Corrigiendo: $component_dir -> $component_class"
  
  # Corregir archivo TypeScript
  cat > src/app/components/${component_dir}/${component_dir}.component.ts << COMPONENT_EOF
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-${component_dir}',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './${component_dir}.component.html',
  styleUrl: './${component_dir}.component.scss'
})
export class ${component_class} {
  title = '${component_dir^}';
}
COMPONENT_EOF

  # Corregir template HTML
  cat > src/app/components/${component_dir}/${component_dir}.component.html << HTML_EOF
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
            M√≥dulo <strong>{{ title }}</strong> en desarrollo. 
            Esta funcionalidad estar√° disponible pr√≥ximamente.
          </div>
          
          <div class="text-center py-4">
            <i class="bi bi-tools display-1 text-muted"></i>
            <h5 class="mt-3 text-muted">P√°gina en construcci√≥n</h5>
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

done

echo "‚úÖ Nombres de componentes corregidos"
