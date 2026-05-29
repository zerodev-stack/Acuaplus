import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  form: FormGroup;
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['buyer', [Validators.required]],
      phone: [''],
      business_name: [''],
      nit: ['']
    });
  

this.form.get('role')!.valueChanges.subscribe(role => {
  this.updateSellerValidators(role);
});
}

get name() {return this.form.get('name')!;}
get email() {return this.form.get('email')!;}
get password() {return this.form.get('password')!;}
get role() {return this.form.get('role')!;}
get phone() {return this.form.get('phone')!;}
get business_name() {return this.form.get('business_name')!;}
get nit() {return this.form.get('nit')!;}

get isSeller(){
  return this.role.value === 'seller';
}

private updateSellerValidators(role: string) {
  const businessCtrl = this.form.get('business_name')!;
  const nitCtrl = this.form.get('nit')!;


if (role === 'seller') {
  businessCtrl.setValidators([Validators.required, Validators.minLength(2)]);
  nitCtrl.setValidators([Validators.required]);
} else {
  businessCtrl.clearValidators();
  nitCtrl.clearValidators();
}

businessCtrl.updateValueAndValidity();
nitCtrl.updateValueAndValidity();
}

onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.loading = true;
  this.errorMsg = '';

  const raw = this.form.value;
  const payload: any = {
    name: raw.name,
    email: raw.email,
    password: raw.password,
    role: raw.role
  };
  if (raw.phone) payload.phone = raw.phone;
  if (raw.business_name) payload.business_name = raw.business_name;
  if (raw.nit) payload.nit = raw.nit;
this.authService.register(payload).subscribe({
  next: (res) => {
    this.loading = false;
    if (raw.role === 'seller') {
      this.successMsg = 'Registro exitoso. Tu cuenta está pendiente de aprobación por el administrador. Te notificaremos por correo electrónico una vez que tu cuenta sea aprobada.';
    } else {
      this.router.navigate(['/auth/login'], { queryParams: {registered: 'true'}
      });
    }
  }, error: (err) => {
    this.loading = false;
    this.errorMsg = err.error?.message || 'Error al registrar. Por favor, intenta nuevamente.';
  }
});
}
}