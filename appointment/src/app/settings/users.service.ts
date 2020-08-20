import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { User } from './users/user.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private _users = new BehaviorSubject<User[]>([]);

  get users() {
    return this._users.asObservable();
  }

  get userLoggedInId() {
    return this.authService.userId;
  }

  constructor(private http: HttpClient, private authService: AuthService, private snackBar: MatSnackBar) { }

  fetchUsers() {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );
    return this.http.get<[]>('/api/getallusers/', { headers })
    .pipe(tap(resData => {
      this._users.next(resData);
    }));
  }

  getUser(userId: string) {
    return this.users.pipe(take(1), map(users => {
      return {...users.find(u => u._id === userId)};
    }));
  }

  addNewUser(username: string, password: string, fullname: string, role: string, clinic?: string) {
    const newUser = new User('', username, password, fullname, role, new Date(), [], [], clinic);
    let returnedId: string;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.post<{'_id': string, message?: string}>('/api/insertusers', {...newUser}, { headers })
    .pipe(switchMap (resData => {
      if (resData.message) {
        this.snackBar.open('Username already Exists', '', {
          verticalPosition: 'top',
          horizontalPosition: 'end',
          duration: 3000
        });
      }
      returnedId = resData._id;
      return this.users;
    }),
    take(1),
    tap(users => {
      if (returnedId) {
        newUser._id = returnedId;
        this._users.next(users.concat(newUser));
      }
    }));
  }

  changePassword(oldPassword: string, newPassword: string) {
    const userId = this.authService.getUserId();
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.post(`/api/editPassword`, {userId, oldPassword, newPassword }, { headers })
      .pipe(tap(updateRes => {
        return updateRes;
      }));
  }

  editUser(userId: string, username: string, password: string, fullname: string, role: string, clinic?: string) {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.patch('/api/edituser/', {userId , fullname, username, password, role, clinic}, {headers})
    .pipe(tap(resp => {
      return resp;
    }));
  }
}
