import { CanvasCell } from './canvas-cell';

describe('CanvasCell', () => {
  let subject: CanvasCell
  beforeEach(() => {
    subject = new CanvasCell(10, 20)
  })

  it('should create an instance for any row and column', () => {
    expect(subject).toBeTruthy();
  });

  it('should return key any cordinates', () => {
    // act
    const result = subject.getKey()

    // assure
    expect(result).toBe("10|20")
  })

  it('should not be drawable by default', () => {
    // act
    const result = subject.isDrawable()

    // assure
    expect(result).toBeFalse()
  })

  it('should be drawable once drawing data is set', () => {
    // act
    subject.setDrawingData(100, 200, 50, 60)

    // assure
    expect(subject.isDrawable()).toBeTrue()
    expect(subject.x).toBe(100)
    expect(subject.y).toBe(200)
    expect(subject.width).toBe(50)
    expect(subject.height).toBe(60)
  })

  it('should not be drawable once reset drawing data invoked', () => {
    // act 1
    subject.setDrawingData(100, 200, 50, 60)

    // assure
    expect(subject.isDrawable()).toBeTrue()

    // act 1
    subject.resetDrawingData()

    // assure
    expect(subject.isDrawable()).toBeFalse()
  })

  it('should get correct eight neighbours', () => {
    // act 1
    const neighbours = subject.getNeghbourCells()

    // assure
    expect(neighbours).toHaveSize(8)
    expect(neighbours[0].row).toBe(subject.row - 1)
    expect(neighbours[0].col).toBe(subject.col - 1)

    expect(neighbours[1].row).toBe(subject.row - 1)
    expect(neighbours[1].col).toBe(subject.col)

    expect(neighbours[2].row).toBe(subject.row - 1)
    expect(neighbours[2].col).toBe(subject.col + 1)

    expect(neighbours[3].row).toBe(subject.row)
    expect(neighbours[3].col).toBe(subject.col - 1)

    expect(neighbours[4].row).toBe(subject.row)
    expect(neighbours[4].col).toBe(subject.col + 1)

    expect(neighbours[5].row).toBe(subject.row + 1)
    expect(neighbours[5].col).toBe(subject.col - 1)

    expect(neighbours[6].row).toBe(subject.row + 1)
    expect(neighbours[6].col).toBe(subject.col)

    expect(neighbours[7].row).toBe(subject.row + 1)
    expect(neighbours[7].col).toBe(subject.col + 1)
  })

});
