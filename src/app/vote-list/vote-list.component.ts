import { MemberContractService } from './../services/member-contract.service';
import { VotingContractService } from './../services/voting-contract.service';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialogConfig, MatDialog, MatSnackBar } from '@angular/material';
import { Web3Service } from '../services/web3.service';
import { VoteDetailDialogComponent } from '../dialogs/vote-detail-dialog/vote-detail-dialog.component';

@Component({
  selector: 'app-vote-list',
  templateUrl: './vote-list.component.html',
  styleUrls: ['./vote-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VoteListComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private votingContractService: VotingContractService,
    private memberContractService: MemberContractService,
    private _web3Service: Web3Service,
    private snackbar: MatSnackBar,

  ) {
    this.memberContractService.getThisMember().then(() => {
      this.getVotes();
    });
  }

  displayedColumns = ['nr', 'name', 'originator', 'dateOfVote', 'type', 'status', 'outcome', 'cancel'];
  dataSource = new MatTableDataSource(voteList);
  private filter = '';
  acc = this._web3Service.getAccount()

  @ViewChild(MatSort) sort: MatSort;

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
          const isInitiatorResult = await this.checkIninitator(vote);
          const aliasResult = await this.getAlias(vote);
          const dateResult = await this.getBlockTimestamp(vote[8]);

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
            initiatonDate: dateResult

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
            voteList[i] = ({ nr: voteObj.id, name: voteObj.name, type: voteObj.type, status: voteObj.status, outcome: voteObj.outcome, isInitiator: voteObj.isInitiator, isCancelableByMember: voteObj.isCancelableByMember, originator: voteObj.originator, initiatonDate: voteObj.initiatonDate, docHash: voteObj.docHash, initiator: voteObj.initiator, newBoardMembers: voteObj.newBoardMembers, newVotingContractAddress: voteObj.newVotingContractAddress, voters: voteObj.voters, blockNumAtInit: voteObj.blockNumAtInit});
            this.dataSource.sort = this.sort;
          });
        });
      }
    });
  }

  async checkCancel(vote: any) {
    const currentBlock = await this.votingContractService.getCurrentBlock()
    const blocksPassed = currentBlock - vote[8]

    if (blocksPassed < 172800 && this.acc != vote[7]) {
      return vote.isCancelableByMember = false;
    }
    else {
      return vote.isCancelableByMember = true;
    }
  }

  async checkIninitator(vote: any) {
    const account = await this.acc;
    if (account === vote[7]) {
      return vote.isInitiator = true;
    }
    return vote.isInitiator = false;
  }

  async getAlias(vote){
    let alias = await this.memberContractService.getMember(vote[7])
    return alias[0]
  }

  async getBlockTimestamp(voteBlock: string){
    let blockInfo = await this.votingContractService.getBlockInfo(voteBlock)
    let initiatonDate = blockInfo.timestamp * 1000
    return initiatonDate;
  }

  showDetails(vote){
    console.log("dialog", vote)
    const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        voteID: vote.nr,
        voteName: vote.name,
        voteType: vote.type,
        voteDocumentHash: vote.docHash,
        voteStatus: vote.status,
        voteNewBoardMembers: vote.newBoardMembers,
        voteNewVotingContractAddress: vote.newVotingContractAddress,
        voteVoters: vote.voters,
        voteInitiator: vote.initiator,
        voteBlockNumAtInit: vote.blockNumAtInit,
        voteOriginator: vote.originator,
        voteInitiatonDate: vote.initiatonDate
      };
    this.dialog.open(VoteDetailDialogComponent, dialogConfig)
  }

  closeVote(_vote) {
    if (_vote.outcome === 'Undecided') {
      this.snackbar.open('Undecided votes cannot be closed!', 'Alright...', { duration: 2000 });
    } 
    if (_vote.status === 'Closed') {
      this.snackbar.open('Vote already closed!', 'Okay...', { duration: 2000 })
    }
    else if (_vote.outcome === 'Closed') {
      this.snackbar.open('Vote already closed!', 'Okay...', { duration: 2000 })
    }

    if (_vote.status != 'Closed' && _vote.outcome != 'Undecided') {
      this.votingContractService.closeVote(_vote.nr);
    }


  }

  async cancelVote(vote: any) {
    if (vote.status != 'Canceled') {
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
    // await this.voteCanceled();
  }



  // async voteCanceled(){
  //   this.votingContractService.addVoteCanceledCallback ((err, res) => {
  //     if (res) {
  //       const vote = voteList.filter(v => v.nr == res.returnValues.voteId);
  //       vote.map(v => v.status.replace("Open", "Canceled"))

  //       // vote.forEach((vote : any, key: number) => {
  //       // vote.status})
  //       this.dataSource.sort = this.sort;
  //       this.dataSource.filter = this.filter;
        
  //     }
  //   });
  // }

}

export interface PeriodicElement {
  nr: number;
  name: string;
  type: string;
  outcome: number;
  status: string;
  isInitiator: boolean;
  isCancelableByMember: boolean;
  originator: string;
  initiatonDate: string;
  docHash: string;
  initiator: string;
  newBoardMembers: string;
  newVotingContractAddress: string; 
  voters: string;
  blockNumAtInit: number;
}

const voteList: PeriodicElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
