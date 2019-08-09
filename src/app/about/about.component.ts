import { ConfirmApplicationDialogComponent } from './../dialogs/confirm-application-dialog/confirm-application-dialog.component';
import { MemberContractService } from './../services/member-contract.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatDialog, MatDialogConfig } from '@angular/material';
import { Web3Service } from '../services/web3.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit {

 

  displayedColumns = ['alias', 'status', 'block'];
  dataSource = new MatTableDataSource(aboutList);
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
    
    };
 
  }



export interface TableElement {
  alias: string;
  status: string;
  block: number;
  address: string;
}


const aboutList: TableElement[] = [];

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


