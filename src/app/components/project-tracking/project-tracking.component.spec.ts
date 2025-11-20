import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTrackingComponent } from './project-tracking.component';

describe('ProjectTrackingComponent', () => {
  let component: ProjectTrackingComponent;
  let fixture: ComponentFixture<ProjectTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
