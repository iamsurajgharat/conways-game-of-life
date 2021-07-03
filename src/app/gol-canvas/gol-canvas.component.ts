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

  private zoomLevelChange: number = 5;
  private moveChangeRate: number = 20;
  private generationDuration = 300;

  // canvas properties
  zoomLevel = 25;
  gridWidth = 1500;
  gridHeight = 600;

  // all lives
  allLives = new Map<string, CellLife>();

  private timeoutToken!: any;

  constructor(private canvasService: GolCanvasDrawService) {
    this.setInitValues(this.gridWidth, this.gridHeight, this.zoomLevel, this.generationDuration)
  }

  ngOnInit(): void {
    //this.canvas.nativeElement.style.height = '500px'
    this.canvasService.setCanvas(
      this.canvas,
      this.gridWidth,
      this.gridHeight,
      this.zoomLevel
    );

    //this.refresh(this.cellSize);
  }

  setInitValues(gw: number, gh: number, zl: number, duration: number) {
    this.gridWidth = gw
    this.gridHeight = gh
    this.zoomLevel = zl
    this.generationDuration = duration
  }

  getGrid() {
    return this.canvasService.getGrid()
  }

  createOscillator() {
    // oscillator
    const centerCell1 = new CanvasCell(this.getGrid().centerRow - 1, this.getGrid().centerCol);
    const centerCell2 = new CanvasCell(this.getGrid().centerRow, this.getGrid().centerCol);
    const centerCell3 = new CanvasCell(this.getGrid().centerRow + 1, this.getGrid().centerCol);
    const lives = [centerCell1, centerCell2, centerCell3];

    this.createInitialState(lives);
  }

  createGlider() {
    // glider
    const c1 = new CanvasCell(this.getGrid().centerRow - 1, this.getGrid().centerCol + 1);
    const c2 = new CanvasCell(this.getGrid().centerRow, this.getGrid().centerCol - 1);
    const c3 = new CanvasCell(this.getGrid().centerRow, this.getGrid().centerCol + 1);
    const c4 = new CanvasCell(this.getGrid().centerRow + 1, this.getGrid().centerCol);
    const c5 = new CanvasCell(this.getGrid().centerRow + 1, this.getGrid().centerCol + 1);

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
    this.canvasService.moveUp(this.moveChangeRate)
    this.drawAllLives()
  }

  moveDown() {
    this.canvasService.moveDown(this.moveChangeRate)
    this.drawAllLives()
  }

  moveLeft() {
    this.canvasService.moveLeft(this.moveChangeRate)
    this.drawAllLives()
  }

  moveRight() {
    this.canvasService.moveRight(this.moveChangeRate)
    this.drawAllLives()
  }

  private doZoom(newZoomLevel: number) {
    if (newZoomLevel < 2) {
      return;
    }

    this.zoomLevel = newZoomLevel;
    this.canvasService.setCellSize(newZoomLevel)
    this.drawAllLives()
  }

  private createInitialState(lives: CanvasCell[]) {
    // stop the ongoing execution
    this.stop();

    // reset lives data
    this.allLives = new Map<string, CellLife>();
    for (let cell of lives) {
      this.allLives.set(cell.getKey(), new CellLife(cell, true));
    }

    // clear the grid
    this.canvasService.resetGrid()

    // put new lives on grid
    this.drawAllLives()
  }

  private drawAllLives() {
    for (let life of this.allLives) {
      this.canvasService.fillCell(life[1].cell.row, life[1].cell.col)
    }
  }

  private createNextGeneration() {
    //this.fillCell(new CanvasCell(18, 25))

    // process each life in allLives state, and its surroundings
    const newDeads: CanvasCell[] = [];
    const newBorn: CanvasCell[] = [];
    const processedLives = new Set<string>();
    const newGeneration = new Map<string, CellLife>();

    for (let [key, life] of this.allLives) {

      this.calculateNextStateForCell(key, life, processedLives, newDeads, newBorn, newGeneration)

      // process neighbours
      for (let neighbour of this.getNeighbours(life, this.allLives)) {
        const key2 = neighbour.cell.getKey();
        this.calculateNextStateForCell(key2, neighbour, processedLives, newDeads, newBorn, newGeneration)
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

  private calculateNextStateForCell(key: string, life: CellLife, processedLives: Set<string>, newDeads: CanvasCell[], newBorn: CanvasCell[], newGeneration: Map<string, CellLife>) {
    if (processedLives.has(key)) {
      return
    }
    const nextLifeStatus = this.evaluateLifeRules(life, this.allLives);
    processedLives.add(key);

    if (nextLifeStatus) {
      // born now
      if (!life.alive) {
        newBorn.push(life.cell)
      }

      newGeneration.set(key, new CellLife(life.cell, true))
    }
    // died now
    else if (life.alive) {
      newDeads.push(life.cell)
    }

  }

  private evaluateLifeRules(
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
      neighbours.push(new CellLife(newNeighbour, allLives.has(newNeighbour.getKey())));
    }

    return neighbours;
  }

  private updateCellsOnCanvass(
    cellsToClear: CanvasCell[],
    cellToDraw: CanvasCell[]
  ) {
    // remove
    for (let cell of cellsToClear) {
      this.canvasService.clearCell(cell.row, cell.col);
    }

    // create
    for (let cell of cellToDraw) {
      this.canvasService.fillCell(cell.row, cell.col);
    }
  }
}
