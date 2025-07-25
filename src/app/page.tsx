'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserCheck,
  UserPlus,
  List,
  LayoutDashboard,
  Clock,
  UserX,
  School,
  LineChart,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getStudentsRealtime,
  Student,
} from '@/services/students';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
  Legend,
} from 'recharts';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getStudentsRealtime(user.uid, (studentsList) => {
        const formattedStudents = studentsList.map(s => ({
            ...s,
            registration_date: s.registration_date instanceof Date ? s.registration_date : (s.registration_date as any).toDate(),
          }))
      setStudents(formattedStudents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const joined = students.filter((s) => s.status === 'تم الانضمام').length;
    const postponed = students.filter((s) => s.status === 'مؤجل').length;
    const rejected = students.filter((s) => s.status === 'مرفوض').length;
    const moved = students.filter((s) => s.status === 'دخل لمدرسة أخرى').length;
    const latestStudents = [...students].sort((a, b) => b.registration_date.getTime() - a.registration_date.getTime()).slice(0, 5);

    const statusDistribution = [
      { name: 'تم الانضمام', value: joined, fill: 'hsl(var(--accent))' },
      { name: 'مؤجل', value: postponed, fill: 'hsl(var(--primary))' },
      { name: 'مرفوض', value: rejected, fill: 'hsl(var(--destructive))' },
      { name: 'مدرسة أخرى', value: moved, fill: 'hsl(var(--muted-foreground))' },
    ];

    return { totalStudents, joined, postponed, rejected, moved, latestStudents, statusDistribution };
  }, [students]);

  const registrationChartData = useMemo(() => {
    if (timeFrame === 'weekly') {
        const weeklyData: { [week: string]: { count: number, names: string[] } } = {};
        students.forEach(student => {
            const weekStart = startOfWeek(student.registration_date, { locale: ar });
            const weekKey = format(weekStart, 'yyyy-MM-dd');
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { count: 0, names: [] };
            }
            weeklyData[weekKey].count++;
            weeklyData[weekKey].names.push(student.full_name);
        });

        return Object.entries(weeklyData)
            .map(([weekKey, data]) => {
                const weekStart = new Date(weekKey);
                const weekEnd = endOfWeek(weekStart, { locale: ar });
                return {
                    name: `أسبوع ${format(weekStart, 'd MMM', { locale: ar })}`,
                    "عدد التسجيلات": data.count,
                    studentNames: data.names,
                    tooltip: `${format(weekStart, 'd MMM', { locale: ar })} - ${format(weekEnd, 'd MMM yyyy', { locale: ar })}`,
                }
            })
            .sort((a, b) => new Date(a.tooltip.split(' - ')[0]).getTime() - new Date(b.tooltip.split(' - ')[0]).getTime());

    } else { // monthly
        const monthlyData: { [month: string]: { count: number, names: string[] } } = {};
        students.forEach(student => {
            const monthKey = format(student.registration_date, 'yyyy-MM');
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { count: 0, names: [] };
            }
            monthlyData[monthKey].count++;
            monthlyData[monthKey].names.push(student.full_name);
        });
        
        return Object.entries(monthlyData)
            .map(([monthKey, data]) => ({
                name: format(new Date(monthKey), 'MMMM yyyy', { locale: ar }),
                "عدد التسجيلات": data.count,
                studentNames: data.names,
            }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }
  }, [students, timeFrame]);

  const StatCard = ({ title, value, icon: Icon, description, colorClass }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-headline">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${colorClass || 'text-primary'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

   if (loading) {
        return (
            <div className="container mx-auto py-12 px-4">
                 <div className="flex flex-col gap-4 mb-8">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
                 <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-[350px]" />
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-full h-[350px]" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
                لوحة التحكم
            </h1>
            <p className="text-muted-foreground">
                نظرة شاملة على نشاط المدرسة والطلاب.
            </p>
        </div>
        <div className="flex gap-2">
            <Button asChild className="font-headline" size="lg">
                <Link href="/register"><UserPlus />تسجيل طالب جديد</Link>
            </Button>
            <Button asChild className="font-headline" variant="outline" size="lg">
                <Link href="/students"><List />عرض كل الطلبة</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
         <StatCard title="إجمالي الطلاب" value={stats.totalStudents} icon={Users} />
         <StatCard title="المنضمون" value={stats.joined} icon={UserCheck} colorClass="text-accent" />
         <StatCard title="المؤجلون" value={stats.postponed} icon={Clock} colorClass="text-yellow-500" />
         <StatCard title="المرفوضون" value={stats.rejected} icon={UserX} colorClass="text-destructive" />
         <StatCard title="مدرسة أخرى" value={stats.moved} icon={School} colorClass="text-gray-500" />
      </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline">آخر الطلاب المسجلين</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="font-headline">الاسم الكامل</TableHead>
                            <TableHead className="font-headline hidden sm:table-cell">الحالة</TableHead>
                            <TableHead className="font-headline hidden lg:table-cell">تاريخ التسجيل</TableHead>
                             <TableHead className="font-headline text-left">الشيخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.latestStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant={student.status === 'تم الانضمام' ? 'default' : student.status === 'مؤجل' ? 'secondary' : 'destructive'}
                                     className={
                                        student.status === 'تم الانضمام' ? 'bg-accent text-accent-foreground' : ''
                                     }>
                                        {student.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell font-mono" dir="ltr">
                                {format(student.registration_date, 'yyyy-MM-dd')}
                                </TableCell>
                                <TableCell className="text-left">{student.assigned_sheikh || '-'}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">توزيع حالات الطلاب</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={stats.statusDistribution} layout="vertical" dir="rtl" margin={{ right: 20, left: 20 }}>
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
                        <Bar dataKey="value" name="عدد الطلاب" radius={[0, 4, 4, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
      </div>

       <Card className="mt-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-xl flex items-center gap-3">
                <LineChart className="h-6 w-6 text-primary" />
                تطور تسجيلات الطلبة الجدد
              </CardTitle>
              <CardDescription>
                تتبع عدد الطلاب الجدد حسب تاريخ الإضافة.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeFrame === 'weekly' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('weekly')}
              >
                عرض أسبوعي
              </Button>
              <Button
                variant={timeFrame === 'monthly' ? 'default' : 'outline'}
                onClick={() => setTimeFrame('monthly')}
              >
                عرض شهري
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RechartsLineChart data={registrationChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const tooltipLabel = data.tooltip || label;
                    const studentNames = data.studentNames || [];
                    const namesToShow = studentNames.slice(0, 5);
                    const remainingNames = studentNames.length - namesToShow.length;

                    return (
                      <div className="p-3 bg-background border rounded-md shadow-lg max-w-xs">
                        <p className="font-bold text-base mb-2">{tooltipLabel}</p>
                        <p className="text-sm text-accent font-semibold mb-2">{`${payload[0].name}: ${payload[0].value}`}</p>
                        <div className="border-t pt-2 space-y-1">
                            <p className="text-xs text-muted-foreground font-bold">الطلاب المسجلون:</p>
                             {namesToShow.map((name: string, index: number) => (
                                <p key={index} className="text-xs truncate">{`${index + 1}. ${name}`}</p>
                            ))}
                            {remainingNames > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">... و {remainingNames} آخرون.</p>
                            )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="عدد التسجيلات"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--accent))' }}
                activeDot={{ r: 8, fill: 'hsl(var(--accent))', stroke: 'hsl(var(--background))' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </div>
  );
}
