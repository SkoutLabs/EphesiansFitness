import source from './products.json';
export interface Product { id: number; name: string; image: string; price: number | null; category: string; availableSizes: string[]; availableTypes: string[]; availableColors: string[]; description: string; }
export const products: Product[] = source as Product[];
export const categories = [...new Set(products.map(p => p.category))];
