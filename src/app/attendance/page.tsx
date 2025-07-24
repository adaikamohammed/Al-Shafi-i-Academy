'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Search, Users, CheckCircle, XCircle } from 'lucide-react';

const mockAttendance = {
  '12345': [
    { date: '2024-05-20', status: 'حاضر' },
    { date: '2024-05-19', status: 'حاضر' },
    { date: '2024-05-18', status: 'غائب' },
    { date: '2024-05-17', status: 'حاضر' },
    { date: '2024-05-16', status: 'حاضر' },
  ],
  'أحمد بن محمد النور': [
    { date: '2024-05-20', status: 'حاضر' },
    { date: '2024-05-19', status: 'حاضر' },
    { date: '2024-05-18', status: 'غائب' },
    { date: '2024-05-17', status: 'حاضر' },
    { date: '2024-05-16', status: 'حاضر' },
  ],
};

type AttendanceRecord = {
    date: string;
    status: 'حاضر' | 'غائب';
}

export default function AttendancePage() {
  const [studentId, setStudentId] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundAttendance = (mockAttendance as any)[studentId] || null;
    setAttendance(foundAttendance);
    setSearched(true);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            متابعة حضور الطالب
          </CardTitle>
          <CardDescription>
            أدخل اسم الطالب أو رقمه التعريفي للاطلاع على سجل الحضور والغياب اليومي.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
                <Input
                type="text"
                placeholder="اسم الطالب أو رقمه التعريفي..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button type="submit" className="font-headline w-full sm:w-auto">
              بحث
            </Button>
          </form>

          {searched && (
            <div>
              {attendance ? (
                <div>
                  <h3 className="font-headline text-xl mb-4">
                    سجل الحضور للطالب: <span className="text-primary">{studentId}</span>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-headline">التاريخ</TableHead>
                        <TableHead className="font-headline text-center">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className='font-mono' dir='ltr'>{record.date}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={`flex items-center gap-1.5 justify-center ${
                                record.status === 'حاضر'
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-destructive text-destructive-foreground'
                              }`}
                            >
                              {record.status === 'حاضر' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 bg-muted rounded-md">
                  <p className="text-muted-foreground">لم يتم العثور على سجلات للطالب المدخل.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
