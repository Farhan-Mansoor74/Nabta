"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const monthlyData = [
  { month: 'Jan', volunteers: 12, hours: 48, events: 2 },
  { month: 'Feb', volunteers: 18, hours: 72, events: 3 },
  { month: 'Mar', volunteers: 25, hours: 125, events: 5 },
  { month: 'Apr', volunteers: 32, hours: 160, events: 6 },
  { month: 'May', volunteers: 28, hours: 140, events: 5 },
  { month: 'Jun', volunteers: 35, hours: 175, events: 7 }
];

const categoryData = [
  { name: 'Ocean Conservation', value: 35, color: '#3B82F6' },
  { name: 'Urban Greening', value: 28, color: '#10B981' },
  { name: 'Wildlife Protection', value: 20, color: '#8B5CF6' },
  { name: 'Education', value: 17, color: '#F59E0B' }
];

const impactMetrics = [
  { metric: 'Trees Planted', value: 245, unit: 'trees', change: '+12%' },
  { metric: 'Waste Collected', value: 1.2, unit: 'tons', change: '+8%' },
  { metric: 'Volunteer Hours', value: 720, unit: 'hours', change: '+15%' },
  { metric: 'CO2 Offset', value: 3.4, unit: 'tons', change: '+20%' }
];

export default function CompanyImpact() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Impact Analytics</CardTitle>
        <p className="text-gray-600 dark:text-gray-400">Track your environmental impact and volunteer engagement</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {impactMetrics.map((metric) => (
                <div key={metric.metric} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {metric.value}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">
                      {metric.unit}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {metric.metric}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full inline-block">
                    {metric.change} from last quarter
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="volunteers" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Volunteers"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Hours"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Volunteer Distribution by Category
                </h3>
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}