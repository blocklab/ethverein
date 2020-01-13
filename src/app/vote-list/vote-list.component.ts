import { MemberContractService } from './../services/member-contract.service';
import { VotingContractService } from './../services/voting-contract.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialogConfig, MatDialog, MatSnackBar, MatTable } from '@angular/material';
import { Web3Service } from '../services/web3.service';
import { VoteDetailDialogComponent } from '../dialogs/vote-detail-dialog/vote-detail-dialog.component';

@Component({
  selector: 'app-vote-list',
  templateUrl: './vote-list.component.html',
  styleUrls: ['./vote-list.component.css'],
})

export class VoteListComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private votingContractService: VotingContractService,
    private memberContractService: MemberContractService,
    private _web3Service: Web3Service,
    private snackbar: MatSnackBar,
    private changeDetectorRefs: ChangeDetectorRef,

  ) {
    this.votingContractService.addVoteCanceledCallback((err, res) => {
      if (res) {
        voteList.filter(v => v.nr == res.returnValues.voteId).map(v => v.status = 'Canceled');
        this.dataSource.sort = this.sort;
        this.dataSource.filter = this.filter;
        this.changeDetectorRefs.detectChanges();
      }
    });
    this.memberContractService.getThisMember().then(() => {
      this.getVotes();
    });
  }

  displayedColumns = ['nr', 'name', 'originator', 'dateOfVote', 'type', 'status', 'outcome', 'cancel'];
  dataSource = new MatTableDataSource(voteList);
  updatedSource = new MatTableDataSource();
  private filter = '';
  acc = this._web3Service.getAccount()

  @ViewChild(MatSort) sort: MatSort;

  @ViewChild(MatTable) table: MatTable<any>;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
  }

  async getVotes() {
    // get open votes
    this.votingContractService.getNumberOfVotes().then(async noV => {

      for (let i = 0; i < noV; i++) {
        this.votingContractService.getVoteDetails(i).then(async vote => {
          let voteObj;
          let voteType;
          let voteStatus;

          switch (parseInt(vote[1], 0)) {
            case 1: voteType = 'Document Vote'; break;
            case 2: voteType = 'Board Member Vote'; break;
            case 3: voteType = 'Voting Contract Vote'; break;
            default: break;
          }

          switch (parseInt(vote[3], 0)) {
            case 0: voteStatus = 'None'; break;
            case 1: voteStatus = 'Open'; break;
            case 2: voteStatus = 'Closed'; break;
            case 3: voteStatus = 'Canceled'; break;
            default: break;
          }

          const isCancelableByMemberResult = await this.checkCancel(vote);
          const isInitiatorResult = await this.checkInitiator(vote);
          const aliasResult = await this.getAlias(vote);
          const dateResult = await this.getBlockTimestamp(vote);

          voteObj = {
            id: i,
            name: vote[0],
            type: voteType,
            docHash: vote[2],
            status: voteStatus,
            newBoardMembers: vote[4],
            newVotingContractAddress: vote[5],
            voters: vote[6],
            initiator: vote[7],
            blockNumAtInit: vote[8],
            isCancelableByMember: isCancelableByMemberResult,
            isInitiator: isInitiatorResult,
            originator: aliasResult,
            initiationDate: dateResult

          };
          return voteObj;

        }).then(voteObj => {
          this.votingContractService.computeVoteOutcome(voteObj.id).then(_outcome => {

            switch (parseInt(_outcome[0], 0)) {
              case 0: voteObj.outcome = 'Undecided'; break;
              case 1: voteObj.outcome = 'Accepted'; break;
              case 2: voteObj.outcome = 'Declined'; break;
              default: break;
            }
            voteList[i] = ({ nr: voteObj.id, name: voteObj.name, type: voteObj.type, status: voteObj.status, outcome: voteObj.outcome, isInitiator: voteObj.isInitiator, isCancelableByMember: voteObj.isCancelableByMember, originator: voteObj.originator, initiationDate: voteObj.initiationDate, docHash: voteObj.docHash, initiator: voteObj.initiator, newBoardMembers: voteObj.newBoardMembers, newVotingContractAddress: voteObj.newVotingContractAddress, voters: voteObj.voters, blockNumAtInit: voteObj.blockNumAtInit });
            this.dataSource.sort = this.sort;
          });
        });
      }
    });
  }

  async checkCancel(vote: any) {
    const currentBlock = await this.votingContractService.getCurrentBlock()
    const blocksPassed = currentBlock - vote[8]

    return (blocksPassed < 172800 && this.acc != vote[7]) ? false : true;
  }

  async checkInitiator(vote: any) {
    const account = await this.acc;
    if (account === vote[7]) {
      return vote.isInitiator = true;
    }
    return vote.isInitiator = false;
  }

  async getAlias(vote: any) {
    let alias = await this.memberContractService.getMember(vote[7])
    return alias[0]
  }

  async getBlockTimestamp(vote: any) {
    let blockInfo = await this.votingContractService.getBlockInfo(vote[8])
    let initiationDate = blockInfo.timestamp * 1000
    return initiationDate;
  }

  showDetails(vote: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = vote;
    this.dialog.open(VoteDetailDialogComponent, dialogConfig)
  }

  closeVote(vote: any) {
    if (vote.outcome === 'Undecided') {
      this.snackbar.open('Undecided votes cannot be closed!', 'Alright...', { duration: 2000 });
    }
    if (vote.status === 'Closed') {
      this.snackbar.open('Vote already closed!', 'Okay...', { duration: 2000 })
    }
    if (vote.status != 'Closed' && vote.outcome != 'Undecided') {
      this.votingContractService.closeVote(vote.nr);
    }


  }

  cancelVote(vote: any) {
    if (vote.status === 'Open') {
      this.votingContractService.cancelVote(vote.nr, (err, res) => {
        if (err) {
          this.snackbar.open('Error canceling vote', 'What happened?', { duration: 2000 });
        }
        else {
          this.snackbar.open('Canceled Vote sucessfully', 'Excellent!', { duration: 2000 });
        }
      });
    } else if (vote.status === 'Canceled') {
      this.snackbar.open('Vote already canceled', 'Alright...', { duration: 2000 });
    }

  }

}

export interface Vote {
  nr: number;
  name: string;
  type: string;
  outcome: number;
  status: string;
  isInitiator: boolean;
  isCancelableByMember: boolean;
  originator: string;
  initiationDate: string;
  docHash: string;
  initiator: string;
  newBoardMembers: string;
  newVotingContractAddress: string;
  voters: string;
  blockNumAtInit: number;
}

const voteList: Vote[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
