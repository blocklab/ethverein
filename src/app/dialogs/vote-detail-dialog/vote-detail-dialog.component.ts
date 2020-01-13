import { VotingContractService } from './../../services/voting-contract.service';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-vote-detail-dialog',
    templateUrl: './vote-detail-dialog.component.html',
    styleUrls: ['./vote-detail-dialog.component.css']
})
export class VoteDetailDialogComponent {
    vote;

    constructor(
        private dialogRef: MatDialogRef<VoteDetailDialogComponent>,
        private _votingContractService: VotingContractService,
        @Inject(MAT_DIALOG_DATA) vote
    ) {
        this.vote = vote;
    }

    confirm() {
        this._votingContractService.closeVote(this.vote.nr).then(() => {
            this.dialogRef.close();
        });
    }

    cancel() {
        this.dialogRef.close();
    }

}
