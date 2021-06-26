import { CanvasCell } from './canvas-cell';
import { CellLife } from './cell-life';

describe('CellLife', () => {
  it('should create an instance', () => {
    expect(new CellLife(new CanvasCell(10, 20), false)).toBeTruthy();
  });
});
