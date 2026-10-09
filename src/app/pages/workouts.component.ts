import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
@Component({selector:'app-workouts',imports:[FormsModule],templateUrl:'./workouts.component.html',styleUrl:'./workouts.component.scss'})
export class WorkoutsComponent {
 readonly categories=[
  {name:'Gym programs',number:'01',icon:'pi pi-bolt',title:'Build your foundation.',description:'A place for strength, muscle-building and general fitness program requests.',tags:['Strength','Muscle','Fitness']},
  {name:'Sport training',number:'02',icon:'pi pi-flag',title:'Train for your game.',description:'Request training that considers your sport, position and season.',tags:['Conditioning','Performance','Preparation']},
  {name:'Stretching & mobility',number:'03',icon:'pi pi-arrows-h',title:'Make room to move.',description:'Explore requests for stretching guides, mobility routines and warm-ups.',tags:['Mobility','Stretching','Warm-ups']}
 ];
 readonly levels=['New to training','Some experience','Experienced'];
 readonly schedules=['1–2 days','3–4 days','5+ days'];
 draft={type:'Gym programs',sport:'',goal:'',level:'',days:'',equipment:''};
 readonly summary=signal<typeof this.draft|null>(null);
 choose(type:string){this.draft.type=type;this.summary.set(null);document.getElementById('workout-request')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});document.getElementById('workout-type')?.focus({preventScroll:true});}
 preview(form:NgForm){if(form.invalid){form.control.markAllAsTouched();return;}this.summary.set({...this.draft});}
}
