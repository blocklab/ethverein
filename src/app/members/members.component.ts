import { ConfirmApplicationDialogComponent } from './../dialogs/confirm-application-dialog/confirm-application-dialog.component';
import { MemberContractService } from './../services/member-contract.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog, MatDialogConfig } from '@angular/material';
import { Web3Service } from '../services/web3.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})

export class MembersComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private _web3Service: Web3Service,
    private _memberContractService: MemberContractService,
    private changeDetectorRefs: ChangeDetectorRef,
  ) {
    // register event listeners
    this._memberContractService.addMemberAppliedCallback ((err, res) => {
      if (res && res.returnValues.applicantAddress && !membersList.some(m => m.address === res.returnValues.applicantAddress)) {
        membersList.push({ alias: res.returnValues.applicantName, status: 'Pending', block: 0, address: res.returnValues.applicantAddress});
        this.dataSource.sort = this.sort;
        this.dataSource.filter = this.filter;
      }
    });
    this._memberContractService.addMemberConfirmedCallback ((err, res) => {
      if (res) {
        membersList.filter(m => m.address === res.returnValues.memberAddress).map(m => m.status = 'Member');
        this.dataSource.sort = this.sort;
        this.dataSource.filter = this.filter;
        this.changeDetectorRefs.detectChanges();
      }
    });
    this._memberContractService.addMemberNameChangedCallback ((err, res) => {
      if (res) {
        membersList.filter(m => m.address === res.returnValues.memberAddress).map(m => m.alias = res.returnValues.newMemberName);
        this.dataSource.sort = this.sort;
        this.dataSource.filter = this.filter;
        this.changeDetectorRefs.detectChanges();
      }
    });
    this._memberContractService.addMemberResginedCallback ((err, res) => {
      if (res) {
        let indexOfResignedMember = membersList.findIndex(m => m.address === res.returnValues.memberAddress);
        if (indexOfResignedMember !== -1) {
          membersList.splice(indexOfResignedMember, 1);
        }
      }
    });
   }

  displayedColumns = ['alias', 'status', 'block'];
  dataSource = new MatTableDataSource(membersList);
  private filter = '';
  ownAddress: string;
  ownStatus: string;

  @ViewChild(MatSort) sort: MatSort;

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.filter = filterValue;
    this.dataSource.filter = this.filter;
  }

  ngOnInit() {
    this._web3Service.getAccount().then(address => {
      this.ownAddress = address;
    });
    this.loadData();
  }

  loadData() {
    this._memberContractService.getNumberOfMembers().then(nOM => {
      for (let i = 0; i < nOM; i++) {
        this._memberContractService.getMembers(i).then(memberAddress => {

          this._memberContractService.getMember(memberAddress).then(member => {
            let _status;
            switch (parseInt(member[1], 0)) {
              case 1: _status = 'Pending'; break;
              case 2: _status = 'Member'; break;
              case 3: _status = 'Board Member'; break;
              default: _status = 'None'; break;
            }
            const _entry = parseInt(member[2], 0);
            if (this.ownAddress === memberAddress) {
              this.ownStatus = _status;
            }
            membersList[i] = ({ alias: member[0], status: _status, block: _entry, address: memberAddress });
            this.dataSource.sort = this.sort;
          });
        });
      }
    });
  }

  openDialog(_member) {
    if (this.ownStatus === 'Board Member' && _member.status === 'Pending') {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        alias: _member.alias,
        address: _member.address
      };
      this.dialog.open(ConfirmApplicationDialogComponent, dialogConfig);
    }
  }
}

export interface TableElement {
  alias: string;
  status: string;
  block: number;
  address: string;
}


const membersList: TableElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


