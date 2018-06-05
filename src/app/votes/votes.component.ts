import { HashFileService } from './../services/hash-file.service';
import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DroppableModule } from '@ctrl/ngx-droppable';
import { MatSnackBar } from '@angular/material';


@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.css']
})

export class VotesComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  docName = 'Drop a file here or click to select one.';
  contractName = 'Drop a contract (.sol) here or click to select one.';
  memberDocName = 'Drop a file here or click to select one.';
  droppedFile = false;
  droppedMemberFile = false;
  droppedContract = false;
  docHash;
  memberDocHash;
  contractHash;
  isCopied;


  constructor(
    private _hashFile: HashFileService,
    private _formBuilder: FormBuilder,
    public _snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
  }

  handleFiles(_files: FileList) {
    this._hashFile.getHash(_files[0]).then(res => {
      this.docHash = res;
    });

    this.docName = _files[0].name;
    this.droppedFile = true;
    this.firstFormGroup.patchValue({ firstCtrl: this.docName });
  }

  handleContracts(_files: FileList) {
    const len = _files[0].name.length;
    const ending = _files[0].name.slice(len - 4, len);
    if (ending === '.sol') {
      this._hashFile.getHash(_files[0]).then(res => {
        this.contractHash = res;
      });

      this.contractName = _files[0].name;
      this.droppedContract = true;
      this.secondFormGroup.patchValue({ firstCtrl: this.contractName });
    } else {
      this._snackBar.open('\'' + ending + '\' not allowed, choose a \'.sol\' file.', 'Alright...', { duration: 4000 });
    }
  }

  handleMemberFiles(_files: FileList) {
    this._hashFile.getHash(_files[0]).then(res => {
      this.memberDocHash = res;
    });

    this.memberDocName = _files[0].name;
    this.droppedMemberFile = true;
    this.thirdFormGroup.patchValue({ firstCtrl: this.memberDocName });
  }

  copyHash() {
    if (this.isCopied) {
      this._snackBar.open('Hash copied to Clipboard', 'Cool!', { duration: 2000 });
    }
  }

  createDocumentVote() {
    console.log(this.docHash);
  }

  createContractVote() {
    console.log(this.docHash);
  }

}

