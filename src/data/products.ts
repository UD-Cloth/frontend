// Sprint 3: single source of truth for the `Product` shape. Several modules
// import `Product` from this module by historical accident; re-export the
// canonical type so they continue to compile.
export type { Product, AdminProduct } from "@/stores/productStore";

export const categories = [
  { id: "tshirts", name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop" },
  { id: "shirts", name: "Shirts", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop" },
  { id: "hoodies", name: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop" },
  { id: "jackets", name: "Jackets", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop" },
  { id: "jeans", name: "Jeans", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop" },
];

export const colorHexMap: Record<string, string> = {
  "White": "#FFFFFF",
  "Black": "#000000",
  "Navy": "#1e3a5f",
  "Light Blue": "#87CEEB",
  "Pink": "#FFB6C1",
  "Grey": "#808080",
  "Maroon": "#800000",
  "Blue": "#1e3a5f",
  "Dark Blue": "#1a1a2e",
  "Brown": "#8B4513",
  "Red Check": "#DC2626",
  "Blue Check": "#1e3a5f"
};
