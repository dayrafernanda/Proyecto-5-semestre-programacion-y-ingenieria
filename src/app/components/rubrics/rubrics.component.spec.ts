import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubricsComponent } from './rubrics.component';

describe('RubricsComponent', () => {
  let component: RubricsComponent;
  let fixture: ComponentFixture<RubricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RubricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RubricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
