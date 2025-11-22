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

  projectState: 'borrador' | 'pendiente' = 'borrador';

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
      if (this.projectState === 'pendiente') {
        this.saveProject('enviado');
      } else {
        this.saveProject('guardado');
      }
    } else {
      this.markAllFieldsAsTouched();
      alert('Por favor complete todos los campos requeridos correctamente.');
    }
  }

  saveDraft() {
    this.projectState = 'borrador';
    if (this.projectForm.valid) {
      this.saveProject('guardado');
    } else {
      this.saveProject('guardado');
    }
  }

  private saveProject(action: 'guardado' | 'enviado') {
    const projectData = {
      ...this.projectForm.value,
      estado: this.projectState,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      id: this.generateProjectId()
    };

    console.log('Proyecto guardado:', projectData);

    this.simulateSaveToDatabase(projectData);

    if (action === 'enviado') {
      alert('¡Proyecto enviado para revisión exitosamente! Será visible en tu portafolio.');
      this.router.navigate(['/mi-portafolio']);
    } else {
      alert('Borrador guardado exitosamente. Puedes editarlo más tarde desde tu portafolio.');
      this.router.navigate(['/dashboard']);
    }
  }

  private simulateSaveToDatabase(projectData: any) {
    try {
      const existingProjects = JSON.parse(localStorage.getItem('studentProjects') || '[]');
      
      existingProjects.push(projectData);
      
      localStorage.setItem('studentProjects', JSON.stringify(existingProjects));
      
      console.log('Proyecto guardado en localStorage:', projectData);
    } catch (error) {
      console.error('Error guardando proyecto:', error);
    }
  }

  private generateProjectId(): string {
    return 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private markAllFieldsAsTouched() {
    Object.keys(this.projectForm.controls).forEach(key => {
      const control = this.projectForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  get isFormValid(): boolean {
    return this.projectForm.valid;
  }

  get titleErrors(): string {
    const control = this.projectForm.get('title');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'El título es requerido';
      if (control.errors['minlength']) return `Mínimo 10 caracteres (actual: ${control.value?.length || 0})`;
    }
    return '';
  }

  get knowledgeAreaErrors(): string {
    const control = this.projectForm.get('knowledgeArea');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'El área de conocimiento es requerida';
    }
    return '';
  }

  get summaryErrors(): string {
    const control = this.projectForm.get('summary');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'El resumen es requerido';
      if (control.errors['minlength']) return `Mínimo 100 caracteres (actual: ${control.value?.length || 0})`;
    }
    return '';
  }

  get objectivesErrors(): string {
    const control = this.projectForm.get('objectives');
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Los objetivos son requeridos';
    }
    return '';
  }
}
