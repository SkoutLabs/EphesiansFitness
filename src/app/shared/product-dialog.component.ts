import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Product } from '../core/catalog';
import { CartService } from '../core/cart.service';
@Component({ selector: 'app-product-dialog', imports: [DialogModule, SelectModule, ButtonModule, FormsModule, CurrencyPipe], template: `
<p-dialog [(visible)]="visible" [modal]="true" [header]="product?.name || 'Product details'" [style]="{width:'800px', maxWidth:'95vw'}" [draggable]="false" [closeButtonProps]="{ariaLabel:'Close'}">
 @if(product; as p) { <div class="product-detail"><div class="detail-photo"><img [src]="p.image" [alt]="p.name"></div><div><span class="eyebrow">{{p.category}}</span><h2>{{p.name}}</h2><p class="detail-price">{{p.price === null ? 'Enquire for pricing' : (p.price | currency:'ZAR':'symbol-narrow':'1.0-0')}}</p><p class="muted">{{p.description}}</p><p class="small muted">Product image shows the design. Confirm your chosen colour and fit with the team.</p><div class="option-fields"><label for="size">Size</label><p-select inputId="size" [options]="p.availableSizes" [(ngModel)]="size" appendTo="body"/><label for="colour">Colour</label><p-select inputId="colour" [options]="p.availableColors" [(ngModel)]="color" appendTo="body"/><label for="fit">Style</label><p-select inputId="fit" [options]="p.availableTypes" [(ngModel)]="type" appendTo="body"/></div>
 @if(p.price !== null) {<p-button [ariaLabel]="added ? 'Added to your bag' : 'Add to bag'" [label]="added ? 'Added to your bag' : 'Add to bag'" [icon]="added ? 'pi pi-check' : 'pi pi-shopping-bag'" (onClick)="add()" styleClass="full"/><p class="small" aria-live="polite">{{added ? 'Open Bag in the header to review your items.' : 'R50 delivery · Free on orders over R800'}}</p>} @else {<a class="cta" href="mailto:fitnessephesians@gmail.com">Ask about this item <i class="pi pi-arrow-up-right"></i></a>}
 </div></div> }
</p-dialog>` })
export class ProductDialogComponent {
  private readonly cart = inject(CartService); product: Product | null = null; visible = false; size = ''; color = ''; type = ''; added = false;
  open(product: Product) { this.product = product; this.size = product.availableSizes[0]; this.color = product.availableColors[0]; this.type = product.availableTypes[0]; this.added = false; this.visible = true; }
  add() { if(this.product) { this.cart.add(this.product, this.size, this.color, this.type); this.added = true; } }
}


