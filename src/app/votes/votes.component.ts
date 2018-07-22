import { Web3Service } from './../services/web3.service';
import { ValidatorService } from './../services/validator.service';
import { HashFileService } from './../services/hash-file.service';
import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DroppableModule } from '@ctrl/ngx-droppable';
import { MatSnackBar } from '@angular/material';
import { VotingContractService } from './../services/voting-contract.service';

@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.css']
})

export class VotesComponent implements OnInit {
  formGroup1: FormGroup;
  formGroup2: FormGroup;
  formGroup3: FormGroup;
  formGroup4: FormGroup;
  formGroup5: FormGroup;
  docName = 'Drop a file here or click to select one.';
  memberDocName = 'Drop a file here or click to select one.';
  droppedFile = false;
  droppedMemberFile = false;
  droppedContract = false;
  docHash;
  memberDocHash;
  isCopied;
  address;

  constructor(
    private _hashFile: HashFileService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private _web3Service: Web3Service,
    private _validatorService: ValidatorService,
    private _votingContractService: VotingContractService
  ) {
    _web3Service.getAccount().then(address => {
      this.address = address;
    });

  }

  ngOnInit() {
    this.formGroup1 = this._formBuilder.group({
      'firstCtrl': ['', Validators.required]
    });
    this.formGroup2 = this._formBuilder.group({
      'address': ['', [Validators.required, this._validatorService.addressValidator]],
      'name': ['', Validators.required]
    });
    this.formGroup3 = this._formBuilder.group({
      'firstCtrl': ['', Validators.required]
    });
    this.formGroup4 = this._formBuilder.group({
      'voteName': ['', Validators.required]
    });
    this.formGroup5 = this._formBuilder.group({
      'memberVoteName': ['', Validators.required],
      'address1': ['', [Validators.required, this._validatorService.addressValidator]],
      'address2': ['', [Validators.required, this._validatorService.addressValidator]],
      'address3': ['', [Validators.required, this._validatorService.addressValidator]]
    });
  }

  handleFiles(_files: FileList) {
    this._hashFile.getHash(_files[0]).then(res => {
      this.docHash = res;
    });

    this.docName = _files[0].name;
    this.droppedFile = true;
    this.formGroup1.patchValue({ firstCtrl: this.docName });
  }

  handleMemberFiles(_files: FileList) {
    this._hashFile.getHash(_files[0]).then(res => {
      this.memberDocHash = res;
    });

    this.memberDocName = _files[0].name;
    this.droppedMemberFile = true;
    this.formGroup3.patchValue({ firstCtrl: this.memberDocName });
  }

  copyHash() {
    if (this.isCopied) {
      this._snackBar.open('Hash copied to Clipboard', 'Cool!', { duration: 2000 });
    }
  }

  createDocumentVote() {
    this._votingContractService.initiateDocumentVote(this.formGroup4.value.voteName, this.docHash).then(res => {
      this.docName = 'Drop a file here or click to select one.';
      this.droppedFile = false;
      this._snackBar.open('Success!', 'Yeha!', { duration: 3000 });
    });

  }

  createContractVote() {
    this._votingContractService.initiateVotingContractUpdateVote(this.formGroup2.value.name, this.formGroup2.value.address).then(res => {
      // this.formGroup2.reset(true);
      this.droppedContract = false;
      this._snackBar.open('Success!', 'Cool!', { duration: 3000 });
    });

  }

  createMemberVote() {
    const addresses: string[] = [this.formGroup5.value.address1, this.formGroup5.value.address2, this.formGroup5.value.address3];
    this._votingContractService.initiateBoardMemberVote(this.formGroup5.value.memberVoteName, this.memberDocHash, addresses)
      .then(res => {
        this.memberDocName = 'Drop a file here or click to select one.';
        this.droppedMemberFile = false;
        this._snackBar.open('Success!', 'Sweet!', { duration: 3000 });
      });


  }
}

