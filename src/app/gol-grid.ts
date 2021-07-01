export class GolGrid {
    width: number = 100
    height: number = 100
    cellSize: number = 10
    topRowHeight: number = this.cellSize
    bottomRowHeight: number = this.cellSize
    leftColWidth: number = this.cellSize
    rightColWidth: number = this.cellSize
    
    verticalCenter = this.height / 2;
    horizontalCenter = this.width / 2;

    // virtual grid numbers
    topRow: number = 1
    bottomRow: number = 10
    leftCol: number = 1
    rightCol: number = 10
    centerRow = 10;
    centerCol = 10;
    

    constructor(w: number, h: number, cs:number) {
        this.width = w
        this.height = h
        this.cellSize = cs
        this.verticalCenter = this.height / 2;
        this.horizontalCenter = this.width / 2;
    }

    getRowsCount(): number {
        return this.bottomRow - this.topRow + 1
    }

    getColsCount(): number {
        return this.rightCol - this.leftCol + 1
    }

    
}
