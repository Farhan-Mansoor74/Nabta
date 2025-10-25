"use client";

import { useState, useEffect } from 'react';
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
  Eye,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EventEditorDialog, { Opportunity } from './EventEditorDialog';
import ParticipantsDialog, { Participant } from './ParticipantsDialog';
import { useUser } from '@/hooks/useUser';
import { ApiClient } from '@/lib/apiClient';
import { supabase } from '@/lib/supabaseClient';

export default function CompanyOpportunities() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState("active");
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch opportunities from backend
  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await ApiClient.get('/api/companies/opportunities');
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOpportunities();
    }
  }, [user]);

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
    console.log('Opening participants dialog for event:', opp);
    setSelected(opp);
    // Small delay to ensure state is set
    setTimeout(() => setParticipantsOpen(true), 0);
  };

  const handleSave = async (updated: Opportunity) => {
    try {
      if (updated.id) {
        // Update existing opportunity
        const data = await ApiClient.put(`/api/companies/opportunities/${updated.id}`, updated);
        setItems(prev => prev.map(i => i.id === updated.id ? data : i));
      } else {
        // Create new opportunity
        const data = await ApiClient.post('/api/companies/opportunities', updated);
        setItems(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Error saving opportunity:', err);
      setError(err instanceof Error ? err.message : 'Failed to save opportunity');
    }
  };

  const handleDelete = async (opportunity: Opportunity) => {
    if (!opportunity.id) return;
    
    try {
      await ApiClient.delete(`/api/companies/opportunities/${opportunity.id}`);
      setItems(prev => prev.filter(i => i.id !== opportunity.id));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity');
    }
  };

  if (userLoading) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your opportunities.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Your Opportunities</CardTitle>
        <p className="text-gray-600 dark:text-gray-400">Manage and track your volunteering events</p>
        {error && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
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
                          {opportunity.event_date ? new Date(opportunity.event_date).toLocaleDateString() : 'No date set'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                          {opportunity.current_participants || 0}/{opportunity.max_participants || opportunity.capacity || 0} registered
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="h-4 w-4 mr-1" />
                        {opportunity.views || 0} views
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
                        <DropdownMenuItem 
                          className="text-red-600 dark:text-red-400"
                          onClick={() => handleDelete(opportunity)}
                        >
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
                        {Math.round(((opportunity.current_participants || 0) / (opportunity.max_participants || opportunity.capacity || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${((opportunity.current_participants || 0) / (opportunity.max_participants || opportunity.capacity || 1)) * 100}%` }}
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
            )}
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
        eventId={selected?.id}
      />
    </Card>
  );
}