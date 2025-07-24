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
import { Search, PlusCircle, Award, Star } from 'lucide-react';
import { Student, findStudent, addReminderPoints } from '@/services/students';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PointsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setSearched(true);
    setStudent(null);
    try {
      const foundStudent = await findStudent(searchQuery);
      setStudent(foundStudent);
    } catch (error) {
      toast({
        title: 'خطأ في البحث',
        description: 'لم نتمكن من إجراء البحث. حاول مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async () => {
    if (!student) return;
    try {
      const newPoints = await addReminderPoints(student.id, 5);
      setStudent({ ...student, reminder_points: newPoints });
      toast({
        title: 'تم إضافة النقاط!',
        description: `تم إضافة 5 نقاط للطالب ${student.full_name}. الرصيد الجديد: ${newPoints}`,
        className: 'bg-accent text-accent-foreground',
      });
    } catch (error) {
      toast({
        title: 'خطأ!',
        description: 'فشل إضافة النقاط. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Star className="h-8 w-8 text-primary" />
            نقاط حضور ولي الأمر
          </CardTitle>
          <CardDescription>
            ابحث عن الطالب بالاسم الكامل أو رقم الهاتف لتسجيل حضور وليه وإضافة
            نقاط له.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 mb-8">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="الاسم الكامل أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button type="submit" className="font-headline" disabled={loading}>
              {loading ? 'جارٍ البحث...' : 'بحث'}
            </Button>
          </form>

          {searched && !loading && (
            <div>
              {student ? (
                <div className="space-y-6">
                  <div className="p-6 bg-muted rounded-lg">
                    <h3 className="font-headline text-xl mb-2">
                      {student.full_name}
                    </h3>
                    <p className="text-muted-foreground">
                      نقاط التذكير الحالية:{' '}
                      <span className="font-bold text-primary text-lg">
                        {student.reminder_points}
                      </span>
                    </p>
                  </div>

                  {(student.reminder_points || 0) > 20 && (
                    <Alert className="border-accent bg-accent/10">
                      <Award className="h-5 w-5 text-accent" />
                      <AlertTitle className="font-headline text-accent">
                        له أولوية للانضمام!
                      </AlertTitle>
                      <AlertDescription>
                        هذا الطالب لديه أكثر من 20 نقطة، مما يمنحه الأولوية في
                        التسجيل أو الأنشطة.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleAddPoints}
                    className="w-full font-headline text-lg"
                    size="lg"
                  >
                    <PlusCircle className="ml-2 h-5 w-5" />
                    تسجيل حضور الولي (إضافة 5 نقاط)
                  </Button>
                </div>
              ) : (
                <div className="text-center py-10 bg-muted rounded-md">
                  <p className="text-muted-foreground">
                    لم يتم العثور على طالب يطابق معايير البحث.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}