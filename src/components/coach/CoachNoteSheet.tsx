// src/components/coach/CoachNoteSheet.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Trash2 } from 'lucide-react';

interface CoachNote {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  assessment_id: string | null;
  action_id: string | null;
  note_text: string;
  created_at: string;
  note_type: 'observation' | 'action' | 'follow-up' | null;
}

interface AssessmentOption { id: string; created_at: string; }
interface ActionOption { id: string; action_title: string; }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string | null;
  dealerName: string;
  onNoteAdded: () => void;
}

export function CoachNoteSheet({ open, onOpenChange, dealershipId, dealerName, onNoteAdded }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [actions, setActions] = useState<ActionOption[]>([]);
  const [contextType, setContextType] = useState<'general' | 'assessment' | 'action'>('general');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'action' | 'follow-up' | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!open || !dealershipId || !user?.id) return;
    setContextType('general');
    setNoteText('');
    setNoteType('');
    setSelectedAssessmentId('');
    setSelectedActionId('');
    fetchSheetData();
  }, [open, dealershipId, user?.id]);

  const fetchSheetData = async () => {
    if (!dealershipId || !user?.id) return;
    setLoadingHistory(true);
    try {
      const [notesRes, assessmentsRes] = await Promise.all([
        supabase
          .from('coach_notes')
          .select('*')
          .eq('dealership_id', dealershipId)
          .eq('coach_user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('assessments')
          .select('id, created_at')
          .eq('dealership_id', dealershipId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setNotes((notesRes.data as CoachNote[]) ?? []);
      const fetchedAssessments = assessmentsRes.data ?? [];
      setAssessments(fetchedAssessments);

      if (fetchedAssessments.length) {
        const { data: actionData } = await supabase
          .from('improvement_actions')
          .select('id, action_title')
          .eq('assessment_id', fetchedAssessments[0].id)
          .in('status', ['Open', 'In Progress'])
          .limit(20);
        setActions(actionData ?? []);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!selectedAssessmentId) return;
    const fetchActions = async () => {
      const { data } = await supabase
        .from('improvement_actions')
        .select('id, action_title')
        .eq('assessment_id', selectedAssessmentId)
        .in('status', ['Open', 'In Progress'])
        .limit(20);
      setActions(data ?? []);
    };
    fetchActions();
  }, [selectedAssessmentId]);

  const handleSubmit = async () => {
    if (!noteText.trim() || !dealershipId || !user?.id) return;
    setSubmitting(true);

    const payload: {
      coach_user_id: string;
      dealership_id: string;
      note_text: string;
      note_type: string | null;
      assessment_id?: string;
      action_id?: string;
    } = {
      coach_user_id: user.id,
      dealership_id: dealershipId,
      note_text: noteText.trim(),
      note_type: noteType || null,
    };
    if (contextType === 'assessment' && selectedAssessmentId) payload.assessment_id = selectedAssessmentId;
    if (contextType === 'action' && selectedActionId) payload.action_id = selectedActionId;

    const { data, error } = await supabase.from('coach_notes').insert(payload).select().single();

    if (error) {
      console.error('coach_notes insert failed', error);
    } else if (data) {
      setNotes(prev => [data as CoachNote, ...prev]);
      setNoteText('');
      setNoteType('');
      setContextType('general');
      setSelectedAssessmentId('');
      setSelectedActionId('');
      onNoteAdded();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-base font-semibold">{dealerName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Compose */}
          <div className="px-5 py-4 border-b border-border space-y-3">
            <RadioGroup
              value={contextType}
              onValueChange={v => setContextType(v as 'general' | 'assessment' | 'action')}
              className="flex gap-4"
            >
              {(['general', 'assessment', 'action'] as const).map(ctx => (
                <div key={ctx} className="flex items-center gap-1.5">
                  <RadioGroupItem value={ctx} id={`ctx-${ctx}`} />
                  <Label htmlFor={`ctx-${ctx}`} className="text-sm capitalize cursor-pointer">{ctx}</Label>
                </div>
              ))}
            </RadioGroup>

            {contextType === 'assessment' && assessments.length > 0 && (
              <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">
                      {format(new Date(a.created_at), 'dd MMM yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {contextType === 'action' && actions.length > 0 && (
              <Select value={selectedActionId} onValueChange={setSelectedActionId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map(a => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">{a.action_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={noteType} onValueChange={v => setNoteType(v as typeof noteType)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Note type (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observation">Observation</SelectItem>
                <SelectItem value="action">Action</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Add a field note…"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              maxLength={2000}
              rows={3}
              className="resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{noteText.length}/2000</span>
              <Button size="sm" onClick={handleSubmit} disabled={!noteText.trim() || submitting}>
                {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Save Note
              </Button>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 px-5 py-3 space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No notes yet</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.created_at), 'dd MMM yyyy')}
                    </span>
                    {note.assessment_id && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Assessment</Badge>
                    )}
                    {note.action_id && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Action</Badge>
                    )}
                    {note.note_type && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{note.note_type}</Badge>
                    )}
                    <button
                      className="ml-auto text-muted-foreground hover:text-[#dc2626] transition-colors"
                      onClick={async () => {
                        await supabase.from('coach_notes').delete().eq('id', note.id);
                        setNotes(prev => prev.filter(n => n.id !== note.id));
                      }}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground">{note.note_text}</p>
                  <div className="border-b border-border/50" />
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
