import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Artwork } from '../../../core/models/api.models';
import { LocaleService } from '../../../core/services/ui.services';

@Component({
  selector: 'app-artwork-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artwork-card.html',
  styleUrl: './artwork-card.scss'
})
export class ArtworkCardComponent {
  @Input({ required: true }) artwork!: Artwork;
  readonly locale = inject(LocaleService);

  get title(): string {
    const a = this.artwork as any;
    if (this.locale.locale() === 'ar') {
      return a.titleAr || a.title_ar || a.title || a.name || a.titleEn || a.title_en || '';
    }
    return a.titleEn || a.title_en || a.title || a.name || a.titleAr || a.title_ar || '';
  }

  get image(): string {
    const a = this.artwork as any;
    const images = a.images ?? [];
    const primary = images.find((img: any) => typeof img === 'object' && img !== null && img.isPrimary);
    const first = images[0];
    const selected = primary || first;
    if (!selected) return a.imageUrl || a.image_url || '';
    return typeof selected === 'string' ? selected : (selected.url || selected.secure_url || a.imageUrl || a.image_url || '');
  }

  get available(): boolean {
    const a = this.artwork as any;
    if (a.status) {
      return a.status === 'AVAILABLE';
    }
    return a.isAvailable ?? ((a.quantity ?? a.stock ?? 1) > 0);
  }

  get categoryName(): string {
    const a = this.artwork as any;
    if (!a.category) return '';
    const cat = a.category;
    if (this.locale.locale() === 'ar') {
      return cat.nameAr || cat.name_ar || cat.name || cat.title || cat.nameEn || cat.name_en || '';
    }
    return cat.nameEn || cat.name_en || cat.name || cat.title || cat.nameAr || cat.name_ar || '';
  }

  get price(): string {
    if (this.artwork.onSale && this.artwork.discountPrice) {
      return String(this.artwork.discountPrice);
    }
    return String(this.artwork.price ?? '—');
  }

  get originalPrice(): string | null {
    if (this.artwork.onSale && this.artwork.discountPrice) {
      return String(this.artwork.price);
    }
    return null;
  }
}

