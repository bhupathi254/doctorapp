import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  subscribe: Subscription;
  constructor(){
    //this.toasts.push({show:true, message:'Hi', variant:'success'});
  }
  ngOnDestroy(): void {
    this.subscribe.unsubscribe();
  }
}
