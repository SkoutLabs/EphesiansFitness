interface PaymentOrder {
 reference:string;total:number;subtotal:number;shipping:number;mode:'preview'|'live';
 payment:{accountName:string|null;bankName:string|null;accountNumber:string|null;branchCode:string|null;businessEmail:string|null};
}
interface Delivery {name:string;email:string;phone:string;address:string;addressLine2:string;suburb:string;city:string;province:string;postalCode:string;}
// A text PDF keeps payment instructions selectable and downloads without a print dialog.
export function downloadPaymentPdf(order:PaymentOrder,customer:Delivery):void {
 const bank=order.payment;
 const lines=[
  'EPHESIANS FITNESS', 'EFT payment instructions', '',
  ...(order.mode==='preview'?['PREVIEW ONLY - DO NOT PAY','No live order was placed. No email was sent.','']:[]),
  'Order reference: '+order.reference,'Status: Awaiting payment','',
  'BANKING DETAILS',
  'Account name: '+(bank.accountName||'Not configured'),
  'Bank: '+(bank.bankName||'Not configured'),
  'Account number: '+(bank.accountNumber||'Not configured'),
  'Branch code: '+(bank.branchCode||'Not configured'),
  'Payment reference: '+order.reference,
  'Amount to pay: ZAR '+order.total.toFixed(2),'',
  'Use the exact reference when making your EFT.',
  'Send proof of payment to: '+(bank.businessEmail||'Contact the team'),
  'Include your order reference. Payment is confirmed when funds reflect',
  'in our bank account. Your order will then be processed.','',
  'DELIVERY DETAILS',customer.name,customer.address,customer.addressLine2,
  customer.suburb,customer.city+', '+customer.province,customer.postalCode+', South Africa',
  'Phone: '+customer.phone,'Email: '+customer.email,'',
  'Subtotal: ZAR '+order.subtotal.toFixed(2),
  'Delivery: ZAR '+order.shipping.toFixed(2),'Total: ZAR '+order.total.toFixed(2)
 ];
 // Built-in Helvetica uses Windows Latin-1; retain accents where supported.
 const clean=(value:string)=>value.replace(/[\r\n\t]/g,' ').replace(/[^\x20-\xFF]/g,'?');
 const wrapped=lines.flatMap(line=>{const text=clean(line);if(!text)return [''];const parts:string[]=[];let rest=text;while(rest.length>78){let split=rest.lastIndexOf(' ',78);if(split<1)split=78;parts.push(rest.slice(0,split));rest=rest.slice(split).trimStart();}return [...parts,rest];});
 const pages:string[][]=[];for(let i=0;i<wrapped.length;i+=46)pages.push(wrapped.slice(i,i+46));
 const escape=(value:string)=>value.replace(/([\\()])/g,'\\$1');
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'];
 const children:number[]=[];
 for(const lines of pages){const pageId=objects.length+1;children.push(pageId);const contentId=pageId+1;objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);const stream='BT /F1 11 Tf 16 TL 48 790 Td\n'+lines.map(line=>'('+escape(line)+') Tj T*').join('\n')+'\nET';objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);}
 objects[1]=`<< /Type /Pages /Kids [${children.map(id=>id+' 0 R').join(' ')}] /Count ${pages.length} >>`;
 let pdf='%PDF-1.4\n';const offsets=[0];objects.forEach((object,index)=>{offsets.push(pdf.length);pdf+=`${index+1} 0 obj\n${object}\nendobj\n`;});const xref=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 const bytes=Uint8Array.from(pdf,char=>char.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));const link=document.createElement('a');link.href=url;link.download=order.reference+'-payment-instructions.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
