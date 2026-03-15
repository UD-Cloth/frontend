/**
 * Product type used across the app. API returns products with _id and populated category.
 */
export interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string | { _id: string; name: string };
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating?: number;
  reviewCount?: number;
  description?: string;
  fabric?: string;
  isNew?: boolean;
  isNewItem?: boolean;
  isTrending?: boolean;
  countInStock?: number;
}
