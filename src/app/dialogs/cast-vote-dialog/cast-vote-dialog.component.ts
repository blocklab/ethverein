import { VotingContractService } from './../../services/voting-contract.service';
import { HashFileService } from './../../services/hash-file.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cast-vote-dialog',
  templateUrl: './cast-vote-dialog.component.html',
  styleUrls: ['./cast-vote-dialog.component.css']
})
export class CastVoteDialogComponent implements OnInit {
  vote;
  isCopied;
  verifyHash = '0x';
  docName = 'Drop the file here or click to select one.';
  droppedFile = false;
  blockExplorerLink: string;

  constructor(
    private snackBar: MatSnackBar,
    private _hashFile: HashFileService,
    private votingContractService: VotingContractService,
    private dialogRef: MatDialogRef<CastVoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.vote = data.vote;
    this.blockExplorerLink = environment.blockExplorerBaseUrl + this.vote.newVotingContractAddress;
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

  handleFiles(_files: FileList) {
    this._hashFile.getHash(_files[0]).then(res => {
      this.verifyHash = '0x' + res;
    });
    this.docName = _files[0].name;
    this.droppedFile = true;
  }
}
