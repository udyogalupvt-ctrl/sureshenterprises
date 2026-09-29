import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Save, RotateCcw, Hash, Calendar, IndianRupee, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AddPO = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    poNumber: '', invoiceNumber: '', invoiceDate: '', dueDate: '', poAmount: '', paymentRequired: '',
  });

  const gst = form.poAmount ? (Number(form.poAmount) * 0.18).toFixed(2) : '0.00';
  const profit = form.poAmount && form.paymentRequired
    ? (Number(form.poAmount) - Number(form.paymentRequired)).toFixed(2) : '0.00';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'invoiceDate' && value) {
        const d = new Date(value);
        d.setDate(d.getDate() + 45);
        updated.dueDate = d.toISOString().split('T')[0];
      }
      return updated;
    });
  };

  const handleReset = () => {
    setForm({ poNumber: '', invoiceNumber: '', invoiceDate: '', dueDate: '', poAmount: '', paymentRequired: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.poNumber || !form.invoiceNumber || !form.invoiceDate || !form.poAmount || !form.paymentRequired) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'purchase_orders'), {
        poNumber: form.poNumber, invoiceNumber: form.invoiceNumber, invoiceDate: form.invoiceDate,
        dueDate: form.dueDate, poAmount: Number(form.poAmount), paymentRequired: Number(form.paymentRequired),
        gst: Number(gst), profit: Number(profit), createdAt: serverTimestamp(),
      });
      toast.success('Purchase order saved!');
      handleReset();
    } catch (error) {
      console.error('Error saving PO:', error);
      toast.error('Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  const fmt = (val) => {
    const num = Number(val);
    return isNaN(num) ? '₹0' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-main)]">New Purchase Order</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Record a new PO and invoice.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput label="PO Number" name="poNumber" value={form.poNumber} onChange={handleChange} placeholder="e.g. 4201951647" required icon={<Hash size={16} />} />
            <FormInput label="Invoice Number" name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} placeholder="e.g. INV-001" required icon={<FileText size={16} />} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[var(--border-color)] pt-6">
            <FormInput label="Invoice Date" name="invoiceDate" type="date" value={form.invoiceDate} onChange={handleChange} required icon={<Calendar size={16} />} />
            <FormInput label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} hint="Auto-calculated as +45 days" icon={<Calendar size={16} />} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[var(--border-color)] pt-6">
            <FormInput label="PO Amount" name="poAmount" type="number" value={form.poAmount} onChange={handleChange} placeholder="0" required icon={<IndianRupee size={16} />} />
            <FormInput label="Payment Required" name="paymentRequired" type="number" value={form.paymentRequired} onChange={handleChange} placeholder="0" required icon={<IndianRupee size={16} />} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-6 border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/10">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Profit</p>
            <p className={`text-3xl font-bold tracking-tight ${Number(profit) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {fmt(profit)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">PO Amount - Payment Required</p>
          </div>
          <div className="card p-6 border-amber-500 ring-1 ring-amber-500/10">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">GST (18%)</p>
            <p className="text-3xl font-bold text-amber-500 tracking-tight">
              {fmt(gst)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">Auto-calculated from PO Amount</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={handleReset} className="px-5 py-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--border-color)]/30 transition-colors flex items-center gap-2 text-sm font-medium">
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 btn-primary flex items-center gap-2 text-sm font-medium min-w-[140px] justify-center">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Save Entry
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required, hint, icon }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="text-sm font-medium text-[var(--text-main)] flex items-center gap-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full py-2 input-field ${icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
    {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
  </div>
);

export default AddPO;
