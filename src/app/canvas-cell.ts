export class CanvasCell {
    x: number = 0
    y: number = 0
    width: number = 0
    height: number = 0

    private isDrawingReady: boolean = false
    constructor(public row: number, public col: number) {

    }

    getKey(): string {
        return this.concatForKey(this.row, this.col)
    }

    getNeghbourCells(): CanvasCell[] {
        return [
            new CanvasCell(this.row - 1, this.col - 1),              // top-left
            new CanvasCell(this.row - 1, this.col),                // top-mid
            new CanvasCell(this.row - 1, this.col + 1),              // top-right
            new CanvasCell(this.row, this.col - 1),                // mid-left
            new CanvasCell(this.row, this.col + 1),                // mid-right
            new CanvasCell(this.row + 1, this.col - 1),              // bottom-left
            new CanvasCell(this.row + 1, this.col),                // bottom-mid
            new CanvasCell(this.row + 1, this.col + 1),              // bottom-right
        ]
    }

    isDrawable(): boolean {
        return this.isDrawingReady
    }

    resetDrawingData() {
        this.isDrawingReady = false
    }

    setDrawingData(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.isDrawingReady = true
    }

    private concatForKey(x: number, y: number): string {
        return x + "|" + y
    }
}
