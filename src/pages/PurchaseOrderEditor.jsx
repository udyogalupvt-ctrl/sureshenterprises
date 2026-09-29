import { SearchX } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseOrderForm from '../components/purchase-orders/PurchaseOrderForm';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { FormSkeleton } from '../components/ui/Skeleton';
import { useData } from '../context/DataContext';
import { deletePurchaseOrder } from '../services/purchaseOrders';

const LIST_PATH = '/purchase-orders';

export default function PurchaseOrderEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { purchaseOrders, loading } = useData();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const order = isNew ? null : purchaseOrders.find((po) => po.id === id);

  const handleDelete = async () => {
    setConfirmingDelete(false);
    // Leave first so the page never renders the record disappearing underneath it.
    navigate(LIST_PATH, { replace: true });
    try {
      await deletePurchaseOrder(id);
      toast.success('Purchase order deleted');
    } catch (error) {
      console.error(error);
      toast.error('Couldn’t delete the order. Please try again.');
    }
  };

  let content;
  // Wait for data even when adding, so suggestions and the next invoice number are ready.
  if (loading) {
    content = <FormSkeleton />;
  } else if (isNew) {
    content = <PurchaseOrderForm previousOrders={purchaseOrders} onSaved={() => navigate(LIST_PATH)} />;
  } else if (!order) {
    content = (
      <Card>
        <EmptyState
          icon={SearchX}
          title="Order not found"
          description="It may have been deleted."
          action={
            <Button variant="secondary" to={LIST_PATH}>
              Back to orders
            </Button>
          }
        />
      </Card>
    );
  } else {
    content = (
      <PurchaseOrderForm
        order={order}
        previousOrders={purchaseOrders}
        onSaved={() => navigate(LIST_PATH)}
        onDelete={() => setConfirmingDelete(true)}
      />
    );
  }

  return (
    <>
      <PageHeader
        backTo={LIST_PATH}
        backLabel="Purchase orders"
        title={isNew ? 'New purchase order' : order ? `PO ${order.poNumber}` : 'Purchase order'}
      />
      {content}
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this purchase order?"
        description={`PO ${order?.poNumber ?? ''} will be removed permanently. This can’t be undone.`}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </>
  );
}
