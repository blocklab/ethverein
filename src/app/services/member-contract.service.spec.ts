import { TestBed, inject } from '@angular/core/testing';

import { MemberContractService } from './member-contract.service';

describe('MemberContractService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemberContractService]
    });
  });

  it('should be created', inject([MemberContractService], (service: MemberContractService) => {
    expect(service).toBeTruthy();
  }));
});
