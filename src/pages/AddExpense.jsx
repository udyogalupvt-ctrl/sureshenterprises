import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../config/cloudinary';
import {
  Save, RotateCcw, IndianRupee, Calendar, CreditCard,
  StickyNote, UploadCloud, X, Plus, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = ['Transport', 'Fuel', 'Salary', 'Food', 'Office', 'Maintenance', 'Material', 'Other'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque'];

const AddExpense = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: '', amount: '', category: '', date: today, paymentMode: '', note: '', proofImage: '',
  });

  useEffect(() => {
    if (!user) return;
    const loadCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'users', user.uid, 'categories'));
        const custom = snap.docs.map((d) => d.data().name);
        setCategories([...new Set([...DEFAULT_CATEGORIES, ...custom])]);
      } catch (err) { console.error('Error loading categories:', err); }
    };
    loadCategories();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat }));
    setShowCustomCategory(false);
  };

  const handleAddCustomCategory = async () => {
    if (!customCategory.trim()) return;
    const newCat = customCategory.trim();
    if (categories.includes(newCat)) { toast.error('Category already exists'); return; }
    try {
      await setDoc(doc(db, 'users', user.uid, 'categories', newCat.toLowerCase().replace(/\s+/g, '_')), { name: newCat, createdAt: serverTimestamp() });
      setCategories((prev) => [...prev, newCat]);
      setForm((prev) => ({ ...prev, category: newCat }));
      setCustomCategory('');
      setShowCustomCategory(false);
      toast.success(`Category "${newCat}" added!`);
    } catch (err) { console.error('Error adding category:', err); toast.error('Failed to add category'); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  const handleReset = () => {
    setForm({ title: '', amount: '', category: '', date: today, paymentMode: '', note: '', proofImage: '' });
    setImageFile(null); setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.paymentMode) { toast.error('Please fill all required fields'); return; }
    setSaving(true);
    try {
      let proofUrl = '';
      if (imageFile) { setUploading(true); proofUrl = await uploadToCloudinary(imageFile); setUploading(false); }
      await addDoc(collection(db, 'users', user.uid, 'expenses'), {
        title: form.title || form.category, amount: Number(form.amount), category: form.category,
        date: form.date, paymentMode: form.paymentMode, note: form.note, proofImage: proofUrl, createdAt: serverTimestamp(),
      });
      toast.success('Expense saved!');
      handleReset();
    } catch (error) { console.error('Error saving expense:', error); toast.error('Failed to save.'); }
    finally { setSaving(false); setUploading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-main)]">Add Expense</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Record a new business expense.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="card p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-[var(--border-color)] pb-8">
            <FormInput label="Title (Optional)" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cab to office" icon={<StickyNote size={16} />} />
            <FormInput label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0" required icon={<IndianRupee size={16} />} />
          </div>

          <div className="space-y-3 border-b border-[var(--border-color)] pb-8">
            <label className="text-sm font-medium text-[var(--text-main)]">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
                    form.category === cat
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--bg-input)] text-[var(--text-main)] border-[var(--border-input)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowCustomCategory(!showCustomCategory)}
                className="px-3 py-1.5 rounded-md text-sm border border-dashed border-[var(--border-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--text-muted)] transition-colors flex items-center gap-1 bg-[var(--bg-card)]"
              >
                <Plus size={14} /> Custom
              </button>
            </div>

            {showCustomCategory && (
              <div className="flex gap-2 animate-fade-in pt-2">
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 max-w-[200px] px-3 py-2 input-field text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCategory())}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-input)] rounded-md text-sm font-medium text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput label="Date" name="date" type="date" value={form.date} onChange={handleChange} required icon={<Calendar size={16} />} />
            
            <div className="space-y-1.5">
              <label htmlFor="paymentMode" className="text-sm font-medium text-[var(--text-main)]">
                Payment Mode <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <CreditCard size={16} />
                </div>
                <select
                  id="paymentMode"
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 input-field text-sm appearance-none bg-[var(--bg-input)]"
                >
                  <option value="">Select mode</option>
                  {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="note" className="text-sm font-medium text-[var(--text-main)]">Note (Optional)</label>
            <textarea
              id="note"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Add any extra details here..."
              rows={3}
              className="w-full px-3 py-2 input-field text-sm resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-[var(--text-main)]">Receipt / Proof (Optional)</label>
            
            {imagePreview ? (
              <div className="relative inline-block border border-[var(--border-color)] rounded-lg p-1 bg-[var(--bg-input)] shadow-sm animate-fade-in">
                <img src={imagePreview} alt="Receipt preview" className="w-full max-w-xs h-40 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--border-input)] rounded-lg bg-[var(--bg-input)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer group">
                <div className="flex flex-col items-center gap-2 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors">
                  <UploadCloud size={24} />
                  <span className="text-sm font-medium">Click to upload receipt</span>
                  <span className="text-xs opacity-75">PNG, JPG up to 5MB</span>
                </div>
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </label>
            )}
          </div>

        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleReset} className="px-5 py-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--border-color)]/30 transition-colors flex items-center gap-2 text-sm font-medium">
            <RotateCcw size={16} />
            Reset
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 btn-primary flex items-center gap-2 text-sm font-medium min-w-[140px] justify-center bg-rose-500 hover:bg-rose-600 shadow-rose-500/40">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Save Expense
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
        className={`w-full py-2 input-field text-sm ${icon ? 'pl-9 pr-3' : 'px-3'}`}
      />
    </div>
    {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
  </div>
);

export default AddExpense;
