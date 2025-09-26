"use client";

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check } from 'lucide-react';

type Participant = {
	id: number;
	misis: string;
	name: string;
	phone: string;
	email: string;
	status: 'not_approved' | 'approved' | 'checked_in';
};

const mockParticipantsByEvent: Record<string, Participant[]> = {
	'1': [
		{ id: 1, misis: 'MIS-1001', name: 'Alex Morgan', phone: '+1 555-123-4567', email: 'alex.morgan@example.com', status: 'not_approved' },
		{ id: 2, misis: 'MIS-1002', name: 'Taylor Reed', phone: '+1 555-222-7890', email: 'taylor.reed@example.com', status: 'not_approved' },
		{ id: 3, misis: 'MIS-1003', name: 'Jordan Lee', phone: '+1 555-987-6543', email: 'jordan.lee@example.com', status: 'approved' },
	],
	'2': [
		{ id: 4, misis: 'MIS-2001', name: 'Sam Patel', phone: '+1 555-333-1200', email: 'sam.patel@example.com', status: 'not_approved' },
	],
	'3': [],
	'4': [
		{ id: 5, misis: 'MIS-4001', name: 'Riley Chen', phone: '+1 555-444-8888', email: 'riley.chen@example.com', status: 'approved' },
	]
};

export const dynamicParams = false;
export async function generateStaticParams() {
	return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
}

export default function ParticipantsPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = String(params?.id ?? '');
	const [rows, setRows] = useState<Participant[]>(mockParticipantsByEvent[eventId] ?? []);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [query, setQuery] = useState('');

	const allSelected = rows.length > 0 && selectedIds.size === rows.length;
	const indeterminate = selectedIds.size > 0 && selectedIds.size < rows.length;

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		return rows.filter(r =>
			r.misis.toLowerCase().includes(q) ||
			r.name.toLowerCase().includes(q) ||
			r.phone.toLowerCase().includes(q) ||
			r.email.toLowerCase().includes(q) ||
			r.status.replace('_',' ').toLowerCase().includes(q)
		);
	}, [rows, query]);

	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(rows.map(r => r.id)));
		}
	};

	const toggleRow = (id: number) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	};

	const approveSelected = () => {
		if (selectedIds.size === 0) return;
		setRows(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: 'approved' } : r));
		setSelectedIds(new Set());
	};

	const statusStyle = (status: Participant['status']) => {
		switch (status) {
			case 'approved':
				return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
			case 'checked_in':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			default:
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
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
						<div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[44px]">
											<Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-checked={indeterminate ? 'mixed' : allSelected} />
										</TableHead>
										<TableHead>MISIS</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filtered.map((p) => (
										<TableRow key={p.id}>
											<TableCell>
												<Checkbox checked={selectedIds.has(p.id)} onCheckedChange={() => toggleRow(p.id)} />
											</TableCell>
											<TableCell className="font-medium text-gray-900 dark:text-white">{p.misis}</TableCell>
											<TableCell className="text-gray-700 dark:text-gray-300">{p.name}</TableCell>
											<TableCell className="text-gray-700 dark:text-gray-300">{p.phone}</TableCell>
											<TableCell className="text-gray-700 dark:text-gray-300">{p.email}</TableCell>
											<TableCell>
												<Badge className={statusStyle(p.status)}>{p.status.replace('_', ' ')}</Badge>
											</TableCell>
										</TableRow>
									))}
									{filtered.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-8">No participants found.</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
} 