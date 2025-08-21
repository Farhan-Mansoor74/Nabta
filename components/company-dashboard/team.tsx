import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Users, Plus } from 'lucide-react';

const topVolunteers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    points: 1250,
    eventsAttended: 8,
    badge: "Eco Champion"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@company.com",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    points: 980,
    eventsAttended: 6,
    badge: "Green Leader"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "e.rodriguez@company.com",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    points: 750,
    eventsAttended: 5,
    badge: "Nature Advocate"
  },
  {
    id: 4,
    name: "David Kim",
    email: "d.kim@company.com",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    points: 620,
    eventsAttended: 4,
    badge: "Sustainability Star"
  }
];

export default function CompanyTeam() {
  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Team Overview</CardTitle>
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Employees</span>
              <span className="font-semibold text-gray-900 dark:text-white">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Volunteers</span>
              <span className="font-semibold text-gray-900 dark:text-white">87</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Participation Rate</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">56%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full w-[56%]"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Volunteers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Top Volunteers</CardTitle>
          <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVolunteers.map((volunteer, index) => (
              <div key={volunteer.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                  <AvatarFallback>{volunteer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {volunteer.name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {volunteer.points} pts
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {volunteer.eventsAttended} events
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {volunteer.badge}
                </Badge>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Invite More Team Members
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}