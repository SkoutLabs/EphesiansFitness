const http=require('node:http');
const nodemailer=require('nodemailer');
const {createOrderService,ValidationError}=require('./order-service.cjs');
const config=process.env;
const mode=config.MAIL_MODE||'preview';
let transport;
if(mode==='live'){
 const required=['MAIL_FROM','BUSINESS_EMAIL','BANK_ACCOUNT_NAME','BANK_NAME','BANK_ACCOUNT_NUMBER','BANK_BRANCH_CODE'];
 if(required.some(key=>!config[key]))throw new Error('Configure email sender and bank details before enabling live mode.');
 if(config.SMTP_HOST){if(!config.SMTP_USER||!config.SMTP_PASSWORD)throw new Error('SMTP credentials are required.');transport=nodemailer.createTransport({host:config.SMTP_HOST,port:Number(config.SMTP_PORT||587),secure:config.SMTP_SECURE==='true',auth:{user:config.SMTP_USER,pass:config.SMTP_PASSWORD}});}
 else {if(['GOOGLE_USER','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REFRESH_TOKEN'].some(key=>!config[key]))throw new Error('Gmail OAuth credentials are required.');transport=nodemailer.createTransport({service:'gmail',auth:{type:'OAuth2',user:config.GOOGLE_USER,clientId:config.GOOGLE_CLIENT_ID,clientSecret:config.GOOGLE_CLIENT_SECRET,refreshToken:config.GOOGLE_REFRESH_TOKEN}});}
}else if(mode!=='preview')throw new Error('MAIL_MODE must be preview or live.');
if(mode==='preview'&&config.NODE_ENV==='production')throw new Error('Preview mode is local only.');
const service=createOrderService({...config,MAIL_MODE:mode,MAIL_FROM:config.MAIL_FROM||'fitnessephesians@gmail.com',BUSINESS_EMAIL:config.BUSINESS_EMAIL||'fitnessephesians@gmail.com'},transport);
const attempts=new Map();
function reply(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
const server=http.createServer(async(req,res)=>{
 if(req.method==='GET'&&req.url==='/api/checkout/config')return reply(res,200,{mode});
 if(req.method!=='POST'||req.url!=='/api/orders')return reply(res,404,{message:'Not found.'});
 const ip=req.socket.remoteAddress;const now=Date.now();const entry=attempts.get(ip)||{count:0,expires:now+60000};if(now>entry.expires){entry.count=0;entry.expires=now+60000;}entry.count++;attempts.set(ip,entry);if(entry.count>10)return reply(res,429,{message:'Please wait a minute before trying again.'});
 if(!req.headers['content-type']?.includes('application/json'))return reply(res,415,{message:'JSON is required.'});
 try{let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>32768){reply(res,413,{message:'Request too large.'});return;}}const result=await service.submit(JSON.parse(body),req.headers['idempotency-key']);reply(res,200,result);}
 catch(error){if(error instanceof ValidationError||error instanceof SyntaxError)reply(res,400,{message:error instanceof SyntaxError?'Invalid request.':error.message});else{console.error('Checkout processing failed:',error.code||error.name);reply(res,503,{message:'We could not finish processing your order. Your bag is safe; retry with the same details or contact the team.'});}}
});
server.requestTimeout=30000;server.headersTimeout=15000;
setInterval(()=>{for(const [ip,entry]of attempts)if(entry.expires<Date.now())attempts.delete(ip);},60000).unref();
server.listen(Number(config.PORT||3000),config.HOST||'127.0.0.1',()=>console.log(`Checkout API ready on port ${config.PORT||3000} (${mode}; ${mode==='preview'?'emails saved locally':'email delivery enabled'})`));
