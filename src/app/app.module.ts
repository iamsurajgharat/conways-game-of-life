import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GolCanvasComponent } from './gol-canvas/gol-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    GolCanvasComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
