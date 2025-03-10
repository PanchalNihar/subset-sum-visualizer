import { TestBed } from '@angular/core/testing';

import { SubsetSumService } from './subset-sum.service';

describe('SubsetSumService', () => {
  let service: SubsetSumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubsetSumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
