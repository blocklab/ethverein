import { VotingContractService } from './../../services/voting-contract.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-confirm-close-vote-dialog',
  templateUrl: './confirm-close-vote-dialog.component.html',
  styleUrls: ['./confirm-close-vote-dialog.component.css']
})
export class ConfirmCloseVoteDialogComponent implements OnInit {
  voteID;
  voteName;

  constructor(
    private dialogRef: MatDialogRef<ConfirmCloseVoteDialogComponent>,
    private snackBar: MatSnackBar,
    private _votingContractService: VotingContractService,
    @Inject(MAT_DIALOG_DATA) data
  ) {
    this.voteID = data.voteID;
    this.voteName = data.voteName;
  }

  ngOnInit() {
  }

  confirm() {
    this._votingContractService.closeVote(this.voteID).then(() => {
      this.dialogRef.close();
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}
