import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Artwork, Category, Course, CreateOrderPayload, OrderResponse,
  PaginatedResponse, SiteInfoResponse,
} from '../models/api.models';

declare global {
  interface Window { __APP_CONFIG__?: { apiBaseUrl?: string }; }
}

const API_BASE_URL = (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiBaseUrl) || 'http://localhost:3005/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  private unwrap<T>(response: unknown): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: T }).data;
    }
    return response as T;
  }

  get<T>(path: string, params?: Record<string, string | number | undefined>): Observable<T> {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== '') httpParams = httpParams.set(key, String(value));
    });
    return this.http.get<unknown>(`${API_BASE_URL}${path}`, { params: httpParams }).pipe(
      map(res => this.unwrap<T>(res))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<unknown>(`${API_BASE_URL}${path}`, body).pipe(
      map(res => this.unwrap<T>(res))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly api = inject(ApiClient);
  getSiteInfo(): Observable<SiteInfoResponse> {
    return this.api.get<SiteInfoResponse>('/content/site-info');
  }
}

@Injectable({ providedIn: 'root' })
export class ArtworkService {
  private readonly api = inject(ApiClient);
  featured(): Observable<Artwork[]> { return this.api.get<Artwork[]>('/artworks/home-featured'); }
  list(params: { categoryId?: string; page?: number; limit?: number; search?: string } = {}): Observable<PaginatedResponse<Artwork> | Artwork[]> {
    return this.api.get<PaginatedResponse<Artwork> | Artwork[]>('/artworks', params);
  }
  findOne(id: string): Observable<Artwork> { return this.api.get<Artwork>(`/artworks/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiClient);
  list(): Observable<Category[]> { return this.api.get<Category[]>('/categories'); }
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly api = inject(ApiClient);
  list(): Observable<Course[]> {
    return this.api.get<Course[] | PaginatedResponse<Course>>('/courses').pipe(
      map((response) => Array.isArray(response) ? response : (response.data ?? response.items ?? [])),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiClient);
  create(payload: CreateOrderPayload): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/orders', payload);
  }
}

@Injectable({ providedIn: 'root' })
export class ClientRequestService {
  private readonly http = inject(HttpClient);
  create(formData: FormData): Observable<any> {
    const url = (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiBaseUrl) || 'http://localhost:3005/api/v1';
    return this.http.post(`${url}/client-requests`, formData);
  }
}

