'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addStudent, Student } from '@/services/students';
import StudentForm from '@/components/student-form';

export default function RegisterPage() {
  const { toast } = useToast();

  const handleRegister = async (values: Omit<Student, 'id'>, resetForm: () => void) => {
    try {
      await addStudent({
        ...values,
        registration_date: new Date(),
      } as any);

      toast({
        title: 'تم التسجيل بنجاح!',
        description: `تم تسجيل الطالب ${values.full_name} في النظام.`,
        className: 'bg-accent text-accent-foreground',
      });
      resetForm();
    } catch (error) {
       toast({
        title: 'حدث خطأ!',
        description: 'فشل تسجيل الطالب. الرجاء المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            تسجيل طالب جديد
          </CardTitle>
          <CardDescription>
            الرجاء تعبئة جميع الحقول المطلوبة لإنشاء سجل جديد للطالب.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <StudentForm 
                onSubmit={handleRegister} 
            />
        </CardContent>
      </Card>
    </div>
  );
}
