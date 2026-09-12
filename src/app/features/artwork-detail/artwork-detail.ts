import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Artwork } from '../../core/models/api.models';
import { ArtworkService } from '../../core/services/api.services';
import { LocaleService } from '../../core/services/ui.services';

@Component({
  selector: 'app-artwork-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artwork-detail.html',
  styleUrl: './artwork-detail.scss'
})
export class ArtworkDetailComponent {
  readonly locale = inject(LocaleService);
  readonly artwork = signal<Artwork | null>(null);
  readonly image = signal('');
  readonly images = signal<string[]>([]);

  constructor(route: ActivatedRoute, api: ArtworkService) {
    const id = route.snapshot.paramMap.get('id')!;
    api.findOne(id).subscribe((a) => {
      this.artwork.set(a);
      const rawImages = a.images ?? [];
      const urls = rawImages.map(img => typeof img === 'string' ? img : (img.url || img.secure_url || '')).filter(Boolean);
      this.images.set(urls.length ? urls : (a.imageUrl ? [a.imageUrl] : []));

      const primary = rawImages.find(img => typeof img === 'object' && img !== null && img.isPrimary);
      const primaryUrl = typeof primary === 'string' ? primary : (primary?.url || primary?.secure_url);
      this.image.set(primaryUrl || urls[0] || a.imageUrl || '');
    });
  }

  setImage(url: string): void {
    this.image.set(url);
  }

  title(a: Artwork): string {
    if (this.locale.locale() === 'ar') {
      return a.titleAr || this.locale.text(a.title ?? a.name, 'عمل فني');
    }
    return a.titleEn || this.locale.text(a.title ?? a.name, 'Untitled piece');
  }

  description(a: Artwork): string {
    if (this.locale.locale() === 'ar') {
      return a.storyAr || this.locale.text(a.description, 'قطعة فنية أصلية فريدة صُنعت لتبقى معك.');
    }
    return a.storyEn || this.locale.text(a.description, 'A piece made to stay with you.');
  }

  categoryLabel(a: Artwork): string {
    if (!a.category) return this.locale.locale() === 'ar' ? 'عمل فني أصلي' : 'ORIGINAL PIECE';
    return this.locale.locale() === 'ar'
      ? (a.category.nameAr || 'لوحات')
      : (a.category.nameEn || 'Artworks');
  }

  get isAvailable(): boolean {
    const a = this.artwork();
    if (!a) return false;
    if (a.status) return a.status === 'AVAILABLE';
    return a.isAvailable ?? ((a.quantity ?? a.stock ?? 1) > 0);
  }
}
