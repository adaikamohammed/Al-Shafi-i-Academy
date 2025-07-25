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
import { Upload, Download, FileCheck2, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { addMultipleStudents } from '@/services/students';
import type { Student } from '@/services/students';
import { Input } from '@/components/ui/input';


const REQUIRED_HEADERS = [
    "الاسم الكامل", "الجنس", "تاريخ الميلاد", "المستوى الدراسي",
    "اسم الولي", "رقم الهاتف 1", "رقم الهاتف 2", "مقر السكن",
    "الحالة", "رقم الصفحة", "ملاحظات"
];

// Type for the raw data read from Excel
type RawStudentData = {
  [key: string]: any;
};


export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [students, setStudents] = useState<Partial<Student>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();


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
        // If it's already a Date object from xlsx parsing
        if (dateInput instanceof Date) {
            return dateInput;
        }
        // If it's a string like 'DD/MM/YYYY' or 'DD-MM-YYYY'
        if (typeof dateInput === 'string') {
            const parts = dateInput.split(/[/.-]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
                const year = parseInt(parts[2], 10);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    // Handle 2-digit year
                    const fullYear = year < 100 ? 2000 + year : year;
                    return new Date(fullYear, month, day);
                }
            }
        }
        // If it's an Excel serial number (a number)
        if (typeof dateInput === 'number') {
             // Excel's epoch starts on 1900-01-01, but incorrectly thinks 1900 is a leap year.
             // The formula for conversion is: (excelDate - 25569) * 86400 * 1000
            return new Date((dateInput - 25569) * 86400 * 1000);
        }

        return null;
    }

    const parseExcel = (fileToParse: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: RawStudentData[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if(jsonData.length < 1) {
                    setError("الملف فارغ أو غير صحيح.");
                    setStudents([]);
                    return;
                }

                const headers: string[] = jsonData[0] as string[];
                const headersMatch = REQUIRED_HEADERS.every(h => headers.includes(h));

                if (!headersMatch) {
                    setError(`ملف غير متوافق. يجب أن يحتوي على الأعمدة التالية: ${REQUIRED_HEADERS.join(', ')}`);
                    setStudents([]);
                    return;
                }

                const parsedStudents = jsonData.slice(1).map((row, rowIndex) => {
                    const student: any = {};
                    headers.forEach((header, index) => {
                        const key = header as keyof RawStudentData;
                        student[key] = (row as any[])[index];
                    });
                    
                    const birthDate = parseDate(student["تاريخ الميلاد"]);

                    if (!birthDate || isNaN(birthDate.getTime())) {
                        console.warn(`تاريخ ميلاد غير صالح في الصف ${rowIndex + 2}:`, student["تاريخ الميلاد"]);
                         return null; // Skip invalid records
                    }

                    return {
                        full_name: student["الاسم الكامل"],
                        gender: student["الجنس"],
                        birth_date: birthDate,
                        level: student["المستوى الدراسي"],
                        guardian_name: student["اسم الولي"],
                        phone1: String(student["رقم الهاتف 1"] || ''),
                        phone2: String(student["رقم الهاتف 2"] || ''),
                        address: student["مقر السكن"],
                        status: student["الحالة"],
                        page_number: Number(student["رقم الصفحة"]) || 0,
                        note: student["ملاحظات"] || '',
                    };
                }).filter(s => s && s.full_name); // Filter out empty or invalid rows

                if (parsedStudents.length === 0 && jsonData.length > 1) {
                     setError("لم يتم العثور على أي سجلات صالحة في الملف. يرجى التحقق من تنسيق تاريخ الميلاد (مثال: 24/02/2000).");
                     setStudents([]);
                     return;
                }

                setStudents(parsedStudents as Partial<Student>[]);
                setError(null);

            } catch (err) {
                console.error(err);
                setError("حدث خطأ أثناء قراءة الملف. تأكد من أن الملف غير تالف.");
                setStudents([]);
            }
        };
        reader.onerror = () => {
             setError("فشل قراءة الملف.");
        }
        reader.readAsBinaryString(fileToParse);
    };

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.aoa_to_sheet([REQUIRED_HEADERS]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الطلبة");
        worksheet['!props'] = { RTL: true };
        XLSX.writeFile(workbook, "نموذج_تسجيل_الطلبة.xlsx");
    };
    
    const handleImport = async () => {
        if (students.length === 0) return;
        setLoading(true);
        try {
            await addMultipleStudents(students);
            toast({
                title: 'تم الاستيراد بنجاح!',
                description: `تم استيراد ${students.length} طالبًا إلى قاعدة البيانات.`,
                className: 'bg-accent text-accent-foreground',
            });
            router.push('/students');
        } catch (err) {
            console.error(err);
            toast({
                title: 'خطأ في الاستيراد!',
                description: 'فشلت عملية استيراد الطلاب. يرجى مراجعة البيانات والمحاولة مرة أخرى.',
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
            {/* Step 1: Download Template */}
            <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-headline text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</span>
                    تحميل النموذج
                </h3>
                <p className="text-muted-foreground">
                    قم بتحميل نموذج Excel الجاهز، واملأه ببيانات الطلبة. تأكد من عدم تغيير أسماء الأعمدة.
                </p>
                <Button onClick={handleDownloadTemplate} variant="secondary">
                    <Download className="ml-2"/>
                    تحميل نموذج Excel
                </Button>
            </div>

            {/* Step 2: Upload File */}
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
                    accept=".xlsx"
                    className="w-full max-w-sm file:ml-4 file:font-headline"
                />
            </div>
          
           {error && (
                <Alert variant="destructive">
                    <AlertTitle>خطأ في الملف</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
           )}

            {/* Step 3: Preview and Import */}
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
