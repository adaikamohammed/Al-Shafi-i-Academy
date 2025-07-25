'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Download, FileCheck2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addMultipleStudents } from '@/services/students';
import type { Student } from '@/services/students';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';


const REQUIRED_HEADERS = [
    "تاريخ التسجيل", "الاسم الكامل", "الجنس", "تاريخ الميلاد", "المستوى الدراسي",
    "اسم الولي", "رقم الهاتف 1", "رقم الهاتف 2", "مقر السكن",
    "الحالة", "رقم الصفحة", "ملاحظات"
];

// Helper functions to calculate age and age group
function calculateAge(birthDate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getAgeGroup(age: number): Student['age_group'] {
    if (age < 7) return 'أقل من 7';
    if (age >= 7 && age <= 10) return 'من 7–10';
    if (age >= 11 && age <= 13) return 'من 11–13';
    return '14+';
}


export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [students, setStudents] = useState<Partial<Student>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                setError("يرجى اختيار ملف بصيغة .xlsx");
                setFile(null);
                setStudents([]);
                return;
            }
            setFile(selectedFile);
            setError(null);
            parseExcel(selectedFile);
        }
    };
    
    const parseDate = (dateInput: any): Date | null => {
        if (!dateInput) return null;

        if (dateInput instanceof Date) {
            if (!isNaN(dateInput.getTime())) {
                return dateInput;
            }
        }
        
        // Handle Excel's numeric date format
        if (typeof dateInput === 'number') {
            // The subtraction of 25569 converts Excel's date (days since 1900-01-01) to Unix timestamp (milliseconds since 1970-01-01)
            const date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        if (typeof dateInput === 'string') {
            // Try to parse formats like 'dd/mm/yyyy' or 'dd-mm-yyyy'
            const parts = dateInput.split(/[/.-]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                let year = parseInt(parts[2], 10);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    // Handle 2-digit years
                    if (year < 100) {
                        year += (year > (new Date().getFullYear() % 100)) ? 1900 : 2000;
                    }
                    const date = new Date(Date.UTC(year, month, day));
                     if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            }
        }
        
        // Fallback for other string formats that JS can parse
        const parsedDate = new Date(dateInput);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
        
        return null;
    }


    const parseExcel = (fileToParse: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // Use raw: false to ensure dates are parsed by the library if possible
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

                if(jsonData.length < 2) { 
                    setError("الملف فارغ أو لا يحتوي على بيانات.");
                    setStudents([]);
                    return;
                }

                const headers: string[] = jsonData[0].map(h => String(h || '').trim());
                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`ملف غير متوافق. الأعمدة التالية مفقودة: ${missingHeaders.join(', ')}`);
                    setStudents([]);
                    return;
                }

                const headerIndex: {[key: string]: number} = {};
                headers.forEach((h, i) => {
                    headerIndex[h] = i;
                });
                
                const parsedStudents = jsonData.slice(1).map((row, rowIndex) => {
                    // Skip empty rows
                    if (row.every(cell => cell === null || cell === '')) return null; 
                    
                    const fullName = row[headerIndex["الاسم الكامل"]];
                    // Skip rows without a full name
                    if (!fullName) return null;

                    const birthDateRaw = row[headerIndex["تاريخ الميلاد"]];
                    const birthDate = parseDate(birthDateRaw);
                    
                    const registrationDateRaw = row[headerIndex["تاريخ التسجيل"]];
                    const registrationDate = parseDate(registrationDateRaw);

                    if (!birthDate) {
                         // Create an object with an error message for invalid dates
                         return { 
                             full_name: fullName, 
                             error: `تاريخ ميلاد غير صالح في الصف ${rowIndex + 2}. القيمة المدخلة: '${birthDateRaw}'`
                        }; 
                    }
                    
                    const age = calculateAge(birthDate);
                    const age_group = getAgeGroup(age);
                    
                    return {
                        full_name: fullName,
                        gender: row[headerIndex["الجنس"]],
                        birth_date: birthDate,
                        registration_date: registrationDate, // Can be null, will default to now() on save
                        age: age,
                        age_group: age_group,
                        level: row[headerIndex["المستوى الدراسي"]],
                        guardian_name: row[headerIndex["اسم الولي"]],
                        phone1: String(row[headerIndex["رقم الهاتف 1"]] || ''),
                        phone2: String(row[headerIndex["رقم الهاتف 2"]] || ''),
                        address: row[headerIndex["مقر السكن"]],
                        status: row[headerIndex["الحالة"]],
                        page_number: Number(row[headerIndex["رقم الصفحة"]]) || 0,
                        note: row[headerIndex["ملاحظات"]] || '',
                    };
                }).filter(s => s); // Remove null entries from empty or skipped rows

                // Check for any students that have parsing errors
                const invalidStudents = parsedStudents.filter(s => s && s.error);
                if (invalidStudents.length > 0) {
                     setError(`تم العثور على ${invalidStudents.length} سجل بمشاكل. المثال الأول: الطالب "${invalidStudents[0]?.full_name}" - ${invalidStudents[0]?.error}. الرجاء مراجعة الملف وتصحيح التواريخ (مثال: 24/02/2000).`);
                     setStudents([]); // Do not show preview if there are errors
                     return;
                }
                
                const validStudents = parsedStudents.filter(s => s && !s.error);
                if (validStudents.length === 0) {
                     setError("لم يتم العثور على أي سجلات صالحة في الملف.");
                     setStudents([]);
                     return;
                }

                setStudents(validStudents as Partial<Student>[]);
                setError(null);

            } catch (err) {
                console.error(err);
                setError("حدث خطأ أثناء قراءة الملف. تأكد من أن الملف غير تالف وصيغته صحيحة.");
                setStudents([]);
            }
        };
        reader.onerror = () => {
             setError("فشل قراءة الملف.");
        }
        reader.readAsBinaryString(fileToParse);
    };

    const handleDownloadTemplate = () => {
        const wsData = [
            [
              "تاريخ التسجيل", "الاسم الكامل", "الجنس", "تاريخ الميلاد", "المستوى الدراسي",
              "اسم الولي", "رقم الهاتف 1", "رقم الهاتف 2", "مقر السكن",
              "الحالة", "رقم الصفحة", "ملاحظات"
            ],
            ["25/07/2024", "محمد عبدالله", "ذكر", "15/05/2010", "5 إبتدائي", "عبدالله أحمد", "0123456789", "0987654321", "تقسيم الوادي", "تم الانضمام", 50, "طالب مجتهد"]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الطلبة");
        worksheet['!props'] = { RTL: true };
        XLSX.writeFile(workbook, "نموذج_تسجيل_الطلبة.xlsx");
    };
    
    const handleImport = async () => {
        if (!user) {
             toast({
                title: 'خطأ في المصادقة',
                description: 'يجب أن تكون مسجلاً للدخول لتنفيذ هذه العملية.',
                variant: 'destructive'
            })
            return;
        }
        if (students.length === 0 || error) {
            toast({
                title: 'لا يمكن الاستيراد',
                description: 'الرجاء إصلاح الأخطاء أو التأكد من وجود بيانات صالحة للمتابعة.',
                variant: 'destructive'
            })
            return;
        }
        setLoading(true);
        try {
            await addMultipleStudents(students as any[], user.uid);
            toast({
                title: 'تم الاستيراد بنجاح!',
                description: `تم حفظ ${students.length} طالبًا في قاعدة البيانات بشكل دائم.`,
                className: 'bg-accent text-accent-foreground',
            });
            router.push('/students');
        } catch (err) {
            console.error(err);
            toast({
                title: 'خطأ في الاستيراد!',
                description: 'فشلت عملية حفظ الطلاب في قاعدة البيانات. يرجى مراجعة البيانات والمحاولة مرة أخرى.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <Upload className="h-8 w-8 text-primary" />
            استيراد الطلبة من ملف Excel
          </CardTitle>
          <CardDescription>
            يمكنك إضافة عدة طلاب دفعة واحدة عن طريق رفع ملف Excel. اتبع الخطوات التالية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-headline text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
                    تحميل النموذج
                </h3>
                <p className="text-muted-foreground">
                    قم بتحميل نموذج Excel الجاهز الذي يحتوي على مثال توضيحي، واملأه ببيانات الطلبة. تأكد من عدم تغيير أسماء الأعمدة.
                </p>
                <Button onClick={handleDownloadTemplate} variant="secondary">
                    <Download className="ml-2"/>
                    تحميل نموذج Excel
                </Button>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-headline text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</span>
                    رفع الملف
                </h3>
                <p className="text-muted-foreground">
                    بعد ملء النموذج، قم برفعه من هنا. يدعم فقط ملفات بصيغة .xlsx
                </p>
                 <Input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="w-full max-w-sm file:ml-4 file:font-headline"
                />
            </div>
          
           {error && (
                <Alert variant="destructive">
                    <AlertTitle>خطأ في الملف</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
           )}

           {students.length > 0 && !error && (
             <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="font-headline text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</span>
                    معاينة واستيراد
                </h3>
                <p className="text-muted-foreground">
                    تم قراءة {students.length} سجل. هذه معاينة لأول 5 سجلات. إذا كانت البيانات صحيحة، اضغط على زر الاستيراد.
                </p>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم الكامل</TableHead>
                                <TableHead>الجنس</TableHead>
                                <TableHead>المستوى</TableHead>
                                <TableHead>اسم الولي</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.slice(0, 5).map((student, index) => (
                                <TableRow key={index}>
                                    <TableCell>{student.full_name}</TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>{student.level}</TableCell>
                                    <TableCell>{student.guardian_name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <Button onClick={handleImport} size="lg" className="w-full font-headline bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                    {loading ? "جارٍ الاستيراد..." : (
                        <>
                           <FileCheck2 className="ml-2" />
                           تأكيد واستيراد {students.length} طالبًا
                        </>
                    )}
                </Button>
            </div>
           )}

        </CardContent>
      </Card>
    </div>
  );
}

    