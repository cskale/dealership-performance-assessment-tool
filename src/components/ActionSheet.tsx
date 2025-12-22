import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const SUPPORT_OPTIONS = [
  "Coach",
  "IT Team",
  "Parts Vendor",
  "OEM",
  "Management",
  "Training Provider",
  "Consultant"
];

const KPI_CATEGORIES = [
  "Parts KPIs",
  "Workshop KPIs",
  "Sales KPIs",
  "Aftersales KPIs",
  "Financial KPIs",
  "Customer Satisfaction KPIs"
];

const DEPARTMENTS = [
  "Parts",
  "Workshop",
  "Sales",
  "Aftersales",
  "Finance",
  "Marketing",
  "Customer Service"
];

export function ActionSheet({ open, onOpenChange, action, mode, onSave, onDelete }: ActionSheetProps) {
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
        action_description: action.action_description,
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
    }
  }, [action, mode, open]);

  const toggleArrayItem = (field: 'support_required_from' | 'kpis_linked_to', item: string) => {
    const current = formData[field] || [];
    const newArray = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
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

  const handleDelete = () => {
    if (action && onDelete) {
      onDelete(action.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === 'create' ? 'Create New Action' : 'Edit Action'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          {/* Action Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Action Title</Label>
            <Input
              id="title"
              value={formData.action_title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, action_title: e.target.value }))}
              placeholder="Enter action title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.action_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, action_description: e.target.value }))}
              placeholder="Enter action description"
              rows={3}
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              value={formData.department || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority || 'medium'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status || 'Open'}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Responsible Person */}
          <div className="space-y-2">
            <Label>Responsible Person</Label>
            <Select
              value={formData.responsible_person || ''}
              onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_person: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                {RESPONSIBLE_PERSONS.map(person => (
                  <SelectItem key={person} value={person}>{person}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Target Completion Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.target_completion_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.target_completion_date
                    ? format(new Date(formData.target_completion_date), "PPP")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.target_completion_date ? new Date(formData.target_completion_date) : undefined}
                  onSelect={(date) => setFormData(prev => ({ 
                    ...prev, 
                    target_completion_date: date ? format(date, "yyyy-MM-dd") : null 
                  }))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Support Required */}
          <div className="space-y-2">
            <Label>Support Required From</Label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORT_OPTIONS.map(support => (
                <div key={support} className="flex items-center space-x-2">
                  <Checkbox
                    id={`support-${support}`}
                    checked={formData.support_required_from?.includes(support) || false}
                    onCheckedChange={() => toggleArrayItem('support_required_from', support)}
                  />
                  <label htmlFor={`support-${support}`} className="text-sm cursor-pointer">
                    {support}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="space-y-2">
            <Label>KPIs Linked To</Label>
            <div className="grid grid-cols-1 gap-2">
              {KPI_CATEGORIES.map(kpi => (
                <div key={kpi} className="flex items-center space-x-2">
                  <Checkbox
                    id={`kpi-${kpi}`}
                    checked={formData.kpis_linked_to?.includes(kpi) || false}
                    onCheckedChange={() => toggleArrayItem('kpis_linked_to', kpi)}
                  />
                  <label htmlFor={`kpi-${kpi}`} className="text-sm cursor-pointer">
                    {kpi}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="flex gap-2 pt-4 border-t">
          {mode === 'edit' && onDelete && (
            <Button variant="destructive" onClick={handleDelete} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
