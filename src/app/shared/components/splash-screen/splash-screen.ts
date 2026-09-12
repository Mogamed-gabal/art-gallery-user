import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.scss'
})
export class SplashScreenComponent {
  readonly visible = signal(true);
  readonly closing = signal(false);

  constructor() {
    // Elegant timing: 2.1s active screen, then fade out
    setTimeout(() => {
      this.closing.set(true);
    }, 2100);

    setTimeout(() => {
      this.visible.set(false);
    }, 2700);
  }

  skip(): void {
    if (this.closing()) return;
    this.closing.set(true);
    setTimeout(() => this.visible.set(false), 500);
  }
}
