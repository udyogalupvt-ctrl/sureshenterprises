import { ImagePlus, ImageUp, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';

export default function ProofUpload({ previewUrl, onSelect, onRemove }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current.click();

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) onSelect(file);
        event.target.value = ''; // allow choosing the same file again
      }}
    />
  );

  if (previewUrl) {
    return (
      <div className="space-y-3">
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-line bg-sunken"
        >
          <img src={previewUrl} alt="Expense proof" className="max-h-72 w-full object-contain" />
        </a>
        <div className="flex gap-2 *:flex-1">
          <Button variant="secondary" size="sm" icon={ImageUp} onClick={openPicker}>
            Replace
          </Button>
          <Button variant="danger-ghost" size="sm" icon={X} onClick={onRemove}>
            Remove
          </Button>
        </div>
        {input}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onSelect(file);
        }}
        className={cn(
          'flex w-full flex-col items-center rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
          dragging ? 'border-accent bg-accent/5' : 'border-line-strong hover:border-accent/60 hover:bg-sunken/60',
        )}
      >
        <span className="grid size-10 place-items-center rounded-xl bg-sunken text-muted">
          <ImagePlus className="size-5" />
        </span>
        <span className="mt-3 text-sm font-medium text-fg">Add a photo</span>
        <span className="mt-0.5 text-xs text-faint">Receipt or bill, compressed before upload</span>
      </button>
      {input}
    </>
  );
}
