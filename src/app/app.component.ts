import { Web3Service } from './services/web3.service';
import { Component, NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, OnInit, Input } from '@angular/core';
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

export class AppComponent implements OnInit {
  active = false;

  @Input()
  currentNetwork: String;

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
  ngOnInit() {
    this.checkNetwork()
  }

  get stateName() {
    return this.active ? 'active' : 'inactive';
  }

  toggle() {
    this.active = !this.active;
  }

  checkNetwork() {
   this._web3Service.getNetworkId().then(res => {
      if(res == '1'){
        this.currentNetwork = 'Main Ethereum Network'
      }
      else if(res == '3'){
        this.currentNetwork = 'Ropsten Test Network'
      }
      else if(res == '4'){
        this.currentNetwork = 'Rinkeby Test Network'
      }
      else if(res == '5'){
        this.currentNetwork = 'Goerli Test Network'
      }
      else if(res == '42'){
        this.currentNetwork = 'Kovan Test Network'
      }
      else if(res == '6545' ){
        this.currentNetwork = 'Local Development Network'
      }
      else {
        this.currentNetwork = 'Network id: ', res
      }
    });


  }



}
