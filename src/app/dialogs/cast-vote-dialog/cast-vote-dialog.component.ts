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
  voting;

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
    this.vote.type = Number(this.vote.type);
  }

  copyHash() {
    if (this.isCopied) {
      this.snackBar.open('Copied to Clipboard', 'Perfect!', { duration: 2000 });
    }
  }

  yes() {
    this.voting = true;
    this.votingContractService.castVote(this.vote.id, true, (err) => {
      this.voting = false;
      if (err) {
        this.snackBar.open('Error casting vote', 'What happened?', { duration: 2000 });  
      } else {
        this.snackBar.open('Casted Vote with yes', 'Excellent!', { duration: 2000 });
        this.dialogRef.close();
      }
    });
  }

  no() {
    this.voting = true;
    this.votingContractService.castVote(this.vote.id, false, (err) => {
      this.voting = false;
      if (err) {
        this.snackBar.open('Error casting vote', 'What happened?', { duration: 2000 });  
      } else {
        this.snackBar.open('Casted Vote with no', 'Why that?', { duration: 2000 });
        this.dialogRef.close();
      }
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
