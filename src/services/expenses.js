import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { listen, userCollection, userDoc } from './firestore';

const COLLECTION = 'expenses';

export const subscribeExpenses = (onData, onError) =>
  listen(query(userCollection(COLLECTION), orderBy('createdAt', 'desc')), onData, onError);

const toRecord = (values) => ({
  title: values.title.trim(),
  amount: Number(values.amount),
  category: values.category,
  date: values.date,
  paymentMode: values.paymentMode,
  note: values.note.trim(),
  proofUrl: values.proofUrl ?? '',
});

export const createExpense = (values) =>
  addDoc(userCollection(COLLECTION), { ...toRecord(values), createdAt: serverTimestamp() });

export const updateExpense = (id, values) => updateDoc(userDoc(COLLECTION, id), toRecord(values));

export const deleteExpense = (id) => deleteDoc(userDoc(COLLECTION, id));
