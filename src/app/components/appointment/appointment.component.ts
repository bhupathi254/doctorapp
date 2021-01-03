import { Component, OnInit } from '@angular/core';
import { Appointment, PaginatedTable, User } from 'src/app/models/definitions';
import { ServerService } from 'src/app/services/server.service';
import * as moment from 'moment';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { NglComboboxOptionItem } from 'ng-lightning';
@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit {

  appointmentTime: Date;
  pTable: PaginatedTable;
  morningSlots: string[];
  eveningSlots: string[];
  appointment: any;
  opened = false;
  openPic = false;
  users: NglComboboxOptionItem[];
  filteredUsers$: Observable<NglComboboxOptionItem[]>;
  user: any;
  selectedUser = new FormControl();

  constructor(private authService: ServerService) {
    this.appointmentTime = new Date();
    this.users = [];
    this.appointment = {
      appointmentTime: null,
      userId: null
    };
    this.filteredUsers$ = this.selectedUser.valueChanges
      .pipe(
        startWith(''),
        map(val => !val ? [...this.users] : this.filter(val))
      );
  }

  private filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(user => user.label.toLowerCase().indexOf(filterValue) > -1);
  }

  open(time) {
    this.appointment.appointmentTime = moment(this.appointmentTime).startOf('day').format('YYYY-MM-DD')+ ` ${time}`;
    this.opened = !this.opened;
  }

  cancel(){
    this.opened = !this.opened;
    this.appointment = {
      appointmentTime: null,
      userId: null
    };
  }

  bookAppointment(){
    const appointmentTime = moment(this.appointment.appointmentTime, 'YYYY-MM-DD h:mm A').toDate();
    const subscribe = this.authService.createAppointment({appointmentTime, userId: this.user}).subscribe(data=>{
      this.cancel();
      this.loadAppointmentList();
    }, error=>{}, ()=>{
      subscribe.unsubscribe();
    });
  }

  getUsers(){
    const subscribe = this.authService.getUsers({ page: 1, limit: 50, search: '', sortWith: 'createdAt', sortBy: this.pTable.sort.order}).subscribe((data: any) => {      
      this.users = data.data.map(v=>{
        const {_id, name} = v;
        return {value:_id, label:name};
      });
    }, error => {
      console.log(error);
    }, () => {
      subscribe.unsubscribe();
    });
  }

  isExist(time){
    return this.pTable.data.some(v=>moment(v.appointmentTime).format('h:mm A')===time);
  }

  ngOnInit(): void {
    this.morningSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM"]
    this.eveningSlots = ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"];
    this.pTable = {
      isLoading: false,
      data: [],
      sort: { key: 'createdAt', order: 'desc' },
      boundaryNumbers: 1,
      limit: 19,
      page: 1,
      total: 0,
      search: '',
      selectAll: false,
    }
    this.getUsers();
    this.loadAppointmentList();
  }

  onDateChange(){
    this.loadAppointmentList();
  }

  loadAppointmentList(): void{
    this.pTable.isLoading = true;
    const subscribe = this.authService.getAppointments({ page: this.pTable.page || 1, limit: this.pTable.limit, search: this.pTable.search || '', sortKey: this.pTable.sort.key, sortBy: this.pTable.sort.order, appointmentTime: moment(this.appointmentTime).format('YYYY-MM-DD')}).subscribe((data: any) => {
      this.pTable.data = data.data;
      console.log()
      this.pTable.selectAll = false;
      this.pTable.total = data.count;
    }, error => {
      console.log(error);
    }, () => {
      this.pTable.isLoading = false
      subscribe.unsubscribe();
    });
  }

}
