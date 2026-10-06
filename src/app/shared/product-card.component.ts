import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../core/catalog';
@Component({ selector: 'app-product-card', imports: [CurrencyPipe], template: `
<button class="product-card" (click)="selected.emit(product())" [attr.aria-label]="'View ' + product().name">
  <div class="product-photo"><img [src]="product().image" [alt]="product().name" loading="lazy"><span class="product-view">VIEW DETAILS <i class="pi pi-arrow-up-right" aria-hidden="true"></i></span></div>
  <div class="product-meta"><small>{{product().category}}</small><h3>{{product().name}}</h3><div><span>{{product().price === null ? 'Enquire for pricing' : (product().price | currency:'ZAR':'symbol-narrow':'1.0-0')}}</span><span class="color-dots" aria-hidden="true"><b></b><b></b><b></b></span></div></div>
</button>` })
export class ProductCardComponent { readonly product = input.required<Product>(); readonly selected = output<Product>(); }

