import { GolGrid } from './gol-grid';

describe('GolGrid', () => {
  it('should create an instance', () => {
    expect(new GolGrid(100,100,10)).toBeTruthy();
  });
});
