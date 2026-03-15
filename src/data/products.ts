/**
 * Product type used across the app. API returns products with _id and populated category.
 */
export interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  image?: string;
  images?: string[];
  category: string | { _id: string; name: string };
  sizes: string[];
  colors: any[];
  rating?: number;
  reviewCount?: number;
  description?: string;
  fabric?: string;
  material?: string;
  isNew?: boolean;
  isNewItem?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
  brand?: string;
  sku?: string;
  tags?: string[];
  countInStock?: number;
  stock?: number;
}
