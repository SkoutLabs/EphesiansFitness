import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { CartService } from './core/cart.service';
@Component({ selector: 'app-root', imports: [RouterOutlet, RouterLink, RouterLinkActive, CurrencyPipe, ButtonModule, DrawerModule], templateUrl: './app.component.html' })
export class AppComponent {
  readonly cart = inject(CartService);
  readonly menu = signal(false);
  basket = false;
  readonly year = new Date().getFullYear();
  constructor() { inject(Router).events.subscribe(e => { if (e instanceof NavigationEnd) this.menu.set(false); }); }
}
