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
import { Edit, Trash2, List, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { getStudentsRealtime, Student, deleteStudent, updateStudent } from '@/services/students';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const unsubscribe = getStudentsRealtime((studentsList) => {
      const formattedStudents = studentsList.map(s => ({
        ...s,
        birth_date: s.birth_date instanceof Date ? s.birth_date : (s.birth_date as any).toDate(),
        registration_date: s.registration_date instanceof Date ? s.registration_date : (s.registration_date as any).toDate(),
      }))
      setStudents(formattedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusBadgeVariant = (status: Student['status']) => {
    switch (status) {
      case 'تم الانضمام':
        return 'default';
      case 'مؤجل':
        return 'secondary';
      case 'دخل لمدرسة أخرى':
        return 'outline';
      case 'رُفِض':
        return 'destructive';
      default:
        return 'default';
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
  
  const handleUpdate = async (values: Omit<Student, 'id'>) => {
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

  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <List className="h-8 w-8 text-primary" />
            قائمة الطلبة المسجلين
          </CardTitle>
          <CardDescription>
            عرض وإدارة بيانات الطلاب المسجلين في المدرسة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <p className='text-center'>جارٍ تحميل بيانات الطلبة...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">الاسم الكامل</TableHead>
                  <TableHead className="font-headline hidden md:table-cell">العمر</TableHead>
                  <TableHead className="font-headline">المستوى</TableHead>
                  <TableHead className="font-headline hidden sm:table-cell">الحالة</TableHead>
                  <TableHead className="font-headline hidden lg:table-cell">تاريخ التسجيل</TableHead>
                  <TableHead className="font-headline text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{student.age} سنوات</TableCell>
                    <TableCell>{student.level}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                       <Badge
                        variant={getStatusBadgeVariant(student.status)}
                         className={
                          student.status === 'تم الانضمام'
                            ? 'bg-accent text-accent-foreground'
                            : ''
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                     <TableCell className="hidden lg:table-cell font-mono" dir="ltr">
                      {format(student.registration_date, 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-center">
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
                            تعديل
                          </DropdownMenuItem>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                    حذف
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                    هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف سجل الطالب بشكل دائم من خوادمنا.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)}>متابعة</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
            <DialogTitle className='font-headline'>تعديل بيانات الطالب</DialogTitle>
            <DialogDescription>
                قم بتحديث الحقول أدناه لحفظ التغييرات.
            </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
                <StudentForm 
                    onSubmit={handleUpdate} 
                    student={selectedStudent} 
                    submitButtonText="حفظ التغييرات"
                />
            )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
