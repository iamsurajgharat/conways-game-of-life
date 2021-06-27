import { TestBed } from '@angular/core/testing';

import { GolCanvasDrawService } from './gol-canvas-draw.service';

describe('GolCanvasDrawService', () => {
  let service: GolCanvasDrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GolCanvasDrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
