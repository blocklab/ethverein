import { Injectable } from '@angular/core';
import * as Web3 from 'web3';

declare global {
  interface Window { 
    web3: any; 
    ethereum: any;
  }
}

window.web3 = window.web3 || {};

@Injectable({
  providedIn: 'root'
})

export class Web3Service {
  web3: any;
  account;

  constructor() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else {
      this.web3 = window.web3;
    }
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
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'));
      return false;
    }

  }

  // get current account address from MetaMask
  public async getAccount(): Promise<string> {
    if (this.account == null) {
      if (window.ethereum) {
        try {
          // Request account access if needed
          await window.ethereum.enable();
        } catch (error) {
          alert('Please allow this app access to MetaMask.');
          return;
        }
      }

      this.account = this.web3.eth.accounts[0];
      if (!this.account) {
        alert(
          'Could not get any accounts! Make sure you are correctly logged in to MetaMask.'
        );
        return Promise.reject("No account found");
      }

      this.web3.eth.defaultAccount = this.account;
    }
    return Promise.resolve(this.account);
  }
}
