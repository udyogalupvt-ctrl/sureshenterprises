import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Trash2, Edit2, X, Save, FileText, Receipt,
  ChevronDown, ChevronUp, ExternalLink, AlertCircle, Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Records = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('po');
  const [poRecords, setPoRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsubPO = onSnapshot(query(collection(db, 'users', user.uid, 'purchase_orders'), orderBy('createdAt', 'desc')), (snap) => {
      setPoRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const unsubExp = onSnapshot(query(collection(db, 'users', user.uid, 'expenses'), orderBy('createdAt', 'desc')), (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubPO(); unsubExp(); };
  }, [user]);

  const fmt = (a) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(a || 0);

  const filteredPO = poRecords.filter((po) => {
    const q = search.toLowerCase();
    return po.poNumber?.toLowerCase().includes(q) || po.invoiceNumber?.toLowerCase().includes(q) || po.invoiceDate?.includes(q);
  });
  const filteredExpenses = expenses.filter((exp) => {
    const q = search.toLowerCase();
    return exp.title?.toLowerCase().includes(q) || exp.category?.toLowerCase().includes(q) || exp.paymentMode?.toLowerCase().includes(q) || exp.date?.includes(q);
  });

  const startEdit = (r) => { setEditingId(r.id); setEditForm({ ...r }); setExpandedId(r.id); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      const u = { ...prev, [name]: value };
      if (tab === 'po' && (name === 'poAmount' || name === 'paymentRequired')) {
        const pa = Number(name === 'poAmount' ? value : prev.poAmount) || 0;
        const pr = Number(name === 'paymentRequired' ? value : prev.paymentRequired) || 0;
        u.gst = Number((pa * 0.18).toFixed(2));
        u.profit = Number((pa - pr).toFixed(2));
      }
      if (tab === 'po' && name === 'invoiceDate' && value) {
        const d = new Date(value); d.setDate(d.getDate() + 45);
        u.dueDate = d.toISOString().split('T')[0];
      }
      return u;
    });
  };

  const saveEdit = async () => {
    try {
      const col = tab === 'po' ? 'purchase_orders' : 'expenses';
      const data = { ...editForm }; delete data.id;
      if (tab === 'po') { data.poAmount = Number(data.poAmount) || 0; data.paymentRequired = Number(data.paymentRequired) || 0; data.gst = Number(data.gst) || 0; data.profit = Number(data.profit) || 0; }
      else { data.amount = Number(data.amount) || 0; }
      await updateDoc(doc(db, 'users', user.uid, col, editingId), data);
      toast.success('Updated successfully'); cancelEdit();
    } catch (err) { console.error(err); toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, tab === 'po' ? 'purchase_orders' : 'expenses', id));
      toast.success('Record deleted'); setDeleteConfirm(null);
    } catch (err) { console.error(err); toast.error('Failed to delete'); }
  };

  const records = tab === 'po' ? filteredPO : filteredExpenses;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Records</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage and edit your business records.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-1 shadow-sm w-fit">
        <button onClick={() => { setTab('po'); setSearch(''); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            tab === 'po' ? 'bg-[var(--text-main)] text-[var(--bg-card)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}>
          <FileText size={16} /> Purchase Orders
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ml-1 ${tab === 'po' ? 'bg-[var(--bg-card)]/20 text-white' : 'bg-[var(--border-color)] text-[var(--text-muted)]'}`}>
            {poRecords.length}
          </span>
        </button>
        <button onClick={() => { setTab('expense'); setSearch(''); cancelEdit(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
            tab === 'expense' ? 'bg-[var(--text-main)] text-[var(--bg-card)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}>
          <Receipt size={16} /> Expenses
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ml-1 ${tab === 'expense' ? 'bg-[var(--bg-card)]/20 text-white' : 'bg-[var(--border-color)] text-[var(--text-muted)]'}`}>
            {expenses.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'po' ? 'Search POs...' : 'Search expenses...'}
          className="w-full pl-9 pr-8 py-2 input-field text-sm" />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X size={14} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="card divide-y divide-[var(--border-color)]">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-[3px] border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-3">
              {tab === 'po' ? <FileText size={20} className="text-[var(--text-muted)]" /> : <Receipt size={20} className="text-[var(--text-muted)]" />}
            </div>
            <p className="text-sm font-medium text-[var(--text-main)]">{search ? 'No matches found' : `No records yet`}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">They will appear here once created.</p>
          </div>
        ) : (
          records.map((record) => (
            <RecordItem
              key={record.id}
              record={record}
              type={tab}
              isEditing={editingId === record.id}
              editForm={editForm}
              isExpanded={expandedId === record.id}
              onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)}
              onEdit={() => startEdit(record)}
              onCancelEdit={cancelEdit}
              onSaveEdit={saveEdit}
              onEditChange={handleEditChange}
              onDelete={() => setDeleteConfirm(record.id)}
              fmt={fmt}
            />
          ))
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 max-w-sm w-full animate-fade-up">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-main)]">Delete Record</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Are you sure? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-md border border-[var(--border-color)] text-sm font-medium hover:bg-[var(--bg-input)] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-sm text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecordItem = ({ record, type, isEditing, editForm, isExpanded, onToggle, onEdit, onCancelEdit, onSaveEdit, onEditChange, onDelete, fmt }) => {
  const isPO = type === 'po';

  return (
    <div className="flex flex-col">
      {/* Header Row */}
      <div 
        onClick={!isEditing ? onToggle : undefined}
        className={`px-6 py-4 flex items-center justify-between transition-colors ${!isEditing ? 'cursor-pointer hover:bg-[var(--bg-input)]' : 'bg-[var(--bg-input)]'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isPO ? 'bg-indigo-500/10 text-indigo-500' : 'bg-rose-500/10 text-rose-500'}`}>
            {isPO ? <Hash size={14} /> : <Receipt size={14} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-main)]">
              {isPO ? `PO #${record.poNumber}` : (record.title || record.category)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isPO ? record.invoiceDate || 'No date' : `${record.category} • ${record.paymentMode}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className={`text-sm font-bold ${isPO ? 'text-emerald-500' : 'text-rose-500'}`}>
              {fmt(isPO ? record.profit : record.amount)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isPO ? fmt(record.poAmount) : record.date}
            </p>
          </div>
          <div className="text-[var(--text-muted)] w-5 flex justify-end">
            {!isEditing && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </div>
        </div>
      </div>

      {/* Expanded Detail / Edit View */}
      {isExpanded && (
        <div className="px-6 py-5 border-t border-[var(--border-color)] bg-[var(--bg-input)]/50">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {isPO ? (
                  <>
                    <EditField label="PO Number" name="poNumber" value={editForm.poNumber} onChange={onEditChange} />
                    <EditField label="Invoice No" name="invoiceNumber" value={editForm.invoiceNumber} onChange={onEditChange} />
                    <EditField label="Invoice Date" name="invoiceDate" type="date" value={editForm.invoiceDate} onChange={onEditChange} />
                    <EditField label="Due Date" name="dueDate" type="date" value={editForm.dueDate} onChange={onEditChange} />
                    <EditField label="PO Amount" name="poAmount" type="number" value={editForm.poAmount} onChange={onEditChange} />
                    <EditField label="Payment Req" name="paymentRequired" type="number" value={editForm.paymentRequired} onChange={onEditChange} />
                  </>
                ) : (
                  <>
                    <EditField label="Title" name="title" value={editForm.title} onChange={onEditChange} />
                    <EditField label="Amount" name="amount" type="number" value={editForm.amount} onChange={onEditChange} />
                    <EditField label="Category" name="category" value={editForm.category} onChange={onEditChange} />
                    <EditField label="Date" name="date" type="date" value={editForm.date} onChange={onEditChange} />
                    <EditField label="Mode" name="paymentMode" value={editForm.paymentMode} onChange={onEditChange} />
                    <EditField label="Note" name="note" value={editForm.note || ''} onChange={onEditChange} />
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onCancelEdit} className="px-3 py-1.5 rounded-md border border-[var(--border-color)] text-xs font-medium hover:bg-[var(--bg-input)]">Cancel</button>
                <button onClick={onSaveEdit} className="px-3 py-1.5 rounded-md btn-primary text-xs flex items-center gap-1.5"><Save size={12}/> Save</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {isPO ? (
                  <>
                    <Detail label="Invoice No" value={record.invoiceNumber} />
                    <Detail label="Due Date" value={record.dueDate} />
                    <Detail label="PO Amount" value={fmt(record.poAmount)} />
                    <Detail label="Payment Req." value={fmt(record.paymentRequired)} />
                    <Detail label="GST (18%)" value={fmt(record.gst)} color="text-amber-500" />
                    <Detail label="Profit" value={fmt(record.profit)} color="text-emerald-500" />
                  </>
                ) : (
                  <>
                    <Detail label="Amount" value={fmt(record.amount)} />
                    <Detail label="Category" value={record.category} />
                    <Detail label="Date" value={record.date} />
                    <Detail label="Payment Mode" value={record.paymentMode} />
                    {record.note && <div className="col-span-2"><Detail label="Note" value={record.note} /></div>}
                  </>
                )}
              </div>
              
              {!isPO && record.proofImage && (
                <div className="pt-2">
                  <a href={record.proofImage} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-primary)] hover:underline">
                    <ExternalLink size={12} /> View Receipt Image
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={onDelete} className="flex items-center gap-1.5 text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value, color }) => (
  <div>
    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-semibold ${color || 'text-[var(--text-main)]'}`}>{value}</p>
  </div>
);

const EditField = ({ label, name, type = 'text', value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
    <input name={name} type={type} value={value || ''} onChange={onChange}
      className="w-full px-3 py-1.5 input-field text-sm" />
  </div>
);

export default Records;
