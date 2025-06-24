"use client";

import { useState } from "react";
import type { Submission } from "@/hooks/useSubmissions";
import { useNylas } from "@/hooks/useNylas";
import { useAuth } from "@clerk/nextjs";
import { Calendar, CheckCircle } from "lucide-react";
import nylas from '@/lib/nylas';

interface SubmissionFormProps {
  submission?: Submission;
  onSubmit: (submission: Omit<Submission, "id" | "createdAt" | "updatedAt">) => Promise<Submission> | void;
  onCancel: () => void;
  isUpdating?: boolean;
}

export function SubmissionForm({ submission, onSubmit, onCancel, isUpdating }: SubmissionFormProps) {
  const { userId } = useAuth();
  const { isConnected, createEvent } = useNylas();
  const [addToCalendar, setAddToCalendar] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const [formData, setFormData] = useState(() => {
    // Check for prefilled data from theater directory
    try {
      const prefilled = localStorage.getItem("prefilledSubmission");
      if (prefilled) {
        const data = JSON.parse(prefilled);
        localStorage.removeItem("prefilledSubmission"); // Clear it after using
        return {
          theaterName: data.theaterName || "",
          contactPerson: data.contactPerson || "",
          submissionDate: data.submissionDate || new Date().toISOString().split('T')[0],
          deadline: data.deadline || "",
          fee: data.fee || "",
          scriptTitle: data.scriptTitle || "",
          status: data.status || "Submitted" as Submission["status"],
          notes: data.notes || "",
        };
      }
    } catch (error) {
      console.error("Failed to load prefilled data", error);
    }

    // Default values
    return {
      theaterName: submission?.theaterName || "",
      contactPerson: submission?.contactPerson || "",
      submissionDate: submission?.submissionDate || new Date().toISOString().split('T')[0],
      deadline: submission?.deadline || "",
      fee: submission?.fee || "",
      scriptTitle: submission?.scriptTitle || "",
      status: submission?.status || "Submitted" as Submission["status"],
      notes: submission?.notes || "",
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.theaterName || !formData.scriptTitle) {
      alert("Please fill out all required fields.");
      return;
    }

    const submissionData = {
      ...formData,
      fee: formData.fee ? Number(formData.fee) : undefined,
    };

    // First, submit the submission to the database
    try {
      const createdSubmission = await onSubmit(submissionData);
      
      // If submission was successful and user wants to add to calendar, create the event
      if (addToCalendar && formData.deadline && isConnected && createdSubmission) {
        try {
          setIsCreatingEvent(true);
          // Use the actual submission ID from the created submission
          await createEvent({
            id: createdSubmission.id,
            theaterName: formData.theaterName,
            scriptTitle: formData.scriptTitle,
            submissionDate: formData.submissionDate,
            deadline: formData.deadline,
            notes: formData.notes,
          });
        } catch (error) {
          console.error('Failed to create calendar event:', error);
          // Don't fail the entire submission if calendar event fails
        } finally {
          setIsCreatingEvent(false);
        }
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      // Handle submission error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-notion-bg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-notion-text">
          {submission ? "Edit Submission" : "Add New Submission"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-notion-text-light hover:text-notion-text"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theater Name */}
        <div className="md:col-span-2">
          <label htmlFor="theaterName" className="block text-sm font-medium text-notion-text-light mb-2">
            Theater/Contest Name *
          </label>
          <input
            type="text"
            id="theaterName"
            name="theaterName"
            value={formData.theaterName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            placeholder="e.g., Magic Theatre, Playwrights Foundation"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-notion-text-light mb-2">
            Contact Person
          </label>
          <input
            type="text"
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            placeholder="e.g., Literary Manager"
          />
        </div>

        {/* Script Title */}
        <div>
          <label htmlFor="scriptTitle" className="block text-sm font-medium text-notion-text-light mb-2">
            Script Title *
          </label>
          <input
            type="text"
            id="scriptTitle"
            name="scriptTitle"
            value={formData.scriptTitle}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            placeholder="e.g., My Great Play"
          />
        </div>

        {/* Submission Date */}
        <div>
          <label htmlFor="submissionDate" className="block text-sm font-medium text-notion-text-light mb-2">
            Submission Date *
          </label>
          <input
            type="date"
            id="submissionDate"
            name="submissionDate"
            value={formData.submissionDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
          />
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-notion-text-light mb-2">
            Response Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
          />
        </div>

        {/* Fee */}
        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-notion-text-light mb-2">
            Submission Fee ($)
          </label>
          <input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            placeholder="0.00"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-notion-text-light mb-2">
            Status *
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
          >
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="No Response">No Response</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-notion-text-light mb-2">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
          placeholder="Requirements, follow-up reminders, special instructions..."
        />
      </div>

      {/* Nylas Calendar Integration */}
      {isConnected && (
        <div className="border-t border-notion-border pt-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-4 h-4 text-notion-accent" />
            <span className="text-sm font-medium text-notion-text">
              Nylas Calendar
            </span>
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">Connected</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="addToCalendar"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
              disabled={!formData.deadline}
              className="w-4 h-4 text-notion-accent bg-notion-bg border-notion-border rounded focus:ring-notion-accent"
            />
            <label
              htmlFor="addToCalendar"
              className="text-sm text-notion-text-light"
            >
              {formData.deadline
                ? "Add deadline to Nylas Calendar with reminders"
                : "Add deadline to Nylas Calendar (set a deadline first)"}
            </label>
          </div>
          
          {addToCalendar && formData.deadline && (
            <p className="text-xs text-notion-text-light mt-2">
              Creates a calendar event with email and popup reminders 1 day and 1 hour before the deadline.
            </p>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreatingEvent || isUpdating}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
        >
          {isCreatingEvent ? "Creating..." : isUpdating ? "Updating..." : (submission ? "Update Submission" : "Add Submission")}
        </button>
      </div>
    </form>
  );
} 