import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Target, Users, Megaphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-primary/10 py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-6xl">
            المدرسة القرآنية للإمام الشافعي
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80 md:text-xl">
            صرح تعليمي متميز لتربية الأجيال على هدي القرآن الكريم والسنة النبوية الشريفة.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="font-headline">
              <Link href="/register">تسجيل طالب جديد</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-headline">
              <Link href="/students">قائمة الطلبة</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-headline text-3xl font-bold text-accent">
            قيمنا ومبادئنا
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookOpen className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline mt-4">تعليم قرآني متقن</CardTitle>
              </CardHeader>
              <CardContent>
                <p>نعتني بتحفيظ القرآن الكريم مع التجويد والفهم الصحيح لمعانيه.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline mt-4">تربية إيمانية</CardTitle>
              </CardHeader>
              <CardContent>
                <p>نغرس في نفوس طلابنا القيم الإسلامية والأخلاق الحميدة.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="font-headline mt-4">بيئة تعليمية محفزة</CardTitle>
              </CardHeader>
              <CardContent>
                <p>نوفر بيئة آمنة وداعمة تشجع على الإبداع والتفوق الدراسي.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="my-12 w-2/3" />

      <section className="w-full pb-16 md:pb-24">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl font-bold text-accent flex items-center gap-3">
              <Megaphone className="h-8 w-8" />
              آخر الإعلانات
            </h2>
            <div className="mt-6 space-y-4">
              <div className="p-4 border-r-4 border-primary bg-card rounded-md">
                <h3 className="font-headline font-bold"> بدء التسجيل للعام الدراسي الجديد</h3>
                <p className="text-sm text-muted-foreground">1 أغسطس 2024</p>
                <p className="mt-2">تعلن المدرسة عن فتح باب التسجيل للعام الدراسي القادم. الأماكن محدودة.</p>
              </div>
              <div className="p-4 border-r-4 border-primary bg-card rounded-md">
                <h3 className="font-headline font-bold">مسابقة الحفظ السنوية</h3>
                <p className="text-sm text-muted-foreground">15 سبتمبر 2024</p>
                <p className="mt-2">استعدوا لمسابقة الحفظ السنوية بجوائز قيمة للمتفوقين.</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold text-accent mb-6">
              من أجواء المدرسة
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Image src="https://placehold.co/600x400.png" alt="طلاب في الفصل" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="students classroom" />
              <Image src="https://placehold.co/600x400.png" alt="نشاط مدرسي" width={600} height={400} className="rounded-lg shadow-md" data-ai-hint="school activity" />
              <Image src="https://placehold.co/600x400.png" alt="فناء المدرسة" width={600} height={400} className="rounded-lg shadow-md col-span-2" data-ai-hint="school yard" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
