"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data for impact metrics
const impactMetrics = {
  overall: [
    { name: 'Trees Planted', value: 25000, icon: '🌳', target: 50000, color: 'chart-1' },
    { name: 'Waste Collected (kg)', value: 4800, icon: '♻️', target: 10000, color: 'chart-2' },
    { name: 'Volunteers', value: 10000, icon: '👥', target: 15000, color: 'chart-3' },
    { name: 'Events Completed', value: 520, icon: '📅', target: 1000, color: 'chart-4' },
  ],
  monthly: [
    { month: 'Jan', trees: 1200, waste: 350, volunteers: 800 },
    { month: 'Feb', trees: 1500, waste: 400, volunteers: 950 },
    { month: 'Mar', trees: 2000, waste: 500, volunteers: 1100 },
    { month: 'Apr', trees: 2400, waste: 600, volunteers: 1300 },
    { month: 'May', trees: 2800, waste: 700, volunteers: 1500 },
    { month: 'Jun', trees: 3200, waste: 750, volunteers: 1700 },
  ],
  categories: [
    { name: 'Ocean Conservation', value: 30 },
    { name: 'Urban Greening', value: 25 },
    { name: 'Wildlife', value: 20 },
    { name: 'Education', value: 15 },
    { name: 'Waste Management', value: 10 },
  ],
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Impact() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overall');
  const [activeMetric, setActiveMetric] = useState('trees');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Collective Impact</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Together, we&apos;re making measurable progress toward a healthier planet. Every volunteer hour contributes to these growing impact metrics.
          </p>
        </div>

        <Tabs defaultValue="overall" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overall">Overall Progress</TabsTrigger>
              <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overall" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {impactMetrics.overall.map((metric) => (
                <Card key={metric.name} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{metric.icon}</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-500">Goal: {metric.target.toLocaleString()}</span>
                    </div>
                    <Progress
                      className="h-2"
                      value={(metric.value / metric.target) * 100}
                      style={{
                        "--progress-background": `hsl(var(--${metric.color}))`
                      } as React.CSSProperties}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4 space-x-4">
                  {['trees', 'waste', 'volunteers'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setActiveMetric(metric)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium transition",
                        activeMetric === metric
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={impactMetrics.monthly}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey={activeMetric}
                        fill={`hsl(var(--chart-${activeMetric === 'trees' ? '1' :
                            activeMetric === 'waste' ? '2' : '3'
                          }))`}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={impactMetrics.categories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {impactMetrics.categories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Volunteer Participation by Category</h3>
                    <div className="space-y-4">
                      {impactMetrics.categories.map((category, index) => (
                        <div key={category.name} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {category.name}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {category.value}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${category.value}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}