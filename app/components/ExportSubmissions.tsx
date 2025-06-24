"use client";

import { useState } from 'react';
import { Download, FileText, FileJson, Calendar, Filter } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';
import { toast } from 'sonner';

interface ExportSubmissionsProps {
  className?: string;
}

export function ExportSubmissions({ className = '' }: ExportSubmissionsProps) {
  const { exportSubmissions, analytics } = useSubmissions();
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: ''
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      const exportFilters = {
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      };

      await exportSubmissions(format, Object.keys(exportFilters).length > 0 ? exportFilters : undefined);
      
      toast.success(`${format.toUpperCase()} export completed successfully!`);
    } catch (error) {
      toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      label: 'CSV Export',
      description: 'For spreadsheet users and data analysis',
      icon: FileText,
      format: 'csv' as const,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'JSON Export',
      description: 'For technical users and data portability',
      icon: FileJson,
      format: 'json' as const,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className={`bg-notion-bg border border-notion-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-notion-text">Export Your Data</h3>
          <p className="text-sm text-notion-text-light">
            Export your submissions for backup, analysis, or migration
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mb-6 p-4 bg-notion-hover-bg rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-notion-text-light mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="No Response">No Response</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-text-light mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-notion-text-light mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-notion-text-light">
            <span>
              {analytics.total} total submissions
              {filters.status !== 'all' && ` • ${analytics.byStatus[filters.status] || 0} ${filters.status.toLowerCase()}`}
            </span>
            <button
              onClick={() => setFilters({ status: 'all', startDate: '', endDate: '' })}
              className="text-notion-accent hover:text-notion-accent-hover transition-colors"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.format}
              onClick={() => handleExport(option.format)}
              disabled={isExporting}
              className={`flex items-center gap-3 p-4 rounded-lg text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-notion-bg ${option.color} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Icon size={20} />
              <div className="text-left">
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm opacity-90">{option.description}</div>
              </div>
              <Download size={16} className="ml-auto" />
            </button>
          );
        })}
      </div>

      {/* Export Info */}
      <div className="mt-4 p-3 bg-notion-hover-bg rounded-lg">
        <div className="flex items-center gap-2 text-sm text-notion-text-light">
          <Calendar size={14} />
          <span>
            Exports include all submission data including dates, fees, and notes.
            {filters.status !== 'all' || filters.startDate || filters.endDate ? 
              ' Filtered results will be exported.' : 
              ' All submissions will be exported.'
            }
          </span>
        </div>
      </div>
    </div>
  );
} 