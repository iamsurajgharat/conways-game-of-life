import { TestBed } from '@angular/core/testing';
import { GolCanvasDrawService } from './gol-canvas-draw.service';

describe('GolCanvasDrawService', () => {
  let service: GolCanvasDrawService;
  let htmlCanvasSpy: any
  let nativeHtmlCanvasSpy: jasmine.SpyObj<HTMLCanvasElement>
  let canvasContextSpy: jasmine.SpyObj<CanvasRenderingContext2D>

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GolCanvasDrawService);

    canvasContextSpy = jasmine.createSpyObj<CanvasRenderingContext2D>('CanvasRenderingContext2D',
      ['beginPath', 'closePath', 'clearRect', 'moveTo', 'lineTo', 'stroke', 'fillRect'])
    nativeHtmlCanvasSpy = jasmine.createSpyObj<HTMLCanvasElement>('HTMLCanvasElement', ['getContext'])
    nativeHtmlCanvasSpy.getContext.and.returnValue(canvasContextSpy)

    htmlCanvasSpy = jasmine.createSpyObj('ElementRef<HTMLCanvasElement>', [], { 'nativeElement': nativeHtmlCanvasSpy })

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setCanvas should initialize the service correctly', () => {

    // act
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)

    // assert    
    expect(canvasContextSpy.clearRect).toHaveBeenCalledTimes(1)

    // horizontal lines (11) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(26)

  })

  it('setCanvas should throw error if canvas context not found', () => {

    // arrange
    nativeHtmlCanvasSpy.getContext.and.returnValue(null)

    // act and assert
    expect(() => service.setCanvas(htmlCanvasSpy, 150, 110, 10)).toThrow()
  })


  it('should compute grid data correctly', () => {

    // act
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)
    const grid = service.getGrid()

    // assert
    expect(grid.height).toBe(110)
    expect(grid.width).toBe(150)
    expect(grid.cellSize).toBe(10)
    expect(grid.verticalCenter).toBe(110 / 2)
    expect(grid.horizontalCenter).toBe(150 / 2)

    expect(grid.centerRow).toBe(10)
    expect(grid.centerCol).toBe(10)

    // center row (10) + 1 - complete rows (5) - partial top row (1)
    expect(grid.topRow).toBe(10 + 1 - 5 - 1)

    // center row (10) + complete rows (5) + partial bottom row (1)
    expect(grid.bottomRow).toBe(10 + 5 + 1)

    // center col (10) + 1 - complete cols (7) - partial left col (1)
    expect(grid.leftCol).toBe(10 + 1 - 7 - 1)

    // center col (10) + complete cols (7) + partial right col (1)
    expect(grid.rightCol).toBe(10 + 7 + 1)

    expect(grid.topRowHeight).toBe(5)
    expect(grid.bottomRowHeight).toBe(5)
    expect(grid.leftColWidth).toBe(5)
    expect(grid.rightColWidth).toBe(5)
  })

  it('fillCell should not fill cell when outside visible grid', () => {

    // arrange
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)

    // act - center row is 10, and column is 10
    const result = service.fillCell(4, 0)

    // assert
    expect(result).toBeFalse()
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)
  })

  it('fillCell should fill cell when inside visible grid', () => {

    // arrange
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)

    // act - center row is 10, and column is 10
    const result = service.fillCell(10, 10)

    // assert
    expect(result).toBeTrue()

    // visible rows are from 5 to 16, and out of which first row is partly visible
    // thats why 10th row would start at 5 + (4*10), vertically
    // similarly, visible columns are 3 to 18, out of which left column is partly visible
    // thats why 10th col would start at 5 + (6*10), horizontally
    // the extra 1 is a fixed margin, 
    expect(canvasContextSpy.fillRect).toHaveBeenCalledOnceWith(65 + 1, 45 + 1, 10 - 1, 10 - 1)

  })


  it('fillCell should fill cell when inside first partly visible row', () => {

    // arrange
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)

    // act - center row is 10, and column is 10
    const result = service.fillCell(5, 10)

    // assert
    expect(result).toBeTrue()

    // visible rows are from 5 to 16, and out of which first row is partly visible
    // thats why 10th row would start at 5 + (4*10), vertically
    // similarly, visible columns are 3 to 18, out of which left column is partly visible
    // thats why 10th col would start at 5 + (6*10), horizontally
    // the extra 1 is a fixed margin, 
    expect(canvasContextSpy.fillRect).toHaveBeenCalledOnceWith(65 + 1, 0 + 1, 10 - 1, 5 - 1)

    new Array().forEach(element => {

    });

    [[10, 20]].forEach(([x, y]) => {

    })

  })

  new Array(
    [10, 10, 65, 45, 10, 10],     // center
    [5, 10, 65, 0, 10, 5],        // first row, which is partly visible
    [6, 3, 0, 5, 5, 10],           // first column, which is partly visible
    [16, 4, 5, 105, 10, 5],           // last row, which is partly visible
    [15, 18, 145, 95, 5, 10]           // last column, which is partly visible
  ).forEach(([row, col, x, y, width, height]) => {
    it('fillCell should fill cell when inside visible grid - all combinations ', () => {

      // arrange
      service.setCanvas(htmlCanvasSpy, 150, 110, 10)

      // act - center row is 10, and column is 10
      const result = service.fillCell(row, col)

      // assert
      expect(result).toBeTrue()

      // visible rows are from 5 to 16, and out of which top and bottom rows are partly visible
      // similarly, visible columns are 3 to 18, out of which left most and right columns are partly visible
      expect(canvasContextSpy.fillRect).toHaveBeenCalledOnceWith(x + 1, y + 1, width - 1, height - 1)

    })
  })

  it('clearCell should not clear the cell when outside visible grid', () => {

    // arrange
    service.setCanvas(htmlCanvasSpy, 150, 110, 10)
    canvasContextSpy.clearRect.calls.reset()

    // act - center row is 10, and column is 10
    const result = service.clearCell(4, 0)

    // assert
    expect(result).toBeFalse()
    expect(canvasContextSpy.clearRect).toHaveBeenCalledTimes(0)
  })

  new Array(
    [10, 10, 65, 45, 10, 10],     // center
    [5, 10, 65, 0, 10, 5],        // first row, which is partly visible
    [6, 3, 0, 5, 5, 10],           // first column, which is partly visible
    [16, 4, 5, 105, 10, 5],           // last row, which is partly visible
    [15, 18, 145, 95, 5, 10]           // last column, which is partly visible
  ).forEach(([row, col, x, y, width, height]) => {
    it('clearCell should clear cell when inside visible grid - all combinations ', () => {

      // arrange
      service.setCanvas(htmlCanvasSpy, 150, 110, 10)
      canvasContextSpy.clearRect.calls.reset()

      // act - center row is 10, and column is 10
      const result = service.clearCell(row, col)

      // assert
      expect(result).toBeTrue()

      // visible rows are from 5 to 16, and out of which top and bottom rows are partly visible
      // similarly, visible columns are 3 to 18, out of which left most and right columns are partly visible
      expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(x + 1, y + 1, width - 1, height - 1)

    })
  })

  function setupGridWithOneLife() {

    service.setCanvas(htmlCanvasSpy, 150, 110, 10)
    const result = service.fillCell(10, 10)
  }

  it('resetGrid should redraw the grid without lives', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.resetGrid()

    // assert
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (11) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(26)

    // ensure no life is painted
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

  it('moveUp should move the grid up by given amount', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.moveUp(15)
    const grid = service.getGrid()

    // assert
    expect(grid.centerRow).toBe(9)
    expect(grid.topRow).toBe(4)
    expect(grid.bottomRow).toBe(14)
    expect(grid.verticalCenter).toBe(60)

    // assure column data is unchanged
    expect(grid.centerCol).toBe(10)

    // assert redraw
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (10) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(25)

    // ensure no life is painted without explicitcall
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

  it('moveDown should move the grid down by given amount', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.moveDown(10)
    const grid = service.getGrid()

    // assert
    expect(grid.centerRow).toBe(11)
    expect(grid.topRow).toBe(6)
    expect(grid.bottomRow).toBe(17)
    expect(grid.verticalCenter).toBe(55)

    // assure column data is unchanged
    expect(grid.centerCol).toBe(10)

    // assert redraw
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (11) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(26)

    // ensure no life is painted without explicitcall
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

  it('moveLeft should move the grid left by given amount', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.moveLeft(20)
    const grid = service.getGrid()

    // assert
    expect(grid.centerCol).toBe(8)
    expect(grid.leftCol).toBe(1)
    expect(grid.rightCol).toBe(16)
    expect(grid.horizontalCenter).toBe(75)

    // assure row data is unchanged
    expect(grid.centerRow).toBe(10)

    // assert redraw
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (11) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(26)

    // ensure no life is painted without explicitcall
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

  it('moveRight should move the grid right by given amount', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.moveRight(2)
    const grid = service.getGrid()

    // assert
    expect(grid.centerCol).toBe(10)
    expect(grid.leftCol).toBe(3)
    expect(grid.rightCol).toBe(18)
    expect(grid.horizontalCenter).toBe(73)

    // assure row data is unchanged
    expect(grid.centerRow).toBe(10)

    // assert redraw
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (11) + vertical lines (15)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(26)

    // ensure no life is painted without explicitcall
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

  it('setCellSize should resize the grid cells to given amount', () => {

    // arrange
    setupGridWithOneLife()
    canvasContextSpy.clearRect.calls.reset()
    canvasContextSpy.stroke.calls.reset()
    canvasContextSpy.fillRect.calls.reset()

    // act
    service.setCellSize(20)
    const grid = service.getGrid()

    // assert
    expect(grid.cellSize).toBe(20)
    expect(grid.centerRow).toBe(10)
    expect(grid.centerCol).toBe(10)

    // center row (10) + 1 - complete rows (2) - partial top row (1)
    expect(grid.topRow).toBe(10 + 1 - 2 - 1)

    // center row (10) + complete rows (2) + partial bottom row (1)
    expect(grid.bottomRow).toBe(10 + 2 + 1)

    // center col (10) + 1 - complete cols (3) - partial left col (1)
    expect(grid.leftCol).toBe(10 + 1 - 3 - 1)

    // center col (10) + complete cols (3) + partial right col (1)
    expect(grid.rightCol).toBe(10 + 3 + 1)

    expect(grid.topRowHeight).toBe(15)
    expect(grid.bottomRowHeight).toBe(15)
    expect(grid.leftColWidth).toBe(15)
    expect(grid.rightColWidth).toBe(15)

    // assert redraw
    expect(canvasContextSpy.clearRect).toHaveBeenCalledOnceWith(0, 0, 150, 110)

    // horizontal lines (5) + vertical lines (7)
    expect(canvasContextSpy.stroke).toHaveBeenCalledTimes(12)

    // ensure no life is painted without explicitcall
    expect(canvasContextSpy.fillRect).toHaveBeenCalledTimes(0)

  })

});
