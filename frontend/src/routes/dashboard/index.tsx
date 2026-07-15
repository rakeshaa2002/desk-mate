import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Building, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from 'recharts';
import { mockActivities } from '@/services/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});

const revenueData = [
  { name: 'Jan', total: 32000 },
  { name: 'Feb', total: 45000 },
  { name: 'Mar', total: 42000 },
  { name: 'Apr', total: 51000 },
  { name: 'May', total: 60000 },
  { name: 'Jun', total: 72000 },
  { name: 'Jul', total: 85000 },
];

const occupancyData = [
  { time: '08:00', rate: 20 },
  { time: '10:00', rate: 65 },
  { time: '12:00', rate: 85 },
  { time: '14:00', rate: 90 },
  { time: '16:00', rate: 75 },
  { time: '18:00', rate: 40 },
];

function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening at DeskMate today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download Report</Button>
          <Button>Add New Member</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (Monthly)</CardTitle>
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$85,231.00</div>
            <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +180 new this week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workspaces Occupied</CardTitle>
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              +2% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Subscriptions</CardTitle>
            <div className="bg-red-100 p-2 rounded-full text-red-600">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">42</div>
            <p className="text-xs text-red-600 flex items-center mt-1 font-medium">
              <ArrowDownRight className="h-3 w-3 mr-1" /> Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="md:col-span-4 lg:col-span-5 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Monthly revenue breakdown for the current year.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 lg:col-span-2 hover:shadow-md transition-shadow flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the space.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-6">
              {mockActivities.map((activity, i) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="relative mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full absolute -left-1.5 top-1.5 ring-4 ring-background" />
                    {i !== mockActivities.length - 1 && (
                      <div className="w-[1px] h-10 bg-border absolute left-[3px] top-4" />
                    )}
                  </div>
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">{activity.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <div className="flex items-center text-xs text-muted-foreground pt-1">
                      <span className="font-medium text-foreground mr-1">{activity.user}</span>
                      <Clock className="w-3 h-3 mr-1 ml-auto" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
         <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Today's Occupancy</CardTitle>
            <CardDescription>Real-time workspace utilization rate.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used administrative tools.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
               <div className="bg-primary/10 p-2 rounded-full"><Users className="w-5 h-5 text-primary" /></div>
               <span>Register Visitor</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
               <div className="bg-primary/10 p-2 rounded-full"><Building className="w-5 h-5 text-primary" /></div>
               <span>Allocate Desk</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
               <div className="bg-primary/10 p-2 rounded-full"><DollarSign className="w-5 h-5 text-primary" /></div>
               <span>Generate Invoice</span>
             </Button>
             <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors">
               <div className="bg-primary/10 p-2 rounded-full"><Activity className="w-5 h-5 text-primary" /></div>
               <span>Device Status</span>
             </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
