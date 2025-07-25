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
  ArrowLeft,
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
} from 'recharts';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getStudentsRealtime((studentsList) => {
        const formattedStudents = studentsList.map(s => ({
            ...s,
            registration_date: s.registration_date instanceof Date ? s.registration_date : (s.registration_date as any).toDate(),
          }))
      setStudents(formattedStudents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const joined = students.filter((s) => s.status === 'تم الانضمام').length;
    const postponed = students.filter((s) => s.status === 'مؤجل').length;
    const rejected = students.filter((s) => s.status === 'رُفِض').length;
    const latestStudents = students.slice(0, 5);

    const statusDistribution = [
      { name: 'تم الانضمام', value: joined, fill: 'hsl(var(--accent))' },
      { name: 'مؤجل', value: postponed, fill: 'hsl(var(--primary))' },
      { name: 'رُفِض', value: rejected, fill: 'hsl(var(--destructive))' },
    ];

    return { totalStudents, joined, postponed, rejected, latestStudents, statusDistribution };
  }, [students]);

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
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
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
        )
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <StatCard title="إجمالي الطلاب" value={stats.totalStudents} icon={Users} />
         <StatCard title="المنضمون" value={stats.joined} icon={UserCheck} colorClass="text-accent" />
         <StatCard title="المؤجلون" value={postponed} icon={Clock} colorClass="text-yellow-500" />
         <StatCard title="المرفوضون" value={rejected} icon={UserX} colorClass="text-destructive" />
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

    </div>
  );
}
