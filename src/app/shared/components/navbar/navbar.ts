import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BrandMark } from '../brand-mark/brand-mark';
import { LocaleService, ThemeService } from '../../../core/services/ui.services';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, BrandMark],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly locale = inject(LocaleService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  menuOpen = false;

  toggleLocale(): void {
    this.locale.setLocale(this.locale.locale() === 'en' ? 'ar' : 'en');
  }

  scrollToSection(sectionId: string, event?: Event): void {
    this.menuOpen = false;
    const currentUrl = this.router.url.split('#')[0];
    if (currentUrl === '/' || currentUrl === '') {
      if (event) event.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `/#${sectionId}`);
      }
    } else {
      this.router.navigate(['/'], { fragment: sectionId });
    }
  }
}
