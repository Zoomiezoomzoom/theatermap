"use client";

import { useState } from "react";
import type { Submission } from "@/hooks/useSubmissions";
import { SubmissionForm } from "./SubmissionForm";
import { Search, Filter, Plus } from "lucide-react";

interface SubmissionsTableProps {
  submissions: Submission[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onUpdate: (id: string, updates: Partial<Submission>) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  analytics: {
    total: number;
    byStatus: Record<string, number>;
    totalFees: number;
    pendingSubmissions: number;
    upcomingDeadlines: number;
  };
}

type SortableField = keyof Submission;

export function SubmissionsTable({ 
  submissions, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter,
  onUpdate, 
  onDelete,
  onAdd,
  analytics 
}: SubmissionsTableProps) {
  const [sortField, setSortField] = useState<SortableField>("submissionDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSort = (field: SortableField) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === bValue) return 0;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue && bValue && typeof aValue === 'string' && typeof bValue === 'string') {
      // Handle date strings
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        comparison = aDate.getTime() - bDate.getTime();
      } else {
        comparison = aValue.localeCompare(bValue);
      }
    } else {
      // Fallback for mixed or other types
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getStatusInfo = (submission: Submission) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = submission.deadline ? new Date(submission.deadline) : null;
    if (deadline) {
      deadline.setHours(0, 0, 0, 0);
    }
    
    let status = submission.status;
    let color = "bg-gray-400"; // No Response / Submitted
    
    if (status === 'Accepted') color = "bg-green-500";
    else if (status === 'Rejected') color = "bg-red-500";
    else if (status === 'Under Review') color = "bg-blue-500";
    
    // Overrule status color if overdue
    if (deadline && deadline < today && status !== 'Accepted' && status !== 'Rejected') {
      status = 'Overdue' as any; // Type assertion for display purposes
      color = "bg-yellow-500";
    }

    return { status, color };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === null || amount === undefined) return "-";
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-notion-border rounded-lg">
        <div className="mx-auto w-16 h-16 text-notion-text-light mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        </div>
        <h3 className="text-xl font-semibold text-notion-text mb-2">
          Track your first submission
        </h3>
        <p className="text-notion-text-light mb-6 max-w-sm mx-auto">
          Add a submission to get started. Benefits include:
        </p>
        <ul className="text-notion-text-light list-disc list-inside mb-6 inline-block text-left">
            <li>Never miss a deadline</li>
            <li>See your submission history</li>
            <li>Analyze your success rate</li>
        </ul>
        <div>
            <button
              onClick={onAdd}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover"
            >
              <Plus size={16} className="mr-2" />
              Add Submission
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-notion-bg rounded-lg border border-notion-border overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-notion-border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-text-light" size={20} />
            <input
              type="text"
              placeholder="Search theaters or scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
            >
              <Filter size={16} />
              Filters
            </button>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-notion-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm text-notion-text-light">
                <span className="font-medium">Total:</span> {analytics.total} submissions
              </div>
              <div className="text-sm text-notion-text-light">
                <span className="font-medium">Pending:</span> {analytics.pendingSubmissions} responses
              </div>
              <div className="text-sm text-notion-text-light">
                <span className="font-medium">Fees:</span> {formatCurrency(analytics.totalFees)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-notion-bg">
            <tr>
              {[
                { key: "status", label: "Status" },
                { key: "theaterName", label: "Theater" },
                { key: "scriptTitle", label: "Script" },
                { key: "submissionDate", label: "Submitted" },
                { key: "deadline", label: "Deadline" },
                { key: "fee", label: "Fee" },
                { key: "actions", label: "" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-semibold text-notion-text-light uppercase tracking-wider"
                >
                  {key !== "actions" ? (
                    <button
                      onClick={() => handleSort(key as SortableField)}
                      className="flex items-center gap-1 hover:text-notion-text transition-colors"
                    >
                      {label}
                      {sortField === key && (
                        <span className="text-notion-accent">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ) : (
                    label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-notion-border">
            {sortedSubmissions.map((submission) => {
              const { status, color } = getStatusInfo(submission);
              return (
                <tr key={submission.id} className="hover:bg-notion-hover-bg">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`h-2.5 w-2.5 rounded-full ${color} mr-2`}></span>
                      <span className="text-sm text-notion-text">{status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-notion-text">{submission.theaterName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-light">{submission.scriptTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-light">{formatDate(submission.submissionDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-light">{formatDate(submission.deadline)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-notion-text-light">{formatCurrency(submission.fee)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setEditingSubmission(submission)} className="text-notion-accent hover:text-notion-accent-hover">Edit</button>
                      <button onClick={() => window.confirm("Are you sure?") && onDelete(submission.id)} className="text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-notion-hover-bg">
            <tr>
              <td colSpan={5} className="px-6 py-3 text-right text-sm font-semibold text-notion-text">Total Fees:</td>
              <td className="px-6 py-3 text-sm font-semibold text-notion-text">{formatCurrency(analytics.totalFees)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {editingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-notion-bg rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-notion-border shadow-2xl">
            <SubmissionForm
              submission={editingSubmission}
              onSubmit={async (updatedSubmission) => {
                setIsUpdating(true);
                try {
                  await onUpdate(editingSubmission.id, updatedSubmission);
                  setEditingSubmission(null);
                } finally {
                  setIsUpdating(false);
                }
              }}
              onCancel={() => setEditingSubmission(null)}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      )}
    </div>
  );
} 