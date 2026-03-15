import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit2, Trash2, Loader2, Upload } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description?: string;
  image: string;
  images?: string[];
  category: { _id: string; name: string } | string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  fabric?: string;
  isNewItem?: boolean;
  isTrending?: boolean;
}

const emptyForm = {
  name: "",
  price: "",
  originalPrice: "",
  description: "",
  image: "",
  images: "" as string | string[],
  category: "",
  sizes: "",
  colors: "",
  fabric: "",
  isNewItem: false,
  isTrending: false,
};

function parseColors(val: string): { name: string; hex: string }[] {
  if (!val.trim()) return [];
  return val.split(",").map((s) => {
    const part = s.trim().split(/\s+/);
    const name = part[0] || "Unknown";
    const hex = part[1] || "#000000";
    return { name, hex };
  });
}

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get<Product[]>("/products");
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Category[]>("/categories");
      return data;
    },
  });

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (typeof p.category === "object" ? p.category?.name : "").toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.post("/products", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Product created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const { data } = await api.put(`/products/${id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Product updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setDeleteId(null);
      toast({ title: "Product deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    // Handle case where category might be populated as an object vs just an ID string
    const catId = typeof p.category === "object" ? (p.category as any)?._id : p.category;
    setForm({
      name: p.name,
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
      description: p.description || "",
      image: p.image || "",
      images: Array.isArray(p.images) ? p.images.join("\n") : "",
      category: catId || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : "",
      colors: Array.isArray(p.colors)
        ? p.colors.map((c) => `${c.name} ${c.hex}`).join(", ")
        : "",
      fabric: p.fabric || "",
      isNewItem: p.isNewItem ?? false,
      isTrending: p.isTrending ?? false,
    });
    setEditingId(p._id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const categoryId = form.category.trim() || undefined;
    if (!categoryId && !editingId) {
      toast({ title: "Category is required", variant: "destructive" });
      return;
    }
    const body: Record<string, unknown> = {
      name: form.name.trim() || "Sample name",
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      description: form.description.trim() || "Sample description",
      image: form.image.trim() || "/images/sample.jpg",
      images: typeof form.images === "string"
        ? form.images.split("\n").map((s) => s.trim()).filter(Boolean)
        : form.images,
      category: categoryId,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: parseColors(form.colors),
      fabric: form.fabric.trim() || "Sample fabric",
      isNewItem: form.isNewItem,
      isTrending: form.isTrending,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, body });
    } else {
      createMutation.mutate(body);
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="bg-zinc-900 text-white hover:bg-zinc-800" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {typeof product.category === "object"
                      ? (product.category as { name: string })?.name
                      : product.category}
                  </TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(product)}
                      >
                        <Edit2 className="h-4 w-4 text-zinc-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteId(product._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!productsLoading && filteredProducts.length === 0 && (
          <div className="py-12 text-center text-zinc-500">No products found.</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Original price (₹)</label>
                <Input
                  type="number"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Image URL</label>
              <div className="flex gap-2">
                <Input
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://... or upload below"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const { url } = await api.uploadImage(file);
                      setForm((f) => ({ ...f, image: url }));
                      toast({ title: "Image uploaded" });
                    } catch (err) {
                      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
                    } finally {
                      setUploadingImage(false);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  title="Upload image"
                >
                  {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Sizes (comma-separated)</label>
              <Input
                value={form.sizes}
                onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                placeholder="S, M, L, XL"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Colors (e.g. Black #000000, White #FFFFFF)</label>
              <Input
                value={form.colors}
                onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
                placeholder="Black #000000, White #FFFFFF"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Fabric</label>
              <Input
                value={form.fabric}
                onChange={(e) => setForm((f) => ({ ...f, fabric: e.target.value }))}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isNewItem}
                  onChange={(e) => setForm((f) => ({ ...f, isNewItem: e.target.checked }))}
                />
                <span className="text-sm">New arrival</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isTrending}
                  onChange={(e) => setForm((f) => ({ ...f, isTrending: e.target.checked }))}
                />
                <span className="text-sm">Trending</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
