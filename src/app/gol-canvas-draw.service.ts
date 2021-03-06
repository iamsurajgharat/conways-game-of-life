import { ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';
import { CanvasCell } from './canvas-cell';
import { GolGrid } from './gol-grid';

@Injectable({
  providedIn: 'root'
})
export class GolCanvasDrawService {
  private grid!: GolGrid
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  cellMargin = 2

  constructor() { }

  setCanvas(canvas: ElementRef<HTMLCanvasElement>, width: number, height: number, cellSize: number) {
    this.canvas = canvas
    this.grid = new GolGrid(width, height, cellSize)

    const newCtxValue = this.canvas.nativeElement.getContext('2d')
    if (newCtxValue != null) {
      this.ctx = newCtxValue;

      // init with proper values

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

    // this.beginPath()
    // this.ctx.fillStyle = "rgba(255,0,0,0.25)"
    // this.ctx.fillRect(cell.x + this.cellMargin, cell.y + this.cellMargin, cell.width - this.cellMargin, cell.height - this.cellMargin)
    // this.closePath()
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
    const rebalancingData = this.getOffsetRebalancingData(this.grid.verticalCenter - originalVerticalCenter, this.grid.cellSize)
    this.grid.centerRow -= rebalancingData[0]
    this.grid.verticalCenter = originalVerticalCenter + rebalancingData[1]
    this.refresh();
  }

  moveDown(delta: number) {
    this.grid.verticalCenter -= delta
    const originalVerticalCenter = this.grid.height / 2;
    const rebalancingData = this.getOffsetRebalancingData(originalVerticalCenter - this.grid.verticalCenter, this.grid.cellSize)
    this.grid.centerRow += rebalancingData[0]
    this.grid.verticalCenter = originalVerticalCenter - rebalancingData[1]
    this.refresh();
  }

  moveLeft(delta: number) {
    this.grid.horizontalCenter += delta
    const originalHorizontalCenter = this.grid.width / 2;
    const rebalancingData = this.getOffsetRebalancingData(this.grid.horizontalCenter - originalHorizontalCenter, this.grid.cellSize)
    this.grid.centerCol -= rebalancingData[0]
    this.grid.horizontalCenter = originalHorizontalCenter + rebalancingData[1]
    this.refresh();
  }

  moveRight(delta: number) {
    this.grid.horizontalCenter -= delta
    const originalHorizontalCenter = this.grid.height / 2;
    const rebalancingData = this.getOffsetRebalancingData(originalHorizontalCenter - this.grid.horizontalCenter, this.grid.cellSize)
    this.grid.centerCol += rebalancingData[0]
    this.grid.horizontalCenter = originalHorizontalCenter - rebalancingData[1]
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
        : (row == this.grid.bottomRow
          ? this.grid.bottomRowHeight
          : this.grid.cellSize)
    const result = new CanvasCell(row, col)
    result.x = x
    result.y = y
    result.width = width
    result.height = height
    return result;
  }

  private refresh() {
    this.clearAll();
    this.drawHorizontalLines();
    this.drawVerticalLines();
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
    this.grid.rightColWidth = x > this.grid.width ? this.grid.width - x + this.grid.cellSize : this.grid.cellSize;
  }

  private getOffsetRebalancingData(offset: number, cellSize: number): number[] {
    return offset >= cellSize ? [Math.floor(offset / cellSize), offset % cellSize] : [0, offset]
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
    this.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.strokeStyle = "grey"
    this.ctx.lineWidth = 0.3
    this.ctx.stroke()
    this.closePath()
  }

  private fillRect(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.fillStyle = "rgba(0,0,255,0.75)"
    this.ctx.fillRect(x, y, width, height)
    this.closePath()
  }

  private clearRect(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.clearRect(x, y, width, height)
    this.closePath()
  }
}
