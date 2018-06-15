import { VotingContractService } from './../../services/voting-contract.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { MemberContractService } from './../../services/member-contract.service';

@Component({
  selector: 'app-cast-vote-dialog',
  templateUrl: './cast-vote-dialog.component.html',
  styleUrls: ['./cast-vote-dialog.component.css']
})
export class CastVoteDialogComponent implements OnInit {
  vote;
  isCopied;

  constructor(
    private snackBar: MatSnackBar,
    private votingContractService: VotingContractService,
    private dialogRef: MatDialogRef<CastVoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.vote = data.vote;
  }

  ngOnInit() {
  }

  copyHash() {
    if (this.isCopied) {
      this.snackBar.open('Copied to Clipboard', 'Perfect!', { duration: 2000 });
    }
  }

  yes() {
    this.votingContractService.castVote(this.vote.id, true).then(() => {
      this.dialogRef.close();
    });
  }

  no() {
    this.votingContractService.castVote(this.vote.id, false).then(() => {
      this.dialogRef.close();
    });

  }
}
