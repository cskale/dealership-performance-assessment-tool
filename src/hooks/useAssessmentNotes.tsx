import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AssessmentNote {
  id?: string;
  question_id: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export function useAssessmentNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load all notes for the current user
  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assessment_notes')
        .select('question_id, notes')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const notesMap: Record<string, string> = {};
      data?.forEach(note => {
        notesMap[note.question_id] = note.notes;
      });
      
      setNotes(notesMap);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update a note
  const saveNote = async (questionId: string, noteText: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (noteText.trim()) {
        const { error } = await supabase
          .from('assessment_notes')
          .upsert({
            user_id: user.id,
            question_id: questionId,
            notes: noteText.trim()
          }, {
            onConflict: 'user_id, question_id'
          });

        if (error) throw error;
        
        setNotes(prev => ({ ...prev, [questionId]: noteText.trim() }));
      } else {
        // Delete note if empty
        await deleteNote(questionId);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete a note
  const deleteNote = async (questionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('assessment_notes')
        .delete()
        .eq('user_id', user.id)
        .eq('question_id', questionId);

      if (error) throw error;
      
      setNotes(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Get notes for a specific category
  const getCategoryNotes = (questionIds: string[]) => {
    return questionIds.reduce((categoryNotes, questionId) => {
      if (notes[questionId]) {
        categoryNotes[questionId] = notes[questionId];
      }
      return categoryNotes;
    }, {} as Record<string, string>);
  };

  // Check if a question has notes
  const hasNotes = (questionId: string) => {
    return Boolean(notes[questionId]?.trim());
  };

  // Get note count for a category
  const getCategoryNoteCount = (questionIds: string[]) => {
    return questionIds.filter(id => hasNotes(id)).length;
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return {
    notes,
    isLoading,
    saveNote,
    deleteNote,
    hasNotes,
    getCategoryNotes,
    getCategoryNoteCount,
    loadNotes
  };
}