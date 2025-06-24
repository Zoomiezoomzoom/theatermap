"use client";

import { useState, useEffect } from "react";
import { SubmissionForm } from "../components/SubmissionForm";
import { SubmissionsTable } from "../components/SubmissionsTable";
import { ExportSubmissions } from "../components/ExportSubmissions";
import { ImportSubmissions } from "../components/ImportSubmissions";
import { CalendarImportWizard } from "../components/CalendarImportWizard";
import { OnboardingOverlay } from "../components/OnboardingOverlay";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, Download, Upload, Plus, Calendar, Search, Filter } from "lucide-react";
import { useSubmissions, type Submission } from "@/hooks/useSubmissions";

export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showCalendarImport, setShowCalendarImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { 
    submissions, 
    loading, 
    error, 
    createSubmission, 
    updateSubmission, 
    deleteSubmission,
    analytics,
    refreshSubmissions
  } = useSubmissions();

  // Check for prefilled submission data from theater directory
  const checkForPrefilledData = () => {
    try {
      const prefilled = localStorage.getItem("prefilledSubmission");
      if (prefilled) {
        const data = JSON.parse(prefilled);
        setShowForm(true);
        localStorage.removeItem("prefilledSubmission");
        return true;
      }
    } catch (error) {
      console.error("Failed to load prefilled submission data", error);
    }
    return false;
  };

  // Check for prefilled data on mount
  useState(() => {
    if (isSignedIn && user) {
      checkForPrefilledData();
    }
  });

  const handleAddSubmission = async (submissionData: Omit<Submission, "id" | "createdAt" | "updatedAt">) => {
    try {
      const createdSubmission = await createSubmission(submissionData);
      setShowForm(false);
      toast.success("Submission added successfully");
      return createdSubmission;
    } catch (error) {
      toast.error(`Failed to add submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleUpdateSubmission = async (id: string, updates: Partial<Submission>) => {
    try {
      await updateSubmission({ id, ...updates });
      toast.success("Submission updated successfully");
    } catch (error) {
      toast.error(`Failed to update submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await deleteSubmission(id);
      toast.success("Submission deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCalendarImportComplete = () => {
    refreshSubmissions();
  };

  const resetOnboarding = () => {
    localStorage.removeItem('theaterTrackerOnboardingCompleted');
    window.location.reload();
  };

  const filteredSubmissions = submissions.filter(s => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = s.theaterName.toLowerCase().includes(searchLower) || s.scriptTitle.toLowerCase().includes(searchLower);
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
        if (statusFilter === 'Pending') {
            matchesStatus = s.status === 'Submitted' || s.status === 'Under Review';
        } else if (statusFilter === 'Overdue') {
            matchesStatus = s.deadline ? new Date(s.deadline) < new Date() && s.status !== 'Accepted' && s.status !== 'Rejected' : false;
        } else {
            matchesStatus = s.status === statusFilter;
        }
    }
    
    return matchesSearch && matchesStatus;
  });

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-accent mx-auto mb-4"></div>
          <p className="text-notion-text-light">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-notion-text mb-4">Sign in to access your dashboard</h1>
          <p className="text-notion-text-light mb-6">
            Track your theater submissions, manage deadlines, and stay organized with your personal dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = '/sign-up'}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 pt-24">
        
        {/* Header */}
        <header className="space-y-1">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-notion-text">
                Submission Tracker
              </h1>
              <p className="text-lg text-notion-text-light">
                Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCalendarImport(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
              >
                <Calendar size={16} />
                Import Calendar
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
              >
                <Upload size={16} />
                Import CSV
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
              >
                <Plus size={16} />
                Add Submission
              </button>
            </div>
          </div>
        </header>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-notion-bg border border-notion-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-notion-text-light">Total Submissions</p>
                <p className="text-2xl font-bold text-notion-text">{analytics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-notion-bg border border-notion-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-notion-text-light">Pending</p>
                <p className="text-2xl font-bold text-notion-text">{analytics.pendingSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-notion-bg border border-notion-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-notion-text-light">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-notion-text">{analytics.upcomingDeadlines}</p>
              </div>
            </div>
          </div>

          <div className="bg-notion-bg border border-notion-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-notion-text-light">Total Fees</p>
                <p className="text-2xl font-bold text-notion-text">${analytics.totalFees.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <SubmissionsTable
          submissions={filteredSubmissions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onUpdate={handleUpdateSubmission}
          onDelete={handleDeleteSubmission}
          onAdd={() => setShowForm(true)}
          analytics={analytics}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading submissions
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-notion-bg rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <SubmissionForm
                onSubmit={handleAddSubmission}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {showImport && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImport(false)}
          >
            <div 
              className="bg-notion-bg rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-notion-border">
                <h2 className="text-xl font-bold text-notion-text">Import Submissions</h2>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-notion-text-light hover:text-notion-text transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <ImportSubmissions
                onImportComplete={() => setShowImport(false)}
              />
            </div>
          </div>
        )}

        {showCalendarImport && (
          <CalendarImportWizard
            onClose={() => setShowCalendarImport(false)}
            onImportComplete={handleCalendarImportComplete}
          />
        )}

        {showExport && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExport(false)}
          >
            <div 
              className="bg-notion-bg rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 border-b border-notion-border">
                <h2 className="text-xl font-bold text-notion-text">Export Submissions</h2>
                <button
                  onClick={() => setShowExport(false)}
                  className="text-notion-text-light hover:text-notion-text transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <ExportSubmissions />
            </div>
          </div>
        )}

        {/* Onboarding Overlay */}
        <OnboardingOverlay />
      </div>
    </div>
  );
} 