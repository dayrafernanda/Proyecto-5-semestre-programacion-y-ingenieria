import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-academic-periods',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './academic-periods.component.html',
  styleUrl: './academic-periods.component.scss'
})
export class AcademicPeriodsComponent {
  title = 'Academic-periods';
}
