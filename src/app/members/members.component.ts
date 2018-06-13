import { ConfirmApplicationDialogComponent } from './../confirm-application-dialog/confirm-application-dialog.component';
import { MemberContractService } from './../services/member-contract.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog, MatDialogConfig } from '@angular/material';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})

export class MembersComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private _memberContractService: MemberContractService
  ) { }

  displayedColumns = ['alias', 'status', 'block'];
  dataSource = new MatTableDataSource(membersList);

  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    this._memberContractService.getNumberOfMembers().then(nOM => {
      for (let i = 0; i < nOM; i++) {
        this._memberContractService.getMembers(i).then(memberAddress => {

          this._memberContractService.getMember(memberAddress).then(member => {
            let _status;
            switch (parseInt(member[1], 0)) {
              case 1: _status = 'pending'; break;
              case 2: _status = 'regular'; break;
              case 3: _status = 'board'; break;
              default: _status = 'none'; break;
            }
            const _entry = parseInt(member[2], 0);
            membersList[i] = ({alias: member[0], status: _status, block: _entry, address: memberAddress });
            this.dataSource.sort = this.sort;
          });
        });
      }
    });
  }

  openDialog(_member) {
 
    if (_member.status === 'pending') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        alias: _member.alias,
        address: _member.address 
      };
      this.dialog.open(ConfirmApplicationDialogComponent, dialogConfig);
    }
  }
}

export interface PeriodicElement {
  alias: string;
  status: string;
  block: number;
  address: string;
}


const membersList: PeriodicElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


