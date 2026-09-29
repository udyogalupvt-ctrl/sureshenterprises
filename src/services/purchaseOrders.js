import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { calcGST, calcProfit } from '../lib/calculations';
import { listen, userCollection, userDoc } from './firestore';

const COLLECTION = 'purchase_orders';

export const subscribePurchaseOrders = (onData, onError) =>
  listen(query(userCollection(COLLECTION), orderBy('createdAt', 'desc')), onData, onError);

function toRecord(values) {
  const poAmount = Number(values.poAmount);
  const paymentRequired = Number(values.paymentRequired);

  return {
    poNumber: values.poNumber.trim(),
    invoiceNumber: values.invoiceNumber.trim(),
    invoiceDate: values.invoiceDate,
    dueDate: values.dueDate,
    poAmount,
    paymentRequired,
    gst: calcGST(poAmount),
    profit: calcProfit(poAmount, paymentRequired),
    completed: Boolean(values.completed),
  };
}

export const createPurchaseOrder = (values) =>
  addDoc(userCollection(COLLECTION), { ...toRecord(values), createdAt: serverTimestamp() });

export const updatePurchaseOrder = (id, values) => updateDoc(userDoc(COLLECTION, id), toRecord(values));

export const deletePurchaseOrder = (id) => deleteDoc(userDoc(COLLECTION, id));
