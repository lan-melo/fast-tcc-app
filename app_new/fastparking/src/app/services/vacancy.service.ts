import { environment } from './../../environments/environment.prod';
import { Establishment, TypeUser } from './../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ModelRequstVacancy, VacancyStatus, UserBusy } from '../models/vacancy.model';

export interface VacancyScheduled {
  establishment: Establishment;
  valuePayment: number;
  dataCheckIn: Date | string;
  dataCheckout: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class VacancyService {

  public dispatchVacancyConfirmed = new Subject<VacancyScheduled>();

  constructor(
    private http: HttpClient
  ) {}

  updateActivityEstablishment(status: boolean) {

    const body = {
      ativo: status
    };

    return this.http.put(`${environment.baseApi}/flag-establishments`, body);
  }

  getCounterVacancys() {
    return this.http.get(`${environment.baseApi}/counters-vacancy`);
  }

  getVacancyBusyUser() {
    return this.http.get(`${environment.baseApi}/vacancy-userbusy`);
  }

  getListVacanciesBusy() {
    return this.http.get(`${environment.baseApi}/list-vacancies-busy`);
  }

  cancelVacancyClient({_id}: UserBusy, observacao: string) {

    const payload = {
      id: _id,
      observacao
    };

    return this.http.post(`${environment.baseApi}/canceled-vacancy`, payload);
  }

  updateStatusVacancy(status: VacancyStatus, idVacancy) {

    const body = {
      id: idVacancy,
      status
    };

    return this.http.post(`${environment.baseApi}/update-status-vacancy`, body);
  }

  requestVacancy(requestData: ModelRequstVacancy) {
    return this.http.post(`${environment.baseApi}/request-vacancy`, requestData);
  }

  getHistory(userType: string) {
    return this.http.get(`${environment.baseApi}/historic/${userType}`);
  }

}
