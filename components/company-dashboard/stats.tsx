import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Calendar, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  {
    title: "Active Opportunities",
    value: "12",
    change: "+3",
    changeType: "increase",
    icon: Calendar,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30"
  },
  {
    title: "Employee Participation",
    value: "87%",
    change: "+12%",
    changeType: "increase",
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
  },
  {
    title: "Total Impact Points",
    value: "15,420",
    change: "+2,340",
    changeType: "increase",
    icon: Award,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30"
  },
  {
    title: "Sustainability Goals",
    value: "8/10",
    change: "+2",
    changeType: "increase",
    icon: Target,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30"
  }
];

export default function CompanyStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isIncrease = stat.changeType === "increase";
        
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div className="flex items-center text-sm">
                  {isIncrease ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                  )}
                  <span className={cn(
                    "font-medium",
                    isIncrease ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {stat.change}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}