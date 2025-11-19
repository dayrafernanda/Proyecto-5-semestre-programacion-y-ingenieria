
echo "��� Reparando todos los errores..."

echo "��� Creando archivos SCSS..."
touch src/app/components/login/login.component.scss
touch src/app/components/dashboard/dashboard.component.scss

echo "/* Login component styles */" > src/app/components/login/login.component.scss
echo "/* Dashboard component styles */" > src/app/components/dashboard/dashboard.component.scss

echo "��� Verificando componentes..."

if ! grep -q "FormBuilder" src/app/components/login/login.component.ts; then
  echo "⚠️  Actualizando login component..."
  cat > src/app/components/login/login.component.ts << 'LOGIN_EOF'
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl = '';
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    if (this.authService.currentUserValue) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login({
      username: this.f['username'].value,
      password: this.f['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.error = 'Credenciales inválidas. Use: estudiante/estudiante, docente/docente, etc.';
        this.loading = false;
      }
    });
  }
}
LOGIN_EOF
fi

echo "✅ Todos los archivos reparados"
echo ""
echo "��� Reiniciando servidor..."
echo "��� La aplicación estará disponible en: http://localhost:4200"
