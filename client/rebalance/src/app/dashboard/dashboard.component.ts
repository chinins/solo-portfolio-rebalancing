import { Component, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ApiClientService } from '../api-client.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {
  user: {
    bonds: object [],
    stocks: object []
  };
  username;

  constructor(
    private client: ApiClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log('got to router');
    this.route.parent.params.subscribe(params => {
      console.log('params', params);
      this.username = params.username;
    });
  }

  ngOnInit() {
    this.username = this.route.parent.paramMap.pipe(
      switchMap((params: ParamMap) => params.get('username'))
      );
    console.log('this.username: ', this.username);

    this.getUserPortfolio();

  }

  onChanges() {
    // this.getUserPortfolio();
  }

  getUserPortfolio (): void {
    console.log('this.username: ', this.username);
    this.client.getUserPortfolio(this.username)
    .subscribe(userData => {
      console.log('got to subsribed');
      let { _id, username, ...filtered } = userData;
      filtered = Object.values(filtered);
      const bonds = filtered.filter(el => el.type === 'bonds');
      const stocks = filtered.filter(el => el.type === 'stocks');
        this.user = {
          bonds,
          stocks
        };
        this.client.sendData(JSON.stringify(this.user));
      });
  }

  // getBonds (arr): void {
  //   this.bonds = arr.filter(el => el.type === 'bonds');
  //   console.log(this.bonds);
  //   return this.bonds;
  // }
}
