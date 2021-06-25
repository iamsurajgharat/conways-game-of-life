import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasCell } from '../canvas-cell'
import { CellLife } from '../cell-life'

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
  private generationDuration = 3000

  // canvas properties
  zoomLevel = 25
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
  firstRowHeight = this.cellSize
  firstColWidth = this.cellSize
  lastRowHeight = this.cellSize
  lastColWidth = this.cellSize

  // all lives
  allLives = new Map<string, CellLife>()

  constructor() { }

  ngOnInit(): void {
    const newCtxValue = this.canvas.nativeElement.getContext('2d')
    if (newCtxValue != null) {
      this.ctx = newCtxValue;
    }
    else {
      // throw error
    }

    this.calculateCellSize(this.zoomLevel)
    this.createInitialState()
    this.refresh(this.cellSize)
    //this.allLives = new Map<string, CellLife>()
    //setTimeout(() => this.createNextGeneration(), this.generationDuration)

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

    // first row height
    this.firstRowHeight = (y + side) != 0 ? y + side : side;

    // draw horizontal lines in lower half
    y = verticalCenter + side
    while (y <= this.canvasHeight) {
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvasWidth, y)
      this.ctx.stroke()
      y = y + side;
    }

    // last row height
    this.lastRowHeight = (y - side) != this.canvasHeight ? this.canvasHeight - y + side : side;

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

    // first column width
    this.firstColWidth = (x + side) != 0 ? x + side : side;

    // draw vertical lines in right half
    x = horizontalCenter + side
    while (x <= this.canvasWidth) {
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvasHeight)
      this.ctx.stroke()
      x = x + side;
    }

    // last column width
    this.lastColWidth = (x - side) != this.canvasWidth ? this.canvasWidth - x + side : side;

    this.ctx.closePath()
    this.updateRowsCols(this.centerRow, this.canvasHeight, this.centerCol, this.canvasWidth, this.zoomLevel)

    // draw lives
    this.drawAllLives();

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
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.ctx.closePath()
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

  private createInitialState() {

    const centerCell = new CanvasCell(this.centerRow, this.centerCol)
    const centerCell2 = new CanvasCell(10, 10)

    this.allLives.set(centerCell.getKey(), new CellLife(centerCell, true))
    this.allLives.set(centerCell2.getKey(), new CellLife(centerCell2, true))
  }

  private drawAllLives() {
    for (let life of this.allLives) {
      this.fillCell(life[1].cell)
    }
  }

  private createNextGeneration() {
    //this.fillCell(new CanvasCell(18, 25))

    // process each life in allLives state, and its surroundings
    const newDeads = []
    const newBorn = []
    const processedLives = new Set<string>()
    const newGeneration = new Map<string, CellLife>()
    for (let key of this.allLives.keys()) {
      const life = this.allLives.get(key)
      if (!life) {
        continue;
      }

      const nextLifeStatus = this.processCellLife(life, this.allLives)
      if (nextLifeStatus == false) {
        newDeads.push(life.cell)
      }
      else {
        newGeneration.set(key, life)
      }

      processedLives.add(key)

      for (let neighbour of this.getNeighbours(life, this.allLives).filter(x => !processedLives.has(x.cell.getKey()))) {
        const nextLifeStatusForNeighbour = this.processCellLife(neighbour, this.allLives)
        const key2 = neighbour.cell.getKey()
        if (nextLifeStatusForNeighbour != neighbour.alive) {
          neighbour.alive = nextLifeStatusForNeighbour
          if (nextLifeStatusForNeighbour) {

            newBorn.push(neighbour.cell)
            newGeneration.set(key2, neighbour)
          }
          else {
            newDeads.push(neighbour.cell)
          }
        }

        processedLives.add(key2)
      }

    }

    // update allLives as per new generation data
    this.allLives = newGeneration;

    // find delta and pass it on to updateCellsOnCanvass method
    this.updateCellsOnCanvass(newDeads, newBorn)

    // schedule itself to be run in next 1s
    setTimeout(() => this.createNextGeneration(), this.generationDuration)
  }

  private processCellLife(cell: CellLife, allLives: Map<string, CellLife>): boolean {
    return !cell.alive
  }

  private getNeighbours(cell: CellLife, allLives: Map<string, CellLife>): CellLife[] {
    const neighbours: CellLife[] = []

    for (let newNeighbour of cell.cell.getNeghbourCellKeys()) {
      let oldNeighbour = allLives.get(newNeighbour.getKey())
      if (oldNeighbour) {
        neighbours.push(oldNeighbour)
      }
      else {
        neighbours.push(new CellLife(newNeighbour, false))
      }
    }


    return neighbours;
  }

  private updateCellsOnCanvass(cellsToClear: CanvasCell[], cellToDraw: CanvasCell[]) {
    // remove
    for (let cell of cellsToClear) {
      this.clearCell(cell)
    }

    // create
    for (let cell of cellToDraw) {
      this.fillCell(cell)
    }
  }

  private fillCell(cell: CanvasCell) {
    if (!this.isCellOnCanvas(cell)) {
      return;
    }

    this.setCanvasCellCordinates(cell);

    this.ctx.beginPath()
    this.ctx.fillStyle = "rgba(255,0,0,0.75)"
    this.ctx.fillRect(cell.x, cell.y, cell.width, cell.height)
    console.log(cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height)
    this.ctx.closePath

  }

  private clearCell(cell: CanvasCell) {
    if (!this.isCellOnCanvas(cell)) {
      return;
    }

    this.setCanvasCellCordinates(cell);

    this.ctx.beginPath()
    this.ctx.clearRect(cell.x, cell.y, cell.width, cell.height)
    console.log("Clearing :" + cell.x + '|' + cell.y + '|' + cell.width + '|' + cell.height)
    this.ctx.closePath
  }

  private isCellOnCanvas(cell: CanvasCell): boolean {
    return cell.row >= this.topRow && cell.row <= this.bottomRow &&
      cell.col >= this.leftCol && cell.col <= this.rightCol;
  }

  private setCanvasCellCordinates(cell: CanvasCell): void {

    const xoffset = cell.col > this.leftCol ? this.firstColWidth : 0;
    const xcols = cell.col <= this.leftCol + 1 ? 0 : cell.col - this.leftCol - 1;
    const yoffset = cell.row > this.topRow ? this.firstRowHeight : 0;
    const ycols = cell.row <= this.topRow + 1 ? 0 : cell.row - this.topRow - 1;

    const x = xoffset + xcols * this.cellSize;
    const y = yoffset + ycols * this.cellSize;

    const width = cell.col == this.leftCol ? this.firstColWidth :
      (cell.col == this.rightCol ? this.lastColWidth : this.cellSize)

    const height = cell.row == this.topRow ? this.firstRowHeight :
      (cell.row == this.bottomRow ? this.lastRowHeight : this.cellSize)

    cell.setDrawingData(x + 1, y + 1, width - 1, height - 1)
  }

  doZoomIn() {
    this.doZoom(this.zoomLevel + this.zoomLevelChange)
  }

  doZoomOut() {
    this.doZoom(this.zoomLevel - this.zoomLevelChange)
  }

  moveUp() {
    this.centerRow = this.centerRow - this.moveChangeRate
    this.refresh(this.cellSize)
    //this.updateRows(this.centerRow, this.canvasHeight, this.cellSize);
  }

  moveDown() {
    this.centerRow = this.centerRow + this.moveChangeRate
    this.refresh(this.cellSize)
    //this.updateRows(this.centerRow, this.canvasHeight, this.cellSize);
  }

  moveLeft() {
    this.centerCol -= this.moveChangeRate
    this.refresh(this.cellSize)
    //this.updateCols(this.centerCol, this.canvasWidth, this.cellSize);
  }

  moveRight() {
    this.centerCol += this.moveChangeRate
    this.refresh(this.cellSize)
    //this.updateCols(this.centerCol, this.canvasWidth, this.cellSize);
  }



}
