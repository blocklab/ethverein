import { TestBed, inject } from '@angular/core/testing';

import { HashFileService } from './hash-file.service';

describe('HashFileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HashFileService]
    });
  });

  it('should be created', inject([HashFileService], (service: HashFileService) => {
    expect(service).toBeTruthy();
  }));
});
