"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  MapPin,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EventEditorDialog, { Opportunity } from './EventEditorDialog';
import ParticipantsDialog, { Participant } from './ParticipantsDialog';

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Corporate Beach Cleanup",
    category: "Ocean Conservation",
    date: "June 15, 2025",
    location: "Santa Monica Beach",
    participants: 24,
    capacity: 30,
    status: "active",
    views: 156
  },
  {
    id: 2,
    title: "Office Building Green Roof",
    category: "Urban Greening",
    date: "June 22, 2025",
    location: "Downtown Office",
    participants: 18,
    capacity: 25,
    status: "active",
    views: 89
  },
  {
    id: 3,
    title: "Team Tree Planting Day",
    category: "Reforestation",
    date: "July 5, 2025",
    location: "Griffith Park",
    participants: 0,
    capacity: 40,
    status: "draft",
    views: 12
  },
  {
    id: 4,
    title: "Quarterly Sustainability Workshop",
    category: "Education",
    date: "May 20, 2025",
    location: "Conference Room A",
    participants: 35,
    capacity: 35,
    status: "completed",
    views: 203
  }
];

const mockParticipants: Record<number, Participant[]> = {
  1: [
    { id: 1, misis: 'MIS-1001', name: 'Alex Morgan', phone: '+1 555-123-4567', email: 'alex.morgan@example.com', status: 'not_approved' },
    { id: 2, misis: 'MIS-1002', name: 'Taylor Reed', phone: '+1 555-222-7890', email: 'taylor.reed@example.com', status: 'not_approved' },
    { id: 3, misis: 'MIS-1003', name: 'Jordan Lee', phone: '+1 555-987-6543', email: 'jordan.lee@example.com', status: 'approved' },
  ],
  2: [
    { id: 4, misis: 'MIS-2001', name: 'Sam Patel', phone: '+1 555-333-1200', email: 'sam.patel@example.com', status: 'not_approved' },
  ],
  3: [],
  4: [
    { id: 5, misis: 'MIS-4001', name: 'Riley Chen', phone: '+1 555-444-8888', email: 'riley.chen@example.com', status: 'approved' },
  ]
};

export default function CompanyOpportunities() {
  const [activeTab, setActiveTab] = useState("active");
  const [items, setItems] = useState<Opportunity[]>(opportunities);
  const [editorOpen, setEditorOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const filteredOpportunities = items.filter(opp => {
    if (activeTab === "all") return true;
    return opp.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleEdit = (opp: Opportunity) => {
    setSelected(opp);
    setEditorOpen(true);
  };

  const handleViewParticipants = (opp: Opportunity) => {
    setSelected(opp);
    setParticipantsOpen(true);
  };

  const handleSave = (updated: Opportunity) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Your Opportunities</CardTitle>
        <p className="text-gray-600 dark:text-gray-400">Manage and track your volunteering events</p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => (
                <div 
                  key={opportunity.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {opportunity.title}
                        </h3>
                        <Badge className={getStatusColor(opportunity.status)}>
                          {opportunity.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          {opportunity.date}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          {opportunity.participants}/{opportunity.capacity} registered
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="h-4 w-4 mr-1" />
                        {opportunity.views} views
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(opportunity)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewParticipants(opportunity)}>
                          <Users className="h-4 w-4 mr-2" />
                          View Participants
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Registration Progress</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.round((opportunity.participants / opportunity.capacity) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${(opportunity.participants / opportunity.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOpportunities.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No opportunities found for this status.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <EventEditorDialog 
        open={editorOpen} 
        onOpenChange={setEditorOpen}
        opportunity={selected}
        onSave={handleSave}
      />

      <ParticipantsDialog 
        open={participantsOpen}
        onOpenChange={setParticipantsOpen}
        eventTitle={selected?.title ?? ''}
        participants={selected ? (mockParticipants[selected.id] ?? []) : []}
      />
    </Card>
  );
}