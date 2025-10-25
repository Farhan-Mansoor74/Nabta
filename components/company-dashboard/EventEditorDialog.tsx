"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Users, Upload, Image as ImageIcon, Plus, X, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { ApiClient } from '@/lib/apiClient';

export type EventDetails = {
	required_skills?: string[];
	preferred_skills?: string[];
	materials_provided?: string;
	bring_your_own?: string[];
	accessibility_info?: string;
	parking_info?: string;
	public_transport_info?: string;
	expected_participants?: number;
	community_impact_level?: 'low' | 'medium' | 'high' | 'very_high';
	impact_metrics?: Record<string, any>;
};

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
	views?: number;
	event_details?: EventDetails;
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
		throw new Error("User not authenticated");
	}

	const cleaned = {
		title: eventData.title,
		category: eventData.category,
		location: eventData.location,
		latitude: eventData.latitude ? Number(eventData.latitude) : null,
		longitude: eventData.longitude ? Number(eventData.longitude) : null,
		image_url: eventData.image_url || null,
		event_date: eventData.event_date && eventData.event_date !== "" ? eventData.event_date : new Date().toISOString().split("T")[0],
		start_time: eventData.start_time && eventData.start_time !== "" ? eventData.start_time : null,
		end_time: eventData.end_time && eventData.end_time !== "" ? eventData.end_time : null,
		capacity: eventData.capacity ?? null,
		max_participants: eventData.max_participants ?? eventData.capacity ?? null,
		current_participants: eventData.current_participants ?? 0,
		points: eventData.points ?? 0,
		status: eventData.status || "draft",
		icon_name: eventData.icon_name || null,
		featured: eventData.featured ?? false,
		description: eventData.description || null,
	};

	try {
		let savedEvent;
		if (eventData.id) {
			// Update existing event
			savedEvent = await ApiClient.put(`/api/companies/opportunities/${eventData.id}`, cleaned);
		} else {
			// Create new event
			savedEvent = await ApiClient.post('/api/companies/opportunities', cleaned);
		}

		// Save or update event_details if we have details data
		if (eventData.event_details && savedEvent?.id) {
			const eventDetailsData = {
				event_id: savedEvent.id,
				required_skills: eventData.event_details.required_skills || null,
				preferred_skills: eventData.event_details.preferred_skills || null,
				materials_provided: eventData.event_details.materials_provided || null,
				bring_your_own: eventData.event_details.bring_your_own || null,
				accessibility_info: eventData.event_details.accessibility_info || null,
				parking_info: eventData.event_details.parking_info || null,
				public_transport_info: eventData.event_details.public_transport_info || null,
				expected_participants: eventData.event_details.expected_participants || null,
				community_impact_level: eventData.event_details.community_impact_level || null,
				impact_metrics: eventData.event_details.impact_metrics || null,
			};

			// Check if event_details already exist
			const { data: existing } = await supabase
				.from('event_details')
				.select('id')
				.eq('event_id', savedEvent.id)
				.maybeSingle();

			if (existing) {
				// Update existing details
				await supabase
					.from('event_details')
					.update(eventDetailsData)
					.eq('event_id', savedEvent.id);
			} else {
				// Insert new details
				await supabase
					.from('event_details')
					.insert(eventDetailsData);
			}
		}

		return savedEvent;
	} catch (error) {
		console.error("Error saving event:", error);
		throw error;
	}
}

// Default empty opportunity template
const createEmptyOpportunity = (): Opportunity => ({
	title: '',
	category: '',
	location: '',
	latitude: '',
	longitude: '',
	image_url: '',
	event_date: '',
	start_time: '',
	end_time: '',
	capacity: 0,
	max_participants: 0,
	current_participants: 0,
	points: 0,
	status: 'draft',
	icon_name: '',
	featured: false,
	description: '',
	views: 0,
	event_details: {
		required_skills: [],
		preferred_skills: [],
		materials_provided: '',
		bring_your_own: [],
		accessibility_info: '',
		parking_info: '',
		public_transport_info: '',
		expected_participants: 0,
		community_impact_level: undefined,
		impact_metrics: {}
	}
});

