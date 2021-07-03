import { ElementRef } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
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
    component.setInitValues(150, 110, 10, 3000);

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

  function createGliderTest() {
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
  }

  it('app should start with empty grid', testSetup);

  it('app should create glider correctly', createGliderTest);

  it('should be created and lived correctly', fakeAsync(() => {

    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const resetGridSpy = spyCanvasDrawService.resetGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const clearCellSpy = spyCanvasDrawService.clearCell = jasmine.createSpy().and.callThrough()

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
    // there should be two deaths and two births
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
    expect(fillCellSpy).toHaveBeenCalledWith(9, 10);
    expect(fillCellSpy).toHaveBeenCalledWith(10, 12)
    expect(clearCellSpy).toHaveBeenCalledTimes(2);
    expect(clearCellSpy).toHaveBeenCalledWith(9, 11);
    expect(clearCellSpy).toHaveBeenCalledWith(10, 9);

    // reset spy data
    resetGridSpy.calls.reset()
    fillCellSpy.calls.reset()
    clearCellSpy.calls.reset()

    // act 3
    tick(3000)

    // assure
    // there should be two deaths and two births
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
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11);
    expect(fillCellSpy).toHaveBeenCalledWith(11, 12)
    expect(clearCellSpy).toHaveBeenCalledTimes(2);
    expect(clearCellSpy).toHaveBeenCalledWith(9, 10);
    expect(clearCellSpy).toHaveBeenCalledWith(10, 11);

    // reset spy data
    resetGridSpy.calls.reset()
    fillCellSpy.calls.reset()
    clearCellSpy.calls.reset()

    // act 4
    tick(3000)

    // assure
    // there should be two deaths and two births
    // 00 is death, and 11 is birth in below illustration
    // ## is unchanged
    // 
    //      08 09 10 11 12 13
    //  08 |__|__|__|__|__|__|
    //  09 |__|__|__|00|__|__|
    //  10 |__|__|11|__|##|__|
    //  11 |__|__|00|##|##|__|
    //  12 |__|__|__|11|__|__|
    //  13 |__|__|__|__|__|__| 

    expect(resetGridSpy).toHaveBeenCalledTimes(0)
    expect(fillCellSpy).toHaveBeenCalledTimes(2);
    expect(fillCellSpy).toHaveBeenCalledWith(10, 10);
    expect(fillCellSpy).toHaveBeenCalledWith(12, 11)
    expect(clearCellSpy).toHaveBeenCalledTimes(2);
    expect(clearCellSpy).toHaveBeenCalledWith(9, 11);
    expect(clearCellSpy).toHaveBeenCalledWith(11, 10);

    component.stop()
  }));

  it('should support zoom-in', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const setCellSize = spyCanvasDrawService.setCellSize = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.doZoomIn()

    // assert
    expect(setCellSize).toHaveBeenCalledTimes(1);

    // initial zoomlevel is 10 and 5 is constant delta
    expect(setCellSize).toHaveBeenCalledOnceWith(15);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })

  it('should support zoom-out', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const setCellSize = spyCanvasDrawService.setCellSize = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.doZoomOut()

    // assert
    expect(setCellSize).toHaveBeenCalledTimes(1);

    // initial zoomlevel is 10 and 5 is constant delta
    expect(setCellSize).toHaveBeenCalledOnceWith(5);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })

  it('should support pan-up', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const moveUpSpy = spyCanvasDrawService.moveUp = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.moveUp()

    // assert
    expect(moveUpSpy).toHaveBeenCalledTimes(1);

    // move rate constant and it is 20
    expect(moveUpSpy).toHaveBeenCalledOnceWith(20);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })

  it('should support pan-right', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const moveRightSpy = spyCanvasDrawService.moveRight = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.moveRight()

    // assert
    expect(moveRightSpy).toHaveBeenCalledTimes(1);

    // move rate constant and it is 20
    expect(moveRightSpy).toHaveBeenCalledOnceWith(20);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })

  it('should support pan-left', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const moveLeftSpy = spyCanvasDrawService.moveLeft = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.moveLeft()

    // assert
    expect(moveLeftSpy).toHaveBeenCalledTimes(1);

    // move rate constant and it is 20
    expect(moveLeftSpy).toHaveBeenCalledOnceWith(20);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })

  it('should support pan-down', () => {
    // create glider
    createGliderTest()

    spyCanvasDrawService.getGrid = jasmine.createSpy().and.callThrough()
    const fillCellSpy = spyCanvasDrawService.fillCell = jasmine.createSpy().and.callThrough()
    const moveDownSpy = spyCanvasDrawService.moveDown = jasmine.createSpy().and.callThrough()

    // act 1 - perform zoom
    component.moveDown()

    // assert
    expect(moveDownSpy).toHaveBeenCalledTimes(1);

    // move rate constant and it is 20
    expect(moveDownSpy).toHaveBeenCalledOnceWith(20);

    // assure the default glider is drawn again
    //      08 09 10 11 12
    //  08 |__|__|__|__|__|
    //  09 |__|__|__|##|__|
    //  10 |__|##|__|##|__|
    //  11 |__|__|##|##|__|
    //  12 |__|__|__|__|__|
    expect(fillCellSpy).toHaveBeenCalledTimes(5);
    expect(fillCellSpy).toHaveBeenCalledWith(9, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 9)
    expect(fillCellSpy).toHaveBeenCalledWith(10, 11)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 10)
    expect(fillCellSpy).toHaveBeenCalledWith(11, 11)
  })
});
