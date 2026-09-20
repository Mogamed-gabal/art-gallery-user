import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArtworkService, ClientRequestService, OrderService } from '../../core/services/api.services';
import { Artwork, OrderResponse, PaymentCurrency } from '../../core/models/api.models';
import { LocaleService } from '../../core/services/ui.services';

// Approximate USD→EUR display rate (for UI only; real conversion happens on the server)
const USD_TO_EUR_DISPLAY: number = 0.92;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent {
  readonly locale = inject(LocaleService);
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(OrderService);
  private readonly clientRequests = inject(ClientRequestService);

  readonly artwork = signal<Artwork | null>(null);
  readonly submitting = signal(false);
  readonly success = signal<OrderResponse | null>(null);
  readonly requestSuccess = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isDragging = signal<boolean>(false);

  /** Selected payment currency */
  readonly selectedCurrency = signal<PaymentCurrency>('USD');

  artworkId = '';

  // Images uploaded for custom request (1 to 5 images)
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(180)]],
    phone: ['', [Validators.required]],
    whatsappPhone: [''],
    email: ['', [Validators.email]],
    description: [''],
    shippingAddress: [''],
    preferredDeliveryDate: ['']
  });

  constructor(route: ActivatedRoute, api: ArtworkService, private readonly router: Router) {
    this.artworkId = route.snapshot.queryParamMap.get('artworkId') || '';
    if (this.artworkId) {
      this.form.controls.shippingAddress.addValidators([Validators.required]);
      this.form.controls.shippingAddress.updateValueAndValidity();
      api.findOne(this.artworkId).subscribe({
        next: (a) => this.artwork.set(a),
        error: () => this.artwork.set(null)
      });
    } else {
      // Custom Commission Request mode
      this.form.controls.description.addValidators([Validators.required, Validators.minLength(5)]);
      this.form.controls.description.updateValueAndValidity();
    }
  }

  get isCustomRequest(): boolean {
    return !this.artworkId;
  }

  get isSubmitDisabled(): boolean {
    if (this.submitting()) return true;
    if (this.isCustomRequest) {
      const raw = this.form.getRawValue();
      return !raw.customerName.trim() || !raw.phone.trim() || !raw.description.trim() || this.selectedFiles.length < 1 || this.selectedFiles.length > 5;
    }
    return this.form.invalid;
  }

  getArtworkTitle(): string {
    const art = this.artwork() as any;
    if (!art) return this.locale.locale() === 'ar' ? 'العمل المختار' : 'Selected artwork';
    const isAr = this.locale.locale() === 'ar';
    return (isAr ? (art.titleAr || art.title_ar) : (art.titleEn || art.title_en)) || art.title || art.name || '';
  }

  /** Price in USD (base currency stored in DB) */
  getArtworkPriceUsd(): number {
    const art = this.artwork();
    if (!art) return 0;
    return Number(art.onSale && art.discountPrice != null ? art.discountPrice : art.price) || 0;
  }

  /** Converted price for display (USD→EUR when EUR selected; otherwise same as USD) */
  getConvertedPrice(): string {
    const usd = this.getArtworkPriceUsd();
    if (!usd) return '—';
    const cur = this.selectedCurrency();
    if (cur === 'USD') return usd.toFixed(2);
    return (usd * USD_TO_EUR_DISPLAY).toFixed(2);
  }

  selectCurrency(cur: PaymentCurrency): void {
    this.selectedCurrency.set(cur);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.handleFiles(Array.from(input.files));
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    this.errorMessage.set(null);
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set(this.locale.locale() === 'ar' ? 'يرجى اختيار ملفات صور صالحة فقط.' : 'Please select valid image files only.');
        continue;
      }
      if (this.selectedFiles.length >= 5) {
        this.errorMessage.set(this.locale.locale() === 'ar' ? 'الحد الأقصى هو 5 صور.' : 'Maximum 5 images allowed.');
        break;
      }
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  submit(): void {
    this.errorMessage.set(null);

    // 1) CUSTOM COMMISSION REQUEST MODE
    if (this.isCustomRequest) {
      const raw = this.form.getRawValue();
      if (!raw.customerName.trim() || !raw.phone.trim() || !raw.description.trim()) {
        this.errorMessage.set(this.locale.locale() === 'ar' ? 'يرجى كتابة الاسم، رقم الهاتف، ووصف اللوحة المطلوبة.' : 'Please enter name, phone, and request description.');
        return;
      }
      if (this.selectedFiles.length < 1) {
        this.errorMessage.set(this.locale.locale() === 'ar' ? 'يرجى إرفاق صورة واحدة على الأقل (من صورة إلى 5 صور).' : 'Please attach at least 1 image (up to 5 images).');
        return;
      }
      if (this.selectedFiles.length > 5) {
        this.errorMessage.set(this.locale.locale() === 'ar' ? 'الحد الأقصى هو 5 صور.' : 'Maximum 5 images allowed.');
        return;
      }

      this.submitting.set(true);
      const formData = new FormData();
      formData.append('name', raw.customerName.trim());
      formData.append('phone', raw.phone.trim());
      formData.append('whatsapp', (raw.whatsappPhone || raw.phone).trim());
      if (raw.email && raw.email.trim()) {
        formData.append('email', raw.email.trim());
      }
      formData.append('description', raw.description.trim());

      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.clientRequests.create(formData).subscribe({
        next: () => {
          this.submitting.set(false);
          this.requestSuccess.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || (this.locale.locale() === 'ar' ? 'تعذر إرسال طلبك، يرجى المحاولة مرة أخرى أو التواصل عبر الواتساب.' : 'Failed to send request. Please try again or reach out on WhatsApp.');
          this.errorMessage.set(Array.isArray(msg) ? msg.join(', ') : msg);
        }
      });
      return;
    }

    // 2) DIRECT CATALOG PURCHASE MODE - via PayPal
    if (this.form.invalid || !this.artworkId) return;
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const payload: any = {
      customerName: raw.customerName.trim(),
      phone: raw.phone.trim(),
      shippingAddress: raw.shippingAddress.trim(),
      paymentCurrency: this.selectedCurrency(),
      items: [{ artworkId: this.artworkId, quantity: 1 }]
    };

    if (raw.email && raw.email.trim()) {
      payload.email = raw.email.trim();
    }
    if (raw.whatsappPhone && raw.whatsappPhone.trim()) {
      payload.whatsappPhone = raw.whatsappPhone.trim();
    }
    if (raw.preferredDeliveryDate && raw.preferredDeliveryDate.trim()) {
      payload.preferredDeliveryDate = raw.preferredDeliveryDate.trim();
    }

    this.orders.create(payload).subscribe({
      next: (r) => {
        this.success.set(r);
        this.submitting.set(false);
        // Redirect to PayPal approval page
        const targetUrl = r.checkoutUrl || r.paymentUrl || r.iframeUrl;
        if (targetUrl) {
          window.location.href = String(targetUrl);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err?.error?.message || (this.locale.locale() === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.' : 'Failed to create order. Please try again.');
        this.errorMessage.set(Array.isArray(msg) ? msg.join(', ') : msg);
      }
    });
  }
}


