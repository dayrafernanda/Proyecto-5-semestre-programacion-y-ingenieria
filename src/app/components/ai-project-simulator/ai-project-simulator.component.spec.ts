import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiProjectSimulatorComponent } from './ai-project-simulator.component';

describe('AiProjectSimulatorComponent', () => {
  let component: AiProjectSimulatorComponent;
  let fixture: ComponentFixture<AiProjectSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiProjectSimulatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiProjectSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
