const {randomUUID}=require('node:crypto');
const fs=require('node:fs/promises');
const path=require('node:path');
const catalog=require('../src/app/core/products.json');
const provinces=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
class ValidationError extends Error {}
function validate(input){
 if(!input||typeof input!=='object'||!input.customer||!Array.isArray(input.items)||!input.items.length||input.items.length>50)throw new ValidationError('Please check your bag and delivery details.');
 const customer={};
 for(const [key,max] of Object.entries({name:100,email:254,phone:30,address:200,city:100,province:50,postalCode:4,notes:1000})){
  const value=input.customer[key];if(typeof value!=='string'||value.length>max||(key!=='notes'&&!value.trim()))throw new ValidationError('Please check your '+key+'.');customer[key]=value.trim();
 }
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(customer.email)||/[\r\n]/.test(customer.email))throw new ValidationError('Enter a valid email address.');
 if(!/^\d{4}$/.test(customer.postalCode)||!provinces.includes(customer.province)||!/^\+?[\d ()-]{9,20}$/.test(customer.phone))throw new ValidationError('Check your South African delivery details.');
 const keys=new Set();
 const items=input.items.map(item=>{const product=catalog.find(p=>p.id===item.productId);if(!product||!product.price||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99||!product.availableSizes.includes(item.size)||!product.availableColors.includes(item.color)||!product.availableTypes.includes(item.type))throw new ValidationError('A product option is invalid. Please update your bag.');
  const key=[product.id,item.size,item.color,item.type].join('|');if(keys.has(key))throw new ValidationError('Duplicate bag items.');keys.add(key);
  return {productId:product.id,name:product.name,size:item.size,color:item.color,type:item.type,quantity:item.quantity,price:product.price,total:product.price*item.quantity};});
 const subtotal=items.reduce((n,i)=>n+i.total,0);const shipping=subtotal>800?0:50;
 return {customer,items,subtotal,shipping,total:subtotal+shipping};
}
function buildEmails(order,config){
 const lines=order.items.map(i=>`${i.quantity} × ${i.name} / ${i.size} / ${i.color} / ${i.type} — R${i.total}`).join('\n');
 const bank=[['Account name',config.BANK_ACCOUNT_NAME],['Bank',config.BANK_NAME],['Account number',config.BANK_ACCOUNT_NUMBER],['Branch code',config.BANK_BRANCH_CODE]].map(([key,value])=>`${key}: ${value||'[Configure before launch]'}`).join('\n');
 const address=[order.customer.address,order.customer.city,order.customer.province,order.customer.postalCode,'South Africa'].join(', ');
 const text=`Hi ${order.customer.name},\n\nThank you for your Ephesians Fitness order. Your order is awaiting EFT payment.\n\nOrder reference: ${order.reference}\n\n${lines}\n\nSubtotal: R${order.subtotal}\nDelivery: R${order.shipping}\nTotal due: R${order.total}\n\nDeliver to: ${address}\nPhone: ${order.customer.phone}\nNotes: ${order.customer.notes||'None'}\n\nBank details\n${bank}\nPayment reference: ${order.reference}\n\nPlease use your order reference when making payment and send proof of payment to ${config.BUSINESS_EMAIL}. Your order will be processed after payment is confirmed.\n\nEphesians Fitness`;
 const html=`<div style="font-family:Arial,sans-serif;color:#183d34;max-width:640px;margin:auto"><h1 style="background:#183d34;color:#d7c394;padding:24px">Ephesians Fitness</h1><h2>Order ${escape(order.reference)}</h2><p>Awaiting EFT payment</p><div style="white-space:pre-wrap;line-height:1.8">${escape(text)}</div></div>`;
 const customer={from:config.MAIL_FROM,to:order.customer.email,replyTo:config.BUSINESS_EMAIL,subject:`Ephesians Fitness — payment details for ${order.reference}`,text,html};
 const business={from:config.MAIL_FROM,to:config.BUSINESS_EMAIL,replyTo:order.customer.email,subject:`New order ${order.reference} — awaiting payment`,text:`Customer email: ${order.customer.email}\n\n${text}`,html};
 return {customer,business};
}
function createOrderService(config,transport){
 const directory=path.resolve(config.ORDER_DATA_DIR||'server/data');
 const pending=new Map();
 async function save(order){await fs.mkdir(path.join(directory,'orders'),{recursive:true});const target=path.join(directory,'orders',order.requestId+'.json');const temporary=target+'.tmp';await fs.writeFile(temporary,JSON.stringify(order,null,2),{mode:0o600});await fs.rename(temporary,target);}
 async function run(input,requestId){
  const checked=validate(input);const fingerprint=JSON.stringify(checked);let order;
  try{order=JSON.parse(await fs.readFile(path.join(directory,'orders',requestId+'.json'),'utf8'));if(order.fingerprint!==fingerprint)throw new ValidationError('Your bag or details changed. Start a new checkout.');}catch(error){if(error.code!=='ENOENT')throw error;order={...checked,requestId,fingerprint,reference:'EF-'+randomUUID().replaceAll('-','').slice(0,16).toUpperCase(),createdAt:new Date().toISOString(),status:'awaiting_payment',customerMailSent:false,businessMailSent:false};await save(order);}
  const emails=buildEmails(order,config);
  for(const kind of ['customer','business']){const flag=kind+'MailSent';if(!order[flag]){if(config.MAIL_MODE==='preview'){const folder=path.join(directory,'email-previews');await fs.mkdir(folder,{recursive:true});await fs.writeFile(path.join(folder,order.reference+'-'+kind+'.html'),emails[kind].html,{mode:0o600});await fs.writeFile(path.join(folder,order.reference+'-'+kind+'.txt'),emails[kind].text,{mode:0o600});}else{const info=await transport.sendMail(emails[kind]);if(info.rejected?.length)throw new Error('Email recipient rejected');}order[flag]=true;await save(order);}}
  return {reference:order.reference,total:order.total,subtotal:order.subtotal,shipping:order.shipping,mode:config.MAIL_MODE==='preview'?'preview':'live',status:order.status};
 }
 return {submit(input,key){if(typeof key!=='string'||!/^[-a-f0-9]{36}$/.test(key))throw new ValidationError('A checkout request identifier is required.');if(pending.has(key))return pending.get(key).then(()=>run(input,key));const promise=run(input,key).finally(()=>pending.delete(key));pending.set(key,promise);return promise;}};
}
module.exports={validate,buildEmails,createOrderService,ValidationError};
