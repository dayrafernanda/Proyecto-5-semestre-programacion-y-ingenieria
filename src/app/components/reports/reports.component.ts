import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  loading = false;
  previewContent = '';
  previewTitle = '';
  currentPreviewType = '';

  stats = {
    totalUsers: 156,
    activeProjects: 42,
    approvalRate: 78,
    systemUsage: 95
  };

  constructor() {}

  ngOnInit(): void {}

  async generateReport(type: string, format: string) {
    this.loading = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const filename = `reporte_${type}_${new Date().toISOString().split('T')[0]}`;
      
      switch (format) {
        case 'pdf':
          this.downloadPDF(filename);
          break;
        case 'excel':
          this.downloadExcel(filename);
          break;
      }
      
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    } finally {
      this.loading = false;
    }
  }

  previewReport(type: string) {
    this.currentPreviewType = type;
    
    switch (type) {
      case 'users':
        this.previewTitle = 'Vista Previa - Reporte de Usuarios';
        this.previewContent = this.generateUserPreview();
        break;
      case 'projects':
        this.previewTitle = 'Vista Previa - Reporte de Proyectos';
        this.previewContent = this.generateProjectPreview();
        break;
      case 'academic':
        this.previewTitle = 'Vista Previa - Métricas Académicas';
        this.previewContent = this.generateAcademicPreview();
        break;
      case 'system':
        this.previewTitle = 'Vista Previa - Rendimiento del Sistema';
        this.previewContent = this.generateSystemPreview();
        break;
    }
    
    this.showModal('previewModal');
  }

  downloadRecentReport(type: string) {
    const filename = `reporte_${type}_reciente`;
    this.downloadPDF(filename);
  }

  downloadCurrentPreview() {
    this.generateReport(this.currentPreviewType, 'pdf');
    this.hideModal('previewModal');
  }

  downloadCurrentPreviewExcel() {
    this.generateReport(this.currentPreviewType, 'excel');
    this.hideModal('previewModal');
  }

  private generateUserPreview(): string {
    return `
      <div class="report-preview">
        <h4 class="text-primary">Reporte de Usuarios del Sistema</h4>
        <p class="text-muted">Generado el: ${new Date().toLocaleDateString()}</p>
        
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead class="table-primary">
              <tr>
                <th>Rol</th>
                <th>Total Usuarios</th>
                <th>Activos</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Estudiantes</td>
                <td>120</td>
                <td>115</td>
                <td>75%</td>
              </tr>
              <tr>
                <td>Docentes</td>
                <td>25</td>
                <td>24</td>
                <td>16%</td>
              </tr>
              <tr>
                <td>Administradores</td>
                <td>5</td>
                <td>5</td>
                <td>3%</td>
              </tr>
              <tr>
                <td>Coordinadores</td>
                <td>6</td>
                <td>6</td>
                <td>4%</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-4">
          <h5>Resumen</h5>
          <ul>
            <li>Total de usuarios registrados: 156</li>
            <li>Usuarios activos: 150 (96%)</li>
            <li>Nuevos usuarios este mes: 12</li>
          </ul>
        </div>
      </div>
    `;
  }

  private generateProjectPreview(): string {
    return `
      <div class="report-preview">
        <h4 class="text-info">Reporte de Proyectos</h4>
        <p class="text-muted">Generado el: ${new Date().toLocaleDateString()}</p>
        
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead class="table-info">
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Activos</td>
                <td>42</td>
                <td>60%</td>
              </tr>
              <tr>
                <td>En revisión</td>
                <td>15</td>
                <td>21%</td>
              </tr>
              <tr>
                <td>Completados</td>
                <td>8</td>
                <td>11%</td>
              </tr>
              <tr>
                <td>Cancelados</td>
                <td>5</td>
                <td>7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private generateAcademicPreview(): string {
    return `
      <div class="report-preview">
        <h4 class="text-warning">Métricas Académicas</h4>
        <p class="text-muted">Generado el: ${new Date().toLocaleDateString()}</p>
        
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead class="table-warning">
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
                <th>Tendencia</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tasa de Aprobación</td>
                <td>78%</td>
                <td>↗️ +2%</td>
              </tr>
              <tr>
                <td>Promedio General</td>
                <td>4.2/5.0</td>
                <td>→ Estable</td>
              </tr>
              <tr>
                <td>Retención Estudiantil</td>
                <td>92%</td>
                <td>↗️ +1%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private generateSystemPreview(): string {
    return `
      <div class="report-preview">
        <h4 class="text-danger">Rendimiento del Sistema</h4>
        <p class="text-muted">Generado el: ${new Date().toLocaleDateString()}</p>
        
        <div class="table-responsive">
          <table class="table table-bordered table-striped">
            <thead class="table-danger">
              <tr>
                <th>Métrica</th>
                <th>Valor</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Uso del Sistema</td>
                <td>95%</td>
                <td>🟢 Excelente</td>
              </tr>
              <tr>
                <td>Tiempo de Respuesta</td>
                <td>120ms</td>
                <td>🟢 Óptimo</td>
              </tr>
              <tr>
                <td>Disponibilidad</td>
                <td>99.8%</td>
                <td>🟢 Excelente</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private downloadPDF(filename: string) {
    console.log(`Descargando PDF: ${filename}`);
    alert(`Reporte ${filename}.pdf generado exitosamente`);
  }

  private downloadExcel(filename: string) {
    console.log(`Descargando Excel: ${filename}`);
    alert(`Reporte ${filename}.xlsx generado exitosamente`);
  }

  private showModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  private hideModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.hide();
    }
  }
}