import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { UserInput } from '../user-input';
import { ActivatedRoute } from '@angular/router';

import * as _ from 'lodash';

@Component({
  selector: 'app-input-table',
  templateUrl: './input-table.component.html',
  styleUrls: ['./input-table.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class InputTableComponent implements OnInit {
  displayedColumns: string[] = ['name', 'units', 'target'];
  data: object;
  bonds: any [];
  stocks: any [];
  username: string;
  investment: 0;

  unitsInput;

  getTotal (arr, key): number {
    return arr.reduce((acc, el) => acc + el[key], 0);
  }

  constructor(
    private client: ApiClientService,
    private route: ActivatedRoute
  ) {
    this.route.parent.params.subscribe(params => this.username = params.username);
    this.bondsValuechange = _.debounce(this.bondsValuechange, 400);
  }

  ngOnInit() {
    const userInput = new UserInput();
    const inputArr = Object.values(userInput);
    this.bonds = inputArr.filter(el => el.type === 'bonds');
    this.stocks = inputArr.filter(el => el.type === 'stocks');
    this.client.currentMessage.subscribe((msg) => {
      const user = this.data = JSON.parse(msg);
    });
  }

  onSubmit () {
    if (this.investment === undefined) {
      this.investment = 0;
    }
    const investment = {
      investment: this.investment
    };
    this.client.addInvestment(this.username, investment)
      .subscribe(() => {
      });
  }

  bondsValuechange(newValue, el, key) {
    this.bonds.find(element => element.ticker === el.ticker)[key] = newValue;
    const ticker = el.ticker;
    const indexFund = {
      [`${ticker}`]: {
        type: el.type,
        units: el.units,
        target: Math.round(el.target / 100 * 1000)
      }
    };
    this.client.postIndexData(indexFund, this.username)
      .subscribe(() => {
      });
  }


  stocksValuechange(newValue, el, key) {
    this.stocks.find(element => element.ticker === el.ticker)[key] = newValue;
    const ticker = el.ticker;
    const indexFund = {
      [`${ticker}`]: {
        type: el.type,
        units: el.units,
        target: Math.round(el.target / 100 * 1000)
      }
    };
    this.client.postIndexData(indexFund, this.username)
    .subscribe(() => {
    });
  }
}
