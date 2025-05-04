import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommunicationService } from '../services/communication.service';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
    registerForm: FormGroup = new FormGroup({
      fullName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(2)]),
      role: new FormControl('', [Validators.required]),
      preferences: new FormControl(''),
      vendorName: new FormControl(''),
      addressLine1: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      postalCode: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required])
    });
  errorMessage: string = '';

  constructor(private http: HttpService, private router: Router) { }

  
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.errorMessage = '';

    const formData = this.registerForm.value;
    // Remove empty fields for non-selected role
    this.http.registerUser(formData).subscribe((data: any) => {
      console.log('Registration successful', data);
      this.router.navigate(['/login']);
    })


  }
}
