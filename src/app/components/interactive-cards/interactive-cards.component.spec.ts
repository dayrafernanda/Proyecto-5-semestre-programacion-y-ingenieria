import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveCardsComponent } from './interactive-cards.component';

describe('InteractiveCardsComponent', () => {
  let component: InteractiveCardsComponent;
  let fixture: ComponentFixture<InteractiveCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
