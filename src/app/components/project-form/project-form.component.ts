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
