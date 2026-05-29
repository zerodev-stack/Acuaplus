import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from '@angular/router';
import {AuthService} from "../../core/services/auth.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService,private route: ActivatedRoute, private router: Router) { this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  this.route.queryParams.subscribe(params => {
    if (params['registered']) {
      this.successMsg = 'Cuenta creada exitosamente. Por favor, inicia sesión.';
    }
  });
  }

  get email(){ return this.form.get('email')!;}
  get password() { return this.form.get('password')!;}

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const {email, password} = this.form.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error?.message || 'Error al inicar sesión. Por favor, inténtalo de nuevo.';
      }
    });
  }

}
