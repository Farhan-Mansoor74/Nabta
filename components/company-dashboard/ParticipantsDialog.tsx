"use client";

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ArrowUpDown,
	Check,
	Loader2,
	X,
	Search,
	UserCheck,
	Clock,
	Users,
	Trash2,
	XCircle,
	CheckCircle2,
	AlertCircle,
	Trophy,
	Lock
} from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';
import EventCompletionDialog from './EventCompletionDialog';

export type Participant = {
	id: string;
	registrationId: string;
	name: string;
	email: string;
	phone?: string;
	status: 'pending' | 'registered' | 'attended' | 'cancelled' | 'no-show';
	registrationDate: string;
};

interface ParticipantsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	eventTitle: string;
	eventId?: string;
	eventStatus?: string;
	eventFinalized?: boolean;
	eventStartTime?: string;
	eventEndTime?: string;
}

export default function ParticipantsDialog({
	open,
	onOpenChange,
	eventTitle,
	eventId,
	eventStatus,
	eventFinalized,
	eventStartTime,
	eventEndTime
}: ParticipantsDialogProps) {
	const [query, setQuery] = useState('');
	const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'registered' | 'attended' | 'cancelled'>('all');
	const [sortBy, setSortBy] = useState<'name' | 'email' | 'status'>('name');
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
	const [rows, setRows] = useState<Participant[]>([]);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [completionDialogOpen, setCompletionDialogOpen] = useState(false);

	const isCompleted = eventStatus === 'completed';
	const needsFinalization = isCompleted && !eventFinalized;

	// Fetch participants when dialog opens
	useEffect(() => {
		console.log('ParticipantsDialog useEffect:', { open, eventId });

		if (open && eventId) {
			const fetchParticipants = async () => {
				setLoading(true);
				setError(null);
				try {
					console.log('Fetching participants for event:', eventId);
					const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
					console.log('Fetched participants:', data);
					setRows(data);
				} catch (err) {
					console.error('Error fetching participants:', err);
					setError(err instanceof Error ? err.message : 'Failed to fetch participants');
				} finally {
					setLoading(false);
				}
			};

			fetchParticipants();
		} else if (open && !eventId) {
			setError('Event not found');
			setLoading(false);
		}

		// Reset state when dialog closes
		if (!open) {
			setSelectedIds(new Set());
			setQuery('');
			setRows([]);
			setError(null);
		}
	}, [open, eventId]);

	// Filter by tab and search query
	const filtered = useMemo(() => {
		// First filter by tab
		let filteredByTab = rows;
		if (activeTab !== 'all') {
			filteredByTab = rows.filter(p => p.status === activeTab);
		}

		// Then filter by search query
		const q = query.toLowerCase().trim();
		const searchFiltered = q
			? filteredByTab.filter(p =>
				p.name.toLowerCase().includes(q) ||
				p.email.toLowerCase().includes(q) ||
				p.status.replace('_', ' ').replace('-', ' ').toLowerCase().includes(q)
			)
			: filteredByTab;

		// Finally sort
		const sorted = [...searchFiltered].sort((a, b) => {
			const aVal = String(a[sortBy]).toLowerCase();
			const bVal = String(b[sortBy]).toLowerCase();
			if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
		return sorted;
	}, [rows, query, sortBy, sortDir, activeTab]);

	// Calculate counts for each status
	const counts = useMemo(() => ({
		all: rows.length,
		pending: rows.filter(p => p.status === 'pending').length,
		registered: rows.filter(p => p.status === 'registered').length,
		attended: rows.filter(p => p.status === 'attended').length,
		cancelled: rows.filter(p => p.status === 'cancelled' || p.status === 'no-show').length,
	}), [rows]);

	const toggleSort = (key: 'name' | 'email' | 'status') => {
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
		else setSelectedIds(new Set(rows.map(r => r.registrationId)));
	};

	const toggleRow = (registrationId: string) => {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (next.has(registrationId)) next.delete(registrationId); else next.add(registrationId);
			return next;
		});
	};

	const approveSelected = async () => {
		if (selectedIds.size === 0 || !eventId) {
			console.log('Cannot approve - no selections or eventId:', { selectedIds: selectedIds.size, eventId });
			return;
		}

		try {
			setLoading(true);
			const registrationIds = Array.from(selectedIds);

			console.log('Approving participants:', { eventId, registrationIds, action: 'approve' });

			const result = await ApiClient.patch(`/api/companies/opportunities/${eventId}/participants`, {
				registrationIds,
				action: 'approve'
			});

			console.log('Approval result:', result);

			// Refresh the participants list
			console.log('Refreshing participants list...');
			const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
			console.log('Refreshed participants:', data);
			setRows(data);
			setSelectedIds(new Set());
			setError(null);
		} catch (err) {
			console.error('Error approving participants:', err);
			setError('Failed to approve participants: ' + (err instanceof Error ? err.message : String(err)));
		} finally {
			setLoading(false);
		}
	};

	const rejectSelected = async () => {
		if (selectedIds.size === 0 || !eventId) return;

		try {
			setLoading(true);
			const registrationIds = Array.from(selectedIds);

			await ApiClient.patch(`/api/companies/opportunities/${eventId}/participants`, {
				registrationIds,
				action: 'reject'
			});

			// Refresh the participants list
			const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
			setRows(data);
			setSelectedIds(new Set());
			setError(null);
		} catch (err) {
			console.error('Error rejecting participants:', err);
			setError('Failed to reject participants: ' + (err instanceof Error ? err.message : String(err)));
		} finally {
			setLoading(false);
		}
	};

	const removeSelected = async () => {
		if (selectedIds.size === 0 || !eventId) return;

		const confirmed = window.confirm(
			`Are you sure you want to permanently remove ${selectedIds.size} participant(s)? This cannot be undone.`
		);

		if (!confirmed) return;

		try {
			setLoading(true);
			const registrationIds = Array.from(selectedIds);

			// Delete registrations
			await Promise.all(
				registrationIds.map(id =>
					ApiClient.delete(`/api/companies/opportunities/${eventId}/participants/${id}`)
				)
			);

			// Refresh the participants list
			const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
			setRows(data);
			setSelectedIds(new Set());
			setError(null);
		} catch (err) {
			console.error('Error removing participants:', err);
			setError('Failed to remove participants: ' + (err instanceof Error ? err.message : String(err)));
		} finally {
			setLoading(false);
		}
	};

	const statusStyles: Record<Participant['status'], string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		registered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
		attended: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
		cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		'no-show': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
								Participants — {eventTitle}
							</DialogTitle>
							{eventFinalized && (
								<div className="flex items-center gap-2 mt-1">
									<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
										<Lock className="h-3 w-3" />
										Finalized
									</Badge>
									<span className="text-xs text-gray-500 dark:text-gray-400">Event has been finalized</span>
								</div>
							)}
						</div>
					</div>
					{needsFinalization && (
						<div className="mt-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg">
							<div className="flex items-start gap-3">
								<Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900 dark:text-white mb-1">
										Event Completed! Ready to Finalize
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
										This event has ended. Review volunteer attendance, adjust hours worked, and finalize the event to award points.
									</p>
									<Button
										onClick={() => setCompletionDialogOpen(true)}
										className="bg-emerald-600 hover:bg-emerald-700"
									>
										<Trophy className="h-4 w-4 mr-2" />
										Finalize Attendance & Hours
									</Button>
								</div>
							</div>
						</div>
					)}
					{error && (
						<div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}
				</DialogHeader>

				{/* Search Bar */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
					<Input
						placeholder="Search by name, email, or status..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						disabled={loading}
						className="pl-9 h-11"
					/>
					{query && (
						<Button
							variant="ghost"
							size="sm"
							className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
							onClick={() => setQuery('')}
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Tabs for filtering */}
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden">
					<TabsList className="grid w-full grid-cols-5 mb-4">
						<TabsTrigger value="all" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							All
							<Badge variant="secondary" className="ml-1 bg-gray-200 dark:bg-gray-700">
								{counts.all}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="pending" className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Pending
							<Badge variant="secondary" className="ml-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
								{counts.pending}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="registered" className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4" />
							Approved
							<Badge variant="secondary" className="ml-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
								{counts.registered}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="attended" className="flex items-center gap-2">
							<UserCheck className="h-4 w-4" />
							Attended
							<Badge variant="secondary" className="ml-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
								{counts.attended}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="cancelled" className="flex items-center gap-2">
							<XCircle className="h-4 w-4" />
							Rejected
							<Badge variant="secondary" className="ml-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
								{counts.cancelled}
							</Badge>
						</TabsTrigger>
					</TabsList>

					{/* Action Buttons */}
					{selectedIds.size > 0 && (
						<div className="flex items-center gap-2 mb-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								{selectedIds.size} participant{selectedIds.size > 1 ? 's' : ''} selected
							</span>
							<div className="flex-1" />
							<Button
								size="sm"
								variant="outline"
								className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
								onClick={approveSelected}
								disabled={loading}
							>
								<Check className="h-4 w-4 mr-1" />
								Approve
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="border-red-600 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
								onClick={rejectSelected}
								disabled={loading}
							>
								<X className="h-4 w-4 mr-1" />
								Reject
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="border-gray-600 text-gray-600 hover:bg-gray-50 dark:border-gray-500 dark:text-gray-400 dark:hover:bg-gray-900/20"
								onClick={removeSelected}
								disabled={loading}
							>
								<Trash2 className="h-4 w-4 mr-1" />
								Delete
							</Button>
						</div>
					)}

					{/* Tab Content */}
					<div className="flex-1 overflow-auto">
						{loading ? (
							<div className="flex flex-col items-center justify-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
								<p className="text-sm text-gray-500 dark:text-gray-400">Loading participants...</p>
							</div>
						) : (
							<TabsContent value={activeTab} className="mt-0">
								<div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
									<Table>
										<TableHeader>
											<TableRow className="bg-gray-50 dark:bg-gray-900">
												<TableHead className="w-[44px]">
													<Checkbox
														checked={allSelected}
														onCheckedChange={toggleSelectAll}
														aria-checked={indeterminate ? 'mixed' : allSelected}
														className="border-gray-400 dark:border-gray-600"
													/>
												</TableHead>
												<TableHead>
													<Button
														variant="ghost"
														className="px-0 hover:bg-transparent font-semibold"
														onClick={() => toggleSort('name')}
													>
														Name
														<ArrowUpDown className="h-4 w-4 ml-2" />
													</Button>
												</TableHead>
												<TableHead>
													<Button
														variant="ghost"
														className="px-0 hover:bg-transparent font-semibold"
														onClick={() => toggleSort('email')}
													>
														Email
														<ArrowUpDown className="h-4 w-4 ml-2" />
													</Button>
												</TableHead>
												<TableHead>
													<Button
														variant="ghost"
														className="px-0 hover:bg-transparent font-semibold"
														onClick={() => toggleSort('status')}
													>
														Status
														<ArrowUpDown className="h-4 w-4 ml-2" />
													</Button>
												</TableHead>
												<TableHead className="text-center">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filtered.length === 0 ? (
												<TableRow>
													<TableCell colSpan={5} className="text-center py-12">
														<div className="flex flex-col items-center gap-2">
															{query ? (
																<>
																	<Search className="h-12 w-12 text-gray-300 dark:text-gray-600" />
																	<p className="text-gray-500 dark:text-gray-400 font-medium">
																		No participants match "{query}"
																	</p>
																	<Button
																		variant="link"
																		className="text-emerald-600 dark:text-emerald-400"
																		onClick={() => setQuery('')}
																	>
																		Clear search
																	</Button>
																</>
															) : (
																<>
																	<Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
																	<p className="text-gray-500 dark:text-gray-400 font-medium">
																		No participants in this category
																	</p>
																</>
															)}
														</div>
													</TableCell>
												</TableRow>
											) : (
												filtered.map((p) => (
													<TableRow
														key={p.registrationId}
														className={selectedIds.has(p.registrationId) ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}
													>
														<TableCell>
															<Checkbox
																checked={selectedIds.has(p.registrationId)}
																onCheckedChange={() => toggleRow(p.registrationId)}
															/>
														</TableCell>
														<TableCell className="font-medium text-gray-900 dark:text-white">
															{p.name}
														</TableCell>
														<TableCell className="text-gray-700 dark:text-gray-300">
															{p.email}
														</TableCell>
														<TableCell>
															<Badge className={statusStyles[p.status]}>
																{p.status === 'no-show' ? 'No Show' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
															</Badge>
														</TableCell>
														<TableCell>
															<div className="flex items-center justify-center gap-1">
																{p.status === 'pending' && (
																	<>
																		<Button
																			size="sm"
																			variant="ghost"
																			className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
																			onClick={async () => {
																				setSelectedIds(new Set([p.registrationId]));
																				await approveSelected();
																			}}
																			disabled={loading}
																		>
																			<Check className="h-4 w-4" />
																		</Button>
																		<Button
																			size="sm"
																			variant="ghost"
																			className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
																			onClick={async () => {
																				setSelectedIds(new Set([p.registrationId]));
																				await rejectSelected();
																			}}
																			disabled={loading}
																		>
																			<X className="h-4 w-4" />
																		</Button>
																	</>
																)}
																{p.status === 'registered' && (
																	<span className="text-xs text-gray-500 dark:text-gray-400">Approved</span>
																)}
																{(p.status === 'cancelled' || p.status === 'no-show') && (
																	<span className="text-xs text-gray-500 dark:text-gray-400">Rejected</span>
																)}
																{p.status === 'attended' && (
																	<span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
																)}
															</div>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>

								{/* Summary Footer */}
								{filtered.length > 0 && (
									<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
										<p className="text-sm text-gray-600 dark:text-gray-400">
											Showing <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> of{' '}
											<span className="font-semibold text-gray-900 dark:text-white">{rows.length}</span> total participants
										</p>
									</div>
								)}
							</TabsContent>
						)}
					</div>
				</Tabs>
			</DialogContent>

			{/* Event Completion Dialog */}
			{eventId && (
				<EventCompletionDialog
					open={completionDialogOpen}
					onOpenChange={setCompletionDialogOpen}
					eventId={eventId}
					eventTitle={eventTitle}
					eventStartTime={eventStartTime}
					eventEndTime={eventEndTime}
					onComplete={() => {
						// Refresh participants list
						if (open && eventId) {
							const fetchParticipants = async () => {
								setLoading(true);
								try {
									const data = await ApiClient.get(`/api/companies/opportunities/${eventId}/participants`);
									setRows(data);
								} catch (err) {
									console.error('Error fetching participants:', err);
								} finally {
									setLoading(false);
								}
							};
							fetchParticipants();
						}
					}}
				/>
			)}
		</Dialog>
	);
} 