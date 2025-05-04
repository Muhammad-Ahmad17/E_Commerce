import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';
import { UserAuth } from '../models/user-auth.model';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(2)])
  });
  errorMessage: string = '';

  constructor( private router: Router, private httpservice: HttpService, private commService: CommunicationService) {

  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.errorMessage = '';

    const loginData = this.loginForm.value;
    this.httpservice.authenticateUser(loginData.email, loginData.password).subscribe((data :UserAuth)=>{
      if (data) {
        console.log('Login successful', data);
        this.commService.userId=data.user.userId;
        data.user.role  && this.router.navigate([data.user.role]);
        
      } else {
        this.errorMessage = 'Invalid email or password';
      }
    })


  }
}
