
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users2, Search, Save } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getStudentsRealtime, Student, updateMultipleStudents, SHEIKHS, LEVELS } from '@/services/students';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Label } from '@/components/ui/label';
import ReactSelect from 'react-select';

type StudentUpdate = {
  status?: Student['status'];
  assigned_sheikh?: Student['assigned_sheikh'];
};

export default function CohortsPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<{ value: string; label: string; }[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<{ value: string; label: string; }[]>([
    { value: 'مؤجل', label: 'مؤجل' },
    { value: 'مرفوض', label: 'مرفوض' },
    { value: 'دخل لمدرسة أخرى', label: 'دخل لمدرسة أخرى' },
  ]);
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [studentUpdates, setStudentUpdates] = useState<Record<string, StudentUpdate>>({});

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
      })).sort((a,b) => a.registration_date.getTime() - b.registration_date.getTime()); // Sort oldest first
      setAllStudents(formattedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const levelOptions = LEVELS.map(l => ({ value: l, label: l }));
  const statusOptions = ['تم الانضمام', 'مؤجل', 'مرفوض', 'دخل لمدرسة أخرى'].map(s => ({ value: s, label: s }));

  const handleSearch = () => {
    const levels = selectedLevels.map(l => l.value);
    const statuses = selectedStatuses.map(s => s.value);

    const filtered = allStudents.filter(student => {
        const matchesLevel = levels.length === 0 || levels.includes(student.level);
        const matchesStatus = statuses.length === 0 || statuses.includes(student.status);
        return matchesLevel && matchesStatus;
    });
    setFilteredStudents(filtered);
    setSelectedStudents({});
    setStudentUpdates({});
  }

  const handleSelectStudent = (studentId: string, isSelected: boolean) => {
    setSelectedStudents(prev => ({ ...prev, [studentId]: isSelected }));
  }

  const handleSelectAll = (isSelected: boolean) => {
      const newSelected: Record<string, boolean> = {};
      filteredStudents.forEach(s => {
          newSelected[s.id] = isSelected;
      });
      setSelectedStudents(newSelected);
  }

  const handleFieldChange = (studentId: string, field: keyof StudentUpdate, value: string) => {
      setStudentUpdates(prev => ({
          ...prev,
          [studentId]: {
              ...prev[studentId],
              [field]: value,
          }
      }));
  }

  const handleBulkChange = (field: keyof StudentUpdate, value: string) => {
      const updatesToApply: Record<string, StudentUpdate> = {};
      Object.keys(selectedStudents).forEach(id => {
          if(selectedStudents[id]) {
            updatesToApply[id] = { ...studentUpdates[id], [field]: value };
          }
      });
      setStudentUpdates(prev => ({...prev, ...updatesToApply}));
  }

  const handleSaveChanges = async () => {
    const updates = Object.entries(studentUpdates)
        .filter(([id, data]) => Object.keys(data).length > 0)
        .map(([id, data]) => ({ id, ...data }));
        
    if (updates.length === 0) {
        toast({ title: 'لا توجد تغييرات للحفظ', variant: 'default' });
        return;
    }

    try {
        await updateMultipleStudents(updates);
        toast({ title: 'تم حفظ التغييرات بنجاح!', className: 'bg-accent text-accent-foreground'});
        setStudentUpdates({});
        setSelectedStudents({});
        // Re-run search to reflect changes
        handleSearch();
    } catch (error) {
        toast({ title: 'فشل حفظ التغييرات', variant: 'destructive'});
        console.error(error);
    }
  }

  const isAllSelected = filteredStudents.length > 0 && Object.keys(selectedStudents).length === filteredStudents.length && Object.values(selectedStudents).every(v => v);

  return (
    <div className="container mx-auto py-12 px-4">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <Users2 className="h-8 w-8 text-primary" />
                    تكوين أفواج وإعادة تفعيل الطلبة
                </CardTitle>
                <CardDescription>
                    فلترة الطلبة حسب المستوى والحالة لتعيينهم في أفواج جديدة أو تغيير حالتهم.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4 mb-8">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-end'>
                         <div>
                            <Label htmlFor="levels-filter" className="font-headline mb-2 block">اختر المستوى الدراسي (متعدد)</Label>
                            <ReactSelect
                                id="levels-filter"
                                isMulti
                                options={levelOptions}
                                value={selectedLevels}
                                onChange={(opts) => setSelectedLevels(opts as any)}
                                placeholder="اختر مستوى واحد أو أكثر..."
                                styles={{ menu: base => ({...base, zIndex: 10})}}
                            />
                        </div>
                         <div>
                            <Label htmlFor="status-filter" className="font-headline mb-2 block">اختر الحالات</Label>
                            <ReactSelect
                                id="status-filter"
                                isMulti
                                options={statusOptions}
                                value={selectedStatuses}
                                onChange={(opts) => setSelectedStatuses(opts as any)}
                                placeholder="اختر حالة واحدة أو أكثر..."
                                styles={{ menu: base => ({...base, zIndex: 9})}}
                            />
                        </div>
                    </div>
                    <Button onClick={handleSearch} className="w-full md:w-auto font-headline">
                        <Search className="ml-2" />
                        بحث الطلبة حسب الفلترة
                    </Button>
                </div>

                {filteredStudents.length > 0 && (
                    <div>
                         <div className="p-4 border rounded-lg bg-muted/50 space-y-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className='flex gap-4 items-center'>
                                <p className='font-bold'>تعديل جماعي لـ {Object.values(selectedStudents).filter(v => v).length} طلبة:</p>
                                <Select onValueChange={(value) => handleBulkChange('status', value)}>
                                    <SelectTrigger className="w-[180px] bg-background">
                                        <SelectValue placeholder="تغيير الحالة إلى..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="تم الانضمام">تم الانضمام</SelectItem>
                                        <SelectItem value="مؤجل">مؤجل</SelectItem>
                                        <SelectItem value="مرفوض">مرفوض</SelectItem>
                                        <SelectItem value="دخل لمدرسة أخرى">دخل لمدرسة أخرى</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Select onValueChange={(value) => handleBulkChange('assigned_sheikh', value)}>
                                    <SelectTrigger className="w-[180px] bg-background">
                                        <SelectValue placeholder="تعيين الشيخ..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SHEIKHS.map(sheikh => <SelectItem key={sheikh} value={sheikh}>{sheikh}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSaveChanges} className="bg-accent text-accent-foreground hover:bg-accent/80 font-headline">
                                <Save className="ml-2" />
                                حفظ كل التغييرات
                            </Button>
                        </div>
                        <div className="border rounded-md overflow-x-auto">
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='px-2'>
                                            <Checkbox checked={isAllSelected} onCheckedChange={(checked) => handleSelectAll(!!checked)} />
                                        </TableHead>
                                        <TableHead>الرقم</TableHead>
                                        <TableHead>تاريخ التسجيل</TableHead>
                                        <TableHead>الاسم الكامل</TableHead>
                                        <TableHead>المستوى</TableHead>
                                        <TableHead>الحالة الأصلية</TableHead>
                                        <TableHead>تغيير الحالة</TableHead>
                                        <TableHead>تعيين شيخ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student, index) => (
                                        <TableRow key={student.id}>
                                            <TableCell className='px-2'>
                                                <Checkbox checked={!!selectedStudents[student.id]} onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}/>
                                            </TableCell>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{format(student.registration_date, 'yyyy/MM/dd')}</TableCell>
                                            <TableCell className='font-medium'>{student.full_name}</TableCell>
                                            <TableCell>{student.level}</TableCell>
                                            <TableCell>{student.status}</TableCell>
                                            <TableCell>
                                                 <Select 
                                                    value={studentUpdates[student.id]?.status ?? ''}
                                                    onValueChange={(value) => handleFieldChange(student.id, 'status', value)}
                                                 >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="اختر حالة جديدة..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                         <SelectItem value="تم الانضمام">تم الانضمام</SelectItem>
                                                         <SelectItem value="مؤجل">مؤجل</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                             <TableCell>
                                                 <Select 
                                                    value={studentUpdates[student.id]?.assigned_sheikh ?? ''}
                                                    onValueChange={(value) => handleFieldChange(student.id, 'assigned_sheikh', value)}
                                                 >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue placeholder="اختر شيخًا..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SHEIKHS.map(sheikh => <SelectItem key={sheikh} value={sheikh}>{sheikh}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
