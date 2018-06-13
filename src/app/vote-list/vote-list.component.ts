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
    private _votingContractService: VotingContractService
  ) {
    this.getVotes();
  }

  displayedColumns = ['nr', 'name'];
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
          return voteObj;

        }).then(voteObj => {
          
          voteList[i] = ({ nr: voteObj.id, name: voteObj.name });
          this.dataSource.sort = this.sort;
        });
      }
    });
  }
}

export interface PeriodicElement {
  nr: number;
  name: string;
}

const voteList: PeriodicElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
