import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Palette, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-4 mb-8">
            <h1 className="font-headline text-3xl font-bold flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-primary" />
                الإعدادات
            </h1>
            <p className="text-muted-foreground">
                تحكم في تفضيلات الموقع والمظهر العام.
            </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Palette className="h-5 w-5" />
                المظهر
            </CardTitle>
            <CardDescription>
                تخصيص مظهر الموقع ليناسب تفضيلاتك.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span className="font-headline">الوضع الداكن</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  تفعيل الوضع الداكن لراحة العين في الإضاءة المنخفضة.
                </span>
              </Label>
              <Switch id="dark-mode" aria-label="Toggle dark mode" />
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Bell className="h-5 w-5" />
                الإشعارات
            </CardTitle>
            <CardDescription>
                إدارة تفضيلات الإشعارات الخاصة بك.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="announcement-notifications" className="flex flex-col space-y-1">
                <span className="font-headline">إشعارات الإعلانات</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  تلقي إشعارات عند نشر إعلان جديد من المدرسة.
                </span>
              </Label>
              <Switch id="announcement-notifications" defaultChecked />
            </div>
             <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="attendance-notifications" className="flex flex-col space-y-1">
                <span className="font-headline">إشعارات الحضور</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  تلقي إشعار يومي بحالة حضور الطالب.
                </span>
              </Label>
              <Switch id="attendance-notifications" />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
