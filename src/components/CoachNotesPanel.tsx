import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CoachNote {
  id: string;
  note_text: string;
  created_at: string;
  action_id: string | null;
  profiles: { display_name: string | null; full_name: string | null } | null;
}

interface CoachNotesPanelProps {
  dealershipId: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function coachDisplayName(profiles: CoachNote['profiles']): string {
  return profiles?.display_name || profiles?.full_name || 'Your coach';
}

export function CoachNotesPanel({ dealershipId }: CoachNotesPanelProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!dealershipId) { setLoaded(true); return; }

    supabase
      .from('coach_notes')
      .select('id, note_text, created_at, action_id, profiles:coach_user_id(display_name, full_name)')
      .eq('dealership_id', dealershipId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!error && data) setNotes(data as CoachNote[]);
        setLoaded(true);
      });
  }, [dealershipId]);

  if (!dealershipId || !loaded || notes.length === 0) return null;

  return (
    <div id="coach-notes" className="bg-white rounded-xl shadow-card border border-[#DFE1E6] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F2F4]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#1D7AFC]" />
          <span className="text-[13px] font-bold text-[#172B4D]">Coach Notes</span>
        </div>
        <button
          onClick={() => navigate('/app/actions')}
          className="text-[11px] font-semibold text-[#6B778C] hover:text-[#1D7AFC] transition-colors flex items-center gap-1"
        >
          View action plan <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-[#F1F2F4]">
        {notes.map((note) => (
          <div key={note.id} className="px-5 py-4">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[11px] font-semibold text-[#172B4D]">
                {coachDisplayName(note.profiles)}
              </span>
              <span className="text-[10px] text-[#97A0AF] shrink-0">
                {timeAgo(note.created_at)}
              </span>
            </div>
            <p className={cn(
              'text-[12px] text-[#44546F] leading-relaxed',
              note.note_text.length > 160 && 'line-clamp-3'
            )}>
              {note.note_text}
            </p>
            {note.action_id && (
              <button
                onClick={() => navigate('/app/actions')}
                className="mt-2 inline-flex items-center"
              >
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-[#1D7AFC] border-[#1D7AFC]/30 hover:bg-[#1D7AFC]/5 cursor-pointer"
                >
                  Linked to action →
                </Badge>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
