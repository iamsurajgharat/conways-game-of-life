import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-gol-canvas',
  templateUrl: './gol-canvas.component.html',
  styleUrls: ['./gol-canvas.component.css']
})
export class GolCanvasComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  private zoomLevelChange: 1 = 1
  private moveChangeRate: 1 = 1

  zoomLevel = 35
  canvasWidth = 800
  canvasHeight = 600

  cellSize = 35
  topRow = 1
  bottomRow = 10
  leftCol = 1
  rightCol = 10
  totalRows = 0
  totalCols = 0
  centerRow = 10
  centerCol = 15

  constructor() { }

  ngOnInit(): void {
    const newCtxValue = this.canvas.nativeElement.getContext('2d')
    if (newCtxValue != null) {
      this.ctx = newCtxValue;
    }
    else {
      // throw error
    }

    this.refresh(this.cellSize)
  }

  private refresh(side: number): void {
    if (side < 10) {
      return
    }

    this.clearCanvas()
    this.ctx.beginPath()
    this.ctx.lineWidth = 0.4
    this.ctx.strokeStyle = "black"

    const verticalCenter = this.canvasHeight / 2;
    // draw center horizontal line
    this.ctx.moveTo(0, verticalCenter)
    this.ctx.lineTo(this.canvasWidth, verticalCenter)
    this.ctx.stroke()

    // draw horizontal lines in upper half
    let y = verticalCenter - side
    while (y >= 0) {
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvasWidth, y)
      this.ctx.stroke()
      y = y - side;
    }

    // draw horizontal lines in lower half
    y = verticalCenter + side
    while (y <= this.canvasHeight) {
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvasWidth, y)
      this.ctx.stroke()
      y = y + side;
    }

    const horizontalCenter = this.canvasWidth / 2;
    // draw center vertical line
    this.ctx.moveTo(horizontalCenter, 0)
    this.ctx.lineTo(horizontalCenter, this.canvasHeight)
    this.ctx.stroke()

    // draw vertical lines in left half
    let x = horizontalCenter - side
    while (x >= 0) {
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvasHeight)
      this.ctx.stroke()
      x = x - side;
    }

    // draw vertical lines in right half
    x = horizontalCenter + side
    while (x <= this.canvasWidth) {
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvasHeight)
      this.ctx.stroke()
      x = x + side;
    }

    this.ctx.closePath()
    this.updateRowsCols(this.centerRow, this.canvasHeight, this.centerCol, this.canvasWidth, this.zoomLevel)
  }

  private updateRowsCols(centerRow: number, height: number, centerCol: number, width: number, side: number) {
    this.updateRows(centerRow, height, side);
    this.updateCols(centerCol, width, side);
  }

  private updateRows(centerRow: number, height: number, side: number) {
    const verticalHalf = height / 2
    const completeCells = Math.floor(verticalHalf / side) * 2;
    const anyIncompleteCell = verticalHalf % side != 0
    this.topRow = centerRow - (completeCells / 2) - 1 - (anyIncompleteCell ? 1 : 0)
    this.totalRows = completeCells + (anyIncompleteCell ? 2 : 0);
    this.bottomRow = this.topRow + this.totalRows - 1
  }

  private updateCols(centerCol: number, width: number, side: number) {
    const horizontalHalf = width / 2
    const completeCells = Math.floor(horizontalHalf / side) * 2;
    const anyIncompleteCell = horizontalHalf % side != 0
    this.leftCol = centerCol - (completeCells / 2) - 1 - (anyIncompleteCell ? 1 : 0)
    this.totalCols = completeCells + (anyIncompleteCell ? 2 : 0);
    this.rightCol = this.leftCol + this.totalCols - 1
  }

  private clearCanvas() {
    this.ctx.beginPath()
    this.ctx.fillStyle = "rgb(255,255,255)"
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.ctx.closePath()
  }

  doZoomIn() {
    this.doZoom(this.zoomLevel + this.zoomLevelChange)
  }

  doZoomOut() {
    this.doZoom(this.zoomLevel - this.zoomLevelChange)
  }

  moveUp() {
    this.centerRow = this.centerRow - this.moveChangeRate
    this.updateRows(this.centerRow, this.canvasHeight, this.cellSize);
  }

  moveDown() {
    this.centerRow = this.centerRow + this.moveChangeRate
    this.updateRows(this.centerRow, this.canvasHeight, this.cellSize);
  }

  moveLeft() {
    this.centerCol -= this.moveChangeRate
    this.updateCols(this.centerCol, this.canvasWidth, this.cellSize);
  }

  moveRight() {
    this.centerCol += this.moveChangeRate
    this.updateCols(this.centerCol, this.canvasWidth, this.cellSize);
  }

  private doZoom(newZoomLevel: number) {
    if (newZoomLevel < 10) {
      return;
    }
    this.zoomLevel = newZoomLevel
    this.calculateCellSize(this.zoomLevel)
    this.refresh(this.cellSize)
  }

  private calculateCellSize(zoomLevel: number) {
    this.cellSize = zoomLevel;
    return this.cellSize;
  }


}
