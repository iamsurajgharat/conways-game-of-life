import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CanvasCell } from '../canvas-cell';
import { CellLife } from '../cell-life';
import { GolCanvasDrawService } from '../gol-canvas-draw.service';

import { GolCanvasComponent } from './gol-canvas.component';

describe('GolCanvasComponent', () => {
  let component: GolCanvasComponent;
  let fixture: ComponentFixture<GolCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GolCanvasComponent],
    }).compileComponents();
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



describe('GolCanvasComponent-Glider', () => {
  let component: GolCanvasComponent;
  let fixture: ComponentFixture<GolCanvasComponent>;

  let spyCanvasDrawService = new GolCanvasDrawService()

  beforeEach(() => {
    /*spyCanvasDrawService = jasmine.createSpyObj('GolCanvasDrawService', [
      'setCanvas',
      'clearAll',
      'beginPath',
      'closePath',
      'drawGridLine',
      'fillCell',
      'clearCell',
      'getGrid'
    ]);*/

    // configure TestBed to create component with mock canvas service
    TestBed.configureTestingModule({
      declarations: [GolCanvasComponent],

      providers: [
        { provide: GolCanvasDrawService, useValue: spyCanvasDrawService },
      ],
    });

    fixture = TestBed.createComponent(GolCanvasComponent);
    component = fixture.componentInstance;

    //fixture.detectChanges();
  });

  function testSetup() {
    var customCanvasElementEqualityTester = {
      asymmetricMatch: function (actual: any) {
        return (
          !!actual &&
          (actual as ElementRef<HTMLCanvasElement>).nativeElement !==
            undefined &&
          (actual as ElementRef<HTMLCanvasElement>).nativeElement.getContext !==
            undefined
        );
      },
    };

    const setConvasSpy = spyOn(spyCanvasDrawService, 'setCanvas').and.callThrough()

    // arrange small test canvas
    component.setInitValues(150,110, 10, 3000);

    // act1 - onInit
    component.ngOnInit();

    // assure
    expect(spyCanvasDrawService.setCanvas).toHaveBeenCalledOnceWith(
      customCanvasElementEqualityTester,
      150,
      110,
      10
    );

    setConvasSpy.calls.reset();
  }

  it('should start correctly with empty grid', testSetup);

  it('createGlider should create glider correctly', fakeAsync(() => {

    // arrange
    testSetup()

    spyOn(spyCanvasDrawService, 'getGrid').and.callThrough()
    const resetGridSpy = spyOn(spyCanvasDrawService, 'resetGrid').and.callThrough()
    const fillCellSpy = spyOn(spyCanvasDrawService, 'fillCell').and.callThrough()
    const clearCellSpy = spyOn(spyCanvasDrawService, 'clearCell').and.callThrough()
    
    // act - create glider in below position
    
    component.createGlider()

    // assure
    // This should produce glider like this
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(resetGridSpy).toHaveBeenCalledTimes(1);
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
    
    // reset spy data
    resetGridSpy.calls.reset()
    fillCellSpy.calls.reset()

    // act 2 - the glider should move to next generation
    // and so, there should two new clear calls and two new fill calls
    //   __ __ __ __ __
    //  |__|__|__|__|__|
    //  |__|##|__|__|__|
    //  |__|__|##|##|__|
    //  |__|##|##|__|__|
    //  |__|__|__|__|__|

    
    component.start()
    
    // assure
    // there should two deaths and two births
    // 00 is death, and 11 is birth in below illustration
    // ## is unchanged
    // 
    //      08 09 10 11 12 13
    //  08 |__|__|__|__|__|__|
    //  09 |__|__|11|00|__|__|
    //  10 |__|00|__|##|11|__|
    //  11 |__|__|##|##|__|__|
    //  12 |__|__|__|__|__|__|

    expect(resetGridSpy).toHaveBeenCalledTimes(0)
    expect(fillCellSpy).toHaveBeenCalledTimes(2);
    expect(fillCellSpy).toHaveBeenCalledWith(9,10);
    expect(fillCellSpy).toHaveBeenCalledWith(10,12)
    expect(clearCellSpy).toHaveBeenCalledTimes(2);
    expect(clearCellSpy).toHaveBeenCalledWith(9,11);
    expect(clearCellSpy).toHaveBeenCalledWith(10,9);

    // reset spy data
    resetGridSpy.calls.reset()
    fillCellSpy.calls.reset()
    clearCellSpy.calls.reset()

    // act 3
    tick(3000)

    // assure
    // there should two deaths and two births
    // 00 is death, and 11 is birth in below illustration
    // ## is unchanged
    // 
    //      08 09 10 11 12 13
    //  08 |__|__|__|__|__|__|
    //  09 |__|__|00|11|__|__|
    //  10 |__|__|__|00|##|__|
    //  11 |__|__|##|##|11|__|
    //  12 |__|__|__|__|__|__|

    expect(resetGridSpy).toHaveBeenCalledTimes(0)
    expect(fillCellSpy).toHaveBeenCalledTimes(2);
    expect(fillCellSpy).toHaveBeenCalledWith(9,11);
    expect(fillCellSpy).toHaveBeenCalledWith(11,12)
    expect(clearCellSpy).toHaveBeenCalledTimes(2);
    expect(clearCellSpy).toHaveBeenCalledWith(9,10);
    expect(clearCellSpy).toHaveBeenCalledWith(10,11);

    component.stop()
  }));
});
