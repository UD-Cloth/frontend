import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts, useAddProduct, useUpdateProduct, useCategories } from '@/hooks/useProducts';
import { Product } from '@/data/products';
import { useToast } from '@/components/ui/use-toast';
import { processProductImage } from '@/lib/imageUtils';

// 1. Setup Zod Schema for Validation
const productSchema = z.object({
    name: z.string().min(2, 'Product name is required').max(100),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    discountPrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    sku: z.string().min(1, 'SKU is required'),
    material: z.string().min(1, 'Fabric/Material is required'),
    status: z.enum(['active', 'inactive']),
    isFeatured: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    isTrending: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: products = [] } = useProducts();
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
    const addProductMutation = useAddProduct();
    const updateProductMutation = useUpdateProduct();
    const { toast } = useToast();

    const existingProduct = id ? products.find((p: any) => p._id === id || p.id === id) : undefined;

    // Specific Multi-Select Fields state (handled outside basic react-hook-form for simplicity)
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    // Image Preview State
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];
    const availableColors = ['Black', 'White', 'Navy', 'Grey', 'Red', 'Olive', 'Beige', 'Light Blue', 'Pink', 'Maroon', 'Blue', 'Dark Blue', 'Brown', 'Red Check', 'Blue Check'];

    const COLOR_HEX_MAP: Record<string, string> = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Navy': '#1e3a5f',
        'Grey': '#808080',
        'Red': '#DC2626',
        'Olive': '#808000',
        'Beige': '#F5F5DC',
        'Light Blue': '#87CEEB',
        'Pink': '#FFB6C1',
        'Maroon': '#800000',
        'Blue': '#1e3a5f',
        'Dark Blue': '#1a1a2e',
        'Brown': '#8B4513',
        'Red Check': '#DC2626',
        'Blue Check': '#1e3a5f'
    };

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: '',
            brand: '',
            description: '',
            status: 'active',
            isFeatured: false,
            isNewArrival: false,
            isTrending: false,
        },
    });

    useEffect(() => {
        if (existingProduct) {
            form.reset({
                name: existingProduct.name,
                category: typeof existingProduct.category === 'string' ? existingProduct.category : existingProduct.category?._id || '',
                brand: existingProduct.brand || '',
                description: existingProduct.description || '',
                status: (existingProduct.status as 'active' | 'inactive') || 'active',
                isFeatured: existingProduct.isFeatured,
                isNewArrival: existingProduct.isNewArrival,
                isTrending: existingProduct.isTrending,
                price: existingProduct.price,
                discountPrice: existingProduct.discountPrice,
                stock: existingProduct.stock,
                sku: existingProduct.sku,
                material: existingProduct.material,
            });
            setSelectedSizes(existingProduct.sizes || []);
            setSelectedColors((existingProduct.colors || []).map((c: any) => typeof c === 'string' ? c : c.name));
            setTags(existingProduct.tags || []);
            setImagePreviews(existingProduct.images || []);
        }
    }, [existingProduct, form]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const validFiles = filesArray.filter(file => file.type.startsWith('image/'));

            if (validFiles.length !== filesArray.length) {
                toast({
                    title: "Invalid file type",
                    description: "Only image files are allowed.",
                    variant: "destructive"
                });
            }

            try {
                // Process and resize all incoming images to standard 3:4 aspect ratio
                const processedImages = await Promise.all(
                    validFiles.map(file => processProductImage(file))
                );

                setImageFiles(prev => [...prev, ...validFiles]);
                setImagePreviews(prev => [...prev, ...processedImages]);
            } catch (error) {
                toast({
                    title: "Image Processing Error",
                    description: "Failed to resize and compress uploaded images.",
                    variant: "destructive"
                });
            }
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagsInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagsInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    async function onSubmit(data: ProductFormValues) {
        if (selectedSizes.length === 0) {
            toast({ title: "Sizes Required", description: "Please select at least one available size.", variant: "destructive" });
            return;
        }

        const newId = existingProduct ? (existingProduct as any)._id || existingProduct.id : undefined;

        const completeProduct = {
            ...data,
            sizes: selectedSizes,
            colors: selectedColors.map(c => ({ name: c, hex: COLOR_HEX_MAP[c] || '#000000' })),
            tags: tags,
            images: imagePreviews, // Storing blobs/urls for now
            rating: existingProduct?.rating || 0,
            reviewCount: existingProduct?.reviewCount || 0
        } as Omit<Product, 'id'>;

        try {
            if (existingProduct && newId) {
                await updateProductMutation.mutateAsync({ id: newId as string, data: completeProduct as Partial<Product> });
                toast({
                    title: "Product Updated",
                    description: `${data.name} has been successfully updated.`,
                });
            } else {
                await addProductMutation.mutateAsync(completeProduct as Partial<Product>);
                toast({
                    title: "Product Created",
                    description: `${data.name} has been successfully loaded into the catalog.`,
                });
            }
            navigate('/admin/products');
        } catch (error: any) {
            toast({
                title: "Error Saving Product",
                description: error.message || "An unexpected error occurred. Please try again.",
                variant: "destructive"
            });
        }
    }

    const { errors, isSubmitting } = form.formState;

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{existingProduct ? "Edit Product" : "Add New Product"}</h1>
                    <p className="text-muted-foreground">{existingProduct ? "Update product details." : "Upload a new clothing item to the store catalog."}</p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Name, description, and categorization.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input id="name" placeholder="e.g. Classic Oxford Men's Shirt" {...form.register('name')} />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select onValueChange={(val) => form.setValue('category', val)} defaultValue={form.getValues('category')} disabled={isCategoriesLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select category..."} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Brand Name *</Label>
                                        <Input id="brand" placeholder="e.g. Urban Drape" {...form.register('brand')} />
                                        {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Product Description *</Label>
                                    <Textarea id="description" placeholder="Describe the item here..." className="min-h-[120px]" {...form.register('description')} />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Uploads */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>Will be automatically resized & cropped to 900x1200px (3:4 ratio) for perfect alignment.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 border-muted-foreground/20 hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            </div>
                                            <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>

                                    {/* Image Previews */}
                                    {imagePreviews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative aspect-square rounded-md overflow-hidden border group">
                                                    <img src={preview} alt={`Preview ${index}`} className="object-cover w-full h-full" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variants and Materials */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Variants & Material</CardTitle>
                                <CardDescription>Sizes, colors, fabric choices.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Available Sizes *</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSizes.map(size => (
                                            <Button
                                                key={size}
                                                type="button"
                                                variant={selectedSizes.includes(size) ? "default" : "outline"}
                                                className="w-12"
                                                onClick={() => {
                                                    setSelectedSizes(prev =>
                                                        prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
                                                    )
                                                }}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Available Colors</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableColors.map(color => (
                                            <Button
                                                key={color}
                                                type="button"
                                                variant={selectedColors.includes(color) ? "default" : "outline"}
                                                onClick={() => {
                                                    setSelectedColors(prev =>
                                                        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                                                    )
                                                }}
                                            >
                                                {color}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="material">Fabric/Material *</Label>
                                    <Input id="material" placeholder="e.g. 100% Cotton, Denim, Leather" {...form.register('material')} />
                                    {errors.material && <p className="text-sm text-destructive">{errors.material.message}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-8">
                        {/* Pricing and Inventory */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing & Inventory</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Regular Price ($) *</Label>
                                    <Input id="price" type="number" step="0.01" {...form.register('price')} />
                                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountPrice">Discount Price ($)</Label>
                                    <Input id="discountPrice" type="number" step="0.01" placeholder="Optional" {...form.register('discountPrice')} />
                                    {errors.discountPrice && <p className="text-sm text-destructive">{errors.discountPrice.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock Quantity *</Label>
                                    <Input id="stock" type="number" {...form.register('stock')} />
                                    {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU / Product Code *</Label>
                                    <Input id="sku" placeholder="e.g. TS-001" {...form.register('sku')} />
                                    {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Organization and Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Product Status</Label>
                                            <p className="text-xs text-muted-foreground">Select whether item is active.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Active</span>
                                            <Switch
                                                checked={form.watch('status') === 'active'}
                                                onCheckedChange={(checked) => form.setValue('status', checked ? 'active' : 'inactive')}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Featured Product</Label>
                                        </div>
                                        <Switch
                                            checked={form.watch('isFeatured')}
                                            onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>New Arrival</Label>
                                        </div>
                                        <Switch
                                            checked={form.watch('isNewArrival')}
                                            onCheckedChange={(checked) => form.setValue('isNewArrival', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Trending Product</Label>
                                        </div>
                                        <Switch
                                            checked={form.watch('isTrending')}
                                            onCheckedChange={(checked) => form.setValue('isTrending', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <Input
                                        placeholder="Press enter to add tag..."
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        onKeyDown={handleTagAdd}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {tags.map(tag => (
                                            <Badge key={tag} variant="secondary" className="gap-1 rounded-sm">
                                                {tag}
                                                <X className="w-3 h-3 cursor-pointer hover:text-destructive text-muted-foreground" onClick={() => removeTag(tag)} />
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 border-t pt-6">
                    <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
