import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home';
import { ArtworksComponent } from './features/artworks/artworks';
import { ArtworkDetailComponent } from './features/artwork-detail/artwork-detail';
import { CheckoutComponent } from './features/checkout/checkout';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'ANASYA3QUB — Artist' },
  { path: 'artworks', component: ArtworksComponent, title: 'Collection — ANASYA3QUB' },
  { path: 'artworks/:id', component: ArtworkDetailComponent, title: 'Artwork — ANASYA3QUB' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout — ANASYA3QUB' },
  { path: '**', redirectTo: '' },
];
