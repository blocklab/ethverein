import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class HashFileService {

  constructor() { }

  getHash(_file): Promise<string> {
    const fileReader = new FileReader();

    return new Promise<string>((resolve, _) => {

      fileReader.onloadend = (evt) => {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
          const wordArray = CryptoJS.lib.WordArray.create(evt.target.result);
          const hash = CryptoJS.SHA256(wordArray);
          resolve(hash);
        }
      };
      fileReader.readAsArrayBuffer(_file);
    });

  }


}
