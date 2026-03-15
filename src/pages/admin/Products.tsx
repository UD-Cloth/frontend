import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export default function AdminProducts() {
    const navigate = useNavigate();
    const { data: products = [], isLoading } = useProducts();
    const deleteProductMutation = useDeleteProduct();
    const [searchQuery, setSearchQuery] = useState('');
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // A simple filter function for the mock data
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">
                        Manage your store's inventory, pricing, and variants.
                    </p>
                </div>

                <Button className="gap-2" onClick={() => navigate('/admin/products/new')}>
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            {/* Filter and search bar area */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filters</Button>
            </div>

            {/* The main data table */}
            {isLoading ? (
                <div className="flex h-48 items-center justify-center rounded-md border bg-white dark:bg-slate-950">
                    <p className="text-muted-foreground animate-pulse">Loading products...</p>
                </div>
            ) : (
                <div className="rounded-md border bg-white dark:bg-slate-950">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                                <TableRow key={product._id || product.id}>
                                    <TableCell className="font-medium">#{product._id || product.id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{typeof product.category === 'string' ? product.category : product.category?.name || "Unknown"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.status === 'active'
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={product.stock === 0 ? "text-destructive font-bold" : product.stock < 10 ? "text-yellow-600 font-semibold" : ""}>
                                          {product.stock === 0 ? "Out of Stock" : product.stock < 10 ? `Low (${product.stock})` : product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2" onClick={() => navigate(`/admin/products/edit/${product._id || product.id}`)}>
                                                    <Edit className="h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive focus:text-destructive"
                                                    onClick={() => setProductToDelete(product._id || product.id || null)}
                                                >
                                                    <Trash2 className="h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Empty state if search yields no results */}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product from your store.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={async () => {
                                if (productToDelete) {
                                    try {
                                        await deleteProductMutation.mutateAsync(productToDelete);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                    setProductToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
