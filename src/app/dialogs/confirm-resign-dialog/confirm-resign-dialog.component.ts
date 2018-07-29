import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { MemberContractService } from './../../services/member-contract.service';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-confirm-resign-dialog',
  templateUrl: './confirm-resign-dialog.component.html',
  styleUrls: ['./confirm-resign-dialog.component.css']
})
export class ConfirmResignDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ConfirmResignDialogComponent>,
    private _memberContractService: MemberContractService,
    @Inject(MAT_DIALOG_DATA) data
  ) {

  }

  ngOnInit() {
  }

  confirm() {
    this._memberContractService.resignOwnMembership().then(() => {
      this.dialogRef.close();
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
