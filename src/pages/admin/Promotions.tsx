import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, PowerOff, Power, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Promotion,
    usePromotions,
    useCreatePromotion,
    useUpdatePromotion,
    useDeletePromotion,
} from '@/hooks/useMarketing';
import { useSettings } from '@/hooks/useSettings';

export default function AdminPromotions() {
    const { data: promotions = [], isLoading } = usePromotions();
    const { data: settings } = useSettings();
    const createMut = useCreatePromotion();
    const updateMut = useUpdatePromotion();
    const deleteMut = useDeletePromotion();
    const { toast } = useToast();

    const currencySymbol = settings?.defaultCurrency === 'INR' ? '₹' : '$';

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
        code: '',
        type: 'percentage',
        value: 10,
        isActive: true,
    });

    const handleAddSubmit = async () => {
        if (!newPromo.code || !newPromo.value) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Code and Value are required fields.'
            });
            return;
        }

        try {
            await createMut.mutateAsync({
                code: newPromo.code.toUpperCase(),
                type: newPromo.type as 'percentage' | 'fixed',
                value: Number(newPromo.value),
                minPurchaseAmount: newPromo.minPurchaseAmount ? Number(newPromo.minPurchaseAmount) : undefined,
                usageLimit: newPromo.usageLimit ? Number(newPromo.usageLimit) : undefined,
                expiryDate: newPromo.expiryDate,
                isActive: true,
            });

            toast({
                title: 'Promotion Created',
                description: `Coupon ${newPromo.code.toUpperCase()} is now live.`
            });

            setIsAddOpen(false);
            setNewPromo({ code: '', type: 'percentage', value: 10, isActive: true });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not create promotion.',
            });
        }
    };

    const toggleStatus = async (promo: Promotion) => {
        try {
            await updateMut.mutateAsync({ id: promo._id, data: { isActive: !promo.isActive } });
            toast({
                title: 'Status Updated',
                description: `${promo.code} is now ${!promo.isActive ? 'Active' : 'Inactive'}.`
            });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not update promotion.',
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMut.mutateAsync(id);
            toast({ title: 'Promotion Deleted' });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not delete promotion.',
            });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h1>
                    <p className="text-muted-foreground mt-2">
                        Create discount codes and manage coupon limits.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Create Promo Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Promotion</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Coupon Code (e.g. SUMMER20)</Label>
                                <Input
                                    value={newPromo.code}
                                    onChange={e => setNewPromo({...newPromo, code: e.target.value})}
                                    placeholder="SUMMER20"
                                    className="uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Discount Type</Label>
                                    <Select
                                        value={newPromo.type}
                                        onValueChange={(val: any) => setNewPromo({...newPromo, type: val})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Flat Amount ({currencySymbol})</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Discount Value</Label>
                                    <Input
                                        type="number"
                                        value={newPromo.value}
                                        onChange={e => setNewPromo({...newPromo, value: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Minimum Purchase Amount (Optional)</Label>
                                <Input
                                    type="number"
                                    placeholder="Leave blank for no limit"
                                    value={newPromo.minPurchaseAmount || ''}
                                    onChange={e => setNewPromo({...newPromo, minPurchaseAmount: Number(e.target.value)})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Usage Limit (Total uses)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Optional"
                                        value={newPromo.usageLimit || ''}
                                        onChange={e => setNewPromo({...newPromo, usageLimit: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expiry Date</Label>
                                    {/* Bug #35: prevent picking a past date */}
                                    <Input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={newPromo.expiryDate ? newPromo.expiryDate.split('T')[0] : ''}
                                        onChange={e => setNewPromo({...newPromo, expiryDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-4" onClick={handleAddSubmit} disabled={createMut.isPending}>
                                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Promotion
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold">Code</TableHead>
                            <TableHead className="font-semibold">Value</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Uses</TableHead>
                            <TableHead className="font-semibold">Expires</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : promotions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No promotions active. Create one to begin.
                                </TableCell>
                            </TableRow>
                        ) : (
                            promotions.map((promo) => (
                                <TableRow key={promo._id}>
                                    <TableCell className="font-bold text-slate-900">{promo.code}</TableCell>
                                    <TableCell>
                                        {promo.type === 'percentage'
                                            ? `${promo.value}% OFF`
                                            : `${currencySymbol}${promo.value} OFF`}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={promo.isActive ? "outline" : "secondary"} className={promo.isActive ? "text-emerald-600 border-emerald-200 bg-emerald-50" : ""}>
                                            {promo.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {promo.usageCount} / {promo.usageLimit || '∞'}
                                    </TableCell>
                                    <TableCell>
                                        {promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'Never'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => toggleStatus(promo)} title={promo.isActive ? 'Deactivate' : 'Activate'}>
                                                {promo.isActive ? <PowerOff className="w-4 h-4 text-slate-500" /> : <Power className="w-4 h-4 text-emerald-600" />}
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDelete(promo._id)} title="Delete" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
