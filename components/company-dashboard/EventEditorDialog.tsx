"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Upload, Image as ImageIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

export type Opportunity = {
	id?: string;
	title: string;
	category: string;
	location: string;
	latitude?: string;
	longitude?: string;
	image_url?: string;
	event_date?: string; // ISO date
	start_time?: string; // HH:mm
	end_time?: string; // HH:mm
	capacity: number;
	max_participants?: number;
	current_participants?: number;
	points?: number;
	status: string;
	icon_name?: string;
	featured?: boolean;
	description?: string;
	organization_id?: string;
};

interface EventEditorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	opportunity: Opportunity | null;
	onSave: (updated: Opportunity) => void;
}

async function saveEvent(eventData: Opportunity) {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		console.error("No user logged in or error fetching user:", userError);
		return null;
	}
	const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

	const cleaned = {
		title: eventData.title,
		category: eventData.category,
		location: eventData.location,
		latitude: eventData.latitude ? Number(eventData.latitude) : null,
		longitude: eventData.longitude ? Number(eventData.longitude) : null,
		image_url: eventData.image_url || null,
		event_date: eventData.event_date && eventData.event_date !== "" ? eventData.event_date : today,
		start_time: eventData.start_time && eventData.start_time !== "" ? eventData.start_time : null,
		end_time: eventData.end_time && eventData.end_time !== "" ? eventData.end_time : null,
		capacity: eventData.capacity ?? null,
		max_participants: eventData.max_participants ?? null,
		current_participants: eventData.current_participants ?? 0,
		points: eventData.points ?? 0,
		status: eventData.status || "draft",
		icon_name: eventData.icon_name || null,
		featured: eventData.featured ?? false,
		description: eventData.description || null,
		organization_id: user.id|| null,
	};

	const { data, error } = await supabase
    .from("events")
    .insert([cleaned])
    .select()
    .single();
	
	if (error) {
		console.error("Error saving event:", error);
		return null;
	}

	return data;
}

export default function EventEditorDialog({ open, onOpenChange, opportunity, onSave }: EventEditorDialogProps) {
	const [form, setForm] = useState<Opportunity | null>(opportunity);
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	useEffect(() => {
		setForm(opportunity);
		if (opportunity?.image_url) {
			setImagePreview(opportunity.image_url);
		}
	}, [opportunity]);

	if (!form) return null;

	const handleChange = (key: keyof Opportunity, value: string | number | boolean) => {
		setForm({ ...form, [key]: value } as Opportunity);
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				setImagePreview(result);
				setForm({ ...form, image_url: result } as Opportunity);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async () => {
		const saved = await saveEvent(form);
		if (saved) {
			onSave(saved);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
				<DialogHeader>
					<DialogTitle className="text-gray-900 dark:text-white">{form.title ? 'Edit Opportunity' : 'Create Opportunity'}</DialogTitle>
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
						<Label htmlFor="image_upload">Event Image</Label>
						<div className="space-y-3">
							<div className="flex items-center justify-center w-full">
								<label htmlFor="image_upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
										<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
											<span className="font-semibold">Click to upload</span> or drag and drop
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 10MB)</p>
									</div>
									<input id="image_upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
								</label>
							</div>
							{imagePreview && (
								<div className="relative">
									<img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2"
										onClick={() => {
											setImagePreview(null);
											setForm({ ...form, image_url: '' } as Opportunity);
										}}
									>
										Remove
									</Button>
								</div>
							)}
						</div>
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