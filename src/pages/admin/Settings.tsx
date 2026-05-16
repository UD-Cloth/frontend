import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Save, Store, CreditCard, Truck, Globe, Loader2 } from "lucide-react";
import { z } from "zod";
import { useSettings, useUpdateSettings, StoreSettings } from '@/hooks/useSettings';

// Bug #33: zod-based contact email validation for Settings
const contactEmailSchema = z.string().email("Please enter a valid email address");

const DEFAULTS: StoreSettings = {
    storeName: "URBAN DRAPE",
    contactEmail: "support@urbandrape.com",
    storeDescription: "Premium urban clothing brand.",
    supportPhone: "+91 9876543210",
    defaultCurrency: "INR",
    streetAddress: "",
    city: "Mumbai",
    stateProvince: "Maharashtra",
    zipCode: "400001",
    codEnabled: true,
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    flatShippingRate: 150,
    freeShippingThreshold: 2000,
    taxPercentage: 10,
    taxIncludedInPrice: true,
    announcementText: "",
    isAnnouncementActive: true,
    isAnnouncementScrolling: true,
};

export default function AdminSettings() {
    const { toast } = useToast();
    const { data, isLoading } = useSettings();
    const updateMut = useUpdateSettings();
    const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
    // Bug #33: track validation error for contact email
    const [emailError, setEmailError] = useState<string | null>(null);

    useEffect(() => {
        if (data) {
            setSettings({ ...DEFAULTS, ...data });
        }
    }, [data]);

    const handleSave = async () => {
        // Bug #33: validate contact email before saving
        const parsed = contactEmailSchema.safeParse(settings.contactEmail);
        if (!parsed.success) {
            const msg = parsed.error.errors[0]?.message || "Invalid email";
            setEmailError(msg);
            toast({
                variant: "destructive",
                title: "Invalid Contact Email",
                description: msg,
            });
            return;
        }
        setEmailError(null);
        try {
            await updateMut.mutateAsync(settings);
            toast({
                title: "Settings Saved",
                description: "Your store configurations have been successfully updated.",
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Failed to Save",
                description: err?.response?.data?.message || "Could not save settings",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage website configuration, tax rules, shipping, and your admin profile.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={updateMut.isPending} className="gap-2">
                    {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {updateMut.isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="bg-white border w-full justify-start h-auto p-1">
                    <TabsTrigger value="general" className="py-2.5 gap-2"><Store className="h-4 w-4" /> General</TabsTrigger>
                    <TabsTrigger value="store" className="py-2.5 gap-2"><Globe className="h-4 w-4" /> Store Details</TabsTrigger>
                    <TabsTrigger value="payment" className="py-2.5 gap-2"><CreditCard className="h-4 w-4" /> Payment</TabsTrigger>
                    <TabsTrigger value="shipping" className="py-2.5 gap-2"><Truck className="h-4 w-4" /> Shipping & Tax</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic configuration for your storefront.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Store Name</Label>
                                    <Input value={settings.storeName} onChange={(e) => setSettings({...settings, storeName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Email</Label>
                                    <Input
                                        value={settings.contactEmail}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setSettings({ ...settings, contactEmail: v });
                                            // Bug #33: live-validate
                                            const r = contactEmailSchema.safeParse(v);
                                            setEmailError(r.success ? null : (r.error.errors[0]?.message || "Invalid email"));
                                        }}
                                        type="email"
                                        aria-invalid={!!emailError}
                                    />
                                    {emailError && <p className="text-sm text-destructive">{emailError}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Store Description / Meta Description</Label>
                                <Textarea
                                    value={settings.storeDescription}
                                    onChange={(e) => setSettings({...settings, storeDescription: e.target.value})}
                                    className="h-24"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Support Phone Number</Label>
                                    {/* Bug #34: phone accepts only digits, +, -, spaces */}
                                    <Input
                                        value={settings.supportPhone}
                                        type="tel"
                                        inputMode="tel"
                                        onKeyPress={(e) => {
                                            if (!/[\d+\-\s]/.test(e.key)) e.preventDefault();
                                        }}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/[^\d+\-\s]/g, '');
                                            setSettings({ ...settings, supportPhone: cleaned });
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <select value={settings.defaultCurrency} onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Announcement Bar Text</Label>
                                <Input value={settings.announcementText} onChange={(e) => setSettings({...settings, announcementText: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={settings.isAnnouncementActive} onChange={(e) => setSettings({...settings, isAnnouncementActive: e.target.checked})} />
                                    Announcement Active
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={settings.isAnnouncementScrolling} onChange={(e) => setSettings({...settings, isAnnouncementScrolling: e.target.checked})} />
                                    Scroll Animation
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="store" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Physical Address</CardTitle>
                            <CardDescription>The official registered address of your business.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Street Address</Label>
                                <Input value={settings.streetAddress} onChange={(e) => setSettings({...settings, streetAddress: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input value={settings.city} onChange={(e) => setSettings({...settings, city: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>State / Province</Label>
                                    <Input value={settings.stateProvince} onChange={(e) => setSettings({...settings, stateProvince: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>ZIP / Postal Code</Label>
                                    <Input value={settings.zipCode} onChange={(e) => setSettings({...settings, zipCode: e.target.value})} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Payment Gateways</CardTitle>
                            <CardDescription>Configure how customers can pay during checkout.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Cash on Delivery (COD)</Label>
                                    <p className="text-sm text-slate-500">Allow customers to pay upon receiving the order.</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="cod-active" checked={settings.codEnabled} onChange={(e) => setSettings({...settings, codEnabled: e.target.checked})} className="rounded text-primary focus:ring-primary w-5 h-5" />
                                    <label htmlFor="cod-active" className="text-sm font-medium cursor-pointer">Enabled</label>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-semibold">Razorpay Integration</Label>
                                    <p className="text-sm text-slate-500">Accept credit cards, UPI, and netbanking securely.</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="razorpay-active" checked={settings.razorpayEnabled} onChange={(e) => setSettings({...settings, razorpayEnabled: e.target.checked})} className="rounded text-primary focus:ring-primary w-5 h-5" />
                                    <label htmlFor="razorpay-active" className="text-sm font-medium cursor-pointer">Enabled</label>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-medium text-sm">Razorpay API Credentials</h4>
                                <div className="space-y-2">
                                    <Label>Key ID</Label>
                                    <Input type="password" placeholder="rzp_test_..." value={settings.razorpayKeyId} onChange={(e) => setSettings({...settings, razorpayKeyId: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Key Secret</Label>
                                    <Input type="password" placeholder="••••••••••••••••" value={settings.razorpayKeySecret} onChange={(e) => setSettings({...settings, razorpayKeySecret: e.target.value})} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Shipping & Tax Rules</CardTitle>
                            <CardDescription>Set up how shipping costs and taxes are calculated at checkout.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-slate-900 border-b pb-2">Shipping Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Flat Shipping Rate (₹)</Label>
                                        <Input type="number" value={settings.flatShippingRate} onChange={(e) => setSettings({...settings, flatShippingRate: Number(e.target.value)})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Free Shipping Threshold (₹)</Label>
                                        <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => setSettings({...settings, freeShippingThreshold: Number(e.target.value)})} />
                                        <p className="text-xs text-slate-500 mt-1">Orders above this amount ship free.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <h4 className="font-medium text-sm text-slate-900 border-b pb-2">Tax Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Default GST/Tax Percentage (%)</Label>
                                        <Input type="number" value={settings.taxPercentage} onChange={(e) => setSettings({...settings, taxPercentage: Number(e.target.value)})} />
                                    </div>
                                    <div className="flex items-center space-x-2 mt-8">
                                        <input type="checkbox" id="tax-included" checked={settings.taxIncludedInPrice} onChange={(e) => setSettings({...settings, taxIncludedInPrice: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                                        <label htmlFor="tax-included" className="text-sm font-medium cursor-pointer">Prices entered include tax</label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
