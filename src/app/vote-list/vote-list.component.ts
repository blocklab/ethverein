import { MemberContractService } from './../services/member-contract.service';
import { VotingContractService } from './../services/voting-contract.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-vote-list',
  templateUrl: './vote-list.component.html',
  styleUrls: ['./vote-list.component.css']
})

export class VoteListComponent implements OnInit {

  constructor(
    private _votingContractService: VotingContractService,
    private _memberContractService: MemberContractService
  ) {
    this._memberContractService.getThisMember().then(() => {
      this.getVotes();
    });
  }

  displayedColumns = ['nr', 'name', 'type', 'status', 'outcome'];
  dataSource = new MatTableDataSource(voteList);

  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
  }

  getVotes() {
    // get open votes
    this._votingContractService.getNumberOfVotes().then(noV => {

      for (let i = 0; i < noV; i++) {
        this._votingContractService.getVoteDetails(i).then(vote => {
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
            default: break;
          }

          voteObj = {
            id: i,
            name: vote[0],
            type: voteType,
            docHash: vote[2],
            status: voteStatus,
            newBoardMembers: vote[4],
            newVotingContractAddress: vote[5],
            voters: vote[6]
          };
          return voteObj;

        }).then(voteObj => {
          this._votingContractService.computeVoteOutcome(voteObj.id).then(_outcome => {

            switch (parseInt(_outcome.c[0], 0)) {
              case 0: voteObj.outcome = 'Undecided'; break;
              case 1: voteObj.outcome = 'Accepted'; break;
              case 2: voteObj.outcome = 'Declined'; break;
              default: break;
            }
            voteList[i] = ({ nr: voteObj.id, name: voteObj.name, type: voteObj.type, status: voteObj.status, outcome: voteObj.outcome });
            this.dataSource.sort = this.sort;
          });
        });
      }
    });
  }
}

export interface PeriodicElement {
  nr: number;
  name: string;
  type: string;
  outcome: number;
  status: string;
}

const voteList: PeriodicElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
