import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GolCanvasComponent } from './gol-canvas.component';

describe('GolCanvasComponent', () => {
  let component: GolCanvasComponent;
  let fixture: ComponentFixture<GolCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GolCanvasComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GolCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
