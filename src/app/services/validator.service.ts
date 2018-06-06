import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  addressValidator(control) {

    if (control.value.match(/^0x[a-fA-F0-9]{40}$/)) {
      return null;
    } else {
      return { addressValidator: { valid: true } };
    }

  }


}

