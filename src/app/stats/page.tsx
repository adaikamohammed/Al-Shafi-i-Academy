'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, Users, BookCheck, BarChart3 as BarChartIcon, UserCheck, UserX, Clock, Award } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { getStudentsRealtime, Student, LEVELS } from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getStudentsRealtime((studentsList) => {
            setStudents(studentsList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const stats = useMemo(() => {
        const totalStudents = students.length;
        const joined = students.filter(s => s.status === 'تم الانضمام').length;
        const postponed = students.filter(s => s.status === 'مؤجل').length;
        const rejected = students.filter(s => s.status === 'رُفِض').length;
        const highReminders = students.filter(s => (s.reminder_points || 0) > 20).length;
        
        const levelDistribution = LEVELS.map(level => ({
            name: level,
            students: students.filter(s => s.level === level).length
        })).filter(item => item.students > 0);

        const statusDistribution = [
            { name: 'تم الانضمام', value: joined, fill: 'hsl(var(--accent))' },
            { name: 'مؤجل', value: postponed, fill: 'hsl(var(--primary))' },
            { name: 'رُفِض', value: rejected, fill: 'hsl(var(--destructive))' },
        ];


        return { totalStudents, joined, postponed, rejected, highReminders, levelDistribution, statusDistribution };
    }, [students]);

    if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                 <div className="flex flex-col gap-4 mb-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-5 w-5 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-7 w-12" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-[350px]" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="w-full h-[350px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">إجمالي الطلاب</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">المنضمون</CardTitle>
            <UserCheck className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.joined}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">المؤجلون</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.postponed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">المرفوضون</CardTitle>
            <UserX className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">نقاط تذكير عالية</CardTitle>
            <Award className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highReminders}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">توزيع الطلاب حسب المستوى</CardTitle>
            <CardDescription>
              يوضح هذا الرسم البياني عدد الطلاب في كل مستوى دراسي.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={stats.levelDistribution} layout="vertical" dir="rtl" margin={{ right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
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

         <Card>
          <CardHeader>
            <CardTitle className="font-headline">توزيع الطلاب حسب الحالة</CardTitle>
            <CardDescription>
              يوضح هذا الرسم البياني توزيع حالات الطلاب.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={stats.statusDistribution} layout="horizontal" dir="rtl" margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" type="category" />
                <YAxis type="number" allowDecimals={false}/>
                <Tooltip
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                    contentStyle={{ 
                    direction: 'rtl',
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Bar dataKey="value" name="عدد الطلاب" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
