import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Save, X, Trash2, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActionRationale } from "@/lib/actionRationaleMap";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Action {
  id: string;
  department: string;
  action_title: string;
  action_description: string;
  priority: string;
  responsible_person: string | null;
  target_completion_date: string | null;
  status: string;
  support_required_from: string[] | null;
  kpis_linked_to: string[] | null;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action | null;
  mode: 'create' | 'edit';
  onSave: (action: Partial<Action>) => void;
  onDelete?: (actionId: string) => void;
  readOnly?: boolean;
  rationale?: ActionRationale;
  cleanDescription?: string;
}

const RESPONSIBLE_PERSONS = [
  "Dealer Principal",
  "Aftersales Manager",
  "Parts Supervisor",
  "Sales Consultant",
  "Sales Manager",
  "Service Manager",
  "Finance Manager",
  "Marketing Manager"
];

const SUPPORT_OPTIONS = ["Coach", "IT Team", "Parts Vendor", "OEM", "Management", "Training Provider", "Consultant"];

const KPI_CATEGORIES = ["Parts KPIs", "Workshop KPIs", "Sales KPIs", "Aftersales KPIs", "Financial KPIs", "Customer Satisfaction KPIs"];

const DEPARTMENTS = ["Parts", "Workshop", "Sales", "Aftersales", "Finance", "Marketing", "Customer Service",
  "New Vehicle Sales", "Used Vehicle Sales", "Service", "Parts & Inventory", "Financial Operations"];

export function ActionSheet({ open, onOpenChange, action, mode, onSave, onDelete, readOnly, rationale, cleanDescription }: ActionSheetProps) {
  const [formData, setFormData] = useState<Partial<Action>>({
    action_title: '',
    action_description: '',
    department: '',
    priority: 'medium',
    status: 'Open',
    responsible_person: null,
    target_completion_date: null,
    support_required_from: [],
    kpis_linked_to: []
  });

  useEffect(() => {
    if (action && mode === 'edit') {
      setFormData({
        action_title: action.action_title,
        action_description: cleanDescription || action.action_description,
        department: action.department,
        priority: action.priority,
        status: action.status,
        responsible_person: action.responsible_person,
        target_completion_date: action.target_completion_date,
        support_required_from: action.support_required_from || [],
        kpis_linked_to: action.kpis_linked_to || []
      });
    } else if (mode === 'create') {
      setFormData({
        action_title: '', action_description: '', department: '', priority: 'medium',
        status: 'Open', responsible_person: null, target_completion_date: null,
        support_required_from: [], kpis_linked_to: []
      });
    }
  }, [action, mode, open, cleanDescription]);

  const toggleArrayItem = (field: 'support_required_from' | 'kpis_linked_to', item: string) => {
    const current = formData[field] || [];
    const newArray = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSave = () => {
    if (mode === 'edit' && action) {
      onSave({ ...formData, id: action.id });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>
            {readOnly ? 'View Action' : mode === 'create' ? 'Create New Action' : 'Edit Action'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-4 py-4">
            {/* B3: Human rationale section */}
            {rationale && mode === 'edit' && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Why this matters
                </div>
                <p className="text-sm text-muted-foreground">{rationale.summary}</p>
                <Separator />
                <div className="text-sm font-medium text-foreground">Our recommendation</div>
                <p className="text-sm text-muted-foreground">{rationale.recommendation}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Action Title</Label>
              <Input
                id="title" disabled={readOnly}
                value={formData.action_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, action_title: e.target.value }))}
                placeholder="Short, imperative action title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description" disabled={readOnly}
                value={formData.action_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, action_description: e.target.value }))}
                placeholder="Describe what needs to be done and expected outcomes"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select disabled={readOnly} value={formData.department || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select disabled={readOnly} value={formData.priority || 'medium'} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select disabled={readOnly} value={formData.status || 'Open'} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Responsible Person</Label>
              <Select disabled={readOnly} value={formData.responsible_person || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_person: value }))}>
                <SelectTrigger><SelectValue placeholder="Assign owner" /></SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_PERSONS.map(person => (<SelectItem key={person} value={person}>{person}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Completion Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={readOnly} className={cn("w-full justify-start text-left font-normal", !formData.target_completion_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_completion_date ? format(new Date(formData.target_completion_date), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.target_completion_date ? new Date(formData.target_completion_date) : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, target_completion_date: date ? format(date, "yyyy-MM-dd") : null }))}
                    initialFocus className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Support Required From</Label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORT_OPTIONS.map(support => (
                  <div key={support} className="flex items-center space-x-2">
                    <Checkbox id={`support-${support}`} disabled={readOnly}
                      checked={formData.support_required_from?.includes(support) || false}
                      onCheckedChange={() => toggleArrayItem('support_required_from', support)} />
                    <label htmlFor={`support-${support}`} className="text-sm cursor-pointer">{support}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>KPIs Linked To</Label>
              <div className="grid grid-cols-1 gap-2">
                {KPI_CATEGORIES.map(kpi => (
                  <div key={kpi} className="flex items-center space-x-2">
                    <Checkbox id={`kpi-${kpi}`} disabled={readOnly}
                      checked={formData.kpis_linked_to?.includes(kpi) || false}
                      onCheckedChange={() => toggleArrayItem('kpis_linked_to', kpi)} />
                    <label htmlFor={`kpi-${kpi}`} className="text-sm cursor-pointer">{kpi}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {!readOnly && (
          <DialogFooter className="flex gap-2 px-6 pb-6 pt-4 border-t">
            {mode === 'edit' && onDelete && action && (
              <Button variant="destructive" onClick={() => { onDelete(action.id); onOpenChange(false); }} className="mr-auto">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
