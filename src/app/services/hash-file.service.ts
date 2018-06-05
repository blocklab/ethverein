import { Injectable } from '@angular/core';
import { SHA256 } from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class HashFileService {

  constructor() { }

  getHash(_files): Promise<string> {
    const fileReader = new FileReader();

    return new Promise<string>((resolve, reject) => {

      fileReader.onloadend = (e) => {
        const res = (SHA256(e.target.result).toString());
        resolve(res);
      };
      fileReader.readAsBinaryString(_files[0]);
    });

  }


}
