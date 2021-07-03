import { ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';
import { CanvasCell } from './canvas-cell';
import { GolGrid } from './gol-grid';

@Injectable({
  providedIn: 'root'
})
export class GolCanvasDrawService {
  private grid!: GolGrid
  private cellMargin = 1
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  constructor() { }

  setCanvas(canvas: ElementRef<HTMLCanvasElement>, width: number, height: number, cellSize: number) {
    this.canvas = canvas
    this.grid = new GolGrid(width, height, cellSize)

    const newCtxValue = this.canvas.nativeElement.getContext('2d')
    if (newCtxValue != null) {
      this.ctx = newCtxValue;

      // init with proper values
      this.ctx.lineWidth = 0.4
      this.ctx.strokeStyle = "black"
      this.ctx.fillStyle = "rgba(255,0,0,0.75)"
    }
    else {
      // throw error
      throw new Error('Canvas context not found')
    }

    this.refresh()
  }

  getGrid() {
    return this.grid
  }

  fillCell(row: number, col: number): boolean {
    if (!this.isCellOnCanvas(row, col)) {
      return false;
    }

    const cell = this.getCanvasCellCordinates(row, col);

    this.fillRect(cell.x + this.cellMargin, cell.y + this.cellMargin, cell.width - this.cellMargin, cell.height - this.cellMargin);
    // console.log(cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height);

    return true
  }

  clearCell(row: number, col: number): boolean {
    if (!this.isCellOnCanvas(row, col)) {
      return false;
    }

    const cell = this.getCanvasCellCordinates(row, col);

    this.clearRect(cell.x + this.cellMargin, cell.y + this.cellMargin, cell.width - this.cellMargin, cell.height - this.cellMargin);
    // console.log(
    //   'Cleared :' + cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height
    // );

    return true
  }

  resetGrid() {
    this.refresh()
  }

  moveUp(delta: number) {
    this.grid.verticalCenter += delta
    const originalVerticalCenter = this.grid.height / 2;
    if (this.grid.verticalCenter - originalVerticalCenter >= this.grid.cellSize) {
      this.grid.centerRow = this.grid.centerRow - 1;
      this.grid.verticalCenter = this.grid.verticalCenter - this.grid.cellSize;
    }

    this.refresh();
  }

  moveDown(delta: number) {
    this.grid.verticalCenter -= delta
    const originalVerticalCenter = this.grid.height / 2;
    if (originalVerticalCenter - this.grid.verticalCenter >= this.grid.cellSize) {
      this.grid.centerRow = this.grid.centerRow + 1;
      this.grid.verticalCenter = this.grid.verticalCenter + this.grid.cellSize;
    }
    this.refresh();
  }

  moveLeft(delta: number) {
    this.grid.horizontalCenter += delta
    const originalHorizontalCenter = this.grid.width / 2;
    if (this.grid.horizontalCenter - originalHorizontalCenter >= this.grid.cellSize) {
      this.grid.centerCol = this.grid.centerCol - 1;
      this.grid.horizontalCenter = this.grid.horizontalCenter - this.grid.cellSize;
    }
    this.refresh();
  }

  moveRight(delta: number) {
    this.grid.horizontalCenter -= delta
    const originalHorizontalCenter = this.grid.height / 2;
    if (originalHorizontalCenter - this.grid.horizontalCenter >= this.grid.cellSize) {
      this.grid.centerCol = this.grid.centerCol + 1;
      this.grid.horizontalCenter = this.grid.horizontalCenter + this.grid.cellSize;
    }
    this.refresh();
  }

  setCellSize(value: number) {
    this.grid.cellSize = value
    this.refresh()
  }

  private getCanvasCellCordinates(row: number, col: number): CanvasCell {
    const xoffset = col > this.grid.leftCol ? this.grid.leftColWidth : 0;
    const xcols =
      col <= this.grid.leftCol + 1 ? 0 : col - this.grid.leftCol - 1;
    const yoffset = row > this.grid.topRow ? this.grid.topRowHeight : 0;
    const ycols = row <= this.grid.topRow + 1 ? 0 : row - this.grid.topRow - 1;

    const x = xoffset + xcols * this.grid.cellSize;
    const y = yoffset + ycols * this.grid.cellSize;

    const width =
      col == this.grid.leftCol
        ? this.grid.leftColWidth
        : col == this.grid.rightCol
          ? this.grid.rightColWidth
          : this.grid.cellSize;

    const height =
      row == this.grid.topRow
        ? this.grid.topRowHeight
        : row == this.grid.bottomRow
          ? this.grid.bottomRowHeight
          : this.grid.cellSize;
    const result = new CanvasCell(row, col)
    result.x = x
    result.y = y
    result.width = width
    result.height = height
    return result;
  }

  private refresh() {
    this.clearAll();
    this.beginPath();

    this.drawHorizontalLines();
    this.drawVerticalLines();

    this.closePath();
  }

  private drawHorizontalLines() {
    // draw center horizontal line
    this.drawGridLine(
      0,
      this.grid.verticalCenter,
      this.grid.width,
      this.grid.verticalCenter
    );

    // draw horizontal lines in upper half
    let y = this.grid.verticalCenter - this.grid.cellSize;
    this.grid.topRow = this.grid.centerRow - 1;
    while (y > 0) {
      this.drawGridLine(0, y, this.grid.width, y);
      y = y - this.grid.cellSize;
      this.grid.topRow -= 1;
    }

    // negate last sub
    this.grid.topRow += 1;

    // first row height
    this.grid.topRowHeight = y < 0 ? y + this.grid.cellSize : this.grid.cellSize;

    // draw horizontal lines in lower half
    y = this.grid.verticalCenter + this.grid.cellSize;
    this.grid.bottomRow = this.grid.centerRow + 2;
    while (y < this.grid.height) {
      this.drawGridLine(0, y, this.grid.width, y);
      y = y + this.grid.cellSize;
      this.grid.bottomRow += 1;
    }

    this.grid.bottomRow -= 1;

    // last row height
    this.grid.bottomRowHeight = y > this.grid.height ? this.grid.height - y + this.grid.cellSize : this.grid.cellSize;
  }

  private drawVerticalLines() {
    // draw center vertical line
    this.drawGridLine(
      //const verticalCenter = this.canvasHeight / 2;
      this.grid.horizontalCenter,
      0,
      this.grid.horizontalCenter,
      this.grid.height
    );

    // draw vertical lines in left half
    let x = this.grid.horizontalCenter - this.grid.cellSize;
    this.grid.leftCol = this.grid.centerCol - 1;
    while (x > 0) {
      this.drawGridLine(x, 0, x, this.grid.height);
      x = x - this.grid.cellSize;
      this.grid.leftCol -= 1;
    }

    // negate last sub
    this.grid.leftCol += 1;

    // first column width
    this.grid.leftColWidth = x < 0 ? x + this.grid.cellSize : this.grid.cellSize;

    // draw vertical lines in right half
    x = this.grid.horizontalCenter + this.grid.cellSize;
    this.grid.rightCol = this.grid.centerCol + 2;
    while (x < this.grid.width) {
      this.drawGridLine(x, 0, x, this.grid.height);
      x = x + this.grid.cellSize;
      this.grid.rightCol += 1;
    }

    this.grid.rightCol -= 1;

    // last column width
    this.grid.rightColWidth = x > this.grid.width ? x - this.grid.width : this.grid.cellSize;
  }

  private isCellOnCanvas(row: number, col: number): boolean {
    return row >= this.grid.topRow &&
      row <= this.grid.bottomRow &&
      col >= this.grid.leftCol &&
      col <= this.grid.rightCol
  }

  private beginPath() {
    this.ctx.beginPath()
  }

  private closePath() {
    this.ctx.closePath()
  }

  private clearAll() {
    this.beginPath()
    this.ctx.clearRect(0, 0, this.grid.width, this.grid.height)
    this.closePath()
  }

  private drawGridLine(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  private fillRect(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.fillRect(x, y, width, height)
    this.closePath()
  }

  private clearRect(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.clearRect(x, y, width, height)
    this.closePath()
  }
}
