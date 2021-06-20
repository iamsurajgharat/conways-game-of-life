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

  zoomLevel = 35
  canvasWidth = 800
  canvasHeight = 600
  xStart = 0
  yStart = 0

  displayedRow1 = 1
  displayedRowN = Math.floor(this.canvasHeight / this.zoomLevel)
  displayedColumn1 = 1
  displayedColumnN = Math.floor(this.canvasWidth / this.zoomLevel)

  constructor() { }

  ngOnInit(): void {
    const newCtxValue = this.canvas.nativeElement.getContext('2d')
    if (newCtxValue != null) {
      this.ctx = newCtxValue;
    }
    else {
      // throw error
    }

    this.refresh(this.zoomLevel)
  }

  private refresh(zoomLevel: number): void {
    this.clearCanvas()
    this.ctx.beginPath()
    this.ctx.lineWidth = 0.4
    this.ctx.strokeStyle = "black"
    let x = this.xStart
    while (x < this.canvasWidth) {
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, 0)
      this.ctx.lineTo(x, this.canvasHeight)
      this.ctx.stroke()
      x = x + zoomLevel
    }

    let y = this.yStart
    while (y < this.canvasHeight) {
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(0, y)
      this.ctx.lineTo(this.canvasWidth, y)
      this.ctx.stroke()
      y = y + zoomLevel
    }
    this.ctx.closePath()
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

  private doZoom(newZoomLevel: number) {
    this.zoomLevel = newZoomLevel
    this.refresh(this.zoomLevel)
  }

}
