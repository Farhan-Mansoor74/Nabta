"use client";

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, Check } from 'lucide-react';

export type Participant = {
	id: number;
	misis: string;
	name: string;
	phone: string;
	email: string;
	status: 'not_approved' | 'approved' | 'checked_in';
};

interface ParticipantsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventTitle: string;
	participants: Participant[];
}

export default function ParticipantsDialog({ open, onOpenChange, eventTitle, participants }: ParticipantsDialogProps) {
	const [query, setQuery] = useState('');
	const [sortBy, setSortBy] = useState<'misis' | 'name' | 'status'>('name');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
	const [rows, setRows] = useState<Participant[]>(participants);
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

	useEffect(() => {
		setRows(participants);
		setSelectedIds(new Set());
	}, [participants, open]);

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		const base = rows.filter(p => 
			p.misis.toLowerCase().includes(q) ||
			p.name.toLowerCase().includes(q) ||
			p.phone.toLowerCase().includes(q) ||
			p.email.toLowerCase().includes(q) ||
			p.status.replace('_',' ').toLowerCase().includes(q)
		);
		const sorted = [...base].sort((a, b) => {
			const aVal = String(a[sortBy]).toLowerCase();
			const bVal = String(b[sortBy]).toLowerCase();
			if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
		return sorted;
	}, [rows, query, sortBy, sortDir]);

	const toggleSort = (key: 'misis' | 'name' | 'status') => {
		if (sortBy === key) {
			setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(key);
			setSortDir('asc');
		}
	};

	const allSelected = rows.length > 0 && selectedIds.size === rows.length;
	const indeterminate = selectedIds.size > 0 && selectedIds.size < rows.length;

	const toggleSelectAll = () => {
		if (allSelected) setSelectedIds(new Set());
		else setSelectedIds(new Set(rows.map(r => r.id)));
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

	const statusStyles: Record<Participant['status'], string> = {
		not_approved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
		checked_in: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl">
				<DialogHeader>
					<DialogTitle className="text-gray-900 dark:text-white">Participants — {eventTitle}</DialogTitle>
					<div className="flex items-center gap-3 mt-3">
						<Input placeholder="Search participants" value={query} onChange={(e) => setQuery(e.target.value)} />
						<Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={approveSelected} disabled={selectedIds.size === 0}>
							<Check className="h-4 w-4 mr-2" />
							Approve
						</Button>
					</div>
				</DialogHeader>

				<div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[44px]">
									<Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-checked={indeterminate ? 'mixed' : allSelected} />
								</TableHead>
								<TableHead>
									<Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => toggleSort('misis')}>
										MISIS
										<ArrowUpDown className="h-4 w-4 ml-2" />
									</Button>
								</TableHead>
								<TableHead>
									<Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => toggleSort('name')}>
										Name
										<ArrowUpDown className="h-4 w-4 ml-2" />
									</Button>
								</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>
									<Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => toggleSort('status')}>
										Status
										<ArrowUpDown className="h-4 w-4 ml-2" />
									</Button>
								</TableHead>
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
										<Badge className={statusStyles[p.status]}>{p.status.replace('_', ' ')}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</DialogContent>
		</Dialog>
	);
} 