import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAuth } from '../models/user-auth.model';
import { UserRegister } from '../models/user-register.model';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  authenticateUser(email: string, password: string):Observable<UserAuth> {
    return this.http.post<UserAuth>('http://localhost:5000/api/registration/login', { email, password });
  }

  registerUser(userData: UserRegister): Observable<UserRegister> {
    return this.http.post<UserRegister>('http://localhost:5000/api/registration/register', userData);
  }
}
