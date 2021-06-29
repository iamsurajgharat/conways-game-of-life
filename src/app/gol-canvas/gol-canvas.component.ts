import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasCell } from '../canvas-cell';
import { CellLife } from '../cell-life';
import { GolCanvasDrawService } from '../gol-canvas-draw.service';

@Component({
  selector: 'app-gol-canvas',
  templateUrl: './gol-canvas.component.html',
  styleUrls: ['./gol-canvas.component.css'],
})
export class GolCanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private zoomLevelChange: number = 3;
  private moveChangeRate: number = 10;
  private generationDuration = 3000;

  // canvas properties
  zoomLevel = 25;
  canvasWidth = 1500;
  canvasHeight = 1000;
  cellSize = 35;
  topRow = 1;
  bottomRow = 10;
  leftCol = 1;
  rightCol = 10;
  totalRows = 0;
  totalCols = 0;
  centerRow = 10;
  centerCol = 15;
  verticalCenter = this.canvasHeight / 2;
  horizontalCenter = this.canvasWidth / 2;
  verticalOffset = 0;
  horizontalOffset = 0;
  firstRowHeight = this.cellSize;
  firstColWidth = this.cellSize;
  lastRowHeight = this.cellSize;
  lastColWidth = this.cellSize;

  // all lives
  allLives = new Map<string, CellLife>();

  private timeoutToken!: any;

  constructor(private canvasService: GolCanvasDrawService) {}

  ngOnInit(): void {
    //this.canvas.nativeElement.style.height = '500px'
    this.canvasService.setCanvas(
      this.canvas,
      this.canvasWidth,
      this.canvasHeight
    );
    this.setInitValues();
    this.refresh(this.cellSize);
  }

  private setInitValues() {
    this.zoomLevel = 35;
    this.calculateCellSize(this.zoomLevel);
    this.canvasWidth = 1500;
    this.canvasHeight = 1000;
    this.topRow = 1;
    this.bottomRow = 10;
    this.leftCol = 1;
    this.rightCol = 10;
    this.totalRows = 0;
    this.totalCols = 0;
    this.centerRow = 10;
    this.centerCol = 15;
    this.verticalCenter = this.canvasHeight / 2;
    this.horizontalCenter = this.canvasWidth / 2;
    this.verticalOffset = 0;
    this.horizontalOffset = 0;
    this.firstRowHeight = this.cellSize;
    this.firstColWidth = this.cellSize;
    this.lastRowHeight = this.cellSize;
    this.lastColWidth = this.cellSize;
  }

  createOscillator() {
    // oscillator
    const centerCell1 = new CanvasCell(this.centerRow, this.centerCol);
    const centerCell2 = new CanvasCell(this.centerRow + 1, this.centerCol);
    const centerCell3 = new CanvasCell(this.centerRow + 2, this.centerCol);
    const lives = [centerCell1, centerCell2, centerCell3];

    this.createInitialState(lives);
  }

  createGlider() {
    // glider
    const c1 = new CanvasCell(10, 10);
    const c2 = new CanvasCell(10, 11);
    const c3 = new CanvasCell(10, 12);
    const c4 = new CanvasCell(9, 12);
    const c5 = new CanvasCell(8, 11);
    const lives = [c1, c2, c3, c4, c5];

    this.createInitialState(lives);
  }

  start() {
    //requestAnimationFrame(() => this.createNextGeneration())
    this.createNextGeneration();
  }

  stop() {
    clearTimeout(this.timeoutToken);
  }

  doZoomIn() {
    this.doZoom(this.zoomLevel + this.zoomLevelChange);
  }

  doZoomOut() {
    this.doZoom(this.zoomLevel - this.zoomLevelChange);
  }

  moveUp() {
    this.verticalCenter += this.moveChangeRate;
    const originalVerticalCenter = this.canvasHeight / 2;
    if (this.verticalCenter - originalVerticalCenter >= this.cellSize) {
      this.centerRow = this.centerRow - 1;
      this.verticalCenter = this.verticalCenter - this.cellSize;
    }
    this.refresh(this.cellSize);
  }

  moveDown() {
    this.verticalCenter -= this.moveChangeRate;
    const originalVerticalCenter = this.canvasHeight / 2;
    if ((originalVerticalCenter - this.verticalCenter) >= this.cellSize) {
      this.centerRow = this.centerRow + 1;
      this.verticalCenter = this.verticalCenter + this.cellSize;
    }
    this.refresh(this.cellSize);
  }

  moveLeft() {
    this.horizontalCenter += this.moveChangeRate;
    const originalHorizontalCenter = this.canvasWidth / 2;
    if (this.horizontalCenter - originalHorizontalCenter >= this.cellSize) {
      this.centerCol = this.centerCol - 1;
      this.horizontalCenter = this.horizontalCenter - this.cellSize;
    }
    this.refresh(this.cellSize);
  }

  moveRight() {
    this.horizontalCenter -= this.moveChangeRate;
    const originalHorizontalCenter = this.canvasWidth / 2;
    if ((originalHorizontalCenter - this.horizontalCenter) >= this.cellSize) {
      this.centerCol = this.centerCol + 1;
      this.horizontalCenter = this.horizontalCenter + this.cellSize;
    }
    this.refresh(this.cellSize);
  }

  private refresh(side: number): void {
    this.canvasService.clearAll();
    this.canvasService.beginPath();

    this.drawHorizontalLines(side);
    this.drawVerticalLines(side);

    this.canvasService.closePath();

    /*this.updateRowsCols(
      this.centerRow,
      this.canvasHeight,
      this.centerCol,
      this.canvasWidth,
      this.zoomLevel
    );*/

    // draw lives
    this.drawAllLives();
  }

  private drawHorizontalLines(side: number) {

    // draw center horizontal line
    this.canvasService.drawGridLine(
      0,
      this.verticalCenter,
      this.canvasWidth,
      this.verticalCenter
    );

    // draw horizontal lines in upper half
    let y = this.verticalCenter - side;
    this.topRow = this.centerRow - 1;
    while (y > 0) {
      this.canvasService.drawGridLine(0, y, this.canvasWidth, y);
      y = y - side;
      this.topRow -= 1;
    }

    // negate last sub
    this.topRow += 1;

    // first row height
    this.firstRowHeight = y < 0 ? y + side : side;

    // draw horizontal lines in lower half
    y = this.verticalCenter + side;
    this.bottomRow = this.centerRow + 2;
    while (y < this.canvasHeight) {
      this.canvasService.drawGridLine(0, y, this.canvasWidth, y);
      y = y + side;
      this.bottomRow += 1;
    }

    this.bottomRow -= 1;

    // last row height
    this.lastRowHeight = y > this.canvasHeight ? y - this.canvasHeight : side;

    this.totalRows = this.bottomRow - this.topRow + 1;
  }

  private drawVerticalLines(side: number) {
    // draw center vertical line
    this.canvasService.drawGridLine(
      //const verticalCenter = this.canvasHeight / 2;
      this.horizontalCenter,
      0,
      this.horizontalCenter,
      this.canvasHeight
    );

    // draw vertical lines in left half
    let x = this.horizontalCenter - side;
    this.leftCol = this.centerCol - 1
    while (x > 0) {
      this.canvasService.drawGridLine(x, 0, x, this.canvasHeight);
      x = x - side;
      this.leftCol -=  1
    }

    // negate last sub
    this.leftCol += 1;

    // first column width
    this.firstColWidth = x < 0 ? x + side : side;

    // draw vertical lines in right half
    x = this.horizontalCenter + side;
    this.rightCol = this.centerCol + 2
    while (x < this.canvasWidth) {
      this.canvasService.drawGridLine(x, 0, x, this.canvasHeight);
      x = x + side;
      this.rightCol += 1
    }

    this.rightCol -= 1

    // last column width
    this.lastColWidth =
      x > this.canvasWidth ? x - this.canvasWidth : side;

      this.totalCols = this.rightCol - this.leftCol + 1;
  }

  private updateRowsCols(
    centerRow: number,
    height: number,
    centerCol: number,
    width: number,
    side: number
  ) {
    this.updateRows(centerRow, height, side);
    this.updateCols(centerCol, width, side);
  }

  private updateRows(centerRow: number, height: number, side: number) {
    const completeUpperRows = Math.floor(this.verticalCenter / side);
    this.firstRowHeight = this.verticalCenter % side || side;
    this.topRow =
      centerRow - completeUpperRows + 1 - (this.firstRowHeight != side ? 1 : 0);

    const completeLowerRows = Math.floor((height - this.verticalCenter) / side);
    this.lastRowHeight = (height - this.verticalCenter) % side || side;
    this.bottomRow =
      centerRow + completeLowerRows + (this.lastRowHeight != side ? 1 : 0);

    this.totalRows = this.bottomRow - this.topRow + 1;
  }

  private updateCols(centerCol: number, width: number, side: number) {
    const completeLeftColumns = Math.floor(this.horizontalCenter / side);
    this.firstColWidth = this.horizontalCenter % side || side;
    this.leftCol =
      centerCol -
      completeLeftColumns +
      1 -
      (this.firstColWidth != side ? 1 : 0);

    const completeRightColumns = Math.floor(
      (width - this.horizontalCenter) / side
    );
    this.lastColWidth = (width - this.horizontalCenter) % side || side;
    this.rightCol =
      centerCol + completeRightColumns + (this.lastRowHeight != side ? 1 : 0);

    this.totalCols = this.rightCol - this.leftCol + 1;
  }

  private doZoom(newZoomLevel: number) {
    if (newZoomLevel < 10) {
      return;
    }
    this.zoomLevel = newZoomLevel;
    this.calculateCellSize(this.zoomLevel);
    this.refresh(this.cellSize);
  }

  private calculateCellSize(zoomLevel: number) {
    this.cellSize = zoomLevel;
    return this.cellSize;
  }

  private createInitialState(lives: CanvasCell[]) {
    this.stop();
    this.canvasService.clearAll();
    this.allLives = new Map<string, CellLife>();

    for (let cell of lives) {
      this.allLives.set(cell.getKey(), new CellLife(cell, true));
    }

    this.refresh(this.cellSize);
  }

  private drawAllLives() {
    for (let life of this.allLives) {
      this.fillCell(life[1].cell);
    }
  }

  private createNextGeneration() {
    //this.fillCell(new CanvasCell(18, 25))

    // process each life in allLives state, and its surroundings
    const newDeads = [];
    const newBorn = [];
    const processedLives = new Set<string>();
    const newGeneration = new Map<string, CellLife>();
    for (let key of this.allLives.keys()) {
      const life = this.allLives.get(key);
      if (!life) {
        continue;
      }

      const nextLifeStatus = this.processCellLife(life, this.allLives);
      if (nextLifeStatus == false) {
        newDeads.push(life.cell);
      } else {
        newGeneration.set(key, life);
      }

      processedLives.add(key);

      for (let neighbour of this.getNeighbours(life, this.allLives).filter(
        (x) => !processedLives.has(x.cell.getKey())
      )) {
        const nextLifeStatusForNeighbour = this.processCellLife(
          neighbour,
          this.allLives
        );
        const key2 = neighbour.cell.getKey();
        if (nextLifeStatusForNeighbour != neighbour.alive) {
          neighbour.alive = nextLifeStatusForNeighbour;
          if (nextLifeStatusForNeighbour) {
            newBorn.push(neighbour.cell);
            newGeneration.set(key2, neighbour);
          } else {
            newDeads.push(neighbour.cell);
          }
        }

        processedLives.add(key2);
      }
    }

    // update allLives as per new generation data
    this.allLives = newGeneration;

    // find delta and pass it on to updateCellsOnCanvass method
    this.updateCellsOnCanvass(newDeads, newBorn);

    // schedule itself to be run in next 1s
    this.timeoutToken = setTimeout(
      () => this.createNextGeneration(),
      this.generationDuration
    );
    //requestAnimationFrame(() => this.createNextGeneration())
  }

  private processCellLife(
    cell: CellLife,
    allLives: Map<string, CellLife>
  ): boolean {
    // TODO : actual rules

    const boolToNum = (x: boolean): number => (x ? 1 : 0);
    const numberOfLivingNeighbours = cell.cell
      .getNeghbourCells()
      .map((x) => {
        const existing = allLives.get(x.getKey());
        if (existing) {
          return boolToNum(existing.alive);
        }

        return 0;
      })
      .reduce((prev, curr, index, arr) => prev + curr);

    if (cell.alive) {
      if (numberOfLivingNeighbours < 2 || numberOfLivingNeighbours > 3) {
        return false;
      }
      return true;
    } else if (numberOfLivingNeighbours == 3) {
      return true;
    }

    return false;
  }

  private getNeighbours(
    cell: CellLife,
    allLives: Map<string, CellLife>
  ): CellLife[] {
    const neighbours: CellLife[] = [];

    for (let newNeighbour of cell.cell.getNeghbourCells()) {
      let oldNeighbour = allLives.get(newNeighbour.getKey());
      if (oldNeighbour) {
        neighbours.push(oldNeighbour);
      } else {
        neighbours.push(new CellLife(newNeighbour, false));
      }
    }

    return neighbours;
  }

  private updateCellsOnCanvass(
    cellsToClear: CanvasCell[],
    cellToDraw: CanvasCell[]
  ) {
    // remove
    for (let cell of cellsToClear) {
      this.clearCell(cell);
    }

    // create
    for (let cell of cellToDraw) {
      this.fillCell(cell);
    }
  }

  private fillCell(cell: CanvasCell) {
    if (!this.isCellOnCanvas(cell)) {
      return;
    }

    this.setCanvasCellCordinates(cell);

    this.canvasService.fillCell(cell.x, cell.y, cell.width, cell.height);
    console.log(cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height);
  }

  private clearCell(cell: CanvasCell) {
    if (!this.isCellOnCanvas(cell)) {
      return;
    }

    this.setCanvasCellCordinates(cell);

    this.canvasService.clearCell(cell.x, cell.y, cell.width, cell.height);
    console.log(
      'Cleared :' + cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height
    );
  }

  private isCellOnCanvas(cell: CanvasCell): boolean {
    return (
      cell.row >= this.topRow &&
      cell.row <= this.bottomRow &&
      cell.col >= this.leftCol &&
      cell.col <= this.rightCol
    );
  }

  private setCanvasCellCordinates(cell: CanvasCell): void {
    const xoffset = cell.col > this.leftCol ? this.firstColWidth : 0;
    const xcols =
      cell.col <= this.leftCol + 1 ? 0 : cell.col - this.leftCol - 1;
    const yoffset = cell.row > this.topRow ? this.firstRowHeight : 0;
    const ycols = cell.row <= this.topRow + 1 ? 0 : cell.row - this.topRow - 1;

    const x = xoffset + xcols * this.cellSize;
    const y = yoffset + ycols * this.cellSize;

    const width =
      cell.col == this.leftCol
        ? this.firstColWidth
        : cell.col == this.rightCol
        ? this.lastColWidth
        : this.cellSize;

    const height =
      cell.row == this.topRow
        ? this.firstRowHeight
        : cell.row == this.bottomRow
        ? this.lastRowHeight
        : this.cellSize;

    cell.setDrawingData(x, y, width, height);
  }
}
