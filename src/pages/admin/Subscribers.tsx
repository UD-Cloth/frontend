import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { MoreHorizontal, Search, MailX, MailCheck, Trash2, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
    Subscriber,
    useSubscribers,
    useToggleSubscriber,
    useDeleteSubscriber,
} from '@/hooks/useMarketing';

export default function AdminSubscribers() {
    const { data: subscribers = [], isLoading } = useSubscribers();
    const toggleMut = useToggleSubscriber();
    const deleteMut = useDeleteSubscriber();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSubscribers = subscribers
        .filter(sub => sub.email.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleStatusToggle = async (subscriber: Subscriber) => {
        try {
            await toggleMut.mutateAsync(subscriber._id);
            const newStatus = subscriber.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed';
            toast({
                title: `Status Updated`,
                description: `${subscriber.email} is now ${newStatus.toLowerCase()}.`,
            });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not update status.',
            });
        }
    };

    const handleDelete = async (subscriber: Subscriber) => {
        try {
            await deleteMut.mutateAsync(subscriber._id);
            toast({
                variant: "destructive",
                title: "Subscriber Removed",
                description: `${subscriber.email} has been permanently deleted.`,
            });
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Failed',
                description: err?.response?.data?.message || 'Could not delete subscriber.',
            });
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
           toast({ title: "No data", description: "There are no subscribers to export.", variant: "destructive" });
           return;
        }

        // Bug #47: subscribers CSV export — `email,status,createdAt`
        // Previously used literal "\\n" instead of newline, producing a single
        // unreadable line. CSV values are quoted in case of commas/quotes.
        const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
        const headers = ['email', 'status', 'createdAt'];
        const csvRows = subscribers.map(sub => [
            escape(sub.email),
            escape(sub.status),
            escape(new Date(sub.createdAt).toISOString()),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `urbandrape_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        toast({
            title: "Export Successful",
            description: "Your subscriber list has been downloaded.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your newsletter list and export leads for marketing.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium flex items-center">
                        Total: {subscribers.filter(s => s.status === 'Subscribed').length}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by email..."
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
                                <TableHead className="font-semibold text-slate-900">Email Address</TableHead>
                                <TableHead className="font-semibold text-slate-900">Status</TableHead>
                                <TableHead className="font-semibold text-slate-900">Subscribed On</TableHead>
                                <TableHead className="font-semibold text-slate-900 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSubscribers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No subscribers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubscribers.map((subscriber) => (
                                    <TableRow key={subscriber._id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{subscriber.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={subscriber.status === 'Subscribed' ? "outline" : "secondary"}
                                                className={subscriber.status === 'Subscribed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''}>
                                                {subscriber.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                                    <DropdownMenuItem onClick={() => handleStatusToggle(subscriber)}>
                                                        {subscriber.status === 'Subscribed' ? (
                                                            <><MailX className="mr-2 h-4 w-4" /> Mark Unsubscribed</>
                                                        ) : (
                                                            <><MailCheck className="mr-2 h-4 w-4" /> Mark Subscribed</>
                                                        )}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(subscriber)}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Subscriber
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
    );
}
