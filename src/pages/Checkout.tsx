import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { useAuthContext } from "@/context/AuthContext";
// Bug #29: read wishlist context so we can clear purchased items post-order
import { useWishlist } from "@/context/WishlistContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/components/ui/use-toast";
import { useValidatePromoCode, useLogAbandonedCart } from "@/hooks/useMarketing";
import { ShieldCheck, ArrowLeft, CheckCircle2, MapPin, User, Truck, CreditCard, Plus, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import SEO from "@/components/SEO";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const checkoutSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
    email: z.string().email("Invalid email address"),
    phone: z.string().refine((val) => isValidPhoneNumber(val), "Invalid phone number"),
    address: z.string().min(5, "Address is too short"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    // Bug #102: Indian ZIP codes are exactly 6 digits
    zipCode: z.string().regex(/^\d{6}$/, "PIN code must be exactly 6 digits"),
    saveAddress: z.boolean().default(false),
    // Sprint 1 / BUG-F-044: Only 'cod' is currently accepted. 'online' option in
    // the UI is disabled until a real payment gateway is wired up.
    paymentMethod: z.literal('cod'),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { items, clearCart } = useCartStore();
    const createOrder = useCreateOrder();
    const { user } = useAuthContext();
    // Bug #29: pull wishlist state so we can prune just-purchased items.
    const { items: wishlistItems, removeFromWishlist } = useWishlist();
    // Bug #167: dropped redundant `isSubmitting` — createOrder.isPending is the
    // single source of truth for the in-flight order request.
    const isSubmitting = createOrder.isPending;
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
    // Bug #172: Promo/coupon codes at checkout (now backed by /promotions/validate)
    const [couponCode, setCouponCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState("");
    const validatePromo = useValidatePromoCode();
    const logAbandonedCart = useLogAbandonedCart();

    // Try to load saved address from localStorage
    const loadSavedData = () => {
        try {
            const saved = localStorage.getItem('urban-drape-saved-checkout');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load saved checkout data", e);
        }
        return null;
    };

    const savedData = loadSavedData();

    const form = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            firstName: savedData?.firstName || user?.firstName || "",
            lastName: savedData?.lastName || user?.lastName || "",
            email: savedData?.email || user?.email || "",
            phone: savedData?.phone || user?.phone || "",
            address: savedData?.address || "",
            city: savedData?.city || "",
            state: savedData?.state || "",
            zipCode: savedData?.zipCode || "",
            saveAddress: savedData?.saveAddress ?? true,
            paymentMethod: 'cod',
        },
        mode: "onTouched",
    });

    const watchZip = form.watch("zipCode");
    const watchEmail = form.watch("email");

    // Log abandoned cart on mount (fire-and-forget). If the user completes the
    // order, the record represents the cart-at-checkout-entry; backend dedupes
    // by sessionId. Runs once per checkout visit.
    useEffect(() => {
        if (!items || items.length === 0) return;
        try {
            let sessionId = localStorage.getItem('urban-drape-session-id');
            if (!sessionId) {
                sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
                localStorage.setItem('urban-drape-session-id', sessionId);
            }
            const totalValue = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
            logAbandonedCart.mutate({
                sessionId,
                items: items.map((it) => ({
                    productId: it.productId,
                    name: it.name,
                    image: it.image,
                    price: it.price,
                    quantity: it.quantity,
                    size: it.size,
                    color: it.color,
                })),
                totalValue,
                email: user?.email || form.getValues('email') || undefined,
                checkoutStarted: true,
                pageAbandoned: '/checkout',
            });
        } catch (err) {
            // fire-and-forget; ignore failures
            console.warn('Abandoned-cart log failed', err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Smart Email Suggestion Logic
    useEffect(() => {
        if (!watchEmail || !watchEmail.includes('@')) {
            setEmailSuggestions([]);
            return;
        }

        const [localPart, domainPart] = watchEmail.split('@');
        const popularDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

        if (domainPart !== undefined) {
            const matches = popularDomains.filter(d => d.startsWith(domainPart.toLowerCase()) && d !== domainPart.toLowerCase());
            setEmailSuggestions(matches.map(d => `${localPart}@${d}`));
        } else {
            setEmailSuggestions([]);
        }
    }, [watchEmail]);

    // Sprint 6 / BUG-F-040: cancel in-flight pincode lookups when the user
    // edits the field, and defensively guard against unexpected response shapes.
    useEffect(() => {
        if (!watchZip || watchZip.length !== 6) return;

        const controller = new AbortController();
        const fetchLocation = async () => {
            setIsFetchingLocation(true);
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${watchZip}`, {
                    signal: controller.signal,
                });
                const data = await res.json().catch(() => null);
                const first = Array.isArray(data) ? data[0] : null;
                const postOffices = first?.PostOffice;
                if (first?.Status === 'Success' && Array.isArray(postOffices) && postOffices.length > 0) {
                    const postOffice = postOffices[0] || {};
                    const city = postOffice.District || postOffice.Block || postOffice.Name;
                    const state = postOffice.State;

                    if (city) form.setValue('city', String(city), { shouldValidate: true });
                    if (state) form.setValue('state', String(state), { shouldValidate: true });

                    if (city || state) {
                        toast({
                            title: 'Location Auto-filled',
                            description: `Found ${city || ''}${city && state ? ', ' : ''}${state || ''}`,
                            duration: 2000,
                        });
                    }
                }
            } catch (error: any) {
                if (error?.name === 'AbortError') return; // user kept typing
                console.error('Postal code lookup failed', error);
            } finally {
                if (!controller.signal.aborted) {
                    setIsFetchingLocation(false);
                }
            }
        };

        fetchLocation();
        return () => controller.abort();
    }, [watchZip, form, toast]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const tax = totalPrice * 0.1;
    // Bug #40: Threshold is ₹2000 — ProductInfo delivery text was showing ₹999 (fixed there)
    const shipping = totalPrice > 2000 ? 0 : 150;
    const subtotalBeforeDiscount = totalPrice + tax + shipping;
    // Bug #10: never let a fixed-amount coupon take the total negative.
    const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            toast({
                variant: "destructive",
                title: "Invalid Coupon",
                description: "Please enter a coupon code.",
            });
            return;
        }
        try {
            const result = await validatePromo.mutateAsync({
                code: couponCode.trim().toUpperCase(),
                cartTotal: subtotalBeforeDiscount,
            });
            if (!result.valid) {
                toast({
                    variant: "destructive",
                    title: "Invalid Coupon",
                    description: result.message || "The coupon code you entered is not valid or has expired.",
                });
                setCouponCode("");
                setDiscountAmount(0);
                setAppliedCoupon("");
                return;
            }
            setDiscountAmount(result.discountAmount);
            setAppliedCoupon(couponCode.trim().toUpperCase());
            setCouponCode("");
            toast({
                title: "Coupon Applied!",
                description: `You saved ${formatPrice(result.discountAmount)} with coupon ${couponCode.trim().toUpperCase()}`,
            });
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Invalid Coupon",
                description: err?.response?.data?.message || "The coupon code you entered is not valid or has expired.",
            });
            setCouponCode("");
            setDiscountAmount(0);
            setAppliedCoupon("");
        }
    };

    const onSubmit = async (data: CheckoutValues) => {
        // Bug #167: createOrder.isPending now drives the submit-disabled state.

        try {
            // Bug #38: Validate cart is not empty before proceeding
            if (items.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Cart is Empty",
                    description: "Please add items to your cart before checking out.",
                });
                return;
            }

            const orderItems = items.map((item) => ({
                name: item.name,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                product: item.productId,
                size: item.size || 'Standard',
                color: item.color || 'Standard',
            }));

            await createOrder.mutateAsync({
                orderItems,
                // Bug #43: Include customer email and phone for order fulfillment
                customerEmail: data.email,
                customerPhone: data.phone,
                shippingAddress: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    city: data.city,
                    postalCode: data.zipCode,
                    state: data.state,
                },
                paymentMethod: 'Cash on Delivery',
                itemsPrice: totalPrice,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: grandTotal,
                ...(appliedCoupon ? { couponCode: appliedCoupon, discountAmount } : {}),
            });

            // Save details if requested
            if (data.saveAddress) {
                localStorage.setItem('urban-drape-saved-checkout', JSON.stringify({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    saveAddress: true
                }));
            } else {
                localStorage.removeItem('urban-drape-saved-checkout');
            }

            toast({
                title: "Order Placed Successfully! 🎉",
                description: "Your order has been confirmed and is being processed.",
            });

            // Bug #29: remove just-purchased items from wishlist so the user
            // doesn't see them as "saved for later" after they've already bought them.
            try {
                const purchasedIds = new Set(items.map((it) => it.productId));
                wishlistItems.forEach((wItem: any) => {
                    const wid = wItem._id || wItem.id;
                    if (wid && purchasedIds.has(wid)) {
                        removeFromWishlist(wid);
                    }
                });
            } catch (e) {
                // non-fatal — wishlist cleanup is best-effort
                console.warn('Wishlist cleanup post-purchase failed', e);
            }

            clearCart();
            navigate("/account");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Order Failed",
                description: "There was an issue processing your order. Please try again.",
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Truck className="w-10 h-10 text-slate-300" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                        <p className="text-muted-foreground mb-8">
                            Looks like you haven't added anything to your cart yet. Discover our latest collections to get started!
                        </p>
                        <Button asChild className="w-full h-12 text-md">
                            <Link to="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
            <SEO title="Checkout" noindex description="Complete your Urban Drape order." />
            <Header />

            <main className="flex-1 container max-w-7xl px-4 py-8 md:py-12 mx-auto">

                {/* Progress Indicator */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 w-full">
                    <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground mb-6 md:mb-0" asChild>
                        <Link to="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Shopping
                        </Link>
                    </Button>

                    <div className="flex items-center justify-center w-full md:w-auto">
                        {['Cart', 'Shipping', 'Payment', 'Done'].map((step, index, array) => (
                            <div key={step} className="flex items-center">
                                <div className="flex flex-col items-center justify-center relative">
                                    <div className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm z-10 transition-colors",
                                        index < 2 ? "bg-black text-white" : (index === 2 ? "bg-red-600 text-white shadow-md shadow-red-200" : "bg-slate-200 text-slate-500")
                                    )}>
                                        {index < 2 ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                                    </div>
                                    <span className={cn(
                                        "absolute top-10 text-xs font-medium whitespace-nowrap",
                                        index <= 2 ? "text-foreground" : "text-slate-400"
                                    )}>
                                        {step}
                                    </span>
                                </div>
                                {index < array.length - 1 && (
                                    <div className={cn(
                                        "w-12 sm:w-20 lg:w-32 h-[2px] mx-2 -translate-y-3",
                                        index < 2 ? "bg-black" : "bg-slate-200"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block w-32"></div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-12">

                        {/* Left Column - Form Sections */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-8">

                            {/* 1. Saved Address Section */}
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <MapPin className="w-5 h-5 mr-3 text-red-600" />
                                    Delivery Options
                                </h2>

                                {/* Sprint 6 / BUG-F-016: cards are now real buttons.
                                    "Use saved" repopulates the form from localStorage; "Add new"
                                    clears it and focuses the first field. */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {savedData && (
                                        <button
                                            type="button"
                                            aria-label="Use saved address"
                                            onClick={() => {
                                                form.reset({
                                                    firstName: savedData.firstName || '',
                                                    lastName: savedData.lastName || '',
                                                    email: savedData.email || '',
                                                    phone: savedData.phone || '',
                                                    address: savedData.address || '',
                                                    city: savedData.city || '',
                                                    state: savedData.state || '',
                                                    zipCode: savedData.zipCode || '',
                                                    saveAddress: true,
                                                    paymentMethod: 'cod',
                                                });
                                            }}
                                            className="text-left w-full border-2 border-red-600 bg-red-50/20 rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all hover:bg-red-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                        >
                                            <div className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-bl-lg">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-slate-100 text-xs font-medium px-2 py-0.5 rounded text-slate-600">Saved</span>
                                                <p className="font-semibold text-sm">{savedData.firstName} {savedData.lastName}</p>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed truncate">
                                                {savedData.address}<br />{savedData.city}, {savedData.state}<br />{savedData.zipCode}
                                            </p>
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        aria-label="Enter a new address"
                                        onClick={() => {
                                            form.reset({
                                                firstName: user?.firstName || '',
                                                lastName: user?.lastName || '',
                                                email: user?.email || '',
                                                phone: '',
                                                address: '',
                                                city: '',
                                                state: '',
                                                zipCode: '',
                                                saveAddress: true,
                                                paymentMethod: 'cod',
                                            });
                                            // Focus the address field — most useful place to land.
                                            setTimeout(() => {
                                                const el = document.querySelector<HTMLInputElement>('input[name="address"]');
                                                el?.focus();
                                            }, 0);
                                        }}
                                        className="border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors rounded-xl p-5 cursor-pointer flex flex-col items-center justify-center text-slate-500 min-h-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium">Add New Address</p>
                                    </button>
                                </div>
                            </div>

                            {/* 2. Contact Information */}
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <User className="w-5 h-5 mr-3 text-red-600" />
                                    Contact Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem>
                                            {/* Bug #92: indicate required field */}
                                            <FormLabel className="text-slate-700">First Name <span className="text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <Input className="h-11 bg-slate-50/50 text-base md:text-sm" placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Last Name <span className="text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <Input className="h-11 bg-slate-50/50 text-base md:text-sm" placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem className="relative">
                                            <FormLabel className="text-slate-700">Email Address <span className="text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    className="h-11 bg-slate-50/50 text-base md:text-sm"
                                                    placeholder="john@example.com"
                                                    {...field}
                                                    autoComplete="email"
                                                />
                                            </FormControl>
                                            {emailSuggestions.length > 0 && (
                                                <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-md shadow-lg mt-1 overflow-hidden">
                                                    {emailSuggestions.map(suggestion => (
                                                        <div
                                                            key={suggestion}
                                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-100"
                                                            onClick={() => {
                                                                form.setValue('email', suggestion, { shouldValidate: true });
                                                                setEmailSuggestions([]);
                                                            }}
                                                        >
                                                            {suggestion}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Phone Number <span className="text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <div className="flex bg-slate-50/50 rounded-md border border-input ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden h-11">
                                                    <PhoneInput
                                                        international
                                                        defaultCountry="IN"
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        className="w-full h-full px-3 py-2 text-sm [&>input]:bg-slate-50/50 [&>input]:border-none [&>input]:h-full [&>input]:focus-visible:ring-0 [&>input]:focus-visible:outline-none"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* 3. Shipping Address */}
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <Truck className="w-5 h-5 mr-3 text-red-600" />
                                    Shipping Address
                                </h2>

                                <div className="space-y-5">
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700">Address Line <span className="text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <Input className="h-11 bg-slate-50/50 text-base md:text-sm" placeholder="Flat No, Building Name, Street" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">City <span className="text-red-600">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 bg-slate-50/50 text-base md:text-sm" placeholder="Mumbai" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="state" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700">State <span className="text-red-600">*</span></FormLabel>
                                                <FormControl>
                                                    <Input className="h-11 bg-slate-50/50 text-base md:text-sm" placeholder="Maharashtra" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="zipCode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-slate-700 flex justify-between items-center">
                                                    <span>Postal Code <span className="text-red-600">*</span></span>
                                                    {isFetchingLocation && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                                </FormLabel>
                                                <FormControl>
                                                    {/* Bug #280: Prevent non-numeric input in postal code */}
                                                <Input
                                                    className="h-11 bg-slate-50/50 text-base md:text-sm"
                                                    placeholder="400001"
                                                    {...field}
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    autoComplete="postal-code"
                                                    onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                                    onPaste={(e) => {
                                                        // Bug #7: strip non-digits from pasted content
                                                        const pasted = e.clipboardData.getData('text');
                                                        const cleaned = pasted.replace(/\D/g, '').slice(0, 6);
                                                        if (cleaned !== pasted) {
                                                            e.preventDefault();
                                                            field.onChange(cleaned);
                                                        }
                                                    }}
                                                />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="pt-4 flex items-center space-x-2">
                                        <FormField control={form.control} name="saveAddress" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                        <FormLabel className="text-sm font-medium text-slate-700 cursor-pointer">
                                                            Save this address for next time
                                                        </FormLabel>
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Payment Method */}
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-3 text-red-600" />
                                    Payment Method
                                </h2>

                                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                    <FormItem className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div
                                                className={cn(
                                                    "border-2 rounded-xl p-5 cursor-pointer relative overflow-hidden transition-all",
                                                    field.value === 'cod' ? "border-red-600 bg-red-50/20" : "border-slate-200 bg-white hover:bg-slate-50"
                                                )}
                                                onClick={() => field.onChange('cod')}
                                            >
                                                {field.value === 'cod' && (
                                                    <div className="absolute top-0 right-0 p-1.5 bg-red-600 text-white rounded-bl-lg">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                        field.value === 'cod' ? "border-red-600" : "border-slate-300"
                                                    )}>
                                                        {field.value === 'cod' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                                                    </div>
                                                    <p className="font-semibold text-sm">Cash on Delivery</p>
                                                </div>
                                                <p className="text-sm text-slate-500 ml-7">Pay in cash when order arrives.</p>
                                            </div>

                                            {/* Sprint 1 / BUG-F-044: Online Payment is not wired to a gateway yet.
                                                The previous code routed the order to the same COD handler with
                                                paymentMethod: 'Online Payment', leaving the customer believing they had paid.
                                                Disable the option until a gateway integration is added. */}
                                            <div
                                                className={cn(
                                                    "border-2 rounded-xl p-5 relative overflow-hidden transition-all",
                                                    "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                                                )}
                                                aria-disabled="true"
                                                title="Online payments are coming soon. Please use Cash on Delivery."
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                                    <p className="font-semibold text-sm">Online Payment</p>
                                                    <span className="ml-auto text-[10px] uppercase tracking-wide bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Coming soon</span>
                                                </div>
                                                <p className="text-sm text-slate-500 ml-7">UPI, Credit/Debit Cards, Netbanking — not available yet.</p>
                                            </div>
                                        </div>
                                    </FormItem>
                                )} />
                            </div>

                        </div>

                        {/* Right Column - Order Summary (Sticky) */}
                        {/* Bug #82: cap sticky sidebar height + scroll on overflow so it
                            doesn't spill below the viewport on shorter screens. */}
                        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/20">
                                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {items.map((item) => (
                                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 group">
                                            <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover mix-blend-multiply transition-transform group-hover:scale-105"
                                                    />
                                                ) : null}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-medium text-sm line-clamp-2 text-slate-800 leading-tight">{item.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.size || 'Standard'}</span>
                                                    <span>•</span>
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.color || 'Standard'}</span>
                                                </p>
                                            </div>
                                            <div className="text-right flex flex-col justify-center">
                                                <span className="font-semibold text-sm text-slate-900">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                                <span className="text-xs text-slate-500 mt-1 mt-auto">Qty: {item.quantity}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-5 bg-slate-100" />

                                {/* Bug #172: Promo/coupon codes */}
                                <div className="mb-5 space-y-2">
                                    {/* Bug #182: associate label with input via htmlFor */}
                                    <label htmlFor="promo-code-input" className="text-sm font-medium text-slate-700">Promo Code</label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="promo-code-input"
                                            placeholder="Enter coupon code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!appliedCoupon}
                                            className="text-sm"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={applyCoupon}
                                            disabled={!!appliedCoupon || !couponCode || validatePromo.isPending}
                                        >
                                            {validatePromo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                        </Button>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-2">
                                            <span className="text-sm font-medium text-emerald-700">{appliedCoupon} Applied</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAppliedCoupon("");
                                                    setDiscountAmount(0);
                                                }}
                                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3.5 text-sm">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span className="font-medium text-slate-900">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Shipping</span>
                                        {shipping === 0 ? (
                                            <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Free</span>
                                        ) : (
                                            <span className="font-medium text-slate-900">{formatPrice(shipping)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Estimated Tax</span>
                                        <span className="font-medium text-slate-900">{formatPrice(tax)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-600 bg-emerald-50 px-3 py-2 rounded">
                                            <span className="font-medium">Discount</span>
                                            <span className="font-bold">-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-5 bg-slate-100" />

                                <div className="flex justify-between items-end mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-500 mb-1">Grand Total</span>
                                        <span className="text-[10px] text-slate-400">Inclusive of all taxes</span>
                                    </div>
                                    <span className="font-bold text-2xl tracking-tight text-slate-900">{formatPrice(grandTotal)}</span>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 text-base font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
                                    disabled={isSubmitting || createOrder.isPending}
                                >
                                    {isSubmitting ? "Processing Securely..." : `Place Order — ${formatPrice(grandTotal)}`}
                                </Button>

                                <div className="mt-5 space-y-3">
                                    <p className="text-xs text-center text-slate-500 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                                        100% Secure & Encrypted Payments
                                    </p>
                                    <p className="text-[10px] text-center text-slate-400 max-w-xs mx-auto leading-relaxed">
                                        By placing your order, you agree to our company Privacy Policy and Conditions of Use.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </main>

            <Footer />
        </div>
    );
}
