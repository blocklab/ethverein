import { Web3Service } from './services/web3.service';
import { Component, NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { } from '@angular/animations';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: []
})

@NgModule({
  schemas: [
    NO_ERRORS_SCHEMA,
    CUSTOM_ELEMENTS_SCHEMA
  ]
})

export class AppComponent {
  active = false;

  constructor(private router: Router, private _web3Service: Web3Service) {

    router.events.subscribe((path) => {
      if (path instanceof NavigationStart) {
        if (!this._web3Service.checkWeb3()) {
          if (path.url !== '/MetaMask') {
            this.router.navigate(['MetaMask']);
          }
        } else {
          if (path.url === '/MetaMask') {
            this.router.navigate(['']);
          }
        }
      }
    });

    if (!this._web3Service.checkWeb3()) {
      if (this.router.routerState.snapshot.url !== '/MetaMask') {
        this.router.navigate(['MetaMask']);
      }
    }

  }

  get stateName() {
    return this.active ? 'active' : 'inactive';
  }

  toggle() {
    this.active = !this.active;
  }



}
