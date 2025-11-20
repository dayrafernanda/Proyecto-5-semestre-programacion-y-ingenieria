import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeMetricsComponent } from './realtime-metrics.component';

describe('RealtimeMetricsComponent', () => {
  let component: RealtimeMetricsComponent;
  let fixture: ComponentFixture<RealtimeMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimeMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
