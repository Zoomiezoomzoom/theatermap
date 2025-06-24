"use client";

import { useState } from 'react';
import { useOnboarding } from './OnboardingProvider';
import { SubmissionForm } from './SubmissionForm';
import { useSubmissions, type Submission } from '@/hooks/useSubmissions';
import { CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function OnboardingOverlay() {
  const { 
    isOnboarding, 
    currentStep, 
    nextStep, 
    skipStep, 
    completeOnboarding, 
    skipOnboarding 
  } = useOnboarding();
  
  const { createSubmission } = useSubmissions();
  const [showFirstSubmissionForm, setShowFirstSubmissionForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOnboarding) return null;

  const handleAddFirstSubmission = async (submission: Omit<Submission, "id" | "createdAt" | "updatedAt">) => {
    try {
      setIsCreating(true);
      const createdSubmission = await createSubmission(submission);
      toast.success("Submission added successfully!");
      setShowFirstSubmissionForm(false);
      nextStep();
      return createdSubmission;
    } catch (error) {
      toast.error("Failed to add submission. Please try again.");
      console.error('Error creating submission during onboarding:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = () => {
    setShowSuccess(true);
    setTimeout(() => {
      completeOnboarding();
      // Trigger a page refresh to show the dashboard
      window.location.reload();
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-notion-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-notion-accent" />
              </div>
              <h1 className="text-3xl font-bold text-notion-text mb-4">
                Welcome to TheaterTracker!
              </h1>
              <p className="text-lg text-notion-text-light">
                Let's get your submissions organized in under 2 minutes
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={nextStep}
                className="w-full bg-notion-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-notion-accent-hover transition-colors"
              >
                Get Started
              </button>
              <button
                onClick={skipOnboarding}
                className="w-full text-notion-text-light hover:text-notion-text transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-notion-text mb-4">
                Add your most recent submission
              </h2>
              <p className="text-notion-text-light mb-6">
                Start with a submission you made in the last few months - we'll help you track the rest later
              </p>
              
              {showFirstSubmissionForm ? (
                <div className="bg-notion-bg rounded-lg border border-notion-border p-6">
                  <SimplifiedSubmissionForm onSubmit={handleAddFirstSubmission} isCreating={isCreating} />
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowFirstSubmissionForm(true)}
                    className="w-full bg-notion-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-notion-accent-hover transition-colors"
                  >
                    Add Submission
                  </button>
                  <button
                    onClick={skipStep}
                    className="w-full text-notion-text-light hover:text-notion-text transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-notion-text mb-4">
                Here's your submission dashboard
              </h2>
              <div className="bg-notion-bg rounded-lg border border-notion-border p-6 mb-6">
                <div className="space-y-4 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-notion-text">Click any submission to edit details</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-notion-text">Use filters to find specific submissions quickly</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-notion-accent rounded-full"></div>
                    <span className="text-sm text-notion-text">The '+' button adds new submissions anytime</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={nextStep}
              className="bg-notion-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-notion-accent-hover transition-colors"
            >
              Got it, let me explore
            </button>
          </div>
        );

      case 4:
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-notion-text mb-4">
                Add a few more to see the magic
              </h2>
              <p className="text-notion-text-light mb-6">
                TheaterTracker works best with your full submission history. Add 2-3 more when you have time.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleComplete}
                className="w-full bg-notion-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-notion-accent-hover transition-colors"
              >
                Add Another
              </button>
              <button
                onClick={handleComplete}
                className="w-full text-notion-text-light hover:text-notion-text transition-colors"
              >
                I'll do this later
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-notion-bg rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-notion-text mb-4">
            You're all set!
          </h2>
          <p className="text-notion-text-light mb-6">
            Your submissions are now organized. Bookmark this page and check back regularly to update statuses and add new submissions.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-notion-text-light">
            <div className="w-2 h-2 bg-notion-accent rounded-full animate-pulse"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-notion-bg rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={skipOnboarding}
          className="absolute top-4 right-4 text-notion-text-light hover:text-notion-text"
        >
          <X size={20} />
        </button>

        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step <= currentStep ? 'bg-notion-accent' : 'bg-notion-border'
                }`}
              />
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
}

// Simplified form for onboarding
function SimplifiedSubmissionForm({ 
  onSubmit, 
  isCreating 
}: { 
  onSubmit: (submission: Omit<Submission, "id" | "createdAt" | "updatedAt">) => void;
  isCreating: boolean;
}) {
  const [formData, setFormData] = useState({
    theaterName: "",
    scriptTitle: "",
    submissionDate: new Date().toISOString().split('T')[0],
    status: "Submitted" as Submission["status"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.theaterName || !formData.scriptTitle) {
      alert("Please fill out all required fields.");
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-notion-text-light mb-2">
          Theater/Contest Name *
        </label>
        <input
          type="text"
          name="theaterName"
          value={formData.theaterName}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent"
          placeholder="e.g., Magic Theatre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-notion-text-light mb-2">
          Script Title *
        </label>
        <input
          type="text"
          name="scriptTitle"
          value={formData.scriptTitle}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent"
          placeholder="e.g., My Great Play"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-notion-text-light mb-2">
          Submission Date *
        </label>
        <input
          type="date"
          name="submissionDate"
          value={formData.submissionDate}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-notion-text-light mb-2">
          Status *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent"
        >
          <option value="Submitted">Submitted</option>
          <option value="Under Review">Under Review</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
          <option value="No Response">No Response</option>
        </select>
      </div>

      <p className="text-xs text-notion-text-light text-center">
        Don't worry about getting everything perfect - you can always edit later
      </p>

      <button
        type="submit"
        disabled={isCreating}
        className="w-full bg-notion-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isCreating ? "Adding..." : "Add Submission"}
      </button>
    </form>
  );
} 