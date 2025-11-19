import { TestBed } from '@angular/core/testing';

import { AcademicPeriod } from './academic-period';

describe('AcademicPeriod', () => {
  let service: AcademicPeriod;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcademicPeriod);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
