import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MemberContractService } from './../services/member-contract.service';

@Component({
  selector: 'app-confirm-application-dialog',
  templateUrl: './confirm-application-dialog.component.html',
  styleUrls: ['./confirm-application-dialog.component.css']
})
export class ConfirmApplicationDialogComponent implements OnInit {
  alias;
  address;

  constructor(
    private _memberContractService: MemberContractService,
    private dialogRef: MatDialogRef<ConfirmApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.alias = data.alias;
    this.address = data.address;
  }

  ngOnInit() {
  }

  confirm() {
    console.log(this.address);
    this._memberContractService.confirmApplication(this.address).then(() => {
      this.dialogRef.close();
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
