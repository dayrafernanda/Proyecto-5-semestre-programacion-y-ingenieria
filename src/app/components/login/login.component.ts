import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  credentials = {
    identifier: '',
    password: ''
  };
  
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.authService.login(this.credentials.identifier, this.credentials.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = 'Credenciales inválidas. Por favor, intente nuevamente.';
    }
  }
}
