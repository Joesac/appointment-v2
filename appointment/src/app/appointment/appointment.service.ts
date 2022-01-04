import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { Appointment } from './appointment.model';

import { AuthService } from '../auth/auth.service';
import { AppService, AppointmentTypes } from '../app.service';

interface ReturnedMyAppointment {
  fullname: string;
  _id: string;
  myAppointments: Appointment[];
}

export interface IAppointmentData {
  addedOn: string;
  bookedDate: string;
  clinic: string;
  contact: string;
  creator: {
    clinic: string | null;
    dateAdded: string;
    fullname: string;
    password: string;
    role: string;
    username: string;
    _id: string;
  },
  dateCriteriaField: string;
  done: string;
  editor: string;
  insurance: null | string;
  madeBy: string;
  name: string;
  remarks: ""
  response: string;
  time: null | string;
  _id: string;
}

export interface AppointmentsResponseData {
  // fullname: string;
  // _id: string;
  // reviews: Appointment[];
  // referrals: Appointment[];
  data: { reviews: IAppointmentData[], referrals: IAppointmentData[] }
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private _reviews = new BehaviorSubject<Appointment[]>([]);
  private _referrals = new BehaviorSubject<Appointment[]>([]);
  private _myCreatedReviews = new BehaviorSubject<Appointment[]>([]);
  private _myCreatedReferrals = new BehaviorSubject<Appointment[]>([]);
  _undoneReviews = new BehaviorSubject<IAppointmentData[]>([]);
  _undoneReferrals = new BehaviorSubject<IAppointmentData[]>([]);

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private appService: AppService
  ) { }

  get reviews() {
    return this._reviews.asObservable();
  }

  get referrals() {
    return this._referrals.asObservable();
  }

  get myCreatedReviews() {
    return this._myCreatedReviews.asObservable();
  }

  get myCreatedReferrals() {
    return this._myCreatedReferrals.asObservable();
  }

  get undoneReviews() {
    return this._undoneReviews.asObservable();
  }

  get undoneReferrals() {
    return this._undoneReferrals.asObservable();
  }

  getUndoneAppointment(dateFrom: Date = new Date(), dateTo: Date = null, searchValue: string = '') {
    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );

    return this.http.get<AppointmentsResponseData>(
      `/api/undone-appointments?dateFrom=${dateFrom}&dateTo=${dateTo}&searchValue=${searchValue}`,
      { headers }
    ).pipe(
      take(1),
      map(apptData => {
        // const formattedReview = [];
        // const formattedReferral = [];
        // for (const it of apptData) {
        //   for (const revIt of it.reviews) {
        //     revIt.madeBy = it.fullname;
        //     formattedReview.push(revIt);
        //   }
        //   for (const refIt of it.referrals) {
        //     refIt.madeBy = it.fullname;
        //     formattedReferral.push(refIt);
        //   }
        // }

        // this._undoneReviews.next(formattedReview);
        // this._undoneReferrals.next(formattedReferral);
        this._undoneReviews.next(apptData?.data.reviews);
        this._undoneReferrals.next(apptData?.data.referrals);
      })
    );
  }

  getMyAppointments(appointmentType: string) {
    const params = new HttpParams()
      .set('userId', this.authService.getUserId())
      .set('appointmentType', appointmentType)
      .set('token', this.authService.getToken())
      .set('clinic', this.authService.getUserClinic());

    return this.http
      .get<ReturnedMyAppointment>('/api/my-appointments', { params })
      .pipe(
        tap(appointmentData => {
          if (appointmentType === AppointmentTypes.review) {
            this._reviews.next(appointmentData[0].myAppointments);
          } else {
            this._referrals.next(appointmentData[0].myAppointments);
          }
        })
      );
  }

  getMyCreatedAppointments(appointmentType: string, dateFrom: Date, dateTo: any) {
    let params;
    if (dateTo !== null) {
      params = new HttpParams()
        .set('userId', this.authService.getUserId())
        .set('appointmentType', appointmentType)
        .set('token', this.authService.getToken())
        .set('dateFrom', dateFrom.toString())
        .set('dateTo', dateTo.toString());
    } else {
      params = new HttpParams()
        .set('userId', this.authService.getUserId())
        .set('appointmentType', appointmentType)
        .set('token', this.authService.getToken())
        .set('dateFrom', dateFrom.toString())
        .set('dateTo', 'null');
    }

    return this.http
      .get<ReturnedMyAppointment>('/api/MyCreatedAppointments', { params })
      .pipe(
        tap(appointmentData => {
          if (appointmentType === AppointmentTypes.review) {
            this._myCreatedReviews.next(appointmentData[0].myAppointments);
          } else {
            this._myCreatedReferrals.next(appointmentData[0].myAppointments);
          }
        })
      );
  }

  addNewAppointment(
    patientName: string,
    clinic: string,
    appointmentDate: Date = null,
    appointmentType: string,
    appointmentTime?: string,
    reason?: string
  ) {
    let returnedId;
    const newAppointment = new Appointment(
      null,
      this.appService.userId,
      patientName,
      clinic,
      appointmentDate,
      appointmentTime,
      appointmentType,
      null,
      '0',
      '',
      '',
      '',
      '',
      reason
    );

    const headers = new HttpHeaders().set(
      'Authorization',
      'Bearer ' + this.authService.getToken()
    );
    return this.http
      .post<{ _id: string }>(
        '/api/insert-appointment',
        { ...newAppointment },
        { headers }
      )
      .pipe(
        switchMap(resData => {
          returnedId = resData._id;
          if (appointmentType === AppointmentTypes.review) {
            return this.myCreatedReviews;
          } else {
            return this.myCreatedReferrals;
          }
        }),
        take(1),
        tap(appointment => {
          newAppointment._id = returnedId;
          if (appointmentType === AppointmentTypes.review) {
            this._myCreatedReviews.next(appointment.concat(newAppointment));
          } else {
            this._myCreatedReferrals.next(appointment.concat(newAppointment));
          }
        })
      );
  }

  cancel(id: string, appointmentType: string, myOwn: boolean) {
    const params = new HttpParams()
      .set('appointmentId', id)
      .set('appointmentType', appointmentType)
      .set('token', this.authService.getToken());

    return this.http.delete(`/api/deleteReview`, { params }).pipe(
      switchMap(() => {
        if (appointmentType === AppointmentTypes.review) {
          if (myOwn) {
            return this.myCreatedReviews;
          } else {
            return this.reviews;
          }
        } else {
          if (myOwn) {
            return this.myCreatedReferrals;
          } else {
            return this.referrals;
          }
        }
      }),
      take(1),
      tap(aptment => {
        if (appointmentType === AppointmentTypes.review) {
          if (myOwn) {
            this._myCreatedReviews.next(aptment.filter(ap => ap._id !== id));
          } else {
            this._reviews.next(aptment.filter(ap => ap._id !== id));
          }
        } else {
          if (myOwn) {
            this._myCreatedReferrals.next(aptment.filter(ap => ap._id !== id));
          } else {
            this._referrals.next(aptment.filter(ap => ap._id !== id));
          }
        }
      })
    );
  }

  updateAppointment(
    appointmentId: string,
    patientName: string,
    clinic: string,
    appointmentType: string,
    insurance: string,
    bookedDate: Date,
    bookedTime: string,
    contact: string,
    remarks: string,
    response: string,
    reason?: string,
    appointmentScope?: string,
    editor?: string,
    madeBy?: string
  ) {
    
    let updatedAppointment: any[];
    if (appointmentScope === AppointmentTypes.general) {
      let aptObs: Observable<IAppointmentData[]>;
      if (appointmentType === AppointmentTypes.review) {
        aptObs = this.undoneReviews;
      } else if (appointmentType === AppointmentTypes.referral) {
        aptObs = this.undoneReferrals;
      }

      return aptObs.pipe(
        take(1),
        switchMap(appointment => {
          this.authService.username.pipe(take(1)).subscribe(usn => { });
          const updatedAppointmentIndex = appointment.findIndex(ap => ap._id === appointmentId);
          updatedAppointment = [...appointment];
          updatedAppointment[updatedAppointmentIndex] = new Appointment(
            appointmentId,
            madeBy,
            patientName,
            clinic,
            bookedDate,
            bookedTime,
            appointmentType,
            insurance,
            '0',
            contact,
            response,
            remarks,
            editor
          );
          if (appointmentType === AppointmentTypes.review) {
            this._undoneReviews.next(updatedAppointment);
          } else {
            this._undoneReferrals.next(updatedAppointment);
          }
          
          const params = new HttpParams()
            .set(
              'data',
              JSON.stringify({ ...updatedAppointment[updatedAppointmentIndex] })
            )
            .set('appointmentType', appointmentType);

          const headers = new HttpHeaders().set(
            'Authorization',
            'Bearer ' + this.authService.getToken()
          );

          return this.http.post<[]>('/api/updatemyappointment', params, {
            headers
          });
        })
      );
    } else {
      let aptObs: Observable<Appointment[]>;
      if (appointmentType === AppointmentTypes.review) {
        aptObs = this.myCreatedReviews;
      } else if (appointmentType === AppointmentTypes.referral) {
        aptObs = this.myCreatedReferrals;
      }

      return aptObs.pipe(
        take(1),
        switchMap(appointment => {
          const updatedAppointmentIndex = appointment.findIndex(
            ap => ap._id === appointmentId
          );
          updatedAppointment = [...appointment];
          updatedAppointment[updatedAppointmentIndex] = new Appointment(
            appointmentId,
            '',
            patientName,
            clinic,
            bookedDate,
            bookedTime,
            appointmentType,
            insurance,
            '0',
            contact,
            response,
            remarks,
            '',
            reason
          );

          if (appointmentType === AppointmentTypes.review) {
            this._myCreatedReviews.next(updatedAppointment);
          } else {
            this._myCreatedReferrals.next(updatedAppointment);
          }

          const params = new HttpParams()
            .set(
              'data',
              JSON.stringify({ ...updatedAppointment[updatedAppointmentIndex] })
            )
            .set('appointmentType', appointmentType);
          const headers = new HttpHeaders().set(
            'Authorization',
            'Bearer ' + this.authService.getToken()
          );
          return this.http.post<[]>('/api/updatemyappointment', params, {
            headers
          });
        })
      );
    }
  }

  isDone(appointments: Appointment[], appointmentType) {
    const appointmentIds = [];
    for (const apt of appointments) {
      appointmentIds.push(apt._id);
    }

    let aptObs: Observable<Appointment[]>;

    if (appointmentType === AppointmentTypes.review) {
      aptObs = this.reviews;
    } else if (appointmentType === AppointmentTypes.referral) {
      aptObs = this.referrals;
    }

    return aptObs.pipe(
      take(1),
      switchMap(aptData => {
        for (const appointment of appointments) {
          aptData = aptData.filter(a => {
            return a._id !== appointment._id;
          });
        }

        const headers = new HttpHeaders().set(
          'Authorization',
          'Bearer ' + this.authService.getToken()
        );

        let urlResource;
        if (appointmentType === AppointmentTypes.review) {
          this._reviews.next(aptData);
          urlResource = 'completereview';
        } else if (appointmentType === AppointmentTypes.referral) {
          this._referrals.next(aptData);
          urlResource = 'completereferral';
        }

        return this.http.patch(
          `/api/${urlResource}`,
          { ...appointmentIds },
          { headers }
        );
      })
    );
  }
}
