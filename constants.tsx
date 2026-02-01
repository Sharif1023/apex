
import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'men',
    name: 'Men',
    subcategories: [
      { id: 'm-formal', name: 'Formal Shoes', parentId: 'men' },
      { id: 'm-sneakers', name: 'Sneakers', parentId: 'men' },
      { id: 'm-casual', name: 'Casual', parentId: 'men' },
      { id: 'm-boots', name: 'Boots', parentId: 'men' },
    ]
  },
  {
    id: 'women',
    name: 'Women',
    subcategories: [
      { id: 'w-heels', name: 'Heels', parentId: 'women' },
      { id: 'w-flats', name: 'Flats', parentId: 'women' },
      { id: 'w-sandals', name: 'Sandals', parentId: 'women' },
    ]
  },
  {
    id: 'kids',
    name: 'Kids',
    subcategories: [
      { id: 'k-school', name: 'School Shoes', parentId: 'kids' },
      { id: 'k-casual', name: 'Casual', parentId: 'kids' },
    ]
  }
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Oxford Formal',
    description: 'Genuine leather formal shoes for modern professionals. Breathable lining and anti-slip sole.',
    price: 4500,
    discountPrice: 3800,
    categoryId: 'men',
    subcategoryId: 'm-formal',
    brand: 'Apex',
    rating: 4.8,
    reviewsCount: 124,
    images: ['https://picsum.photos/seed/shoes1/600/600', 'https://picsum.photos/seed/shoes2/600/600'],
    isBestSeller: true,
    variants: [
      { id: 'v1', size: '40', color: 'Black', stock: 15, sku: 'APX-M-BLK-40' },
      { id: 'v2', size: '42', color: 'Black', stock: 8, sku: 'APX-M-BLK-42' },
    ]
  },
  {
    id: '2',
    name: 'Stellar Run Sneakers',
    description: 'Lightweight performance running shoes with reactive foam cushioning for maximum energy return.',
    price: 3200,
    categoryId: 'men',
    subcategoryId: 'm-sneakers',
    brand: 'Sprint',
    rating: 4.5,
    reviewsCount: 89,
    images: ['https://picsum.photos/seed/shoes3/600/600'],
    isNewArrival: true,
    variants: [
      { id: 'v3', size: '41', color: 'Blue', stock: 20, sku: 'SPR-RN-BL-41' },
    ]
  },
  {
    id: '3',
    name: 'Elegance Stiletto',
    description: 'High-heeled fashion for grand occasions. Comfort cushioned insole for all-night wear.',
    price: 5500,
    discountPrice: 4200,
    categoryId: 'women',
    subcategoryId: 'w-heels',
    brand: 'Venturini',
    rating: 4.9,
    reviewsCount: 56,
    images: ['https://picsum.photos/seed/shoes4/600/600'],
    variants: [
      { id: 'v4', size: '37', color: 'Red', stock: 5, sku: 'VT-HE-RD-37' },
    ]
  },
  {
    id: '4',
    name: 'Urban Explorer Boots',
    description: 'Rugged outdoor boots designed for heavy-duty use. Waterproof leather and reinforced stitching.',
    price: 7800,
    discountPrice: 6500,
    categoryId: 'men',
    subcategoryId: 'm-boots',
    brand: 'Apex',
    rating: 4.7,
    reviewsCount: 42,
    images: ['https://picsum.photos/seed/shoes5/600/600'],
    variants: [
      { id: 'v5', size: '42', color: 'Tan', stock: 12, sku: 'APX-BT-TN-42' },
    ]
  },
  {
    id: '5',
    name: 'Velvet Flat Ballerinas',
    description: 'Chic and comfortable flats for daily wear. Soft velvet exterior and flexible sole.',
    price: 2400,
    categoryId: 'women',
    subcategoryId: 'w-flats',
    brand: 'Nino Rossi',
    rating: 4.3,
    reviewsCount: 78,
    images: ['https://picsum.photos/seed/shoes6/600/600'],
    variants: [
      { id: 'v6', size: '38', color: 'Black', stock: 25, sku: 'NR-FB-BLK-38' },
    ]
  },
  {
    id: '6',
    name: 'Junior Spark Sneakers',
    description: 'Vibrant and durable sneakers for active kids. Easy-strap closure for independent wear.',
    price: 1800,
    categoryId: 'kids',
    subcategoryId: 'k-casual',
    brand: 'Sprint',
    rating: 4.6,
    reviewsCount: 156,
    images: ['https://picsum.photos/seed/shoes7/600/600'],
    variants: [
      { id: 'v7', size: '32', color: 'Multicolor', stock: 40, sku: 'SPR-K-MC-32' },
    ]
  },
  {
    id: '7',
    name: 'Monk Strap Professional',
    description: 'Sophisticated monk strap shoes for a sharp business look. Hand-burnished finish.',
    price: 5200,
    categoryId: 'men',
    subcategoryId: 'm-formal',
    brand: 'Venturini',
    rating: 4.8,
    reviewsCount: 31,
    images: ['https://picsum.photos/seed/shoes8/600/600'],
    variants: [
      { id: 'v8', size: '41', color: 'Dark Brown', stock: 10, sku: 'VT-MS-DB-41' },
    ]
  },
  {
    id: '8',
    name: 'Glamour Platform Sandals',
    description: 'Stylish platform sandals for summer parties. Trendy ankle strap and comfortable height.',
    price: 3800,
    discountPrice: 3200,
    categoryId: 'women',
    subcategoryId: 'w-sandals',
    brand: 'Moochie',
    rating: 4.4,
    reviewsCount: 22,
    images: ['https://picsum.photos/seed/shoes9/600/600'],
    variants: [
      { id: 'v9', size: '36', color: 'Gold', stock: 14, sku: 'MC-PS-GD-36' },
    ]
  },
  {
    id: '9',
    name: 'Tough-Track School Shoes',
    description: 'Built to last through every recess. Scuff-resistant leather and anti-bacterial lining.',
    price: 1600,
    categoryId: 'kids',
    subcategoryId: 'k-school',
    brand: 'Apex',
    rating: 4.9,
    reviewsCount: 310,
    images: ['https://picsum.photos/seed/shoes10/600/600'],
    variants: [
      { id: 'v10', size: '34', color: 'Black', stock: 100, sku: 'APX-KS-BLK-34' },
    ]
  }
];
