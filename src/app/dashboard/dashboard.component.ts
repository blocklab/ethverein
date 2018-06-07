import { VotingContractService } from './../services/voting-contract.service';
import { MemberContractService } from '../services/member-contract.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Web3Service } from '../services/web3.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  status;
  address;
  alias;
  applyBTNDisabled;
  changeBTNDisabled = true;
  resignBTNDisabled;
  aliasInputDisabled;
  isCopied;
  openVotes = [];

  constructor(
    public _snackBar: MatSnackBar,
    private _web3Service: Web3Service,
    private _memberContractService: MemberContractService,
    private _votingContractService: VotingContractService
  ) {

    _web3Service.getAccount().then(address => {
      this.address = address;
    });

    _memberContractService.getThisMember().then(member => {
      this.alias = member[0];
      switch (parseInt(member[1], 0)) {
        case 1:
          this.status = 'pending';
          break;
        case 2:
          this.status = 'regular';
          this.aliasInputDisabled = false;
          break;
        case 3:
          this.status = 'board';
          this.aliasInputDisabled = false;
          break;
        default:
          this.status = 'none';
          this.applyBTNDisabled = false;
          this.aliasInputDisabled = false;
          break;
      }

      // get open votes
      this._votingContractService.getNumberOfVotes().then(noV => {
        for (let i = 0; i < noV; i++) {
          this._votingContractService.getVoteDetails(i).then(vote => {
            if (!vote[6].includes(this.address)) {
              const voteObj = {
                name: vote[0],
                type: vote[1],
                docHash: vote[2],
                status: vote[3],
                newBoardMembers: vote[4],
                newVotingContractAddress: vote[5],
                voters: vote[6]
              };
              this.openVotes.push(voteObj);
            }
          });
        }
      });
    });

  }

  ngOnInit() {

  }

  copyAddress() {
    if (this.isCopied) {
      this._snackBar.open('Address copied to Clipboard', 'Nice!', { duration: 2000 });
    }
  }

  changeAlias(_alias) {
    this._memberContractService.changeName(this.alias);
    this.changeBTNDisabled = true;
  }

  unlockChangeBTN() {
    if (this.status === 'member' || this.status === 'board') {
      this.changeBTNDisabled = false;
    }
  }

  apply() {
    if (this.alias !== '') {
      this._memberContractService.applyForMembership(this.alias).then(() => {
        this.applyBTNDisabled = true;
        this.aliasInputDisabled = true;
      });
    } else {
      this._snackBar.open('Type in Alias before applying', 'Got it!', { duration: 2000 });
    }
  }

  resign() {

  }

}

