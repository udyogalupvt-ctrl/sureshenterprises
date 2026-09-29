import { Plus, Receipt, SearchX } from 'lucide-react';
import { useMemo } from 'react';
import ExpenseRow from '../components/expenses/ExpenseRow';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { SearchInput, Select } from '../components/ui/Form';
import PageHeader from '../components/ui/PageHeader';
import { ListSkeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { useSearchParam } from '../hooks/useSearchParam';
import { PAYMENT_MODES } from '../lib/constants';
import { formatINR, plural } from '../lib/format';

export default function Expenses() {
  const { expenses, categories, loading } = useData();
  const [search, setSearch] = useSearchParam('q');
  const [category, setCategory] = useSearchParam('category');
  const [mode, setMode] = useSearchParam('mode');

  // Include any category already used on an expense, even if it's no longer in the saved list.
  const categoryOptions = useMemo(
    () => [...new Set([...categories, ...expenses.map((expense) => expense.category).filter(Boolean)])],
    [categories, expenses],
  );

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter(
      (expense) =>
        (!category || expense.category === category) &&
        (!mode || expense.paymentMode === mode) &&
        (!query ||
          expense.title?.toLowerCase().includes(query) ||
          expense.category?.toLowerCase().includes(query)),
    );
  }, [expenses, search, category, mode]);

  const isFiltered = Boolean(search || category || mode);
  const total = visible.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setMode('');
  };

  return (
    <>
      <PageHeader
        eyebrow={loading ? undefined : plural(expenses.length, 'expense')}
        title="Expenses"
        actions={
          <Button to="/expenses/new" icon={Plus} className="max-lg:hidden">
            Add expense
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem_11rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search title or category" />
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <Select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select aria-label="Filter by payment mode" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="">All modes</option>
            {PAYMENT_MODES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!loading && expenses.length > 0 && (
        <div className="mt-4 mb-3 flex items-center justify-between gap-4 text-[13px] text-muted">
          <p>
            {plural(visible.length, 'expense')} · <span className="font-medium text-fg">{formatINR(total)}</span>
          </p>
          {isFiltered && (
            <button type="button" onClick={clearFilters} className="font-medium text-accent-ink hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="mt-4">
          <ListSkeleton />
        </div>
      ) : expenses.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            description="Record fuel, salaries, materials and more to see your real net profit."
            action={
              <Button to="/expenses/new" icon={Plus}>
                Add expense
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={SearchX} title="No matching expenses" description="Try a different search or filter." />
        </Card>
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {visible.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </Card>
      )}
    </>
  );
}
