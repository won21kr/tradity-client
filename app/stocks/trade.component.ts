import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { StocksService } from '../stocks.service';
import { GameComponent } from '../game/game.component';

@Component({
  moduleId: module.id,
  selector: 'tradity-trade',
  templateUrl: 'trade.component.html',
  styleUrls: ['trade.component.css']
})
export class TradeComponent implements OnInit, OnDestroy {
  private stockSubscription: Subscription;
  stock: any;
  sellbuy: number;
  amount: number;
  value: number;

  constructor(private route: ActivatedRoute, private stocksService: StocksService, private gameComponent: GameComponent, private router: Router) {
    this.sellbuy = 1;
  }

  ngOnInit() {
    this.gameComponent.heading2 = 'Trade';
    this.stockSubscription = this.route.params
      .switchMap((params: Params) => this.stocksService.stock(params['isin']))
      .subscribe(res => {
        this.stock = res;
        this.gameComponent.heading1 = res.name;
      });
  }

  ngOnDestroy() {
    this.stockSubscription.unsubscribe();
  }

  trade() {
    if (this.amount) {
      this.stocksService.trade(this.stock.stocktextid, this.amount * this.sellbuy)
      .subscribe(
        res => {
          if (res.identifier === 'autodelay-sxnotopen') alert('Your trade will be executed when the stock exchange opens');
          else alert('Successfully traded!');
          this.router.navigateByUrl('/portfolio/orders');
        },
        err => {
          switch (err.identifier) {
            case 'out-of-money':
              alert('You do not have enough leftover money for this trade!');
              break;
            case 'single-paper-share-exceeded':
              alert('Only 50% of your assets may consist of a single stock!');
              break;
            case 'not-enough-stocks':
              alert('Not enough stocks!');
              break;
            case 'over-pieces-limit':
              alert('Unfortunately, your trade exceeds the maximum tradable amount of this stock');
              break;
            case 'stock-not-found':
              alert('This stock could not be found!');
              break;
          }
        }
      )
    }
  }

  calcValue() {
    if (!this.amount) return;
    if (this.sellbuy == 1) {
      this.value = parseFloat((this.amount * (this.stock.ask / 10000)).toFixed(2));
    } else if (this.sellbuy == -1) {
      this.value = parseFloat((this.amount * (this.stock.bid / 10000)).toFixed(2));
    }
    //this.calcFee();
  }

  calcAmount() {
    if (this.sellbuy == 1) {
      this.amount = Math.floor(this.value / (this.stock.ask / 10000));
    } else if (this.sellbuy == -1) {
      this.amount = Math.floor(this.value / (this.stock.bid / 10000));
    }
    //this.calcFee();
  }
}