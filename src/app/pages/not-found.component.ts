import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-not-found',imports:[RouterLink],template:`<section class="page-intro"><span class="eyebrow">404 / A DIFFERENT PATH</span><h1>Let’s get you<br><em>back on track.</em></h1><p>We couldn’t find that page.</p><a class="cta" routerLink="/">Back to home <i class="pi pi-arrow-right"></i></a></section>`})
export class NotFoundComponent {}
