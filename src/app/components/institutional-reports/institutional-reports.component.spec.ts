import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionalReportsComponent } from './institutional-reports.component';

describe('InstitutionalReportsComponent', () => {
  let component: InstitutionalReportsComponent;
  let fixture: ComponentFixture<InstitutionalReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstitutionalReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstitutionalReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
