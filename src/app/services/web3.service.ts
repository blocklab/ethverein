import { Injectable } from '@angular/core';
import * as Web3 from 'web3';

declare global {
  interface Window { web3: any; }
}

window.web3 = window.web3 || {};

@Injectable({
  providedIn: 'root'
})

export class Web3Service {
  web3: any;
  account;
  accounts;

  constructor() {
    this.web3 = window.web3;
  }

  getWeb3() {
    return this.web3;
  }

  public checkWeb3() {
   
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3.currentProvider !== 'undefined') {
      this.web3 = new Web3(window.web3.currentProvider);
      return true;
    } else {
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      return false;
    }
    
  }

  // get current account address from MetaMask
  public async getAccount(): Promise<string> {
    if (this.account == null) {
      this.account = await new Promise((resolve, reject) => {
        this.web3.eth.getAccounts((err, accs) => {
          if (err != null) {
            alert('There was an error fetching your accounts.');
            return;
          }

          if (accs.length === 0) {
            alert(
              'Couldn not get any accounts! Make sure MetaMast is logged in.'
            );
            return;
          }
          resolve(accs[0]);
        });
      }) as string;
      this.web3.eth.defaultAccount = this.account;
    }
    return Promise.resolve(this.account);
  }


}
