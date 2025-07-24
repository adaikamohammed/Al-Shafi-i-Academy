import { db } from './firebase';
import { collection, addDoc, getDocs, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';

export interface Student {
  id: string;
  full_name: string;
  gender: 'ذكر' | 'أنثى';
  birth_date: Date;
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

export const addStudent = async (studentData: Omit<Student, 'id'>) => {
  try {
    const docRef = await addDoc(studentsCollection, {
        ...studentData,
        birth_date: Timestamp.fromDate(studentData.birth_date as Date),
        registration_date: Timestamp.fromDate(studentData.registration_date as Date),
    });
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw new Error('Could not add student.');
  }
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(studentsCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Student, 'id' | 'birth_date' | 'registration_date'>),
      birth_date: (doc.data().birth_date as Timestamp).toDate(),
      registration_date: (doc.data().registration_date as Timestamp),
    }));
  } catch (e) {
    console.error('Error getting documents: ', e);
    throw new Error('Could not retrieve students.');
  }
};


export const getStudentsRealtime = (callback: (students: Student[]) => void): Unsubscribe => {
    const unsubscribe = onSnapshot(studentsCollection, (querySnapshot) => {
        const students = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Student, 'id' | 'birth_date' | 'registration_date'>),
            birth_date: (doc.data().birth_date as Timestamp).toDate(),
            registration_date: (doc.data().registration_date as Timestamp),
        }));
        callback(students);
    }, (error) => {
        console.error("Error getting documents in real-time: ", error);
        throw new Error('Could not retrieve students in real-time.');
    });

    return unsubscribe;
};
