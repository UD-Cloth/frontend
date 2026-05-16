// Canonical Product shape used across the app. Three legacy/runtime sources
// exist (backend `/api/products`, the admin form, and a few seed fixtures), so
// most fields are optional and call-sites render gracefully whichever fields
// are present.
export type Product = {
  id: string;
  /** Backend Mongo id when the product comes from the API. */
  _id?: string;
  name: string;
  category: string | { _id?: string; id?: string; name: string };
  brand?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  /** Pre-discount price from backend. Some pages use this directly. */
  originalPrice?: number;
  sizes: string[];
  colors: string[] | { name: string; hex: string }[];
  material?: string;
  /** Either `stock` (frontend convention) or `countInStock` (backend) may carry the qty. */
  stock?: number;
  countInStock?: number;
  variantStock?: Record<string, number>; // key: "Color-Size", value: quantity
  sku?: string;
  tags?: string[];
  /** Single hero image fallback used by some legacy components. */
  image?: string;
  images?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  /** Backend alias used by some carousels. */
  isNewItem?: boolean;
  /** Some legacy components looked for plain `isNew`. */
  isNew?: boolean;
  isTrending?: boolean;
  isSale?: boolean;
  status?: 'active' | 'inactive';
  rating?: number;
  reviewCount?: number;
  fabric?: string;
};

// For compatibility in some existing files
export type AdminProduct = Product;
