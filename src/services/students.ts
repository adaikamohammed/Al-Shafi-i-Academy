import { db } from './firebase';
import { collection, addDoc, getDocs, Timestamp, onSnapshot, Unsubscribe, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Student {
  id: string;
  full_name: string;
  gender: 'ذكر' | 'أنثى';
  birth_date: Date | Timestamp;
  age: number;
  age_group: 'أقل من 7' | 'من 7–10' | 'من 11–13' | '14+';
  level: 'تحضيري' | 'روضة' | '5 سنوات ابتدائي' | '4 متوسط' | '3 ثانوي' | 'جامعي';
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

export const updateStudent = async (studentId: string, studentData: Partial<Omit<Student, 'id'>>) => {
    try {
        const studentDoc = doc(db, 'الطلبة', studentId);
        const dataToUpdate = { ...studentData };

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