export default function EventEditorDialog({ open, onOpenChange, opportunity, onSave }: EventEditorDialogProps) {
	const [form, setForm] = useState<Opportunity>(() => opportunity || createEmptyOpportunity());
	const [imagePreview, setImagePreview] = useState<string>('');
	const [newSkillInput, setNewSkillInput] = useState('');
	const [newPreferredSkillInput, setNewPreferredSkillInput] = useState('');
	const [newBringItem, setNewBringItem] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (open) {
			// When dialog opens, properly initialize form
			const initialForm = opportunity || createEmptyOpportunity();
			setForm(initialForm);
			setImagePreview(initialForm.image_url || '');
		}
	}, [opportunity, open]);

	const handleChange = (key: keyof Opportunity, value: string | number | boolean) => {
		setForm({ ...form, [key]: value } as Opportunity);
	};

	const handleDetailsChange = (key: keyof EventDetails, value: any) => {
		setForm({
			...form,
			event_details: {
				...form.event_details,
				[key]: value
			}
		} as Opportunity);
	};

	const addSkill = (type: 'required' | 'preferred') => {
		const input = type === 'required' ? newSkillInput : newPreferredSkillInput;
		if (!input.trim()) return;

		const key = type === 'required' ? 'required_skills' : 'preferred_skills';
		const currentSkills = form.event_details?.[key] || [];

		handleDetailsChange(key, [...currentSkills, input.trim()]);

		if (type === 'required') {
			setNewSkillInput('');
		} else {
			setNewPreferredSkillInput('');
		}
	};

	const removeSkill = (type: 'required' | 'preferred', index: number) => {
		const key = type === 'required' ? 'required_skills' : 'preferred_skills';
		const currentSkills = form.event_details?.[key] || [];
		handleDetailsChange(key, currentSkills.filter((_, i) => i !== index));
	};

	const addBringItem = () => {
		if (!newBringItem.trim()) return;
		const currentItems = form.event_details?.bring_your_own || [];
		handleDetailsChange('bring_your_own', [...currentItems, newBringItem.trim()]);
		setNewBringItem('');
	};

	const removeBringItem = (index: number) => {
		const currentItems = form.event_details?.bring_your_own || [];
		handleDetailsChange('bring_your_own', currentItems.filter((_, i) => i !== index));
	};

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Show preview immediately
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			setImagePreview(result);
		};
		reader.readAsDataURL(file);

		// Upload to backend
		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', 'event_image');

			console.log('Uploading image...');
			const data = await ApiClient.uploadFile('/api/upload/image', formData);
			console.log('Image uploaded successfully:', data);

			setForm(prev => ({ ...prev, image_url: data.url }));
		} catch (error) {
			console.error('Error uploading image:', error);
			alert('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
			// Reset preview on error
			setImagePreview('');
		} finally {
			// Reset the file input so the same file can be re-uploaded if needed
			event.target.value = '';
		}
	};

	const handleSubmit = async () => {
		try {
			setIsSaving(true);
			const saved = await saveEvent(form);
			if (saved) {
				onSave(saved);
				onOpenChange(false);
				// Reset form after successful save
				setForm(createEmptyOpportunity());
				setImagePreview('');
			}
		} catch (error) {
			console.error('Error saving event:', error);
			alert('Failed to save event: ' + (error instanceof Error ? error.message : 'Unknown error'));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
				<DialogHeader>
					<DialogTitle className="text-gray-900 dark:text-white">{form.title ? 'Edit Opportunity' : 'Create Opportunity'}</DialogTitle>
					<DialogDescription className="text-gray-600 dark:text-gray-400">
						Fill out all event information including details, logistics, and impact metrics.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="basic" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="basic">Basic Info</TabsTrigger>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="logistics">Logistics</TabsTrigger>
						<TabsTrigger value="impact">Impact</TabsTrigger>
					</TabsList>

					<TabsContent value="basic" className="space-y-4 mt-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="title">Title</Label>
						<Input id="title" value={form.title || ''} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter event title" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="category">Category</Label>
						<Select value={form.category || ''} onValueChange={(val) => handleChange('category', val)}>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Environment">Environment</SelectItem>
								<SelectItem value="Community">Community</SelectItem>
								<SelectItem value="Healthcare">Healthcare</SelectItem>
								<SelectItem value="Education">Education</SelectItem>
								<SelectItem value="Ocean Conservation">Ocean Conservation</SelectItem>
								<SelectItem value="Green Initiatives">Green Initiatives</SelectItem>
								<SelectItem value="Wildlife Protection">Wildlife Protection</SelectItem>
								<SelectItem value="Urban Development">Urban Development</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location">Location</Label>
						<div className="relative">
							<MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
							<Input id="location" className="pl-9" value={form.location || ''} onChange={(e) => handleChange('location', e.target.value)} placeholder="Santa Monica Beach" />
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
							<Input id="event_date" type="date" className="pl-9" value={form.event_date || ''} onChange={(e) => handleChange('event_date', e.target.value)} />
						</div>
					</div>
					<div className="space-y-2 grid grid-cols-2 gap-4 md:col-span-1">
						<div>
							<Label htmlFor="start_time">Start Time</Label>
							<Input id="start_time" type="time" value={form.start_time || ''} onChange={(e) => handleChange('start_time', e.target.value)} />
						</div>
						<div>
							<Label htmlFor="end_time">End Time</Label>
							<Input id="end_time" type="time" value={form.end_time || ''} onChange={(e) => handleChange('end_time', e.target.value)} />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="capacity">Capacity</Label>
						<div className="relative">
							<Users className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
							<Input id="capacity" type="number" className="pl-9" value={form.capacity || 0} onChange={(e) => handleChange('capacity', Number(e.target.value))} />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="max_participants">Max Participants</Label>
						<Input id="max_participants" type="number" value={form.max_participants || form.capacity || 0} onChange={(e) => handleChange('max_participants', Number(e.target.value))} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="current_participants">Current Participants</Label>
						<Input id="current_participants" type="number" value={form.current_participants || 0} onChange={(e) => handleChange('current_participants', Number(e.target.value))} />
					</div>
					<div className="space-y-2">
						<Label htmlFor="points">Points</Label>
						<Input id="points" type="number" value={form.points || 0} onChange={(e) => handleChange('points', Number(e.target.value))} />
					</div>

					<div className="space-y-2">
						<Label>Status</Label>
						<Select value={form.status || 'draft'} onValueChange={(val) => handleChange('status', val)}>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="cancelled">Cancelled</SelectItem>
								<SelectItem value="completed">Completed</SelectItem>
								<SelectItem value="draft">Draft</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="icon_name">Icon Name (Optional)</Label>
						<Input id="icon_name" value={form.icon_name || ''} onChange={(e) => handleChange('icon_name', e.target.value)} placeholder="e.g., tree" />
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
							<Label htmlFor="latitude">Latitude (Optional)</Label>
							<Input id="latitude" value={form.latitude || ''} onChange={(e) => handleChange('latitude', e.target.value)} placeholder="e.g., 25.2048" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="longitude">Longitude (Optional)</Label>
							<Input id="longitude" value={form.longitude || ''} onChange={(e) => handleChange('longitude', e.target.value)} placeholder="e.g., 55.2708" />
						</div>
					</div>

					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="description">Description</Label>
						<Textarea id="description" value={form.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={4} placeholder="Describe the event, its purpose, and what volunteers will be doing..." />
					</div>
				</div>
			</TabsContent>

			<TabsContent value="details" className="space-y-4 mt-4">
				<div className="grid grid-cols-1 gap-6">
					{/* Required Skills */}
					<div className="space-y-2">
						<Label>Required Skills</Label>
						<div className="flex gap-2">
							<Input
								placeholder="Add a required skill"
								value={newSkillInput}
								onChange={(e) => setNewSkillInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
							/>
							<Button type="button" onClick={() => addSkill('required')} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{(form.event_details?.required_skills || []).map((skill, index) => (
								<Badge key={index} variant="secondary" className="flex items-center gap-1">
									{skill}
									<X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill('required', index)} />
								</Badge>
							))}
						</div>
					</div>

					{/* Preferred Skills */}
					<div className="space-y-2">
						<Label>Preferred Skills (Optional)</Label>
						<div className="flex gap-2">
							<Input
								placeholder="Add a preferred skill"
								value={newPreferredSkillInput}
								onChange={(e) => setNewPreferredSkillInput(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('preferred'))}
							/>
							<Button type="button" onClick={() => addSkill('preferred')} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{(form.event_details?.preferred_skills || []).map((skill, index) => (
								<Badge key={index} variant="outline" className="flex items-center gap-1">
									{skill}
									<X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill('preferred', index)} />
								</Badge>
							))}
						</div>
					</div>

					{/* Materials Provided */}
					<div className="space-y-2">
						<Label htmlFor="materials">Materials Provided</Label>
						<Textarea
							id="materials"
							placeholder="List all materials and equipment that will be provided..."
							value={form.event_details?.materials_provided || ''}
							onChange={(e) => handleDetailsChange('materials_provided', e.target.value)}
							rows={3}
						/>
					</div>

					{/* What to Bring */}
					<div className="space-y-2">
						<Label>What Volunteers Should Bring</Label>
						<div className="flex gap-2">
							<Input
								placeholder="Add an item"
								value={newBringItem}
								onChange={(e) => setNewBringItem(e.target.value)}
								onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBringItem())}
							/>
							<Button type="button" onClick={addBringItem} size="sm">
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="flex flex-wrap gap-2 mt-2">
							{(form.event_details?.bring_your_own || []).map((item, index) => (
								<Badge key={index} variant="secondary" className="flex items-center gap-1">
									{item}
									<X className="h-3 w-3 cursor-pointer" onClick={() => removeBringItem(index)} />
								</Badge>
							))}
						</div>
					</div>
				</div>
			</TabsContent>

			<TabsContent value="logistics" className="space-y-4 mt-4">
				<div className="grid grid-cols-1 gap-4">
					<div className="space-y-2">
						<Label htmlFor="accessibility">Accessibility Information</Label>
						<Textarea
							id="accessibility"
							placeholder="Wheelchair accessible, accessible restrooms, etc."
							value={form.event_details?.accessibility_info || ''}
							onChange={(e) => handleDetailsChange('accessibility_info', e.target.value)}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="parking">Parking Information</Label>
						<Textarea
							id="parking"
							placeholder="Where to park, parking fees, nearby lots, etc."
							value={form.event_details?.parking_info || ''}
							onChange={(e) => handleDetailsChange('parking_info', e.target.value)}
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="publictransport">Public Transport Information</Label>
						<Textarea
							id="publictransport"
							placeholder="Nearest metro station, bus routes, etc."
							value={form.event_details?.public_transport_info || ''}
							onChange={(e) => handleDetailsChange('public_transport_info', e.target.value)}
							rows={3}
						/>
					</div>
				</div>
			</TabsContent>

			<TabsContent value="impact" className="space-y-4 mt-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="expected">Expected Participants</Label>
						<Input
							id="expected"
							type="number"
							placeholder="How many people do you expect?"
							value={form.event_details?.expected_participants || 0}
							onChange={(e) => handleDetailsChange('expected_participants', Number(e.target.value) || 0)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="impact">Community Impact Level</Label>
						<Select
							value={form.event_details?.community_impact_level || ''}
							onValueChange={(val) => handleDetailsChange('community_impact_level', val)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select impact level" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="low">Low Impact</SelectItem>
								<SelectItem value="medium">Medium Impact</SelectItem>
								<SelectItem value="high">High Impact</SelectItem>
								<SelectItem value="very_high">Very High Impact</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</TabsContent>
		</Tabs>

		<DialogFooter className="mt-6">
			<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
				Cancel
			</Button>
			<Button
				className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
				onClick={handleSubmit}
				disabled={isSaving}
			>
				{isSaving ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Saving...
					</>
				) : (
					'Save Event'
				)}
			</Button>
		</DialogFooter>
			</DialogContent>
		</Dialog>
	);
} 