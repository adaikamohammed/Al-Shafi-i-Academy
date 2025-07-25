'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Search, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabList, TabPanel, Tab } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { useEffect, useState, useMemo } from 'react';
import { getStudentsRealtime, Student } from '@/services/students';
import { format, isWithinInterval, isEqual, getYear, getMonth, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

type FilterType = 'day' | 'range' | 'month' | 'year';

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [filterType, setFilterType] = useState<FilterType>('day');
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined });
  const [selectedMonth, setSelectedMonth] = useState<number>(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState<number>(getYear(new Date()));

  useEffect(() => {
    if (!user?.uid) {
        setLoading(false);
        return;
    };
    const unsubscribe = getStudentsRealtime(user.uid, (studentsList) => {
      const formattedStudents = studentsList.map(s => ({
        ...s,
        birth_date: s.birth_date instanceof Date ? s.birth_date : (s.birth_date as any).toDate(),
        registration_date: s.registration_date instanceof Date ? s.registration_date : (s.registration_date as any).toDate(),
      }))
      setStudents(formattedStudents);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);
  
  const filteredStudents = useMemo(() => {
    if (loading || students.length === 0) return [];
    
    switch(filterType) {
        case 'day':
            if (!selectedDay) return [];
            return students.filter(s => isEqual(s.registration_date, selectedDay));
        case 'range':
            if (!dateRange.from || !dateRange.to) return [];
            return students.filter(s => isWithinInterval(s.registration_date, { start: dateRange.from!, end: dateRange.to! }));
        case 'month': {
            const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
            const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));
            return students.filter(s => isWithinInterval(s.registration_date, { start: monthStart, end: monthEnd }));
        }
        case 'year': {
            const yearStart = startOfYear(new Date(selectedYear, 0));
            const yearEnd = endOfYear(new Date(selectedYear, 0));
            return students.filter(s => isWithinInterval(s.registration_date, { start: yearStart, end: yearEnd }));
        }
        default:
            return [];
    }
  }, [students, loading, filterType, selectedDay, dateRange, selectedMonth, selectedYear]);

  const handleExport = () => {
    if (filteredStudents.length === 0) {
        toast({ title: 'لا توجد بيانات للتصدير', variant: 'destructive' });
        return;
    }
    const dataToExport = filteredStudents.map(s => ({
        "الاسم الكامل": s.full_name,
        "الجنس": s.gender,
        "تاريخ الميلاد": format(s.birth_date, 'yyyy-MM-dd'),
        "العمر": s.age,
        "المستوى الدراسي": s.level,
        "اسم الولي": s.guardian_name,
        "رقم الهاتف 1": s.phone1,
        "رقم الهاتف 2": s.phone2 || '-',
        "مقر السكن": s.address,
        "رقم الصفحة": s.page_number,
        "تاريخ التسجيل": format(s.registration_date, 'yyyy-MM-dd'),
        "الحالة": s.status,
        "الشيخ المسؤول": s.assigned_sheikh || '-',
        "نقاط التذكير": s.reminder_points || 0,
        "الملاحظات": s.note || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقارير");
    if(!worksheet['!props']) worksheet['!props'] = {};
     worksheet['!props'].RTL = true;
    XLSX.writeFile(workbook, `تقرير_الطلبة_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast({ title: 'تم تصدير الملف بنجاح ✅' });
  };
  
  const years = Array.from({length: getYear(new Date()) - 2020 + 1}, (_, i) => 2021 + i);
  const months = [
    {value: 0, label: 'جانفي'}, {value: 1, label: 'فيفري'}, {value: 2, label: 'مارس'},
    {value: 3, label: 'أفريل'}, {value: 4, label: 'ماي'}, {value: 5, label: 'جوان'},
    {value: 6, label: 'جويلية'}, {value: 7, label: 'أوت'}, {value: 8, label: 'سبتمبر'},
    {value: 9, label: 'أكتوبر'}, {value: 10, label: 'نوفمبر'}, {value: 11, label: 'ديسمبر'}
  ];


  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                التقارير والإحصائيات الزمنية
            </CardTitle>
            <CardDescription>
                تصفية وعرض بيانات تسجيل الطلبة حسب التاريخ.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs onSelect={(index) => setFilterType(['day', 'range', 'month', 'year'][index] as FilterType)}>
                <TabList>
                    <Tab>بحث يومي</Tab>
                    <Tab>بحث حسب فترة</Tab>
                    <Tab>بحث شهري</Tab>
                    <Tab>بحث سنوي</Tab>
                </TabList>

                <div className="p-4 border border-t-0 rounded-b-md">
                    <TabPanel>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Label htmlFor='day-picker'>اختر يوماً:</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="day-picker"
                                        variant={'outline'}
                                        className={cn(
                                        'w-[280px] justify-start text-left font-normal',
                                        !selectedDay && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {selectedDay ? format(selectedDay, 'PPP') : <span>اختر تاريخ</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDay}
                                        onSelect={setSelectedDay}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </TabPanel>
                    <TabPanel>
                       <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Label>اختر فترة:</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                        'w-[280px] justify-start text-left font-normal',
                                        !dateRange.from && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {dateRange.from ? format(dateRange.from, 'PPP') : <span>تاريخ البداية</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={dateRange.from} onSelect={(d) => setDateRange(prev => ({ ...prev, from: d }))} />
                                </PopoverContent>
                            </Popover>
                            <span>-</span>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                        'w-[280px] justify-start text-left font-normal',
                                        !dateRange.to && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="ml-2 h-4 w-4" />
                                        {dateRange.to ? format(dateRange.to, 'PPP') : <span>تاريخ النهاية</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={dateRange.to} onSelect={(d) => setDateRange(prev => ({ ...prev, to: d }))} />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </TabPanel>
                    <TabPanel>
                         <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Label>اختر الشهر والسنة:</Label>
                             <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="الشهر" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="السنة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                    </TabPanel>
                    <TabPanel>
                       <div className="flex flex-col sm:flex-row items-center gap-4">
                          <Label>اختر السنة:</Label>
                           <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="السنة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                </SelectContent>
                            </Select>
                       </div>
                    </TabPanel>
                </div>
            </Tabs>
            
            <div className="mt-8">
                <div className='flex justify-between items-center mb-4'>
                    <h3 className="font-headline text-xl">نتائج البحث ({filteredStudents.length} طالب)</h3>
                    <Button onClick={handleExport} disabled={filteredStudents.length === 0}>
                        <FileDown className="ml-2" />
                        تصدير النتائج إلى Excel
                    </Button>
                </div>

                <div className="border rounded-md overflow-x-auto">
                    {loading ? (
                         <p className='text-center py-8'>جارٍ تحميل البيانات...</p>
                    ): (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الاسم الكامل</TableHead>
                                    <TableHead>تاريخ التسجيل</TableHead>
                                    <TableHead>العمر</TableHead>
                                    <TableHead>المستوى</TableHead>
                                    <TableHead>اسم الولي</TableHead>
                                    <TableHead>رقم الهاتف</TableHead>
                                    <TableHead>الحالة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.full_name}</TableCell>
                                        <TableCell className="font-mono" dir="ltr">{format(student.registration_date, 'yyyy-MM-dd')}</TableCell>
                                        <TableCell>{student.age} س</TableCell>
                                        <TableCell>{student.level}</TableCell>
                                        <TableCell>{student.guardian_name}</TableCell>
                                        <TableCell className="font-mono" dir="ltr">{student.phone1}</TableCell>
                                        <TableCell>{student.status}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24">
                                            لا توجد نتائج مطابقة للبحث. الرجاء تغيير الفلاتر.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
