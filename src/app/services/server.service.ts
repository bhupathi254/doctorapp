import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../app/models/config';
@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }
  getAppointments(params){
    return this.http.get(`${Config.baseUrl}/appointment`, { params });
  }
  getUsers(params){
    return this.http.get(`${Config.baseUrl}/user`, { params });
  }
  createAppointment(appointment){
    return this.http.post(`${Config.baseUrl}/appointment`, {...appointment});
  }
  createUser(user){
    return this.http.post(`${Config.baseUrl}/user`, {...user});
  }
  updateAppointment(appointmentId, status){
    return this.http.put(`${Config.baseUrl}/appointment/${appointmentId}`, {status});
  }
}
