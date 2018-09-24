import { Component, OnInit, Input } from '@angular/core';
import { ApiClientService } from '../api-client.service';
import { UserInput } from '../user-input';

@Component({
  selector: 'app-input-table',
  templateUrl: './input-table.component.html',
  styleUrls: ['./input-table.component.sass']
})
export class InputTableComponent implements OnInit {
  @Input() user: {
    bonds: {}[]
    stocks: {}[]
  }[];
  displayedColumns: string[] = ['name', 'units', 'target'];
  data: object;
  // userInput = new UserInput();
  // inputArr = Object.values(this.userInput);
  bonds: {} [];
  stocks: {} [];


  getTotal (arr, key): number {
    return arr.reduce((acc, el) => acc + el[key], 0);
  }

  constructor(
    private client: ApiClientService
  ) { }

  ngOnInit() {
    const userInput = new UserInput();

    const inputArr = Object.values(userInput);
    this.bonds = inputArr.filter(el => el.type === 'bonds');
    // console.log(this.inputArr);
    this.stocks = inputArr.filter(el => el.type === 'stocks');
    // console.log(stocks);
    this.client.currentMessage.subscribe((msg) => {
      const user = this.data = JSON.parse(msg);
    });
  }

  valuechange(newValue, el) {
    this.bonds.find(element => element.ticker === el.ticker).units = newValue;

    console.log(this.bonds)
  }
}