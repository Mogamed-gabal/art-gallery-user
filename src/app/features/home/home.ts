import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { Artwork, Category, Course, SiteInfoResponse } from '../../core/models/api.models';
import { ArtworkService, CategoryService, ContentService, CourseService } from '../../core/services/api.services';
import { LocaleService } from '../../core/services/ui.services';
import { ArtworkCardComponent } from '../../shared/components/artwork-card/artwork-card';

@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, ArtworkCardComponent], templateUrl: './home.html', styleUrl: './home.scss' })
export class HomeComponent {
  readonly locale = inject(LocaleService);
  private readonly content = inject(ContentService);
  private readonly artworksApi = inject(ArtworkService);
  private readonly categoriesApi = inject(CategoryService);
  private readonly coursesApi = inject(CourseService);
  readonly featured = signal<Artwork[]>([]);
  readonly originals = signal<Artwork[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly courses = signal<Course[]>([]);
  readonly selectedCourse = signal<Course | null>(null);
  readonly site = signal<SiteInfoResponse>({});
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    forkJoin({
      site: this.content.getSiteInfo().pipe(catchError(() => of({}))),
      featured: this.artworksApi.featured().pipe(catchError(() => of([]))),
      artworks: this.artworksApi.list({ limit: 12 }).pipe(catchError(() => of([]))),
      categories: this.categoriesApi.list().pipe(catchError(() => of([]))),
      courses: this.coursesApi.list().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ site, featured, artworks, categories, courses }) => {
        const all = Array.isArray(artworks) ? artworks : ((artworks as any)?.data ?? (artworks as any)?.items ?? (artworks as any)?.results ?? []);
        this.site.set(site || {});
        this.featured.set(Array.isArray(featured) ? featured : []);
        this.categories.set(Array.isArray(categories) ? categories : []);
        this.courses.set((Array.isArray(courses) ? courses : []).filter((course) => course.isActive !== false));
        this.originals.set(all.filter((art: Artwork) => art.isOriginal || art.type?.toUpperCase() === 'ORIGINAL' || art.category?.slug === 'original' || art.category?.nameEn?.toLowerCase() === 'original' || art.category?.nameAr === 'أصلي').slice(0, 3));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }

  section(key: string): Record<string, unknown> {
    const value = this.site()[key];
    return (value && typeof value === 'object' && 'data' in value ? (value as { data: Record<string, unknown> }).data : value as Record<string, unknown>) || {};
  }

  scrollToSection(id: string, event?: Event): void {
    if (event) event.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `/#${id}`);
    }
  }

  heroText(field: 'title' | 'subtitle' | 'eyebrow', fallback = ''): string {
    const hero = this.site()?.hero as Record<string, any> | undefined;
    if (!hero) return fallback;
    const isAr = this.locale.locale() === 'ar';
    const primary = isAr ? (hero[field + 'Ar'] || hero[field + '_ar']) : (hero[field + 'En'] || hero[field + '_en']);
    const secondary = isAr ? (hero[field + 'En'] || hero[field + '_en']) : (hero[field + 'Ar'] || hero[field + '_ar']);
    const direct = hero[field] || (field === 'subtitle' ? (hero['descriptionAr'] || hero['description'] || hero['desc']) : '');
    const res = (typeof primary === 'string' && primary.trim() ? primary : '') ||
                (typeof secondary === 'string' && secondary.trim() ? secondary : '') ||
                (typeof direct === 'string' && direct.trim() ? direct : '');
    return res || fallback;
  }

  aboutText(field: 'title' | 'bio', fallback = ''): string {
    const about = this.site()?.about as Record<string, any> | undefined;
    if (!about) return fallback;
    const isAr = this.locale.locale() === 'ar';
    const primary = isAr ? (about[field + 'Ar'] || about[field + '_ar']) : (about[field + 'En'] || about[field + '_en']);
    const secondary = isAr ? (about[field + 'En'] || about[field + '_en']) : (about[field + 'Ar'] || about[field + '_ar']);
    const direct = about[field] || (field === 'bio' ? (about['descriptionAr'] || about['description'] || about['storyAr'] || about['story']) : '');
    const res = (typeof primary === 'string' && primary.trim() ? primary : '') ||
                (typeof secondary === 'string' && secondary.trim() ? secondary : '') ||
                (typeof direct === 'string' && direct.trim() ? direct : '');
    return res || fallback;
  }

  contactText(field: 'title' | 'description', fallback = ''): string {
    const contact = this.site()?.contact as Record<string, any> | undefined;
    if (!contact) return fallback;
    const isAr = this.locale.locale() === 'ar';
    const primary = isAr ? (contact[field + 'Ar'] || contact[field + '_ar']) : (contact[field + 'En'] || contact[field + '_en']);
    const secondary = isAr ? (contact[field + 'En'] || contact[field + '_en']) : (contact[field + 'Ar'] || contact[field + '_ar']);
    const direct = contact[field] || (field === 'description' ? (contact['subtitleAr'] || contact['subtitle'] || contact['desc']) : '');
    const res = (typeof primary === 'string' && primary.trim() ? primary : '') ||
                (typeof secondary === 'string' && secondary.trim() ? secondary : '') ||
                (typeof direct === 'string' && direct.trim() ? direct : '');
    return res || fallback;
  }

  contactPhone(): string {
    const c = this.site()?.contact as Record<string, any> | undefined;
    const p = c?.['phone'] || c?.['phoneNumber'] || c?.['tel'];
    return typeof p === 'string' ? p.trim() : '';
  }

  contactWhatsApp(): string {
    const contact = this.site()?.contact as Record<string, any> | undefined;
    const w = contact?.['whatsapp'] || contact?.['whatsappPhone'] || contact?.['whatsApp'] || this.contactPhone();
    return typeof w === 'string' ? w.trim() : '';
  }

  contactWhatsAppLink(): string {
    const raw = this.contactWhatsApp().replace(/[^0-9]/g, '');
    if (!raw) return '';
    const full = raw.startsWith('01') ? '2' + raw : raw;
    return `https://wa.me/${full}`;
  }

  contactEmail(): string {
    const contact = this.site()?.contact as Record<string, any> | undefined;
    const e = contact?.['email'] || contact?.['mail'];
    return typeof e === 'string' ? e.trim() : '';
  }

  heroImage(fallback = ''): string {
    const hero = this.site()?.hero as Record<string, any> | undefined;
    const img = hero?.['imageUrl'] || hero?.['image_url'] || hero?.['image'];
    return typeof img === 'string' && img.trim() ? img.trim() : fallback;
  }

  aboutImage(fallback = ''): string {
    const img = this.aboutImage1() || this.aboutImage2();
    return typeof img === 'string' && img.trim() ? img.trim() : fallback;
  }

  aboutImage1(): string {
    const about = this.site()?.about as Record<string, any> | undefined;
    const img = about?.['image1Url'] || about?.['image1_url'] || about?.['image1'] || about?.['imageUrl'];
    return typeof img === 'string' && img.trim() ? img.trim() : '';
  }

  aboutImage2(): string {
    const about = this.site()?.about as Record<string, any> | undefined;
    const img = about?.['image2Url'] || about?.['image2_url'] || about?.['image2'];
    return typeof img === 'string' && img.trim() ? img.trim() : '';
  }

  courseTitle(course: Course): string {
    const isAr = this.locale.locale() === 'ar';
    const directTitle = typeof course.title === 'string' ? course.title : this.locale.text(course.title);
    return (isAr ? course.titleAr : course.titleEn) || directTitle || course.titleAr || course.titleEn || '';
  }

  courseDescription(course: Course): string {
    const isAr = this.locale.locale() === 'ar';
    const directDesc = typeof course.description === 'string' ? course.description : this.locale.text(course.description);
    return (isAr ? course.descriptionAr : course.descriptionEn) || directDesc || course.descriptionAr || course.descriptionEn || '';
  }

  openCourse(course: Course, event?: Event): void {
    if (event) event.preventDefault();
    this.selectedCourse.set(course);
  }

  closeCourse(): void {
    this.selectedCourse.set(null);
  }

  text(key: string, fallback: string): string {
    if (key === 'title') return this.heroText('title', fallback);
    if (key === 'description' || key === 'subtitle') return this.heroText('subtitle', fallback);
    return this.locale.text(this.section('hero')[key] as never, fallback);
  }

  image(key: string): string {
    return String(this.section('hero')[key] || '');
  }

  contentImage(section: string, key: string): string {
    return String(this.section(section)[key] || '');
  }
}
