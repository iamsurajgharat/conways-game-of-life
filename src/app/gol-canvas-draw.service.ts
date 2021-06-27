import { ElementRef } from '@angular/core';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GolCanvasDrawService {
  private width = 0;
  private height = 0
  private cellMargin = 1
  private canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  constructor() { }

  setCanvas(canvas: ElementRef<HTMLCanvasElement>, width: number, height: number) {
    this.canvas = canvas
    this.width = width
    this.height = height

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
      return;
    }
  }

  beginPath() {
    this.ctx.beginPath()
  }

  closePath() {
    this.ctx.closePath()
  }

  drawGridLine(x1: number, y1: number, x2: number, y2: number) {
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.stroke()
  }

  fillCell(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.fillRect(x + this.cellMargin, y + this.cellMargin, width - this.cellMargin, height - this.cellMargin)
    this.closePath()
  }

  clearCell(x: number, y: number, width: number, height: number) {
    this.beginPath()
    this.ctx.clearRect(x + this.cellMargin, y + this.cellMargin, width - this.cellMargin, height - this.cellMargin)
    this.closePath()
  }

  clearAll() {
    this.beginPath()
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.closePath()
  }
}
