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
    console.log('voting contract ' + votingContractAddress);
    this.votingContract = await new this.web3.eth.Contract(VotingAbi.abi, votingContractAddress);
  }
  
  /* Contract Functions */
  /* Contract Calls */

  async getVoteDetails(_index): Promise<string> {
    return this.votingContract.methods.getVoteDetails(_index).call();
  }

  async getNumberOfVotes(): Promise<number> {
    return this.votingContract.methods.getNumberOfVotes().call();
  }

  async computeVoteOutcome(_voteID): Promise<any> {
    return this.votingContract.methods.computeVoteOutcome(_voteID).call();
  }

  /* Contract Transactions */

  async initiateDocumentVote(_name: string, _documentHash) {
    const bytes32Hash = '0x'.concat(_documentHash);
    const acc = await this._web3Service.getAccount();
    return this.votingContract.methods.initiateDocumentVote(_name, bytes32Hash).send({from: acc});
  }

  async initiateVotingContractUpdateVote(_name: string, _address: string): Promise<number> {
    const acc = await this._web3Service.getAccount();
    return this.votingContract.methods.initiateVotingContractUpdateVote(_name, _address).send({from: acc});
  }

  async initiateBoardMemberVote(_name: string, _documentHash: string, _addresses: string[]): Promise<number> {
    const bytes32Hash = '0x'.concat(_documentHash);
    const acc = await this._web3Service.getAccount();
    return this.votingContract.methods.initiateBoardMemberVote(_name, _documentHash, _addresses).send({from: acc});
  }

  async castVote(_voteID: number, _decision: boolean, callback: Function) {
    const acc = await this._web3Service.getAccount();
    this.votingContract.methods.castVote(_voteID, _decision).send({from: acc} , callback);
  }

  async closeVote(_voteID: number) {
    const acc = await this._web3Service.getAccount();
    this.votingContract.methods.closeVote(_voteID).send({from: acc});
  }
    
}
