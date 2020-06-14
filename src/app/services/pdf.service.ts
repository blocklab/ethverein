import { Injectable } from "@angular/core";


@Injectable()
export class PdfService{

    constructor() {}

    getPDF():string {
        return '/assets/declaration/declaration-of-consent-ethverein.pdf'
    }
}