import { db } from './firebase';
import { collection, addDoc, getDocs, Timestamp, onSnapshot, Unsubscribe, query, orderBy, doc, updateDoc, deleteDoc, where, getDoc, writeBatch } from 'firebase/firestore';

export const LEVELS = [
    'روضة',
    'تحضيري',
    '1 إبتدائي',
    '2 إبتدائي',
    '3 إبتدائي',
    '4 إبتدائي',
    '5 إبتدائي',
    '1 متوسط',
    '2 متوسط',
    '3 متوسط',
    '4 متوسط',
    '1 ثانوي',
    '2 ثانوي',
    '3 ثانوي',
    'جامعي',
    'متخرج',
    'متوقف عن الدراسة'
];

export const SHEIKHS = [
    "الشيخ إبراهيم مراد",
    "الشيخ عبد القادر",
    "الشيخ زياد درويش",
    "الشيخ أحمد بن عمر",
    "الشيخ فؤاد بن عمر",
    "الشيخ صهيب نصيب",
    "الشيخ سفيان نصيرة",
    "الشيخ عبد الحق نصيرة"
];


export interface Student {
  id: string;
  full_name: string;
  gender: 'ذكر' | 'أنثى';
  birth_date: Date | Timestamp;
  age: number;
  age_group: 'أقل من 7' | 'من 7–10' | 'من 11–13' | '14+';
  level: (typeof LEVELS)[number];
  guardian_name: string;
  phone1: string;
  phone2?: string;
  address: string;
  registration_date: Timestamp | Date;
  status: 'تم الانضمام' | 'مؤجل' | 'دخل لمدرسة أخرى' | 'رُفِض';
  page_number?: number;
  reminder_points: number;
  assigned_sheikh?: string;
  note?: string;
}

const studentsCollection = collection(db, 'الطلبة');

// --- Helper Functions ---
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


export const addStudent = async (studentData: Omit<Student, 'id'|'registration_date'|'birth_date'> & { birth_date: Date }) => {
  try {
    const docRef = await addDoc(studentsCollection, {
        ...studentData,
        birth_date: Timestamp.fromDate(studentData.birth_date as Date),
        registration_date: Timestamp.now(),
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not add student.');
  }
};


export const addMultipleStudents = async (studentsData: (Omit<Partial<Student>, 'birth_date'> & { birth_date: Date })[]) => {
    const batch = writeBatch(db);

    studentsData.forEach(student => {
        const newDocRef = doc(studentsCollection);
        
        // The birth_date is now guaranteed to be a valid Date object from the frontend
        const birthDate = student.birth_date;

        if (!birthDate || isNaN(birthDate.getTime())) {
            // This case should ideally be prevented by frontend validation
            console.error('Invalid date passed to addMultipleStudents for student:', student.full_name);
            return; // Skip this record
        }

        const age = calculateAge(birthDate);
        const age_group = getAgeGroup(age);

        const newStudent: Omit<Student, 'id'> = {
            full_name: student.full_name || '',
            gender: student.gender === 'ذكر' ? 'ذكر' : 'أنثى',
            birth_date: Timestamp.fromDate(birthDate),
            age,
            age_group,
            level: student.level || 'غير محدد' as any,
            guardian_name: student.guardian_name || '',
            phone1: student.phone1 || '',
            phone2: student.phone2 || '',
            address: student.address || '',
            registration_date: Timestamp.now(),
            status: student.status || 'مؤجل',
            page_number: student.page_number || 0,
            reminder_points: 0,
            assigned_sheikh: student.assigned_sheikh || '',
            note: student.note || ''
        };

        batch.set(newDocRef, newStudent);
    });

    try {
        await batch.commit();
    } catch (e) {
        console.error("Error adding multiple students: ", e);
        throw new Error("Could not import students.");
    }
};


export const updateStudent = async (studentId: string, studentData: Partial<Omit<Student, 'id'>>) => {
    try {
        const studentDoc = doc(db, 'الطلبة', studentId);
        const dataToUpdate: any = { ...studentData };

        if (dataToUpdate.birth_date && dataToUpdate.birth_date instanceof Date) {
            dataToUpdate.birth_date = Timestamp.fromDate(dataToUpdate.birth_date);
        }

        await updateDoc(studentDoc, dataToUpdate);
    } catch (e) {
        console.error('Error updating document: ', e);
        throw new Error('Could not update student.');
    }
};

export const deleteStudent = async (studentId: string) => {
    try {
        const studentDoc = doc(db, 'الطلبة', studentId);
        await deleteDoc(studentDoc);
    } catch (e) {
        console.error('Error deleting document: ', e);
        throw new Error('Could not delete student.');
    }
};


export const getStudentsRealtime = (callback: (students: Student[]) => void): Unsubscribe => {
    const q = query(studentsCollection, orderBy('registration_date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const students = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Student, 'id'>),
        }));
        callback(students);
    }, (error) => {
        console.error("Error getting documents in real-time: ", error);
        throw new Error('Could not retrieve students in real-time.');
    });

    return unsubscribe;
};

export const findStudent = async (searchQuery: string): Promise<Student | null> => {
    const nameQuery = query(studentsCollection, where('full_name', '==', searchQuery));
    const phoneQuery = query(studentsCollection, where('phone1', '==', searchQuery));
    
    try {
        let querySnapshot = await getDocs(nameQuery);
        
        if (querySnapshot.empty) {
            querySnapshot = await getDocs(phoneQuery);
        }

        if (querySnapshot.empty) {
            return null;
        }

        const studentDoc = querySnapshot.docs[0];
        return { id: studentDoc.id, ...studentDoc.data() } as Student;

    } catch (e) {
        console.error('Error finding student:', e);
        throw new Error('Could not find student.');
    }
}

export const addReminderPoints = async (studentId: string, pointsToAdd: number): Promise<number> => {
    const studentDocRef = doc(db, 'الطلبة', studentId);
    try {
        const studentSnap = await getDoc(studentDocRef);
        if (!studentSnap.exists()) {
            throw new Error('Student not found');
        }
        const currentPoints = studentSnap.data().reminder_points || 0;
        const newPoints = currentPoints + pointsToAdd;
        await updateDoc(studentDocRef, { reminder_points: newPoints });
        return newPoints;
    } catch (e) {
        console.error('Error adding reminder points:', e);
        throw new Error('Could not add points.');
    }
};
