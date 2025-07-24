'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Users, BookCheck, BarChart3 as BarChartIcon } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const data = [
  { name: 'المستوى 1', students: 18 },
  { name: 'المستوى 2', students: 25 },
  { name: 'المستوى 3', students: 15 },
  { name: 'الخاتمون', students: 8 },
];

export default function StatsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
            <BarChartIcon className="h-8 w-8 text-primary" />
            إحصائيات المدرسة
        </h1>
        <p className="text-muted-foreground">
            نظرة عامة على أرقام وبيانات المدرسة الحالية.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">إجمالي الطلاب</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">66</div>
            <p className="text-xs text-muted-foreground">+5 عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">الطلاب الخاتمون</CardTitle>
            <BookCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 هذا العام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">متوسط الحضور اليومي</CardTitle>
            <BarChart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">نسبة حضور ممتازة</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">توزيع الطلاب حسب المستوى</CardTitle>
            <CardDescription>
              يوضح هذا الرسم البياني عدد الطلاب في كل مستوى دراسي.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={data} layout="vertical" dir="rtl">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                  contentStyle={{ 
                    direction: 'rtl',
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Bar dataKey="students" fill="hsl(var(--primary))" name="عدد الطلاب" radius={[0, 4, 4, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
