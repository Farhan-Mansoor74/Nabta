import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CompanyTeam() {
  return (
    <div className="space-y-6">
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
    </div>
  );
}