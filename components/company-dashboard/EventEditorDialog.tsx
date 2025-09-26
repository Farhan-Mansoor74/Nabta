"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type Opportunity = {
	id: number;
	title: string;
	category: string;
	date: string;
	location: string;
	participants: number;
	capacity: number;
	status: string;
	views: number;
	description?: string;
	// Extended event schema fields (optional for compatibility)
	organization_id?: string;
	event_date?: string; // ISO date
	start_time?: string; // HH:mm
	end_time?: string; // HH:mm
	image_url?: string;
	max_participants?: number;
	current_participants?: number;
	points?: number;
	featured?: boolean;
	icon_name?: string;
	latitude?: string;
	longitude?: string;
};

interface EventEditorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	opportunity: Opportunity | null;
	onSave: (updated: Opportunity) => void;
}

export default function EventEditorDialog({ open, onOpenChange, opportunity, onSave }: EventEditorDialogProps) {
	const [form, setForm] = useState<Opportunity | null>(opportunity);

	useEffect(() => {
		setForm(opportunity);
	}, [opportunity]);

	if (!form) return null;

	const handleChange = (key: keyof Opportunity, value: string | number | boolean) => {
		setForm({ ...form, [key]: value } as Opportunity);
	};

	const handleSubmit = () => {
		onSave(form);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl">
				<DialogHeader>
					<DialogTitle className="text-gray-900 dark:text-white">{form.id ? 'Edit Opportunity' : 'Create Opportunity'}</DialogTitle>
					<DialogDescription className="text-gray-600 dark:text-gray-400">
						Fill out the event details. Frontend-only; does not persist.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input id="title" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Input id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="location">Location</Label>
						<div className="relative">
							<MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
							<Input id="location" className="pl-9" value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="Santa Monica Beach" />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="image_url">Image URL</Label>
						<Input id="image_url" value={form.image_url ?? ''} onChange={(e) => handleChange('image_url', e.target.value)} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="event_date">Event Date</Label>
						<div className="relative">
							<Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
							<Input id="event_date" type="date" className="pl-9" value={form.event_date ?? ''} onChange={(e) => handleChange('event_date', e.target.value)} />
						</div>
					</div>
					<div className="space-y-2 grid grid-cols-2 gap-4 md:col-span-1">
						<div>
							<Label htmlFor="start_time">Start Time</Label>
							<Input id="start_time" type="time" value={form.start_time ?? ''} onChange={(e) => handleChange('start_time', e.target.value)} />
						</div>
						<div>
							<Label htmlFor="end_time">End Time</Label>
							<Input id="end_time" type="time" value={form.end_time ?? ''} onChange={(e) => handleChange('end_time', e.target.value)} />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="capacity">Capacity</Label>
						<div className="relative">
							<Users className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
							<Input id="capacity" type="number" className="pl-9" value={form.capacity} onChange={(e) => handleChange('capacity', Number(e.target.value))} />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="max_participants">Max Participants</Label>
						<Input id="max_participants" type="number" value={form.max_participants ?? form.capacity ?? 0} onChange={(e) => handleChange('max_participants', Number(e.target.value))} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="current_participants">Current Participants</Label>
						<Input id="current_participants" type="number" value={form.current_participants ?? 0} onChange={(e) => handleChange('current_participants', Number(e.target.value))} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="points">Points</Label>
						<Input id="points" type="number" value={form.points ?? 0} onChange={(e) => handleChange('points', Number(e.target.value))} />
					</div>

					<div className="space-y-2">
						<Label>Status</Label>
						<Select value={form.status} onValueChange={(val) => handleChange('status', val)}>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">active</SelectItem>
								<SelectItem value="cancelled">cancelled</SelectItem>
								<SelectItem value="completed">completed</SelectItem>
								<SelectItem value="draft">draft</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="icon_name">Icon Name</Label>
						<Input id="icon_name" value={form.icon_name ?? ''} onChange={(e) => handleChange('icon_name', e.target.value)} />
					</div>

					<div className="space-y-2">
						<Label>Featured</Label>
						<div className="flex items-center gap-2">
							<Switch checked={!!form.featured} onCheckedChange={(val) => handleChange('featured', Boolean(val))} />
							<span className="text-sm text-gray-600 dark:text-gray-400">Feature this event</span>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
						<div className="space-y-2">
							<Label htmlFor="latitude">Latitude</Label>
							<Input id="latitude" value={form.latitude ?? ''} onChange={(e) => handleChange('latitude', e.target.value)} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="longitude">Longitude</Label>
							<Input id="longitude" value={form.longitude ?? ''} onChange={(e) => handleChange('longitude', e.target.value)} />
						</div>
					</div>

					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="description">Description</Label>
						<Textarea id="description" value={form.description ?? ''} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
					<Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={handleSubmit}>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
} 