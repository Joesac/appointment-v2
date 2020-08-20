import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { ClinicService } from './settings/clinics/clinic.service';
import { Clinic } from './settings/clinics/clinic.model';

export  enum AppointmentTypes {
  review = 'review',
  referral = 'referral',
  general = 'general'
}

export enum UserRoles {
  'system admin' = 'system admin',
  doctor = 'doctor',
  editor = 'editor'
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  _loggedInDoctorClinic: string;
  _isProcessing = new BehaviorSubject(false);
  _clinic = new BehaviorSubject<Clinic[]>([]);
  _pageTitle = new BehaviorSubject<string>('');

  role = '';
  isSystemAdmin: boolean;
  isEditor: boolean;
  isDoctor: boolean;

  _isARole = new BehaviorSubject<{isSystemAdmin: boolean, isEditor: boolean, isDoctor: boolean}>({
    isSystemAdmin: false,
    isEditor: false,
    isDoctor: false
  });

  constructor(private clinicService: ClinicService) { }

  get pageTitle() {
    return this._pageTitle.asObservable();
  }

  get clinics() {
    return this._clinic;
  }

  get isARole() {
    return this._isARole.asObservable();
  }

  get isProcessing() {
    return this._isProcessing.asObservable();
  }

  setPageTitle(pageTitle: string) {
    this._pageTitle.next(pageTitle);
  }

  checkIsRole() {
    return this.isARole.pipe(take(1), tap(d => {
      this.isSystemAdmin = d.isSystemAdmin;
      this.isEditor = d.isEditor;
      this.isDoctor = d.isDoctor;
    }));
  }

  get userId() {
    return JSON.parse(localStorage.getItem('userLoggedInData')).user;
  }

  getClinics() {
    this.clinicService.fetchClinics().pipe(
      tap(clns => {
        this._clinic.next(clns);
      })
    );
  }
}
