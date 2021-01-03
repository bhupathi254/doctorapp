import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { INglDatatableSort } from 'ng-lightning';
import { Subject, Subscription, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, mergeMap, delay } from 'rxjs/operators';
import { PaginatedTable } from 'src/app/models/definitions';
import { ServerService } from 'src/app/services/server.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  pTable: PaginatedTable;
  public searchInput = new Subject<KeyboardEvent>();
  private subscription: Subscription;
  public customer: any;
  opened = false;
  constructor(private authService: ServerService) {
    this.clearCustomer();
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
  isValid(): boolean{
    return this.customer.name && this.customer.gender && this.customer.dob && this.customer.mobile;
  }
  createCustomer(){
    const subscribe = this.authService.createUser(this.customer).subscribe(data=>{
      this.loadAppointmentList();
      this.clearCustomer();
      this.opened = false;
    }, error=>{}, ()=>{
      subscribe.unsubscribe();
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private clearCustomer(){
    this.customer = {
      name : null,
      mobile: null,
      gender: null,
      dob: null
    }
  }

  cancel(){
    this.opened = false;
  }

  open() {
    this.clearCustomer();
    this.opened = true;
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

  onSort($event: INglDatatableSort) {
    const { key, order } = $event;
    this.pTable.sort = { key, order };
    this.loadAppointmentList();
  }

  loadAppointmentList(): void{
    this.pTable.isLoading = true;
    const subscribe = this.authService.getUsers({ page: this.pTable.page || 1, limit: this.pTable.limit, search: this.pTable.search || '', sortWith: this.pTable.sort.key, sortBy: this.pTable.sort.order}).subscribe((data: any) => {
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

}
