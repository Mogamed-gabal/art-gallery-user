import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LocaleService } from '../../core/services/ui.services';

declare global {
  interface Window { __APP_CONFIG__?: { apiBaseUrl?: string }; }
}

const API_BASE_URL =
  (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiBaseUrl) ||
  'https://art-gallery-infa.vercel.app/api/v1';

type PageMode = 'loading' | 'success' | 'cancelled' | 'error';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="payment-result container">
      @switch (mode()) {
        @case ('loading') {
          <div class="result-card result-card--loading">
            <div class="spinner"></div>
            <p>{{ locale.locale() === 'ar' ? 'جاري تأكيد الدفع...' : 'Confirming your payment...' }}</p>
          </div>
        }
        @case ('success') {
          <div class="result-card result-card--success">
            <span class="result-icon">✦</span>
            <h1>{{ locale.locale() === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!' }}</h1>
            <p>{{ locale.locale() === 'ar' ? 'شكراً! تم تأكيد طلبك وسيتواصل معك الفنان أنس يعقوب قريباً.' : 'Thank you! Your order is confirmed. Artist Anas Yaqoub will be in touch soon.' }}</p>
            <p class="order-ref" *ngIf="orderNumber">{{ locale.locale() === 'ar' ? 'رقم الطلب:' : 'Order:' }} <strong>{{ orderNumber }}</strong></p>
            <a routerLink="/" class="btn-home">{{ locale.locale() === 'ar' ? 'العودة للرئيسية' : 'Return to Home' }}</a>
          </div>
        }
        @case ('cancelled') {
          <div class="result-card result-card--cancelled">
            <span class="result-icon">✕</span>
            <h1>{{ locale.locale() === 'ar' ? 'تم إلغاء عملية الدفع' : 'Payment Cancelled' }}</h1>
            <p>{{ locale.locale() === 'ar' ? 'لم يتم تحصيل أي مبلغ. يمكنك المحاولة مرة أخرى في أي وقت.' : 'No charge was made. You can try again anytime.' }}</p>
            <a routerLink="/artworks" class="btn-home">{{ locale.locale() === 'ar' ? 'العودة للمتجر' : 'Browse Artworks' }}</a>
          </div>
        }
        @case ('error') {
          <div class="result-card result-card--error">
            <span class="result-icon">⚠</span>
            <h1>{{ locale.locale() === 'ar' ? 'حدث خطأ' : 'Something went wrong' }}</h1>
            <p>{{ errorMsg() }}</p>
            <a routerLink="/artworks" class="btn-home">{{ locale.locale() === 'ar' ? 'العودة للمتجر' : 'Browse Artworks' }}</a>
          </div>
        }
      }
    </main>
  `,
  styles: [`
    .payment-result {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 1rem;
    }
    .result-card {
      text-align: center;
      border-radius: 16px;
      padding: 4rem 2.5rem;
      max-width: 560px;
      width: 100%;
      border: 1px solid;
    }
    .result-card--loading { border-color: var(--muted, #999); }
    .result-card--success { border-color: var(--gold, #d4af37); background: color-mix(in srgb, var(--gold, #d4af37) 5%, transparent); }
    .result-card--cancelled { border-color: var(--muted, #999); }
    .result-card--error { border-color: #e74c3c; }
    .result-icon { font-size: 3rem; display: block; margin-bottom: 1.5rem; }
    .result-card--success .result-icon { color: var(--gold, #d4af37); }
    .result-card--error .result-icon { color: #e74c3c; }
    h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 1rem; }
    p { color: var(--muted, #999); line-height: 1.7; margin-bottom: 0.8rem; }
    .order-ref { font-size: 0.9rem; margin-top: 0.5rem; }
    .btn-home {
      display: inline-block; margin-top: 2rem;
      padding: 0.8rem 2rem; border-radius: 8px;
      background: var(--gold, #d4af37); color: #000;
      font-weight: 700; text-decoration: none;
      transition: opacity 0.2s;
      &:hover { opacity: 0.85; }
    }
    .spinner {
      width: 40px; height: 40px; border: 3px solid var(--muted, #999);
      border-top-color: var(--gold, #d4af37); border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PaymentResultComponent implements OnInit {
  readonly locale = inject(LocaleService);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  readonly mode = signal<PageMode>('loading');
  readonly errorMsg = signal('');
  orderNumber = '';

  ngOnInit(): void {
    const isCancelled = this.route.snapshot.url.some((s) => s.path === 'cancel');
    if (isCancelled) {
      this.mode.set('cancelled');
      return;
    }

    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    const paypalToken = this.route.snapshot.queryParamMap.get('token');

    if (!orderId || !paypalToken) {
      this.mode.set('error');
      this.errorMsg.set(
        this.locale.locale() === 'ar'
          ? 'بيانات الطلب مفقودة.'
          : 'Missing order data.',
      );
      return;
    }

    // Call backend to capture the payment
    this.http
      .post<any>(
        `${API_BASE_URL}/orders/capture?orderId=${orderId}&token=${paypalToken}`,
        {},
      )
      .subscribe({
        next: (order) => {
          this.orderNumber = order.orderNumber ?? orderId;
          this.mode.set('success');
        },
        error: (err) => {
          const msg =
            err?.error?.message ||
            (this.locale.locale() === 'ar'
              ? 'تعذر تأكيد الدفع، يرجى التواصل معنا.'
              : 'Could not confirm payment. Please contact us.');
          this.errorMsg.set(Array.isArray(msg) ? msg.join(', ') : msg);
          this.mode.set('error');
        },
      });
  }
}
