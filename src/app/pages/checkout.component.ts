import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { downloadPaymentPdf } from '../core/payment-pdf';
import terms from '../core/terms.json';
import { CartService } from '../core/cart.service';
interface Result {reference:string;total:number;subtotal:number;shipping:number;status:'awaiting_payment';mode:'preview'|'live';payment:{accountName:string|null;bankName:string|null;accountNumber:string|null;branchCode:string|null;businessEmail:string|null};}
@Component({selector:'app-checkout',imports:[CurrencyPipe,FormsModule,RouterLink,InputTextModule,SelectModule,ButtonModule],templateUrl:'./checkout.component.html'})
export class CheckoutComponent{
 readonly emailPending=signal(false);readonly emailMessage=signal('');
 readonly termsVersion=terms.version;acceptedTerms=false;
 readonly copyMessage=signal('');
 readonly cart=inject(CartService);private readonly http=inject(HttpClient);readonly pending=signal(false);readonly error=signal('');readonly result=signal<Result|null>(null);readonly mode=signal<'preview'|'live'|null>(null);
 readonly provinces=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
 customer={name:'',email:'',phone:'',address:'',addressLine2:'',suburb:'',city:'',province:'',postalCode:'',notes:''};private requestId=crypto.randomUUID();private payload='';
 constructor(){this.http.get<{mode:'preview'|'live'}>('/api/checkout/config').subscribe({next:config=>this.mode.set(config.mode),error:()=>this.error.set('Checkout is temporarily unavailable. Please try again later or contact the team.')});}
 async copy(label:string,value:string){try{await navigator.clipboard.writeText(value);this.copyMessage.set(label+' copied.');}catch{this.copyMessage.set('Copy is unavailable. Please select and copy the '+label.toLowerCase()+' shown below.');}}
 amount(value:number){return value.toFixed(2);}
 savePdf(){const order=this.result();if(!order)return;downloadPaymentPdf(order,this.customer);}
 sendEmail(){if(this.emailPending())return;this.emailPending.set(true);this.emailMessage.set('');this.http.post<{mode:'preview'|'live'}>('/api/orders/email',{requestId:this.requestId}).subscribe({next:response=>{this.emailMessage.set(response.mode==='preview'?'Email preview saved. No email was sent.':'Payment instructions sent to '+this.customer.email+'.');this.emailPending.set(false);},error:(error:HttpErrorResponse)=>{this.emailMessage.set(error.error?.message||'We could not send the email. Please try again.');this.emailPending.set(false);}});}
 submit(form:NgForm){if(this.pending())return;if(form.invalid||!this.acceptedTerms||!this.cart.count()){form.control.markAllAsTouched();this.error.set('Please complete your delivery details and check your bag, and accept the Terms & Conditions.');return;}this.error.set('');const body={acceptedTerms:this.acceptedTerms,termsVersion:this.termsVersion,customer:this.customer,items:this.cart.items().map(({productId,size,color,type,quantity})=>({productId,size,color,type,quantity}))};const serialized=JSON.stringify(body);if(this.payload&&this.payload!==serialized)this.requestId=crypto.randomUUID();this.payload=serialized;this.pending.set(true);this.http.post<Result>('/api/orders',body,{headers:{'Idempotency-Key':this.requestId}}).subscribe({next:result=>{this.result.set(result);if(result.mode==='live')this.cart.clear();this.pending.set(false);},error:(error:HttpErrorResponse)=>{this.error.set(error.error?.message||'We could not process your order. Your bag has been kept; please try again.');this.pending.set(false);}});}
}
