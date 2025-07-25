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
import { Edit, Trash2, List, MoreVertical, Search, Filter, X, Printer, FileDown, Star, ChevronDown, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useEffect, useState, useMemo } from 'react';
import { getStudentsRealtime, Student, deleteStudent, updateStudent, SHEIKHS, LEVELS } from '@/services/students';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import StudentForm from '@/components/student-form';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/auth-context';


type Filters = {
    gender: string;
    status: string;
    level: string;
    assigned_sheikh: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    gender: 'الكل',
    status: 'الكل',
    level: 'الكل',
    assigned_sheikh: 'الكل',
  });
  const [exportCategory, setExportCategory] = useState('الكل');

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

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({...prev, [filterName]: value}));
  }

  const resetFilters = () => {
    setFilters({
        gender: 'الكل',
        status: 'الكل',
        level: 'الكل',
        assigned_sheikh: 'الكل',
    });
    setSearchQuery('');
  }

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === '' ||
            student.full_name.toLowerCase().includes(searchLower) ||
            student.guardian_name.toLowerCase().includes(searchLower) ||
            (student.page_number && student.page_number.toString().includes(searchLower));

        const matchesFilters = 
            (filters.gender === 'الكل' || student.gender === filters.gender) &&
            (filters.status === 'الكل' || student.status === filters.status) &&
            (filters.level === 'الكل' || student.level === filters.level) &&
            (filters.assigned_sheikh === 'الكل' || student.assigned_sheikh === filters.assigned_sheikh);
        
        return matchesSearch && matchesFilters;
    })
  }, [students, searchQuery, filters]);

  const getStatusRowClass = (status: Student['status']) => {
    switch (status) {
      case 'تم الانضمام':
        return 'bg-green-100/50 dark:bg-green-900/30 print:bg-green-100 !important';
      case 'مؤجل':
        return 'bg-yellow-100/50 dark:bg-yellow-900/30 print:bg-yellow-100 !important';
       case 'دخل لمدرسة أخرى':
        return 'bg-gray-200/50 dark:bg-gray-800/30 print:bg-gray-200 !important';
      case 'مرفوض':
        return 'bg-red-100/50 dark:bg-red-900/30 print:bg-red-100 !important';
      default:
        return 'print:bg-white !important';
    }
  };
  
  const handleDelete = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      toast({
        title: 'تم الحذف بنجاح!',
        description: 'تم حذف سجل الطالب من النظام.',
        className: 'bg-accent text-accent-foreground',
      });
    } catch (error) {
       toast({
        title: 'حدث خطأ!',
        description: 'فشل حذف سجل الطالب. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  }

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdate = async (values: Omit<Student, 'id' | 'registration_date'>) => {
    if (!selectedStudent) return;
    try {
        await updateStudent(selectedStudent.id, values);
        toast({
            title: 'تم التعديل بنجاح!',
            description: `تم تحديث بيانات الطالب ${values.full_name}.`,
            className: 'bg-accent text-accent-foreground',
        });
        setIsEditDialogOpen(false);
        setSelectedStudent(null);
    } catch (error) {
        toast({
            title: 'حدث خطأ!',
            description: 'فشل تحديث بيانات الطالب. الرجاء المحاولة مرة أخرى.',
            variant: 'destructive',
        });
    }
  }

  const handlePrint = () => {
    window.print();
  }
  
  const handleExportFullData = () => {
    const studentsToExport = exportCategory === 'الكل'
        ? filteredStudents
        : filteredStudents.filter(s => s.status === exportCategory);
    
    if(studentsToExport.length === 0){
         toast({
            title: 'لا توجد بيانات للتصدير',
            description: 'لا يوجد طلاب يطابقون الفئة المحددة.',
            variant: 'destructive',
        });
        return;
    }

    const dataToExport = studentsToExport.map(s => ({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "الطلبة");
    if(!worksheet['!props']) worksheet['!props'] = {};
     worksheet['!props'].RTL = true;
    XLSX.writeFile(workbook, `بيانات_الطلبة_الكاملة_${exportCategory}.xlsx`);
    toast({ title: 'تم تصدير الملف بنجاح ✅' });
  }

  const handleExportTemplate = () => {
     const dataToExport = filteredStudents.map(s => ({
        "الاسم الكامل": s.full_name,
        "الجنس": s.gender,
        "تاريخ الميلاد": format(s.birth_date, 'dd/MM/yyyy'),
        "المستوى الدراسي": s.level,
        "اسم الولي": s.guardian_name,
        "رقم الهاتف 1": s.phone1,
        "رقم الهاتف 2": s.phone2 || '',
        "مقر السكن": s.address,
        "الحالة": s.status,
        "رقم الصفحة": s.page_number || '',
        "ملاحظات": s.note || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج التسجيل");
    if(!worksheet['!props']) worksheet['!props'] = {};
     worksheet['!props'].RTL = true;
    XLSX.writeFile(workbook, "نموذج_تسجيل_الطلبة.xlsx");
     toast({ title: 'تم تصدير الملف بنجاح ✅' });
  }


  const FilterSidebar = () => (
    <Card className="h-fit sticky top-20 print:hidden">
        <CardHeader>
            <CardTitle className='font-headline text-lg flex items-center gap-2'>
                <Filter className="h-5 w-5"/>
                تصفية النتائج
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="gender-filter">الجنس</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                    <SelectTrigger id="gender-filter">
                        <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="status-filter">الحالة</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger id="status-filter">
                        <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="الكل">الكل</SelectItem>
                         <SelectItem value="تم الانضمام">تم الانضمام</SelectItem>
                         <SelectItem value="مؤجل">مؤجل</SelectItem>
                         <SelectItem value="دخل لمدرسة أخرى">دخل لمدرسة أخرى</SelectItem>
                         <SelectItem value="مرفوض">مرفوض</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="level-filter">المستوى الدراسي</Label>
                <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
                    <SelectTrigger id="level-filter">
                        <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        {LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="sheikh-filter">الشيخ المسؤول</Label>
                <Select value={filters.assigned_sheikh} onValueChange={(value) => handleFilterChange('assigned_sheikh', value)}>
                    <SelectTrigger id="sheikh-filter">
                        <SelectValue placeholder="اختر الشيخ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        {SHEIKHS.map(sheikh => <SelectItem key={sheikh} value={sheikh}>{sheikh}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Separator />
            <Button variant="ghost" className='w-full' onClick={resetFilters}>
                <X className="h-4 w-4 ml-2" />
                إعادة تعيين الفلاتر
            </Button>
        </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-12 px-4" id="print-area">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            <div className="lg:col-span-1">
                <FilterSidebar />
            </div>

            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                            <div className='flex-grow'>
                                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                    <List className="h-8 w-8 text-primary" />
                                    قائمة الطلبة المسجلين ({filteredStudents.length})
                                </CardTitle>
                                <CardDescription>
                                    عرض وإدارة بيانات الطلاب المسجلين في المدرسة.
                                </CardDescription>
                            </div>
                            <div className='flex flex-wrap gap-2 print:hidden'>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button>
                                            <Upload className="h-4 w-4 ml-2"/>
                                             📤 تصدير كامل البيانات
                                            <ChevronDown className="h-4 w-4 mr-2"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>اختر فئة للتصدير</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={exportCategory} onValueChange={setExportCategory}>
                                            <DropdownMenuRadioItem value="الكل">الكل</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="تم الانضمام">تم الانضمام</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="مؤجل">مؤجل</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="مرفوض">مرفوض</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="دخل لمدرسة أخرى">دخل لمدرسة أخرى</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={handleExportFullData} className="bg-accent text-accent-foreground focus:bg-accent/90">
                                            تأكيد التصدير
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button variant="outline" onClick={handleExportTemplate}>
                                    <FileDown className="h-4 w-4 ml-2" />
                                     📄 تصدير نموذج التسجيل
                                </Button>

                                <Button variant="outline" onClick={handlePrint}>
                                    <Printer className="h-4 w-4 ml-2" />
                                    طباعة / PDF
                                </Button>
                            </div>
                        </div>

                        <div className="relative pt-4 print:hidden">
                            <Input
                                placeholder="ابحث بالاسم، اسم الولي، أو رقم الصفحة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 text-base"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                    {loading ? (
                        <p className='text-center py-8'>جارٍ تحميل بيانات الطلبة...</p>
                    ) : (
                        <div className="border rounded-md overflow-x-auto">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-headline">الاسم الكامل</TableHead>
                                <TableHead className="font-headline print:table-cell hidden sm:table-cell">الجنس</TableHead>
                                <TableHead className="font-headline print:table-cell hidden sm:table-cell">العمر</TableHead>
                                <TableHead className="font-headline">المستوى</TableHead>
                                <TableHead className="font-headline print:table-cell hidden md:table-cell">اسم الولي</TableHead>
                                <TableHead className="font-headline print:table-cell hidden lg:table-cell">رقم الهاتف 1</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">رقم الهاتف 2</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">مقر السكن</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">رقم الصفحة</TableHead>
                                <TableHead className="font-headline print:table-cell hidden lg:table-cell">تاريخ التسجيل</TableHead>
                                <TableHead className="font-headline">الحالة</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">الشيخ المسؤول</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">النقاط</TableHead>
                                <TableHead className="font-headline print:table-cell hidden xl:table-cell">ملاحظات</TableHead>
                                <TableHead className="font-headline text-center print:hidden">إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                            <TableRow key={student.id} className={getStatusRowClass(student.status)}>
                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                <TableCell className="print:table-cell hidden sm:table-cell">{student.gender}</TableCell>
                                <TableCell className="print:table-cell hidden sm:table-cell">{student.age} س</TableCell>
                                <TableCell>{student.level}</TableCell>
                                <TableCell className="print:table-cell hidden md:table-cell">{student.guardian_name}</TableCell>
                                <TableCell className="print:table-cell hidden lg:table-cell font-mono" dir="ltr">{student.phone1}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell font-mono" dir="ltr">{student.phone2}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell">{student.address}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell">{student.page_number}</TableCell>
                                <TableCell className="print:table-cell hidden lg:table-cell font-mono" dir="ltr">{format(student.registration_date, 'yyyy-MM-dd')}</TableCell>
                                <TableCell>{student.status}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell">{student.assigned_sheikh || '-'}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell">{student.reminder_points || 0}</TableCell>
                                <TableCell className="print:table-cell hidden xl:table-cell max-w-[200px] truncate">{student.note || '-'}</TableCell>
                                <TableCell className="text-center print:hidden">
                                <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-5 w-5" />
                                        <span className="sr-only">فتح الإجراءات</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="flex gap-2" onSelect={() => handleEdit(student)}>
                                            <Edit className="h-4 w-4" />
                                            عرض وتعديل كامل
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="flex gap-2 text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="h-4 w-4" />
                                                حذف الطالب
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف سجل الطالب ({student.full_name}) بشكل دائم من خوادمنا.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive hover:bg-destructive/90">تأكيد الحذف</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                                </TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={15} className="text-center h-24">
                                        لا توجد نتائج مطابقة للبحث أو الفلاتر المحددة.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
            <DialogTitle className='font-headline text-2xl'>عرض وتعديل بيانات الطالب</DialogTitle>
            <DialogDescription>
                يمكنك عرض وتحديث بيانات الطالب من هنا. اضغط على "حفظ التغييرات" عند الانتهاء.
            </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
                <div className="py-4">
                    <StudentForm 
                        onSubmit={handleUpdate}
                        student={selectedStudent} 
                        submitButtonText="حفظ التغييرات"
                    />
                </div>
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
