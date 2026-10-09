import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: 'workouts', loadComponent: () => import('./pages/workouts.component').then(m => m.WorkoutsComponent), title: 'Workouts | Ephesians Fitness' },
  { path: 'terms', loadComponent: () => import('./pages/terms.component').then(m => m.TermsComponent), title: 'Terms & Conditions | Ephesians Fitness' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout.component').then(m => m.CheckoutComponent), title: 'Checkout | Ephesians Fitness' },
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent), title: 'Ephesians Fitness | Faith meets fitness' },
  { path: 'store', loadComponent: () => import('./pages/store.component').then(m => m.StoreComponent), title: 'Shop the collection | Ephesians Fitness' },
  { path: 'about', loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent), title: 'Our story | Ephesians Fitness' },
  { path: 'faq', loadComponent: () => import('./pages/faq.component').then(m => m.FaqComponent), title: 'Frequently asked questions | Ephesians Fitness' },
  { path: 'home', redirectTo: '' }, { path: 'shop', redirectTo: 'store' }, { path: 'support', redirectTo: 'faq' },
  { path: '**', loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent), title: 'Page not found | Ephesians Fitness' }
];
