import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';

import { User } from '../settings/users/user.model';
import { AuthUserData } from './authUserData.model';
import { Subject } from 'rxjs';

interface IUserData {
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userId: string;
  fullname: string;
  _username = new Subject<string>();
  _doctorClinic = new Subject<string>();

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    const params = new HttpParams().set('username', username).set('password', password);
    return this.http.get<IUserData>('/api/login', { params })
    .pipe(tap(resData => {
      return resData;
    }));
  }

  isLoggedIn() {
    if (localStorage.getItem('userLoggedInData') !== null) {
      return !!JSON.parse(localStorage.getItem('userLoggedInData')).token;
    } else {
      return false;
    }
  }

  get doctorClinic() {
    return this._doctorClinic.asObservable();
  }

  get username() {
    return this._username.asObservable();
  }

  getUsernameString() {
    return JSON.parse(localStorage.getItem('userLoggedInData')).username;
  }

  getUserClinic() {
    return JSON.parse(localStorage.getItem('userLoggedInData')).clinic;
  }

  getToken() {
    if (localStorage.getItem('userLoggedInData')) {
      return JSON.parse(localStorage.getItem('userLoggedInData')).token;
    }
  }

  getRole() {
    if (localStorage.getItem('userLoggedInData')) {
      return JSON.parse(localStorage.getItem('userLoggedInData')).role;
    }
  }

  getUserId() {
    return JSON.parse(localStorage.getItem('userLoggedInData')).user;
  }

  logout() {
    localStorage.removeItem('userLoggedInData');
    localStorage.removeItem('_isLoggedInAlready');
    return !this.isLoggedIn();
  }
}
