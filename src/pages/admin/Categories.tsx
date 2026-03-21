import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, Trash2, Loader2, Plus } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, ApiCategory } from '@/hooks/useProducts';

export default function AdminCategories() {
    const { data: categories = [], isLoading } = useCategories();
    const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
    const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
    const { toast } = useToast();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<ApiCategory | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
    
    const [formData, setFormData] = useState({ name: '', image: '' });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenForm = (category?: ApiCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, image: category.image || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', image: '' });
        }
        setIsFormOpen(true);
    };

    const handleFormSubmit = () => {
        if (!formData.name || !formData.image) {
            toast({
                title: "Validation Error",
                description: "Name and image URL are required.",
                variant: "destructive",
            });
            return;
        }

        if (editingCategory) {
            updateCategory(
                { id: editingCategory._id, data: formData },
                {
                    onSuccess: () => {
                        setIsFormOpen(false);
                        toast({ title: "Category Updated", description: "The category has been successfully updated." });
                    },
                    onError: (error: any) => {
                        toast({ title: "Error", description: error.message || "Failed to update category.", variant: "destructive" });
                    }
                }
            );
        } else {
            createCategory(
                formData,
                {
                    onSuccess: () => {
                        setIsFormOpen(false);
                        toast({ title: "Category Created", description: "The new category has been successfully created." });
                    },
                    onError: (error: any) => {
                        toast({ title: "Error", description: error.message || "Failed to create category.", variant: "destructive" });
                    }
                }
            );
        }
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;
        deleteCategory(categoryToDelete._id, {
            onSuccess: () => {
                setCategoryToDelete(null);
                toast({
                    variant: "destructive",
                    title: "Category Deleted",
                    description: `${categoryToDelete.name} has been permanently removed.`,
                });
            },
            onError: (error: any) => {
                setCategoryToDelete(null);
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete category.",
                    variant: "destructive",
                });
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage product categories.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium self-center">
                        Total: {categories.length}
                    </div>
                    <Button onClick={() => handleOpenForm()} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-900 w-24">Image</TableHead>
                                <TableHead className="font-semibold text-slate-900">Name</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell>
                                            <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded-md border" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{category.name}</div>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    
                                                    <DropdownMenuItem onClick={() => handleOpenForm(category)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Category
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => setCategoryToDelete(category)}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Category
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="cat-name" className="text-sm font-medium">Category Name</label>
                        <Input 
                            id="cat-name"
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            placeholder="e.g. T-Shirts" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="cat-image" className="text-sm font-medium">Image URL</label>
                        <Input 
                            id="cat-image"
                            value={formData.image} 
                            onChange={(e) => setFormData({...formData, image: e.target.value})} 
                            placeholder="https://..." 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button onClick={handleFormSubmit} disabled={isCreating || isUpdating}>
                        {(isCreating || isUpdating) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {editingCategory ? 'Save Changes' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete the category "{categoryToDelete?.name}"? Make sure no products are using it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={confirmDelete}>
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
