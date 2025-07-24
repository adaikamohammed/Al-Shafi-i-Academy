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
import { getStudents, Student } from '@/services/students';
import { format } from 'date-fns';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsList = await getStudents();
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching students: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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
                      {format(student.registration_date.toDate(), 'yyyy-MM-dd')}
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
                          <DropdownMenuItem className="flex gap-2">
                            <Edit className="h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
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
    </div>
  );
}

