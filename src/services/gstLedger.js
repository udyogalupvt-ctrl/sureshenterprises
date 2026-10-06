import { addDoc, deleteDoc, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { calcGSTOthers } from '../lib/calculations';
import { listen, userCollection, userDoc } from './firestore';

/** The two GST sheets share one layout; each keeps its entries in its own collection. */
export const GST_LEDGERS = {
  others: { collection: 'gst_others', title: 'GST others', path: '/gst-others' },
  own: { collection: 'own_gst', title: 'Own GST', path: '/own-gst' },
};

/** Share, balance and base amounts are worked out on every read from the tax amount. */
const withDerived = (entry) => ({
  ...entry,
  ...calcGSTOthers(entry.taxAmount, entry.sharePercent, entry.balancePercent, entry.gstRate),
});

/** Oldest first, so new rows land at the bottom like in the sheet. */
export const subscribeGstLedger = (name) => (onData, onError) =>
  listen(
    query(userCollection(GST_LEDGERS[name].collection), orderBy('createdAt', 'asc')),
    (entries) => onData(entries.map(withDerived)),
    onError,
  );

const toRecord = (values) => ({
  month: values.month,
  companyName: values.companyName.trim(),
  gstNo: values.gstNo.trim().toUpperCase(),
  invoiceNumber: values.invoiceNumber.trim(),
  taxAmount: Number(values.taxAmount) || 0,
  gstRate: Number(values.gstRate) || 18,
  sharePercent: Number(values.sharePercent) || 0,
  balancePercent: Number(values.balancePercent) || 0,
  status: values.status,
  date: values.date,
});

export const createGstEntry = (name, values) =>
  addDoc(userCollection(GST_LEDGERS[name].collection), { ...toRecord(values), createdAt: serverTimestamp() });

export const updateGstEntry = (name, id, values) =>
  updateDoc(userDoc(GST_LEDGERS[name].collection, id), toRecord(values));

export const deleteGstEntry = (name, id) => deleteDoc(userDoc(GST_LEDGERS[name].collection, id));
