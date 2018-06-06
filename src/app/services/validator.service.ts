import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { FormControl } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class ValidatorService {
  _web3Service: Web3Service;

  constructor() { }

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config = {
      'required': 'Required',
      'invalidAddress': 'This is not a valid Address',
    };
    return config[validatorName];
  }

  addressValidator(control) {
    if (this._web3Service.web3.utils.isAddress(control.value)) {
      return {
        addressValidator: { valid: false }
      };
    }
  }

}

