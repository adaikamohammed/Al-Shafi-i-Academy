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

const students = [
  {
    id: 1,
    name: 'أحمد بن محمد النور',
    grade: 'المستوى الثالث',
    fatherName: 'محمد النور',
    status: 'نشط',
  },
  {
    id: 2,
    name: 'فاطمة بنت علي الصديق',
    grade: 'المستوى الثاني',
    fatherName: 'علي الصديق',
    status: 'نشط',
  },
  {
    id: 3,
    name: 'يوسف بن إبراهيم الخليل',
    grade: 'المستوى الرابع (خاتم)',
    fatherName: 'إبراهيم الخليل',
    status: 'متخرج',
  },
  {
    id: 4,
    name: 'خالد بن سعد الأنصاري',
    grade: 'المستوى الأول',
    fatherName: 'سعد الأنصاري',
    status: 'نشط',
  },
  {
    id: 5,
    name: 'عائشة بنت عمر الفاروق',
    grade: 'المستوى الثالث',
    fatherName: 'عمر الفاروق',
    status: 'نشط',
  },
  {
    id: 6,
    name: 'سليمان بن داود الحكيم',
    grade: 'المستوى الثاني',
    fatherName: 'داود الحكيم',
    status: 'منقطع',
  },
];

export default function StudentsPage() {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-headline">اسم الطالب</TableHead>
                <TableHead className="font-headline hidden md:table-cell">اسم الأب</TableHead>
                <TableHead className="font-headline">المستوى</TableHead>
                <TableHead className="font-headline hidden sm:table-cell">الحالة</TableHead>
                <TableHead className="font-headline text-center">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.fatherName}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        student.status === 'نشط'
                          ? 'default'
                          : student.status === 'متخرج'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        student.status === 'نشط'
                          ? 'bg-accent text-accent-foreground'
                          : ''
                      }
                    >
                      {student.status}
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
