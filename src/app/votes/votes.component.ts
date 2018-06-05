import { HashFileService } from './../services/hash-file.service';
import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DroppableModule } from '@ctrl/ngx-droppable';


@Component({
  selector: 'app-votes',
  templateUrl: './votes.component.html',
  styleUrls: ['./votes.component.css']
})

export class VotesComponent implements OnInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  docName = 'Drop File here or Click to Select';
  droppedFile = false;
  hash;

  constructor(private _hashFile: HashFileService, private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  handleFiles(_files: FileList) {
    this._hashFile.getHash(_files).then(res => {
      this.hash = res;
      console.log(this.hash);
    });

    this.docName = _files[0].name;
    this.droppedFile = true;
    this.firstFormGroup.patchValue({ firstCtrl: this.docName });
  }

}

