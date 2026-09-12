import { Component, inject, signal } from '@angular/core';
import { Artwork, Category } from '../../core/models/api.models';
import { ArtworkService, CategoryService } from '../../core/services/api.services';
import { LocaleService } from '../../core/services/ui.services';
import { ArtworkCardComponent } from '../../shared/components/artwork-card/artwork-card';

@Component({
  selector: 'app-artworks',
  standalone: true,
  imports: [ArtworkCardComponent],
  templateUrl: './artworks.html',
  styleUrl: './artworks.scss'
})
export class ArtworksComponent {
  readonly locale = inject(LocaleService);
  private readonly api = inject(ArtworkService);
  private readonly categoriesApi = inject(CategoryService);

  readonly artworks = signal<Artwork[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selected = signal('');
  readonly loading = signal(true);

  constructor() {
    this.categoriesApi.list().subscribe((x) => this.categories.set(x ?? []));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.list({ categoryId: this.selected() || undefined, limit: 48 }).subscribe({
      next: (r) => {
        const list = Array.isArray(r) ? r : (r.items ?? r.data ?? r.results ?? []);
        this.artworks.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  select(id: string): void {
    this.selected.set(id);
    this.load();
  }

  categoryLabel(category: Category): string {
    if (this.locale.locale() === 'ar') {
      return category.nameAr || this.locale.text(category.name ?? category.title, 'تصنيف');
    }
    return category.nameEn || this.locale.text(category.name ?? category.title, 'Category');
  }
}

