import { ConfirmResignDialogComponent } from './../dialogs/confirm-resign-dialog/confirm-resign-dialog.component';
import { ConfirmApplicationDialogComponent } from './../dialogs/confirm-application-dialog/confirm-application-dialog.component';
import { CastVoteDialogComponent } from './../dialogs/cast-vote-dialog/cast-vote-dialog.component';
import { VotingContractService } from './../services/voting-contract.service';
import { MemberContractService } from '../services/member-contract.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
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
  pendingMembers = [];

  constructor(
    public _snackBar: MatSnackBar,
    private _web3Service: Web3Service,
    private _memberContractService: MemberContractService,
    private _votingContractService: VotingContractService,
    private dialog: MatDialog,
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
          this.status = 'member';
          this.aliasInputDisabled = false;
          this.resignBTNDisabled = false;          
          break;
        case 3:
          this.status = 'board';
          this.aliasInputDisabled = false;
          this.resignBTNDisabled = false;          
          break;
        default:
          this.status = 'none';
          this.applyBTNDisabled = false;
          this.aliasInputDisabled = false;
          break;
      }
      this.getPendingMembers();
      this.getOpenVotes();
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
    this.dialog.open(ConfirmResignDialogComponent);
  }

  submitVote(_vote) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      vote: _vote
    };
    this.dialog.open(CastVoteDialogComponent, dialogConfig);
  }

  acceptMember(_member) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      alias: _member.name,
      address: _member.address
    };
    this.dialog.open(ConfirmApplicationDialogComponent, dialogConfig);
  }

  getPendingMembers() {
    this._memberContractService.getNumberOfMembers().then(noM => {
      for (let i = 0; i < noM; i++) {
        this._memberContractService.getMembers(i)
          .then(address => {
            return address;
          })
          .then(address => {
            this._memberContractService.getMember(address).then(member => {
              if (parseInt(member[1], 0) === 1) {
                const memberObj = {
                  name: member[0],
                  address: address
                };
                this.pendingMembers.push(memberObj);
              }
            });
          });
      }
    });
  }

  getOpenVotes() {
    // get open votes
    this._votingContractService.getNumberOfVotes().then(noV => {
      for (let i = 0; i < noV; i++) {
        this._votingContractService.getVoteDetails(i).then(vote => {
          if (!vote[6].includes(this.address)) {
            const voteObj = {
              id: i,
              name: vote[0],
              type: vote[1],
              docHash: vote[2],
              status: vote[3],
              newBoardMembers: vote[4],
              newVotingContractAddress: vote[5],
              voters: vote[6]
            };
            this.addAliasesForNewBoardMembers(voteObj.newBoardMembers);
            this.openVotes.push(voteObj);
          }
        });
      }
    });
  }

  async addAliasesForNewBoardMembers(newBoardMembers: any) {
    if (newBoardMembers && newBoardMembers.length > 0) {
      let addressToAlias = {};
      let numberOfMembers = await this._memberContractService.getNumberOfMembers();
      for (let i = 0; i < numberOfMembers; i++) {
        let memberAddress = await this._memberContractService.getMembers(i);
        let member = await this._memberContractService.getMember(memberAddress);
        addressToAlias[memberAddress] = member[0];
      }
      for (let i = 0; i < newBoardMembers.length; i++) {
        const boardMemberAddress = newBoardMembers[i];
        newBoardMembers[i] = {
          address: boardMemberAddress,
          alias: addressToAlias[boardMemberAddress]
        }
      }
    }
  }

}



