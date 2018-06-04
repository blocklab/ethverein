import { Component, OnInit } from '@angular/core';
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

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  handleFilesDropped(files: File[]) {
    console.log('Files:', files);
    this.docName = files[0].name;
    this.droppedFile = true;
    this.firstFormGroup.patchValue({ firstCtrl: this.docName });
  }

}
