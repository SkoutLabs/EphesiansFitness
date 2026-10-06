import { Injectable, computed, signal } from '@angular/core';
import { Product } from './catalog';
export interface CartItem { key: string; productId: number; name: string; image: string; price: number; size: string; color: string; type: string; quantity: number; }
@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>(this.restore());
  readonly count = computed(() => this.items().reduce((n, item) => n + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((n, item) => n + item.quantity * item.price, 0));
  readonly shipping = computed(() => this.subtotal() > 800 ? 0 : 50);
  readonly total = computed(() => this.subtotal() + (this.count() ? this.shipping() : 0));
  add(product: Product, size: string, color: string, type: string) {
    if (product.price === null) return;
    const key = `${product.id}|${size}|${color}|${type}`;
    this.items.update(items => items.some(i => i.key === key) ? items.map(i => i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i) : [...items, { key, productId: product.id, name: product.name, image: product.image, price: product.price!, size, color, type, quantity: 1 }]);
    this.save();
  }
  change(key: string, delta: number) { this.items.update(items => items.map(i => i.key === key ? { ...i, quantity: Math.min(99, i.quantity + delta) } : i).filter(i => i.quantity > 0)); this.save(); }
  remove(key: string) { this.items.update(items => items.filter(i => i.key !== key)); this.save(); }
  clear() { this.items.set([]); this.save(); }
  readonly enquiryUrl = computed(() => {
    const details = this.items().map(i => `${i.quantity} x ${i.name} — ${i.size}, ${i.color}, ${i.type}: R${i.price * i.quantity}`).join('\n');
    const body = `Hi Ephesians Fitness,\n\nI'd like to enquire about these items:\n\n${details}\n\nSubtotal: R${this.subtotal()}\nShipping: R${this.shipping()}\nTotal: R${this.total()}\n\nPlease confirm availability and payment details.\n\nMy name:\nDelivery address:\nContact number:`;
    return `mailto:fitnessephesians@gmail.com?subject=${encodeURIComponent('Ephesians Fitness order enquiry')}&body=${encodeURIComponent(body)}`;
  });
  private save() { try { localStorage.setItem('ef-cart-v1', JSON.stringify(this.items())); } catch { /* The basket remains usable when browser storage is unavailable. */ } }
  private restore(): CartItem[] {
    try { const stored: unknown = JSON.parse(localStorage.getItem('ef-cart-v1') || '[]'); return Array.isArray(stored) ? stored.filter((i: CartItem) => typeof i.key === 'string' && typeof i.name === 'string' && typeof i.image === 'string' && Number.isFinite(i.price) && i.price > 0 && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 99 && typeof i.size === 'string' && typeof i.color === 'string' && typeof i.type === 'string') : []; } catch { return []; }
  }
}
