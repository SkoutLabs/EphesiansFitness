const fs = require('node:fs');
const js = fs.readFileSync('docs/source/existing-main.js','utf8');
const literal = js.match(/var Co=(\[.*?\]);var Hr=/s)?.[1];
if (!literal) throw new Error('Catalogue not found');
const groups = JSON.parse(literal.replace(/([{,])([a-zA-Z][a-zA-Z0-9]*):/g,'$1"$2":'));
const descriptions = { 'Pump Covers': '100% cotton. A relaxed training essential with a faith-inspired design.', 'Training Shirts & Vests': 'Made for movement. Your everyday companion for training with purpose.', 'Joggers & Leggings': 'Comfort and flexibility, from your workout to your rest day.', 'Hoodies & Sweaters': '60% cotton, 40% polyester. An extra layer for cooler days.', 'Head Wear': 'Finish your everyday look with Ephesians Fitness headwear.' };
async function main() {
  let csv;
  if(process.argv.includes('--offline')) csv = fs.readFileSync('docs/source/ProductPrices.csv','utf8');
  else { const response = await fetch('https://ephesians-fitness.co.za/files/ProductPrices.csv'); if (!response.ok) throw new Error('Price source unavailable'); csv = await response.text(); }
  fs.mkdirSync('docs/source', {recursive:true}); fs.writeFileSync('docs/source/ProductPrices.csv',csv);
  const prices = new Map(csv.trim().split(/\r?\n/).slice(1).map(line => {const parts=line.split(','); return [parts[1]?.replace(/^"|"$/g,''), Number(parts[2]?.replace(/^"|"$/g,''))];}));
  const seen=new Set(); const products=[];
  fs.mkdirSync('public/images',{recursive:true});
  for (const group of groups) for (const product of group.products) {
    if (seen.has(product.id)) continue; seen.add(product.id);
    const value=prices.get(product.name);
    products.push({...product, price: Number.isFinite(value) && value>0 ? value : null, category:group.title, description:descriptions[group.title]});
    if (!process.argv.includes('--offline')) { const img = await fetch('https://ephesians-fitness.co.za/'+product.image);
      if(!img.ok || !img.headers.get('content-type')?.startsWith('image/')) throw new Error('Image unavailable: '+product.image);
      fs.writeFileSync('public/'+product.image,Buffer.from(await img.arrayBuffer())); }
    console.log('Imported '+product.name);
  }
  fs.mkdirSync('src/app/core',{recursive:true}); fs.writeFileSync('src/app/core/products.json',JSON.stringify(products,null,2)+'\n');
}
main().catch(error=>{ console.error(error);process.exitCode=1; });
