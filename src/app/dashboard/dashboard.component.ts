import { ConfirmResignDialogComponent } from './../dialogs/confirm-resign-dialog/confirm-resign-dialog.component';
import { ConfirmApplicationDialogComponent } from './../dialogs/confirm-application-dialog/confirm-application-dialog.component';
import { CastVoteDialogComponent } from './../dialogs/cast-vote-dialog/cast-vote-dialog.component';
import { ConsentDialogComponent } from './../dialogs/declaration-of-consent-dialog/declaration-of-consent-dialog.component';
import { VotingContractService } from './../services/voting-contract.service';
import { MemberContractService } from '../services/member-contract.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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
  declarationHash;

  constructor(
    public _snackBar: MatSnackBar,
    private _web3Service: Web3Service,
    private _memberContractService: MemberContractService,
    private _votingContractService: VotingContractService,
    private dialog: MatDialog,
  ) {

    this._web3Service.getAccount().then(address => {
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
      if (this.status === 'board') {
        this.getPendingMembers();
      }
      if (this.status === 'board' || this.status === 'member') {
        this.getOpenVotes();
      }
    });

    // event listeners
    if (this.status === 'board') {
      _memberContractService.addMemberAppliedCallback(() => {
        this.getPendingMembers();
      });
    }

  }

  ngOnInit() {
  }

  copyAddress() {
    if (this.isCopied) {
      this._snackBar.open('Address copied to Clipboard', 'Nice!', { duration: 2000 });
    }
  }

  changeAlias() {
    this._memberContractService.changeName(this.alias, this.declarationHash);
    this.changeBTNDisabled = true;
  }

  unlockChangeBTN() {
    if (this.status === 'member' || this.status === 'board') {
      this.changeBTNDisabled = false;
    }
  }

  apply() {
    if (this.alias !== '') {
      this._memberContractService.applyForMembership(this.alias, this.declarationHash).then(() => {
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
      vote: { ..._vote }
    };
    let dialogRef = this.dialog.open(CastVoteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.getOpenVotes());
  }

  acceptMember(_member) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      alias: _member.name,
      address: _member.address
    };
    let dialogRef = this.dialog.open(ConfirmApplicationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((() => this.getPendingMembers()));
  }

  getPendingMembers() {
    this.pendingMembers = [];
    this._memberContractService.getNumberOfMembers().then(noM => {
      for (let i = 0; i < noM; i++) {
        this._memberContractService.getMembers(i)
          .then(address => {
            return address;
          })
          .then(address => {
            this._memberContractService.getMember(address).then(member => {
              if (parseInt(member[1], 0) === 1) {
                this._memberContractService.hasConfirmedApplicant(this.address, address).then(hasConfirmed => {
                  // only show pending members the current user did not yet confirm
                  if (!hasConfirmed) {
                    const memberObj = {
                      name: member[0],
                      address: address
                    };
                    this.pendingMembers.push(memberObj);
                  }
                })
              }
            });
          });
      }
    });
  }

  getOpenVotes() {
    this.openVotes = [];
    // get open votes
    this._votingContractService.getNumberOfVotes().then(noV => {
      for (let i = 0; i < noV; i++) {
        this._votingContractService.getVoteDetails(i).then(vote => {
          if (Number(vote[3]) === 1 && !vote[6].includes(this.address)) {
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

  showDeclaration(action) {
    const dialogConfig = new MatDialogConfig();
    const declRef = this.dialog.open(ConsentDialogComponent, dialogConfig);

    declRef.afterClosed().subscribe(result => {
      this.declarationHash = result.fileHash;

      if (result.confirmation == true) {

        if (action == 'apply') {
          this.apply()
        }
        else if (action == 'changeAlias'){
          this.changeAlias()
        }
      }
      else {
        this._snackBar.open('You must consent to execute this action.', 'Failed!', { duration: 2000 });
      }
    });
  }

}



