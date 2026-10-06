import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../core/cart.service';
interface Result {reference:string;total:number;mode:'preview'|'live';}
@Component({selector:'app-checkout',imports:[CurrencyPipe,FormsModule,RouterLink,InputTextModule,SelectModule,ButtonModule],templateUrl:'./checkout.component.html'})
export class CheckoutComponent{
 readonly cart=inject(CartService);private readonly http=inject(HttpClient);readonly pending=signal(false);readonly error=signal('');readonly result=signal<Result|null>(null);readonly mode=signal<'preview'|'live'|null>(null);
 readonly provinces=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
 customer={name:'',email:'',phone:'',address:'',city:'',province:'',postalCode:'',notes:''};private requestId=crypto.randomUUID();private payload='';
 constructor(){this.http.get<{mode:'preview'|'live'}>('/api/checkout/config').subscribe({next:config=>this.mode.set(config.mode),error:()=>this.error.set('Checkout is temporarily unavailable. Please try again later or contact the team.')});}
 submit(form:NgForm){if(this.pending())return;if(form.invalid||!this.cart.count()){form.control.markAllAsTouched();this.error.set('Please complete your delivery details and check your bag.');return;}this.error.set('');const body={customer:this.customer,items:this.cart.items().map(({productId,size,color,type,quantity})=>({productId,size,color,type,quantity}))};const serialized=JSON.stringify(body);if(this.payload&&this.payload!==serialized)this.requestId=crypto.randomUUID();this.payload=serialized;this.pending.set(true);this.http.post<Result>('/api/orders',body,{headers:{'Idempotency-Key':this.requestId}}).subscribe({next:result=>{this.result.set(result);if(result.mode==='live')this.cart.clear();this.pending.set(false);},error:(error:HttpErrorResponse)=>{this.error.set(error.error?.message||'We could not process your order. Your bag has been kept; please try again.');this.pending.set(false);}});}
}
