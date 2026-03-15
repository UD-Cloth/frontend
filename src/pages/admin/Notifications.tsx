import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Search, Mail, Smartphone, Bell, Trash2 } from 'lucide-react';

export default function AdminNotifications() {
    const { notifications, clearHistory } = useNotificationStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotifications = notifications.filter((notif) =>
        notif.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Sent': return 'default';
            case 'Failed': return 'destructive';
            default: return 'outline';
        }
    };

    const getMethodIcon = (method: string) => {
        if (method === 'Email') return <Mail className="h-4 w-4" />;
        if (method === 'SMS') return <Smartphone className="h-4 w-4" />;
        return <Bell className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
                    <p className="text-muted-foreground">
                        View logs of automated emails and SMS sent to customers.
                    </p>
                </div>
                {notifications.length > 0 && (
                    <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={clearHistory}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear History
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by order ID, name or email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="w-[40%]">Message</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Sent At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredNotifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No notifications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredNotifications.map((notif) => (
                                <TableRow key={notif.id}>
                                    <TableCell className="font-medium">{notif.orderId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{notif.recipientName}</span>
                                            <span className="text-xs text-muted-foreground">{notif.recipientEmail}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            {getMethodIcon(notif.method)}
                                            <span className="text-sm">{notif.method}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm max-w-sm">
                                        <p className="line-clamp-2 text-muted-foreground" title={notif.message}>
                                            {notif.message}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(notif.status)}>
                                            {notif.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right whitespace-nowrap">
                                        {format(new Date(notif.sentAt), 'MMM d, yyyy h:mm a')}
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
