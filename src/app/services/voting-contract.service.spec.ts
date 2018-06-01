import { TestBed, inject } from '@angular/core/testing';

import { VotingContractService } from './voting-contract.service';

describe('VotingContractService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VotingContractService]
    });
  });

  it('should be created', inject([VotingContractService], (service: VotingContractService) => {
    expect(service).toBeTruthy();
  }));
});
