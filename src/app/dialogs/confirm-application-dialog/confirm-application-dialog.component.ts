import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { MemberContractService } from './../../services/member-contract.service';

@Component({
  selector: 'app-confirm-application-dialog',
  templateUrl: './confirm-application-dialog.component.html',
  styleUrls: ['./confirm-application-dialog.component.css']
})

export class ConfirmApplicationDialogComponent implements OnInit {
  alias;
  address;
  isCopied;
  confirming;

  constructor(
    private _memberContractService: MemberContractService,
    private dialogRef: MatDialogRef<ConfirmApplicationDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data) {
    this.alias = data.alias;
    this.address = data.address;
  }

  ngOnInit() {
  }

  confirm() {
    this.confirming = true;
    this._memberContractService.confirmApplication(this.address, (err) => {
      this.confirming = false;
      if (err) {
        this.snackBar.open('Error sending confirmation, please check and try again', 'Oh No!', { duration: 2000 });
      } else {
        this.snackBar.open('Application confirmed', 'Great!', { duration: 2000 });
        this.dialogRef.close();
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  copyHash() {
    if (this.isCopied) {
      this.snackBar.open('Copied to Clipboard', 'Thanks!', { duration: 2000 });
    }
  }
}
