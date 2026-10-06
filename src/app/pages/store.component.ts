import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { products, categories } from '../core/catalog';
import { ProductCardComponent } from '../shared/product-card.component';
import { ProductDialogComponent } from '../shared/product-dialog.component';
@Component({ selector: 'app-store', imports: [FormsModule, InputTextModule, SelectModule, ProductCardComponent, ProductDialogComponent], template: `
<section class="page-intro"><span class="eyebrow">THE EPHESIANS COLLECTION</span><h1>Wear your <em>purpose.</em></h1><p>Training essentials. Everyday comfort. Faith in every detail.</p></section>
<section class="section store-section"><div class="store-toolbar"><div class="search-field"><i class="pi pi-search" aria-hidden="true"></i><input pInputText type="search" aria-label="Search products" placeholder="Find your next essential…" [ngModel]="search()" (ngModelChange)="search.set($event)"></div><p-select [options]="sortOptions" optionLabel="label" optionValue="value" [ngModel]="sort()" (ngModelChange)="sort.set($event)" ariaLabel="Sort products"/></div>
<div class="category-tabs" aria-label="Product categories">@for(c of allCategories; track c) {<button [class.selected]="category()===c" [attr.aria-pressed]="category()===c" (click)="chooseCategory(c)">{{c}}</button>}</div><div class="results-line"><span>{{filtered().length}} essentials</span><span>R50 delivery · Free over R800</span></div><div class="product-grid">@for(product of filtered(); track product.id) {<app-product-card [product]="product" (selected)="detail.open($event)"/>} @empty {<div class="empty-state"><h2>No matches just yet.</h2><p>Try another name or browse the complete collection.</p><button class="cta" (click)="reset()">Reset filters <i class="pi pi-refresh"></i></button></div>}</div></section><app-product-dialog #detail/>` })
export class StoreComponent {
  private readonly router=inject(Router); readonly allCategories=['All essentials',...categories]; readonly category=signal('All essentials'); readonly search=signal(''); readonly sort=signal('featured');
  readonly sortOptions=[{label:'Featured',value:'featured'},{label:'Price: low to high',value:'asc'},{label:'Price: high to low',value:'desc'},{label:'Name: A–Z',value:'name'}];
  readonly filtered=computed(()=>{const items=products.filter(p=>(this.category()==='All essentials'||p.category===this.category())&&p.name.toLowerCase().includes(this.search().trim().toLowerCase()));return items.sort((a,b)=>this.sort()==='name'?a.name.localeCompare(b.name):this.sort()==='asc'?(a.price??Infinity)-(b.price??Infinity):this.sort()==='desc'?(b.price??-Infinity)-(a.price??-Infinity):a.id-b.id);});
  constructor() {inject(ActivatedRoute).queryParamMap.subscribe(params=>{const c=params.get('category');this.category.set(c&&categories.includes(c)?c:'All essentials');});}
  chooseCategory(category:string) {void this.router.navigate([], {queryParams:{category:category==='All essentials'?null:category},queryParamsHandling:'merge'});}
  reset(){this.search.set('');this.sort.set('featured');this.chooseCategory('All essentials');}
}
