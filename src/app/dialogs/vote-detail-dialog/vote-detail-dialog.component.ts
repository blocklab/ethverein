import { VotingContractService } from './../../services/voting-contract.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
    selector: 'app-vote-detail-dialog',
    templateUrl: './vote-detail-dialog.component.html',
    styleUrls: ['./vote-detail-dialog.component.css']
})
export class VoteDetailDialogComponent implements OnInit {
    voteID;
    voteName;
    voteType;
    voteDocumentHash;
    voteStatus;
    voteNewBoardMembers;
    voteNewVotingContractAddress;
    voteVoters;
    voteInitiator;
    voteBlockNumAtInit;
    voteOriginator;
    voteInitiatonDate;
    voteOutcome;


    constructor(
        private dialogRef: MatDialogRef<VoteDetailDialogComponent>,
        private snackBar: MatSnackBar,
        private _votingContractService: VotingContractService,
        @Inject(MAT_DIALOG_DATA) data
    ) {
        console.log("data", data);
        this.voteID = data.voteID;
        this.voteName = data.voteName;
        this.voteType = data.voteType;
        this.voteDocumentHash = data.voteDocumentHash;
        this.voteStatus = data.voteStatus;
        this.voteNewBoardMembers = data.voteNewBoardMembers;
        this.voteNewVotingContractAddress = data.voteNewVotingContractAddress;
        this.voteVoters = data.voteVoters;
        this.voteInitiator = data.voteInitiator;
        this.voteBlockNumAtInit = data.voteBlockNumAtInit;
        this.voteOriginator = data.voteOriginator;
        this.voteInitiatonDate = data.voteInitiatonDate;
        this.voteOutcome = data.voteOutcome;
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
