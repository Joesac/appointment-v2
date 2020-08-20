import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

import { Insurance } from './insurance.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService {

  private _insurances = new BehaviorSubject<Insurance[]>([]);

  get insurances() {
    return this._insurances.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient, private snackBar: MatSnackBar) { }

  addNewInsurance(insurance: string) {
    const newInsurances = new Insurance('', insurance);
    let returnedId: string;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.post<{'_id': string, message: string}>('/api/addinsurance', {...newInsurances}, { headers })
    .pipe(switchMap (resData => {
      if (resData.message) {
        this.snackBar.open('Insurance already Exists', '', {
          verticalPosition: 'top',
          horizontalPosition: 'end',
          duration: 3000
        });
      }
      returnedId = resData._id;
      return this.insurances;
    }),
    take(1),
    tap(insurances => {
      if (returnedId) {
        newInsurances._id = returnedId;
        this._insurances.next(insurances.concat(newInsurances));
      }
    }));
  }

  fetchInsurances() {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );
    return this.http.get<[]>('/api/getInsurances/', { headers })
    .pipe(tap(resData => {
      this._insurances.next(resData);
    }));
  }
}
