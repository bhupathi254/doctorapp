import { Component, OnDestroy, OnInit } from '@angular/core';
import { INglDatatableSort, INglDatatableRowClick } from 'ng-lightning';
import { Subject, Subscription, of } from 'rxjs';
import { ServerService } from '../../services/server.service';
import { PaginatedTable } from '../../models/definitions';
import { delay, map, debounceTime, distinctUntilChanged, mergeMap } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  pTable: PaginatedTable;
  public searchInput = new Subject<KeyboardEvent>();
  private subscription: Subscription;
  opened = false;
  appointmentTime: Date;
  constructor(private authService: ServerService) {
    this.appointmentTime = new Date();
    this.subscription = this.searchInput.pipe(
      map(event => {
        const target = event.target as HTMLTextAreaElement;
        return target.value;
      }),
      debounceTime(700),
      distinctUntilChanged(),
      mergeMap(search => of(search).pipe(
        delay(500),
      )),
    ).subscribe(input => {
      this.pTable.page = 1;
      this.loadAppointmentList();
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.pTable = {
      isLoading: false,
      data: [],
      sort: { key: 'createdAt', order: 'desc' },
      boundaryNumbers: 1,
      limit: 10,
      page: 1,
      total: 0,
      search: '',
      selectAll: false,
    }
    this.loadAppointmentList();
  }

  onDateChange(){
    this.loadAppointmentList();
  }

  onSort($event: INglDatatableSort) {
    const { key, order } = $event;
    this.pTable.sort = { key, order };
    this.loadAppointmentList();
  }

  updateAppointment(_id){
    const subscribe = this.authService.updateAppointment(_id, 'Accepted').subscribe(data=>{
      this.loadAppointmentList();
    }, error=>{}, ()=>{
      subscribe.unsubscribe();
    });
  }

  loadAppointmentList(): void{
    this.pTable.isLoading = true;
    const subscribe = this.authService.getAppointments({ page: this.pTable.page || 1, limit: this.pTable.limit, search: this.pTable.search || '', sortWith: this.pTable.sort.key, sortBy: this.pTable.sort.order, appointmentTime: moment(this.appointmentTime).format('YYYY-MM-DD')}).subscribe((data: any) => {
      this.pTable.data = data.data;
      this.pTable.selectAll = false;
      this.pTable.total = data.count;
    }, error => {
      console.log(error);
    }, () => {
      this.pTable.isLoading = false
      subscribe.unsubscribe();
    });
  }

  onPageChange(): void {
    if (this.pTable.total) {
      this.loadAppointmentList();
    }
  }

  // Initial sort
  

  // Show loading overlay
  

}
