import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { calcGST, calcProfit } from '../lib/calculations';
import { monthCode } from '../lib/format';
import { listen, userCollection, userDoc } from './firestore';

const COLLECTION = 'purchase_orders';

/** GST and net profit are worked out from the amounts on every read, so older saved values can't drift. */
const withDerived = (order) => ({
  ...order,
  month: monthCode(order.invoiceDate),
  gst: calcGST(order.poAmount),
  profit: calcProfit(order.poAmount, order.paymentRequired),
});

export const subscribePurchaseOrders = (onData, onError) =>
  listen(
    query(userCollection(COLLECTION), orderBy('createdAt', 'desc')),
    (orders) => onData(orders.map(withDerived)),
    onError,
  );

function toRecord(values) {
  const poAmount = Number(values.poAmount);
  // Empty means "not known yet" (P in the sheets) and counts as ₹0 until it's filled in.
  const paymentRequired = values.paymentRequired === '' ? null : Number(values.paymentRequired);

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

export const setPurchaseOrderCompleted = (id, completed) => updateDoc(userDoc(COLLECTION, id), { completed });

export const deletePurchaseOrder = (id) => deleteDoc(userDoc(COLLECTION, id));
