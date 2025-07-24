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

const formSchema = z.object({
  studentName: z.string().min(2, 'الاسم يجب أن يتكون من حرفين على الأقل.'),
  fatherName: z.string().min(2, 'اسم الأب يجب أن يتكون من حرفين على الأقل.'),
  dob: z.date({
    required_error: 'تاريخ الميلاد مطلوب.',
  }),
  grade: z.string({ required_error: 'الرجاء اختيار الصف.' }),
  address: z.string().min(5, 'العنوان يجب أن يتكون من 5 أحرف على الأقل.'),
  guardianPhone: z.string().regex(/^(\+?\d{1,3}[- ]?)?\d{10}$/, 'رقم الهاتف غير صالح.'),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      fatherName: '',
      address: '',
      guardianPhone: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'تم التسجيل بنجاح!',
      description: `تم تسجيل الطالب ${values.studentName} في النظام.`,
      className: 'bg-accent text-accent-foreground',
    });
    form.reset();
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-3xl mx-auto">
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
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">اسم الطالب كاملاً</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: محمد عبدالله" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">اسم الأب</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: عبدالله أحمد" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                  control={form.control}
                  name="dob"
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
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline">الصف الدراسي</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الصف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="level1">المستوى الأول</SelectItem>
                          <SelectItem value="level2">المستوى الثاني</SelectItem>
                          <SelectItem value="level3">المستوى الثالث</SelectItem>
                          <SelectItem value="level4">المستوى الرابع (خاتم)</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <FormLabel className="font-headline">العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: تقسيم الوادي، الشارع الرئيسي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline">رقم هاتف ولي الأمر</FormLabel>
                    <FormControl>
                      <Input dir="ltr" placeholder="05XXXXXXXX" {...field} />
                    </FormControl>
                    <FormDescription>
                      سيتم استخدام هذا الرقم للتواصل بشأن الطالب.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full font-headline">
                إرسال التسجيل
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
