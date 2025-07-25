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
    
    // This function now robustly handles dates from Excel (serial numbers) and string formats.
    const parseDate = (dateInput: any): Date | null => {
        if (!dateInput) return null;

        // XLSX with `cellDates: true` will parse dates as Date objects
        if (dateInput instanceof Date) {
            return dateInput;
        }

        // Handle Excel serial date number
        if (typeof dateInput === 'number') {
            // The formula for conversion is: (excelDate - 25569) * 86400 * 1000
            // This correctly handles the Excel 1900 leap year bug.
            return new Date(Math.round((dateInput - 25569) * 86400 * 1000));
        }
        
        // Handle 'DD/MM/YYYY' or 'DD-MM-YYYY' string formats
        if (typeof dateInput === 'string') {
            const parts = dateInput.split(/[/.-]/);
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // JS month is 0-indexed
                let year = parseInt(parts[2], 10);

                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                     // Handle 2-digit year, assume 20xx
                    if (year < 100) {
                        year += 2000;
                    }
                    return new Date(year, month, day);
                }
            }
        }
        
        // If it's a string that can be parsed directly (e.g., ISO 8601)
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
                // Use cellDates: true to let XLSX handle date conversions where possible
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: RawStudentData[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if(jsonData.length < 2) { // Should have header and at least one data row
                    setError("الملف فارغ أو لا يحتوي على بيانات.");
                    setStudents([]);
                    return;
                }

                const headers: string[] = (jsonData[0] as string[]).map(h => h.trim());
                const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setError(`ملف غير متوافق. الأعمدة التالية مفقودة: ${missingHeaders.join(', ')}`);
                    setStudents([]);
                    return;
                }

                // Map headers to their index
                const headerIndex: {[key: string]: number} = {};
                headers.forEach((h, i) => {
                    headerIndex[h] = i;
                });
                

                const parsedStudents = jsonData.slice(1).map((row, rowIndex) => {
                    const rawRow = row as any[];
                    
                    const fullName = rawRow[headerIndex["الاسم الكامل"]];
                    // Skip if the row is empty or doesn't have a name
                    if (!fullName) return null;

                    const birthDate = parseDate(rawRow[headerIndex["تاريخ الميلاد"]]);

                    if (!birthDate || isNaN(birthDate.getTime())) {
                        console.warn(`تاريخ ميلاد غير صالح في الصف ${rowIndex + 2}:`, rawRow[headerIndex["تاريخ الميلاد"]]);
                         return { full_name: fullName, error: `تاريخ ميلاد غير صالح` }; // Return object with error for feedback
                    }
                    
                    return {
                        full_name: fullName,
                        gender: rawRow[headerIndex["الجنس"]],
                        birth_date: birthDate,
                        level: rawRow[headerIndex["المستوى الدراسي"]],
                        guardian_name: rawRow[headerIndex["اسم الولي"]],
                        phone1: String(rawRow[headerIndex["رقم الهاتف 1"]] || ''),
                        phone2: String(rawRow[headerIndex["رقم الهاتف 2"]] || ''),
                        address: rawRow[headerIndex["مقر السكن"]],
                        status: rawRow[headerIndex["الحالة"]],
                        page_number: Number(rawRow[headerIndex["رقم الصفحة"]]) || 0,
                        note: rawRow[headerIndex["ملاحظات"]] || '',
                    };
                }).filter(s => s); // Filter out empty rows

                const invalidStudents = parsedStudents.filter(s => s && s.error);
                if (invalidStudents.length > 0) {
                     setError(`تم العثور على ${invalidStudents.length} سجل بمشاكل. المثال الأول: الطالب "${invalidStudents[0]?.full_name}" - ${invalidStudents[0]?.error}. الرجاء مراجعة الملف وتصحيح التواريخ (مثال: 24/02/2000).`);
                     setStudents([]);
                     return;
                }

                if (parsedStudents.length === 0) {
                     setError("لم يتم العثور على أي سجلات صالحة في الملف.");
                     setStudents([]);
                     return;
                }

                setStudents(parsedStudents as Partial<Student>[]);
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
            REQUIRED_HEADERS,
            ["محمد عبدالله", "ذكر", "15/05/2010", "5 إبتدائي", "عبدالله أحمد", "0123456789", "0987654321", "تقسيم الوادي", "تم الانضمام", 50, "طالب مجتهد"]
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(wsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "نموذج الطلبة");
        worksheet['!props'] = { RTL: true };
        XLSX.writeFile(workbook, "نموذج_تسجيل_الطلبة.xlsx");
    };
    
    const handleImport = async () => {
        if (students.length === 0) return;
        setLoading(true);
        try {
            // The students array now contains valid Partial<Student> objects with Date objects
            await addMultipleStudents(students as any[]);
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
                    قم بتحميل نموذج Excel الجاهز الذي يحتوي على مثال توضيحي، واملأه ببيانات الطلبة. تأكد من عدم تغيير أسماء الأعمدة.
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
