import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { Clinic } from '../clinics/clinic.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  private _clinics = new BehaviorSubject<Clinic[]>([]);

  get clinics() {
    return this._clinics.asObservable();
  }

  set clinicsS(clinics: Clinic[]) {
    this._clinics.next(clinics);
  }

  constructor(private http: HttpClient, private authService: AuthService, private snackBar: MatSnackBar) { }

  addNewClinic(clinic: string) {
    const newClinic = new Clinic('', clinic);
    let returnedId: string;
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.post<{'_id': string, message?: string}>('/api/addclinic', {...newClinic}, { headers })
    .pipe(switchMap (resData => {
      if (resData.message) {
        this.snackBar.open('Clinic already Exists', '', {
          verticalPosition: 'top',
          horizontalPosition: 'end',
          duration: 3000
        });
      }
      returnedId = resData._id;
      return this.clinics;
    }),
    take(1),
    tap(clinics => {
      if (returnedId) {
        newClinic._id = returnedId;
        this._clinics.next(clinics.concat(newClinic));
      }
    }));
  }

  fetchClinics() {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );
    return this.http.get<[]>('/api/getclinics/', { headers })
    .pipe(tap(resData => {
      this._clinics.next(resData);
    }));
  }
}
