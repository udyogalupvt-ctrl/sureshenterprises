import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { LEGACY_PAYMENT_MODES } from '../lib/constants';
import { listen, userCollection, userDoc } from './firestore';

const COLLECTION = 'expenses';

const normalize = (expense) => ({
  ...expense,
  paymentMode: LEGACY_PAYMENT_MODES[expense.paymentMode] ?? expense.paymentMode,
  bank: expense.bank ?? '',
});

export const subscribeExpenses = (onData, onError) =>
  listen(
    query(userCollection(COLLECTION), orderBy('createdAt', 'desc')),
    (expenses) => onData(expenses.map(normalize)),
    onError,
  );

const toRecord = (values) => ({
  title: values.title.trim(),
  amount: Number(values.amount),
  category: values.category,
  date: values.date,
  paymentMode: values.paymentMode,
  bank: values.bank?.trim().toUpperCase() ?? '',
  note: values.note.trim(),
  proofUrl: values.proofUrl ?? '',
});

export const createExpense = (values) =>
  addDoc(userCollection(COLLECTION), { ...toRecord(values), createdAt: serverTimestamp() });

export const updateExpense = (id, values) => updateDoc(userDoc(COLLECTION, id), toRecord(values));

export const deleteExpense = (id) => deleteDoc(userDoc(COLLECTION, id));
