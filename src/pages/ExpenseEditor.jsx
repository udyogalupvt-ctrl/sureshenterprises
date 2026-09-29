import { SearchX } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { FormSkeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { formatINR } from '../lib/format';
import { deleteExpense } from '../services/expenses';

const LIST_PATH = '/expenses';

export default function ExpenseEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { expenses, categories, loading } = useData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const expense = isNew ? null : expenses.find((item) => item.id === id);

  const handleDelete = async () => {
    setConfirmingDelete(false);
    // Leave first so the page never renders the record disappearing underneath it.
    navigate(LIST_PATH, { replace: true });
    try {
      await deleteExpense(id);
      toast.success('Expense deleted');
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t delete the expense. Please try again.');
    }
  };

  let content;
  if (isNew) {
    content = <ExpenseForm categories={categories} onSaved={() => navigate(LIST_PATH)} />;
  } else if (loading) {
    content = <FormSkeleton />;
  } else if (!expense) {
    content = (
      <Card>
        <EmptyState
          icon={SearchX}
          title="Expense not found"
          description="It may have been deleted."
          action={
            <Button variant="secondary" to={LIST_PATH}>
              Back to expenses
            </Button>
          }
        />
      </Card>
    );
  } else {
    content = (
      <ExpenseForm
        expense={expense}
        categories={categories}
        onSaved={() => navigate(LIST_PATH)}
        onDelete={() => setConfirmingDelete(true)}
      />
    );
  }

  return (
    <>
      <PageHeader
        backTo={LIST_PATH}
        backLabel="Expenses"
        title={isNew ? 'New expense' : (expense?.title || expense?.category) ?? 'Expense'}
      />
      {content}
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this expense?"
        description={`This ${formatINR(expense?.amount)} expense will be removed permanently. This can’t be undone.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </>
  );
}
