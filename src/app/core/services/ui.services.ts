import { Injectable, signal } from '@angular/core';
import { Locale, LocalizedText } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly locale = signal<Locale>((typeof localStorage !== 'undefined' && localStorage.getItem('locale') as Locale) || 'ar');

  constructor() {
    this.apply();
  }

  setLocale(locale: Locale): void {
    this.locale.set(locale);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
    this.apply();
  }

  private apply(): void {
    const loc = this.locale();
    if (typeof document !== 'undefined') {
      document.documentElement.lang = loc;
      document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
    }
  }

  text(value: string | LocalizedText | undefined, fallback = ''): string {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    return value[this.locale()] || value.ar || value.en || fallback;
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(localStorage.getItem('theme') === 'dark');
  constructor() { this.apply(); }
  toggle(): void { this.dark.update((value) => !value); this.apply(); }
  private apply(): void {
    document.documentElement.classList.toggle('dark', this.dark());
    localStorage.setItem('theme', this.dark() ? 'dark' : 'light');
  }
}
