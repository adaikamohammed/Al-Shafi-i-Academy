'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { addStudent, Student } from '@/services/students';
import { useState } from 'react';

const formSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يتكون من حرفين على الأقل.'),
  gender: z.enum(['ذكر', 'أنثى'], { required_error: 'الرجاء اختيار الجنس.' }),
  birth_date: z.date({
    required_error: 'تاريخ الميلاد مطلوب.',
  }),
  level: z.enum(['تحضيري', 'روضة', '5 سنوات ابتدائي', '4 متوسط', '3 ثانوي', 'جامعي'], { required_error: 'الرجاء اختيار المستوى الدراسي.' }),
  guardian_name: z.string().min(2, 'اسم الأب يجب أن يتكون من حرفين على الأقل.'),
  phone1: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'رقم الهاتف غير صالح.'),
  phone2: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'رقم الهاتف غير صالح.').optional().or(z.literal('')),
  address: z.string().min(5, 'العنوان يجب أن يتكون من 5 أحرف على الأقل.'),
  status: z.enum(['تم الانضمام', 'مؤجل', 'دخل لمدرسة أخرى', 'رُفِض'], { required_error: 'الرجاء اختيار الحالة.' }),
  page_number: z.coerce.number().optional(),
  assigned_sheikh: z.string().optional(),
  note: z.string().optional(),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<string | undefined>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      guardian_name: '',
      address: '',
      phone1: '',
      phone2: '',
      page_number: 0,
      note: '',
      assigned_sheikh: '',
    },
  });

  function calculateAge(birthDate: Date) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  function getAgeGroup(age: number) {
    if (age < 7) return 'أقل من 7';
    if (age >= 7 && age <= 10) return 'من 7–10';
    if (age >= 11 && age <= 13) return 'من 11–13';
    return '14+';
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const age = calculateAge(values.birth_date);
      const age_group = getAgeGroup(age);

      const studentData: Omit<Student, 'id'> = {
        ...values,
        age,
        age_group,
        registration_date: new Date(),
        reminder_points: 0,
      };
      
      await addStudent(studentData);

      toast({
        title: 'تم التسجيل بنجاح!',
        description: `تم تسجيل الطالب ${values.full_name} في النظام.`,
        className: 'bg-accent text-accent-foreground',
      });
      form.reset();
      setStatus(undefined);
    } catch (error) {
       toast({
        title: 'حدث خطأ!',
        description: `فشل تسجيل الطالب. الرجاء المحاولة مرة أخرى.`,
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: محمد عبدالله" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">الجنس</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الجنس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ذكر">ذكر</SelectItem>
                          <SelectItem value="أنثى">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-headline">تاريخ الميلاد</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-right font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>اختر تاريخاً</span>
                              )}
                              <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1990-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">المستوى الدراسي</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="تحضيري">تحضيري</SelectItem>
                          <SelectItem value="روضة">روضة</SelectItem>
                          <SelectItem value="5 سنوات ابتدائي">5 سنوات ابتدائي</SelectItem>
                          <SelectItem value="4 متوسط">4 متوسط</SelectItem>
                          <SelectItem value="3 ثانوي">3 ثانوي</SelectItem>
                          <SelectItem value="جامعي">جامعي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">اسم الولي</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: عبدالله أحمد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="phone1"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-headline">رقم الهاتف 1</FormLabel>
                        <FormControl>
                        <Input dir="ltr" placeholder="05XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone2"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="font-headline">رقم الهاتف 2 (اختياري)</FormLabel>
                        <FormControl>
                        <Input dir="ltr" placeholder="05XXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline">مقر السكن</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: تقسيم الوادي، الشارع الرئيسي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">الحالة</FormLabel>
                      <Select onValueChange={(value) => { field.onChange(value); setStatus(value); }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="تم الانضمام">تم الانضمام</SelectItem>
                          <SelectItem value="مؤجل">مؤجل</SelectItem>
                          <SelectItem value="دخل لمدرسة أخرى">دخل لمدرسة أخرى</SelectItem>
                           <SelectItem value="رُفِض">رُفِض</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {status === 'تم الانضمام' && (
                    <FormField
                    control={form.control}
                    name="assigned_sheikh"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-headline">الشيخ المسؤول</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الشيخ" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="الشيخ إبراهيم مراد">الشيخ إبراهيم مراد</SelectItem>
                                <SelectItem value="الشيخ عبد القادر">الشيخ عبد القادر</SelectItem>
                                <SelectItem value="الشيخ زياد درويش">الشيخ زياد درويش</SelectItem>
                                <SelectItem value="الشيخ أحمد بن عمر">الشيخ أحمد بن عمر</SelectItem>
                                <SelectItem value="الشيخ فؤاد بن عمر">الشيخ فؤاد بن عمر</SelectItem>
                                <SelectItem value="الشيخ صهيب نصيب">الشيخ صهيب نصيب</SelectItem>
                                <SelectItem value="الشيخ سفيان نصيرة">الشيخ سفيان نصيرة</SelectItem>
                                <SelectItem value="الشيخ عبد الحق نصيرة">الشيخ عبد الحق نصيرة</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>

             <FormField
                control={form.control}
                name="page_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline">رقم الصفحة</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="مثال: 39" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline">ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea placeholder="أضف ملاحظات هنا..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
                />


              <Button type="submit" size="lg" className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90">
                تسجيل الطالب
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
