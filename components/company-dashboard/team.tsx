import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Shield, User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  lastActive: string;
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    lastActive: '3 hours ago'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@company.com',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    lastActive: '5 hours ago'
  }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Crown className="h-3 w-3" />;
    case 'manager':
      return <Shield className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'manager':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default function CompanyTeam() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">Team Overview</CardTitle>
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Stats Section */}
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

            {/* Team Members Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dashboard Access</h4>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getRoleColor(member.role)} flex items-center gap-1`}>
                        {getRoleIcon(member.role)}
                        <span className="text-xs">{member.role}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show more indicator */}
              <div className="text-center">
                <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  View all 152 team members
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}