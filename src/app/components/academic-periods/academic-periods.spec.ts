import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicPeriods } from './academic-periods';

describe('AcademicPeriods', () => {
  let component: AcademicPeriods;
  let fixture: ComponentFixture<AcademicPeriods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicPeriods]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicPeriods);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
