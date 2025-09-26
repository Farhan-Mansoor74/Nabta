import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin } from 'lucide-react';

interface Props {
	onCreate?: () => void;
}

export default function CreateOpportunityCard({ onCreate }: Props) {
	return (
		<Card className="border-dashed">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
					<Plus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
					Create New Opportunity
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
					Set up a new volunteering event with date, location, and capacity.
				</p>
			
				<Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700" onClick={onCreate}>
					<Plus className="h-4 w-4 mr-2" />
					Create Opportunity
				</Button>
			</CardContent>
		</Card>
	);
} 