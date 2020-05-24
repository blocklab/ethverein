import { Web3Service } from './web3.service';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare let require: any;

const contract = require('truffle-contract');
const MembersAbi = require('../../build/contracts/Members.json');

@Injectable({
  providedIn: 'root'
})

export class MemberContractService {
  private web3: any;

  private membersContract: any;
  private membersContractAddress = environment.membersContractAddress;

  constructor(private _web3Service: Web3Service) {
    this.web3 = this._web3Service.getWeb3();
    this.membersContract = new this.web3.eth.Contract(MembersAbi.abi, this.membersContractAddress);
  }

  getAddress() {
    return this.membersContractAddress;
  }

  getContract() {
    return this.membersContract;
  }
  /* Contract Functions */
  /* Contract Calls */

  // get members mapping for logged in account
  async getThisMember(): Promise<string> {
    const acc = await this._web3Service.getAccount();
    return this.membersContract.methods.members(acc).call();
  }


  // get members mapping for specific member
  async getMember(_account: string): Promise<string> {
    return this.membersContract.methods.members(_account).call();
  }

  // get all member addresses
  async getMembers(_memberNo: number): Promise<string> {
    return this.membersContract.methods.memberAddresses(_memberNo).call();
  }

  // get votingContractAddress
  async getVotingContractAddress(): Promise<string> {
    return this.membersContract.methods.votingContractAddress().call();
  }

  // get Number of Members
  async getNumberOfMembers(): Promise<number> {
    return this.membersContract.methods.getNumberOfMembers().call();
  }

  // get Number of Eligible Members
  async getNumberOfEligibleMembers(): Promise<number> {
    return this.membersContract.methods.getNumberOfEligibleMembers().call();
  }

  // check if address is regular or board
  async getIsRegularOrBoardMember(_memberAddress: string): Promise<string> {
    const acc = await this._web3Service.getAccount();
    return this.membersContract.methods.isRegularOrBoardMember(_memberAddress).call();
  }

  // check if board member has already confirmed applicant
  async hasConfirmedApplicant(_boardMemberAddress: string, _applicantAddress: string): Promise<boolean> {
    return this.membersContract.methods.hasConfirmedApplicant(_boardMemberAddress, _applicantAddress).call();
  }

  /* Contract Transactions */

  // apply for Membership
  async applyForMembership(_name: string, _declarationHash) {
    const acc = await this._web3Service.getAccount();
    this.membersContract.methods.applyForMembership(_name, _declarationHash).send({ from: acc });
  }

  // change Name
  async changeName(_newName: string, _declarationHash) {
    const acc = await this._web3Service.getAccount();
    this.membersContract.methods.changeName(_newName, _declarationHash).send({ from: acc });
  }

  // confirm Application of applicant
  async confirmApplication(_applicantAddress: string, callback: Function) {
    const acc = await this._web3Service.getAccount();
    this.membersContract.methods.confirmApplication(_applicantAddress).send({ from: acc }, callback);
  }

  // resign membership of logged in member
  async resignOwnMembership() {
    const acc = await this._web3Service.getAccount();
    this.membersContract.methods.resignOwnMembership().send({ from: acc });
  }

  // Initially set voting contract address
  async setVotingContractAddress(_votingContractAddress: string) {
    const acc = await this._web3Service.getAccount();
    this.membersContract.methods.setVotingContractAddress(_votingContractAddress).send({ from: acc })
  }

  /* /Contract Functions */

  /* Contract Events */
  addMemberAppliedCallback(callback) {
    this.membersContract.events.MemberApplied({
      fromBlock: 0
    }, callback);
  }

  addMemberConfirmedCallback(confirmedCallback) {
    this.membersContract.events.MemberConfirmed({
      fromBlock: 0,
    }, confirmedCallback);

  }

  addMemberNameChangedCallback(callback) {
     this.membersContract.events.MemberNameChanged({
      fromBlock: 0
    }, callback);
  }

  addMemberResginedCallback(callback) {
     this.membersContract.events.MemberResigned({
      fromBlock: 0
    }, callback);
  }
}
