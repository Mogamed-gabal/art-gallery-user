import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen';
import { ContentService } from './core/services/api.services';
import { LocaleService } from './core/services/ui.services';
import { SiteInfoResponse } from './core/models/api.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SplashScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  readonly locale = inject(LocaleService);
  private readonly content = inject(ContentService);
  readonly site = signal<SiteInfoResponse>({});
  readonly currentYear = new Date().getFullYear();

  constructor() {
    this.content.getSiteInfo().subscribe({
      next: (s) => this.site.set(s || {}),
      error: () => {}
    });
  }

  get siteTitle(): string {
    const hero = this.site()?.hero as Record<string, any> | undefined;
    const isAr = this.locale.locale() === 'ar';
    const title = isAr ? hero?.['titleAr'] : hero?.['titleEn'];
    return (typeof title === 'string' && title.trim()) ? title.trim() : (isAr ? 'معرض أنس يعقوب للفنون التشكيلية' : 'Anas Ya3qub Art Gallery');
  }

  get email(): string {
    const e = this.site()?.contact?.email;
    return typeof e === 'string' ? e.trim() : '';
  }
}
