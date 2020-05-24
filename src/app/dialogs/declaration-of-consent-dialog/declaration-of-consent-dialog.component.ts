import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { PdfService } from '../../services/pdf.service';
import { HashFileService } from '../../services/hash-file.service';



@Component({
    selector: 'app-declaration-of-consent-dialog',
    templateUrl: './declaration-of-consent-dialog.component.html',
    styleUrls: ['./declaration-of-consent-dialog.component.css'],
    providers: [PdfService]
})
export class ConsentDialogComponent implements OnInit {
    confirmation = false;
    fileHash;

    src: string;

    constructor(
        private dialogRef: MatDialogRef<ConsentDialogComponent>,
        private pdfService: PdfService,
        private hasher: HashFileService) {

    }
    ngOnInit() {
        this.src = this.pdfService.getPDF();
        this.genHash();
    }

    cancel() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close({confirmation: this.confirmation, fileHash: this.fileHash});
        
    }

    async genHash() {
        const blob = await fetch(this.pdfService.getPDF()).then(r => r.blob());
        
        this.hasher.getHash(blob).then(res => {
            this.fileHash = '0x' + res;
          });

    }

    checkCheckBoxvalue(event) {
        if (event.checked) {
            this.confirmation = true;
        }
        else {
            this.confirmation = false;
        }
    }
}
