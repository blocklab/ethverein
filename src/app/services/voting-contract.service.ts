import { MemberContractService } from './member-contract.service';
import { Observable } from 'rxjs';
import { Web3Service } from './web3.service';
import { Injectable } from '@angular/core';

declare let require: any;

const contract = require('truffle-contract');
const VotingAbi = require('../../build/contracts/Voting.json');

@Injectable({
  providedIn: 'root'
})
export class VotingContractService {
  private web3: any;

  private votingContract: any;

  constructor(
    private _web3Service: Web3Service,
    private _memberContractService: MemberContractService
  ) {
    this.web3 = this._web3Service.getWeb3();
    this.getContract();
  }

  async getContract() {
    let votingContractAddress = await this._memberContractService.getVotingContractAddress();
    this.votingContract = await this.web3.eth.contract(VotingAbi.abi).at(votingContractAddress);
  }
  
  /* Contract Functions */
  /* Contract Calls */

  async getVoteDetails(_index): Promise<string> {
    return new Promise((resolve, reject) => {
      this.votingContract.getVoteDetails.call(_index, function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<string>;
  }

  async getNumberOfVotes(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.votingContract.getNumberOfVotes.call(function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<number>;
  }

  async computeVoteOutcome(_voteID): Promise<any> {
    return new Promise((resolve, reject) => {
      this.votingContract.computeVoteOutcome.call(_voteID, function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<any>;
  }

  /* Contract Transactions */

  async initiateDocumentVote(_name: string, _documentHash) {
    const bytes32Hash = '0x'.concat(_documentHash);
    return new Promise((resolve, reject) => {
      this.votingContract.initiateDocumentVote.sendTransaction(_name, bytes32Hash, function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<number>;
  }

  async initiateVotingContractUpdateVote(_name: string, _address: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.votingContract.initiateVotingContractUpdateVote.sendTransaction(_name, _address, function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<number>;
  }

  async initiateBoardMemberVote(_name: string, _documentHash: string, _addresses: string[]): Promise<number> {
    const bytes32Hash = '0x'.concat(_documentHash);
    return new Promise((resolve, reject) => {
      this.votingContract.initiateBoardMemberVote.sendTransaction(_name, bytes32Hash, _addresses, function (err, res) {
        if (err != null) {
          reject(err);
        }
        resolve(res);
      });
    }) as Promise<number>;
  }

  async castVote(_voteID: number, _decision: boolean, callback: Function) {
    this.votingContract.castVote.sendTransaction(_voteID, _decision, callback);
  }

  async closeVote(_voteID: number) {
    this.votingContract.closeVote.sendTransaction(_voteID, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

}
