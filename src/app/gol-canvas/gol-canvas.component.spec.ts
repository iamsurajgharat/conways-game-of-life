import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GolCanvasDrawService } from '../gol-canvas-draw.service';

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


describe('GolCanvasComponent-Oscillator', () => {
  let component: GolCanvasComponent;
  let fixture: ComponentFixture<GolCanvasComponent>;

  let spyCanvasDrawService: any

  beforeEach(() => {


    spyCanvasDrawService = jasmine.createSpyObj("GolCanvasDrawService",
      ["setCanvas", "clearAll", "beginPath", "closePath", "drawGridLine", "fillCell", "clearCell"])

    // configure TestBed to create component with mock canvas service
    TestBed.configureTestingModule({
      declarations: [GolCanvasComponent],

      providers: [{ provide: GolCanvasDrawService, useValue: spyCanvasDrawService }],
    });

    fixture = TestBed.createComponent(GolCanvasComponent);
    component = fixture.componentInstance;

    //fixture.detectChanges();
  });

  it('should create oscillator correctly', () => {

    var customCanvasElementEqualityTester = {
      asymmetricMatch: function (actual: any) {
        return !!actual &&
          (actual as ElementRef<HTMLCanvasElement>).nativeElement !== undefined &&
          (actual as ElementRef<HTMLCanvasElement>).nativeElement.getContext !== undefined
      }
    };

    // act1 - onInit
    component.ngOnInit()
    //spyCanvasDrawService.setCanvas({}, 800, 600)

    // assure
    expect(spyCanvasDrawService.setCanvas).toHaveBeenCalledOnceWith(customCanvasElementEqualityTester, 800, 600)
    expect(component.cellSize).toBe(component.zoomLevel, 'cell size should be equal to zoom level')
    expect(spyCanvasDrawService.clearAll).toHaveBeenCalledTimes(1)
    expect(spyCanvasDrawService.beginPath).toHaveBeenCalledTimes(1)
    expect(spyCanvasDrawService.drawGridLine).toHaveBeenCalledTimes(58)
    expect(spyCanvasDrawService.closePath).toHaveBeenCalledTimes(1)

  });
});
