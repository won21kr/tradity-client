import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { StocksService } from '../stocks.service';

@Component({
  moduleId: module.id,
  selector: 'tradity-history',
  templateUrl: 'history.component.html'
})
export class HistoryComponent implements OnInit {
  
  history: Observable<any>;
  
  constructor(private stocksService: StocksService) {}

  ngOnInit() {
    this.history = this.stocksService.history;
  }

}