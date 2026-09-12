export type Locale = 'ar' | 'en';

export interface LocalizedText {
  ar?: string;
  en?: string;
}

export interface ArtworkImage {
  id?: string;
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  secure_url?: string;
}

export interface HeroContent {
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

export interface AboutContent {
  titleAr?: string;
  titleEn?: string;
  bioAr?: string;
  bioEn?: string;
  image1Url?: string;
  image2Url?: string;
  [key: string]: unknown;
}

export interface ContactContent {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  socialLinks?: Record<string, string>;
  [key: string]: unknown;
}

export interface SiteInfoResponse {
  hero?: HeroContent | Record<string, unknown>;
  about?: AboutContent | Record<string, unknown>;
  contact?: ContactContent | Record<string, unknown>;
  [key: string]: unknown;
}

export interface Category {
  id: string;
  nameAr?: string;
  nameEn?: string;
  name?: string | LocalizedText;
  title?: string | LocalizedText;
  slug?: string;
  artworks?: Artwork[];
}

export interface Artwork {
  id: string;
  titleAr?: string;
  titleEn?: string;
  storyAr?: string;
  storyEn?: string;
  price?: number | string;
  discountPrice?: number | string | null;
  onSale?: boolean;
  quantity?: number;
  isBestSeller?: boolean;
  status?: 'AVAILABLE' | 'SOLD_OUT';
  category?: Category;
  categoryId?: string;
  images?: ArtworkImage[] | string[];
  createdAt?: string;
  updatedAt?: string;

  // Compatibility fields
  title?: string | LocalizedText;
  name?: string | LocalizedText;
  description?: string | LocalizedText;
  imageUrl?: string;
  stock?: number;
  isAvailable?: boolean;
  isOriginal?: boolean;
  type?: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  items?: T[];
  results?: T[];
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };
  total?: number;
}

export interface Course {
  id: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  title?: string | LocalizedText;
  description?: string | LocalizedText;
  price?: number;
  durationMinutes?: number;
  externalUrl?: string;
  welcomeVideoUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  whatsappPhone?: string;
  email?: string;
  shippingAddress: string;
  preferredDeliveryDate?: string;
  items: Array<{ artworkId: string; quantity: number }>;
}

export interface OrderResponse {
  id: string;
  orderNumber?: string;
  totalAmount?: number | string;
  paymentStatus?: string;
  paymentUrl?: string;
  iframeUrl?: string;
  checkoutUrl?: string;
  [key: string]: unknown;
}

export interface ClientRequestPayload {
  name?: string;
  customerName?: string;
  phone: string;
  email?: string;
  description: string;
  categoryId?: string;
  [key: string]: unknown;
}
