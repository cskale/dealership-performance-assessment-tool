import { useState } from 'react';
import { ChevronDown, ChevronUp, StickyNote } from 'lucide-react';

interface NoteEntry {
  questionId: string;
  text: string;
}

interface FieldNotesCollapsibleProps {
  notes: NoteEntry[];
  questionLabels: Record<string, string>;
}

export function FieldNotesCollapsible({ notes, questionLabels }: FieldNotesCollapsibleProps) {
  const [open, setOpen] = useState(false);

  if (notes.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <StickyNote className="h-3 w-3" />
          Field Notes ({notes.length})
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <dl className="mt-3 space-y-2">
          {notes.map(({ questionId, text }) => (
            <div key={questionId} className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
              {questionLabels[questionId] && (
                <dt className="text-[10px] font-medium text-amber-700 uppercase tracking-wide mb-0.5">
                  {questionLabels[questionId]}
                </dt>
              )}
              <dd className="text-xs text-amber-900 leading-relaxed">{text}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
