import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CalendarIcon, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CoachVisit {
  id: string;
  visit_date: string;
  status: 'proposed' | 'confirmed' | 'cancelled' | 'completed';
  visit_notes: string | null;
  created_at: string;
}

interface VisitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealershipId: string | null;
  dealerName: string;
  onVisitSaved: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  proposed:  'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20',
  confirmed: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
  completed: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20',
};

export function VisitSheet({ open, onOpenChange, dealershipId, dealerName, onVisitSaved }: VisitSheetProps) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<CoachVisit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeVisit, setActiveVisit] = useState<CoachVisit | null>(null);

  useEffect(() => {
    if (open && dealershipId && user?.id) fetchVisits();
  }, [open, dealershipId, user?.id]);

  const fetchVisits = async () => {
    if (!dealershipId || !user?.id) return;
    const { data } = await supabase
      .from('coach_visits')
      .select('*')
      .eq('coach_user_id', user.id)
      .eq('dealership_id', dealershipId)
      .order('visit_date', { ascending: false });
    const rows = (data ?? []) as CoachVisit[];
    setVisits(rows);
    const active = rows.find(v => v.status === 'proposed' || v.status === 'confirmed') ?? null;
    setActiveVisit(active);
  };

  const handlePropose = async () => {
    if (!selectedDate || !dealershipId || !user?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('coach_visits').insert({
        coach_user_id: user.id,
        dealership_id: dealershipId,
        visit_date: format(selectedDate, 'yyyy-MM-dd'),
        visit_notes: notes.trim() || null,
        status: 'proposed',
      });
      if (error) {
        if (error.code === '23505') {
          toast.error('Cancel the existing proposed visit before scheduling a new one.');
        } else {
          throw error;
        }
        return;
      }
      toast.success('Visit proposed');
      setSelectedDate(undefined);
      setNotes('');
      await fetchVisits();
      onVisitSaved();
    } catch {
      toast.error('Failed to propose visit');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (visitId: string) => {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'cancelled' })
      .eq('id', visitId);
    if (error) { toast.error('Failed to cancel visit'); return; }
    toast.success('Visit cancelled');
    await fetchVisits();
    onVisitSaved();
  };

  const handleMarkCompleted = async (visitId: string) => {
    const { error } = await supabase
      .from('coach_visits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', visitId);
    if (error) { toast.error('Failed to mark visit as completed'); return; }
    toast.success('Visit marked as completed');
    await fetchVisits();
    onVisitSaved();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Visits — {dealerName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {activeVisit && (
            <div className="rounded-lg border border-border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {format(new Date(activeVisit.visit_date), 'dd MMM yyyy')}
                </span>
                <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[activeVisit.status]}`}>
                  {activeVisit.status}
                </Badge>
              </div>
              {activeVisit.visit_notes && (
                <p className="text-xs text-muted-foreground">{activeVisit.visit_notes}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#dc2626] hover:text-[#dc2626]"
                onClick={() => handleCancel(activeVisit.id)}
              >
                <X className="h-3 w-3 mr-1" />Cancel visit
              </Button>
              {activeVisit.status === 'confirmed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#16a34a] hover:text-[#16a34a]"
                  onClick={() => handleMarkCompleted(activeVisit.id)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />Mark as completed
                </Button>
              )}
            </div>
          )}

          {!activeVisit && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Propose a visit date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="rounded-md border"
              />
              <Textarea
                placeholder="Optional notes for this visit..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="resize-none text-sm"
                rows={3}
              />
              <Button
                className="w-full"
                disabled={!selectedDate || saving}
                onClick={handlePropose}
              >
                {saving ? 'Proposing…' : 'Propose Visit'}
              </Button>
            </div>
          )}

          {visits.filter(v => v.status === 'cancelled' || v.status === 'completed').length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Past visits</p>
              <div className="divide-y divide-border rounded-lg border">
                {visits
                  .filter(v => v.status === 'cancelled' || v.status === 'completed')
                  .map(v => (
                    <div key={v.id} className="flex items-center justify-between px-3 py-2">
                      <span className="text-sm">{format(new Date(v.visit_date), 'dd MMM yyyy')}</span>
                      <Badge variant="outline" className={`text-xs capitalize ${STATUS_STYLES[v.status]}`}>
                        {v.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
