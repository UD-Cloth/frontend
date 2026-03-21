import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Plus, Save, Trash2, Star } from "lucide-react";
import { useCMSData, useUpdateHeroSlides, useUpdatePromoBanner, useUpdateTestimonials, HeroSlide, Testimonial } from '@/hooks/useCMS';
import api from '@/lib/api';

export default function AdminCMS() {
    const { toast } = useToast();
    const { data: cmsData, isLoading: isLoadingCMS } = useCMSData();
    const updateHeroSlides = useUpdateHeroSlides();
    const updatePromoBanner = useUpdatePromoBanner();
    const updateTestimonials = useUpdateTestimonials();

    // Local state for editable data
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [promoBanner, setPromoBanner] = useState({ isActive: true, text: '', bgColor: '#ea384c', textColor: '#ffffff', link: '' });
    const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
    const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', content: '', rating: 5 });
    const [isSaving, setIsSaving] = useState(false);

    // Update local state when CMS data loads
    useEffect(() => {
        if (cmsData) {
            setHeroSlides(cmsData.heroSlides);
            setPromoBanner(cmsData.promoBanner);
            setTestimonialsList(cmsData.testimonials);
        }
    }, [cmsData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save all changes in parallel
            await Promise.all([
                updateHeroSlides.mutateAsync(heroSlides),
                updatePromoBanner.mutateAsync(promoBanner),
                updateTestimonials.mutateAsync(testimonialsList),
            ]);
            toast({
                title: "Changes Saved",
                description: "The CMS content has been successfully updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save changes. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSlideImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const { url } = await api.uploadImage(file);
                setHeroSlides(heroSlides.map(slide =>
                    slide.id === id ? { ...slide, image: url } : slide
                ));
                toast({
                    title: "Success",
                    description: "Image uploaded successfully.",
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to upload image. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleAddSlide = () => {
        const newSlide: HeroSlide = {
            id: crypto.randomUUID(),
            image: '',
            title: 'New Slider Headline',
            subtitle: 'New slider description goes here',
            cta: 'Click Here',
            link: '/'
        };
        setHeroSlides([...heroSlides, newSlide]);
    };

    const handleDeleteSlide = (id: string) => {
        setHeroSlides(heroSlides.filter(slide => slide.id !== id));
    };

    const handleUpdateSlide = (id: string, updates: Partial<HeroSlide>) => {
        setHeroSlides(heroSlides.map(slide =>
            slide.id === id ? { ...slide, ...updates } : slide
        ));
    };

    const handleAddTestimonial = () => {
        if (!newTestimonial.name || !newTestimonial.content) {
            toast({ title: "Error", description: "Name and review content are required", variant: "destructive" });
            return;
        }
        const testimonial: Testimonial = {
            id: crypto.randomUUID(),
            name: newTestimonial.name,
            role: newTestimonial.role,
            content: newTestimonial.content,
            rating: newTestimonial.rating
        };
        setTestimonialsList([...testimonialsList, testimonial]);
        setNewTestimonial({ name: '', role: '', content: '', rating: 5 });
        toast({ title: "Success", description: "Testimonial added" });
    };

    const handleDeleteTestimonial = (id: string) => {
        setTestimonialsList(testimonialsList.filter(t => t.id !== id));
    };

    if (isLoadingCMS) {
        return <div className="flex items-center justify-center py-12">Loading CMS data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your homepage sliders, banners, and promotional sections.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="hero" className="space-y-6">
                <TabsList className="bg-white border w-full justify-start h-auto p-1">
                    <TabsTrigger value="hero" className="py-2.5">Hero Banners</TabsTrigger>
                    <TabsTrigger value="promotions" className="py-2.5">Promotional Sections</TabsTrigger>
                    <TabsTrigger value="testimonials" className="py-2.5">Testimonials</TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Homepage Hero Slider</CardTitle>
                                <CardDescription>Manage the main sliding banners on the homepage.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleAddSlide}>
                                <Plus className="h-4 w-4" /> Add Slide
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {heroSlides.map((slide) => (
                                <div key={slide.id} className="flex gap-6 p-4 border rounded-xl bg-slate-50 relative group">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteSlide(slide.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="w-48 h-32 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-dashed border-slate-300 relative overflow-hidden group/image cursor-pointer">
                                        {slide.image ? (
                                            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center">
                                                <Plus className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                                                <span className="text-xs text-slate-500 font-medium">Upload Image</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => handleSlideImageUpload(slide.id, e)}
                                        />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Headline</Label>
                                                <Input
                                                    value={slide.title}
                                                    onChange={e => handleUpdateSlide(slide.id, { title: e.target.value })}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Button Text</Label>
                                                <Input
                                                    value={slide.cta}
                                                    onChange={e => handleUpdateSlide(slide.id, { cta: e.target.value })}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 block">
                                                <Label>Link/URL</Label>
                                                <Input
                                                    value={slide.link}
                                                    onChange={e => handleUpdateSlide(slide.id, { link: e.target.value })}
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div className="space-y-2 block">
                                                <Label>Subheadline</Label>
                                                <Input
                                                    value={slide.subtitle}
                                                    onChange={e => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {heroSlides.length === 0 && (
                                <div className="text-center py-12 text-slate-500">No slides configured. Add one above.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="promotions" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Special Offers Banner</CardTitle>
                            <CardDescription>The static promotional banner displayed across the site.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Banner Status</Label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="promo-active"
                                        className="rounded text-primary focus:ring-primary w-4 h-4"
                                        checked={promoBanner.isActive}
                                        onChange={e => setPromoBanner({ ...promoBanner, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="promo-active" className="text-sm cursor-pointer">Active on Homepage</label>
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Label>Announcement Text</Label>
                                <Input
                                    value={promoBanner.text}
                                    onChange={e => setPromoBanner({ ...promoBanner, text: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 mt-4">
                                <Label>Action Link</Label>
                                <Input
                                    value={promoBanner.link}
                                    onChange={e => setPromoBanner({ ...promoBanner, link: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Background Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={promoBanner.bgColor}
                                            onChange={e => setPromoBanner({ ...promoBanner, bgColor: e.target.value })}
                                            className="w-12 p-1"
                                        />
                                        <Input
                                            value={promoBanner.bgColor}
                                            onChange={e => setPromoBanner({ ...promoBanner, bgColor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Text Color (Hex)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={promoBanner.textColor}
                                            onChange={e => setPromoBanner({ ...promoBanner, textColor: e.target.value })}
                                            className="w-12 p-1"
                                        />
                                        <Input
                                            value={promoBanner.textColor}
                                            onChange={e => setPromoBanner({ ...promoBanner, textColor: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="testimonials" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Customer Reviews</CardTitle>
                                <CardDescription>Manage the featured testimonials on the homepage.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Add New Testimonial Form */}
                            <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
                                <h4 className="font-medium text-sm">Add New Review</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Customer Name</Label>
                                        <Input value={newTestimonial.name} onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })} placeholder="John Doe" className="bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role/Title (Optional)</Label>
                                        <Input value={newTestimonial.role} onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })} placeholder="Verified Buyer" className="bg-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Review Content</Label>
                                    <Textarea value={newTestimonial.content} onChange={e => setNewTestimonial({ ...newTestimonial, content: e.target.value })} placeholder="This product is amazing..." className="bg-white" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <Label>Rating</Label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 cursor-pointer ${star <= newTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                                                    onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button onClick={handleAddTestimonial}>Add Review</Button>
                                </div>
                            </div>

                            {/* List Existing Testimonials */}
                            <div className="grid gap-4 mt-8">
                                {testimonialsList.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">No testimonials added yet.</div>
                                ) : (
                                    testimonialsList.map((t) => (
                                        <div key={t.id} className="flex justify-between items-start p-4 border rounded-lg bg-white relative group">
                                            <div className="space-y-1 pr-12">
                                                <div className="flex gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <p className="text-sm font-medium">"{t.content}"</p>
                                                <p className="text-xs text-muted-foreground">- {t.name} {t.role && `(${t.role})`}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteTestimonial(t.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
