import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectReview } from './project-review';

describe('ProjectReview', () => {
  let component: ProjectReview;
  let fixture: ComponentFixture<ProjectReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectReview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
