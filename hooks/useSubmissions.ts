import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export interface Submission {
  id: string;
  theaterName: string;
  scriptTitle: string;
  submissionDate: string;
  deadline?: string;
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'No Response';
  fee?: number;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  responseDate?: string;
  calendarEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionData {
  theaterName: string;
  scriptTitle: string;
  submissionDate: string;
  deadline?: string;
  status: Submission['status'];
  fee?: number;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  responseDate?: string;
}

export interface UpdateSubmissionData extends Partial<CreateSubmissionData> {
  id: string;
}

// Enhanced toast function with better close functionality
const showToast = (type: 'success' | 'error' | 'warning', message: string, options?: any) => {
  const toastId = toast[type](message, {
    duration: 5000,
    closeButton: true,
    dismissible: true,
    ...options,
  });
  
  // Add keyboard shortcut hint for power users
  if (type === 'success') {
    toast.info('💡 Tip: Press Esc to dismiss all notifications', {
      duration: 3000,
      closeButton: true,
      dismissible: true,
    });
  }
  
  return toastId;
};

export function useSubmissions() {
  const { userId } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all submissions
  const fetchSubmissions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/submissions');
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new submission
  const createSubmission = useCallback(async (data: CreateSubmissionData): Promise<Submission> => {
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create submission');
    }

    const newSubmission = await response.json();
    setSubmissions(prev => [newSubmission, ...prev]);
    return newSubmission;
  }, [userId]);

  // Update a submission
  const updateSubmission = useCallback(async (data: UpdateSubmissionData): Promise<Submission> => {
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`/api/submissions/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update submission');
    }

    const updatedSubmission = await response.json();
    setSubmissions(prev => 
      prev.map(sub => sub.id === data.id ? updatedSubmission : sub)
    );
    return updatedSubmission;
  }, [userId]);

  // Delete a submission
  const deleteSubmission = useCallback(async (id: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch(`/api/submissions/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete submission');
    }

    setSubmissions(prev => prev.filter(sub => sub.id !== id));
  }, [userId]);

  // Export submissions
  const exportSubmissions = useCallback(async (format: 'csv' | 'json' = 'csv', filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');

    const params = new URLSearchParams({ format });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`/api/submissions/export?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to export submissions');
    }

    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `submissions-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }, [userId]);

  // Import submissions
  const importSubmissions = useCallback(async (submissions: any[], columnMapping: any): Promise<{
    imported: number;
    warnings: string[];
  }> => {
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch('/api/submissions/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ submissions, columnMapping }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to import submissions');
    }

    const result = await response.json();
    
    // Refresh submissions list
    await fetchSubmissions();
    
    return {
      imported: result.imported,
      warnings: result.warnings || []
    };
  }, [userId, fetchSubmissions]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = submissions.length;
    const byStatus = submissions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalFees = submissions.reduce((sum, sub) => sum + (sub.fee || 0), 0);
    const pendingSubmissions = submissions.filter(sub => 
      ['Submitted', 'Under Review'].includes(sub.status)
    ).length;

    const upcomingDeadlines = submissions.filter(sub => {
      if (!sub.deadline) return false;
      const deadline = new Date(sub.deadline);
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return deadline > now && deadline <= thirtyDaysFromNow;
    }).length;

    return {
      total,
      byStatus,
      totalFees,
      pendingSubmissions,
      upcomingDeadlines
    };
  }, [submissions]);

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return {
    submissions,
    loading,
    error,
    createSubmission,
    updateSubmission,
    deleteSubmission,
    exportSubmissions,
    importSubmissions,
    refreshSubmissions: fetchSubmissions,
    analytics
  };
} 