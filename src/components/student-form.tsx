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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Student, SHEIKHS, LEVELS } from '@/services/students';
import { useEffect, useState } from 'react';

const StudentFormSchema = z.object({
  full_name: z.string().min(2, 'الاسم يجب أن يتكون من حرفين على الأقل.'),
  gender: z.enum(['ذكر', 'أنثى'], { required_error: 'الرجاء اختيار الجنس.' }),
  birth_date: z.date({
    required_error: 'تاريخ الميلاد مطلوب.',
  }),
  level: z.enum(LEVELS, { required_error: 'الرجاء اختيار المستوى الدراسي.' }),
  guardian_name: z.string().min(2, 'اسم الأب يجب أن يتكون من حرفين على الأقل.'),
  phone1: z.string().regex(/^(0\d{9})$/, 'رقم الهاتف غير صالح. يجب أن يبدأ بـ 0 ويتكون من 10 أرقام.'),
  phone2: z.string().regex(/^(0\d{9})$/, 'رقم الهاتف غير صالح.').optional().or(z.literal('')),
  address: z.string().min(5, 'العنوان يجب أن يتكون من 5 أحرف على الأقل.'),
  status: z.enum(['تم الانضمام', 'مؤجل', 'دخل لمدرسة أخرى', 'رُفِض'], { required_error: 'الرجاء اختيار الحالة.' }),
  page_number: z.coerce.number().optional(),
  assigned_sheikh: z.string().optional(),
  note: z.string().optional(),
});


type StudentFormValues = z.infer<typeof StudentFormSchema>;

type StudentFormProps = {
    onSubmit: (values: Omit<Student, 'id'|'registration_date'>, resetForm?: () => void) => Promise<void>;
    student?: Student | null;
    submitButtonText?: string;
}

export default function StudentForm({ onSubmit, student = null, submitButtonText = "تسجيل الطالب" }: StudentFormProps) {
  const [status, setStatus] = useState<string | undefined>(student?.status);
  const [age, setAge] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentFormSchema),
    defaultValues: student ? {
      ...student,
      birth_date: student.birth_date instanceof Date ? student.birth_date : (student.birth_date as any).toDate(),
    } : {
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

  useEffect(() => {
    if (student) {
        const birthDate = student.birth_date instanceof Date ? student.birth_date : (student.birth_date as any).toDate();
        form.reset({
            ...student,
            birth_date: birthDate
        });
        handleDateChange(birthDate);
        setStatus(student.status)
    }
  }, [student, form])

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'birth_date') {
        handleDateChange(value.birth_date);
      }
      if (name === 'status') {
        setStatus(value.status);
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch])

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

  const handleDateChange = (date: Date | undefined) => {
    if(date) {
        const calculatedAge = calculateAge(date);
        const calculatedAgeGroup = getAgeGroup(calculatedAge);
        setAge(calculatedAge);
        setAgeGroup(calculatedAgeGroup);
    }
  }

  const handleFormSubmit = (values: StudentFormValues) => {
    const calculatedAge = calculateAge(values.birth_date);
    const age_group = getAgeGroup(calculatedAge);

    const studentData: Omit<Student, 'id'|'registration_date'> = {
      ...values,
      age: calculatedAge,
      age_group,
      reminder_points: student?.reminder_points ?? 0,
    };
    
    const resetTheForm = () => {
        form.reset({
            full_name: '',
            guardian_name: '',
            address: '',
            phone1: '',
            phone2: '',
            page_number: 0,
            note: '',
            assigned_sheikh: '',
        });
        setStatus(undefined);
        setAge(null);
        setAgeGroup(null);
    }

    onSubmit(studentData, resetTheForm);
  }

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Select onValueChange={field.onChange} value={field.value}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                        'w-full pl-3 text-right font-normal justify-between',
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
        <div className="space-y-2 pt-2">
            <FormLabel className="font-headline">العمر وفئة العمر</FormLabel>
            <div className="flex items-center gap-4 h-10 px-3 py-2 text-sm w-full rounded-md border border-input bg-muted">
                <p>العمر: <span className="font-bold">{age ?? '...'}</span></p>
                <p className="border-r pr-4">الفئة: <span className="font-bold">{ageGroup ?? '...'}</span></p>
            </div>
        </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="font-headline">المستوى الدراسي</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
            control={form.control}
            name="phone1"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="font-headline">رقم الهاتف 1</FormLabel>
                <FormControl>
                <Input dir="ltr" placeholder="0XXXXXXXXX" {...field} />
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
                <Input dir="ltr" placeholder="0XXXXXXXXX" {...field} />
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
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
            <FormItem>
                <FormLabel className="font-headline">الحالة</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر الشيخ" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {SHEIKHS.map(sheikh => <SelectItem key={sheikh} value={sheikh}>{sheikh}</SelectItem>)}
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
            <FormLabel className="font-headline">رقم الصفحة (حفظ)</FormLabel>
            <FormControl>
                <Input type="number" placeholder="مثال: 39" {...field} />
            </FormControl>
                <FormDescription>
                آخر صفحة وصل إليها الطالب في الحفظ.
            </FormDescription>
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
            {submitButtonText}
        </Button>
    </form>
    </Form>
  );
}

    