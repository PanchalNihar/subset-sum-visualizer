import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeVisualizationComponent } from './tree-visualization.component';

describe('TreeVisualizationComponent', () => {
  let component: TreeVisualizationComponent;
  let fixture: ComponentFixture<TreeVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
