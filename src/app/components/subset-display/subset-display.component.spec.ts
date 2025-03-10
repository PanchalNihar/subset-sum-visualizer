import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubsetDisplayComponent } from './subset-display.component';

describe('SubsetDisplayComponent', () => {
  let component: SubsetDisplayComponent;
  let fixture: ComponentFixture<SubsetDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubsetDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubsetDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
