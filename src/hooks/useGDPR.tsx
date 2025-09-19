import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useGDPR = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const exportUserData = async (): Promise<any | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export data",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('export_user_data', {
        _user_id: user.id
      });

      if (error) {
        throw error;
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file",
      });

      return data;
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export your data",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete your account",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('delete_user_account', {
        _user_id: user.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account deleted successfully",
        description: "Your account and all associated data have been permanently removed",
      });

      // Sign out and redirect
      await signOut();
      return true;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete your account",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: 'analytics' | 'marketing', granted: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: any = consentType === 'analytics' 
        ? { consent_analytics: granted }
        : { consent_marketing: granted };

      // Add consent timestamp if granting
      if (granted) {
        updateData.gdpr_consented_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Consent updated",
        description: `${consentType} consent ${granted ? 'granted' : 'withdrawn'}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating consent:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update consent",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    exportUserData,
    deleteAccount,
    updateConsent,
    loading,
  };
};