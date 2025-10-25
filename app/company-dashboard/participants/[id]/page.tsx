"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';

type Participant = {
	id: string;
	registrationId: string;
	name: string;
	email: string;
	status: 'pending' | 'registered' | 'attended' | 'cancelled' | 'no-show';
	registrationDate: string;
};

export default function ParticipantsPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = String(params?.id ?? '');
	const [rows, setRows] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [query, setQuery] = useState('');

    useEffect(() => {
        if (!eventId) return;

        const fetchParticipants = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
                setRows(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch participants');
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [eventId]);

	const allSelected = rows.length > 0 && selectedIds.size === rows.length;
	const indeterminate = selectedIds.size > 0 && selectedIds.size < rows.length;

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		return rows.filter(r =>
			r.name.toLowerCase().includes(q) ||
			r.email.toLowerCase().includes(q) ||
			r.status.replace('_',' ').toLowerCase().includes(q)
		);
	}, [rows, query]);

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(rows.map(r => r.registrationId)));
		}
	};

	const toggleRow = (registrationId: string) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (next.has(registrationId)) next.delete(registrationId); else next.add(registrationId);
			return next;
		});
	};

	const approveSelected = async () => {
		if (selectedIds.size === 0) return;

		try {
			setLoading(true);
			const registrationIds = Array.from(selectedIds);

			await ApiClient.patch(`/api/companies/opportunities/${eventId}/participants`, {
				registrationIds,
				action: 'approve'
			});

			// Refresh the participants list
			const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
			setRows(data);
			setSelectedIds(new Set());
		} catch (err) {
			console.error('Error approving participants:', err);
			setError('Failed to approve participants');
		} finally {
			setLoading(false);
		}
	};

	const statusStyle = (status: Participant['status']) => {
		switch (status) {
			case 'registered':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
			case 'attended':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'cancelled':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'no-show':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
		}
	};

	return (
		<div className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => router.push('/company-dashboard')}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Participants</h1>
					</div>
					<div className="flex items-center gap-3">
						<Input placeholder="Search participants" value={query} onChange={(e) => setQuery(e.target.value)} />
						<Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={approveSelected} disabled={selectedIds.size === 0}>
							<Check className="h-4 w-4 mr-2" />
							Approve
						</Button>
					</div>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Event ID: {eventId}</CardTitle>
					</CardHeader>
					<CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-500">
                                {error}
                            </div>
                        ) : (
                            <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[44px]">
                                                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-checked={indeterminate ? 'mixed' : allSelected} />
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map((p) => (
                                            <TableRow key={p.registrationId}>
                                                <TableCell>
                                                    <Checkbox checked={selectedIds.has(p.registrationId)} onCheckedChange={() => toggleRow(p.registrationId)} />
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900 dark:text-white">{p.name}</TableCell>
                                                <TableCell className="text-gray-700 dark:text-gray-300">{p.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={statusStyle(p.status)}>{p.status.replace('_', ' ').replace('-', ' ')}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filtered.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-8">No participants found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
					</CardContent>
				</Card>
			</div>
		</div>
	    );
	}