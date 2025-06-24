"use client";

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, ArrowRight } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';
import { toast } from 'sonner';

interface ImportSubmissionsProps {
  className?: string;
  onImportComplete?: () => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  theaterName?: string;
  scriptTitle?: string;
  submissionDate?: string;
  deadline?: string;
  status?: string;
  fee?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes?: string;
  responseDate?: string;
}

export function ImportSubmissions({ className = '', onImportComplete }: ImportSubmissionsProps) {
  const { importSubmissions } = useSubmissions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const rows = parseCSV(csv);
        
        if (rows.length === 0) {
          toast.error('CSV file appears to be empty');
          return;
        }

        setCsvData(rows);
        autoMapColumns(rows[0]);
        setPreviewData(rows.slice(0, 5)); // Show first 5 rows for preview
        setStep('mapping');
      } catch (error) {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
      }
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string): CSVRow[] => {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Simple CSV parsing - assumes comma-separated with optional quotes
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  };

  const autoMapColumns = (firstRow: CSVRow) => {
    const mapping: ColumnMapping = {};
    const columns = Object.keys(firstRow);

    columns.forEach(col => {
      const lower = col.toLowerCase();
      
      if (lower.includes('theater') || lower.includes('venue') || lower.includes('company')) {
        mapping.theaterName = col;
      } else if (lower.includes('script') || lower.includes('play') || lower.includes('title') || lower.includes('work')) {
        mapping.scriptTitle = col;
      } else if ((lower.includes('date') || lower.includes('submitted')) && (lower.includes('submit') || lower.includes('sent'))) {
        mapping.submissionDate = col;
      } else if (lower.includes('deadline') || lower.includes('due') || lower.includes('response')) {
        mapping.deadline = col;
      } else if (lower.includes('status') || lower.includes('state')) {
        mapping.status = col;
      } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('amount')) {
        mapping.fee = col;
      } else if (lower.includes('contact') && lower.includes('person')) {
        mapping.contactPerson = col;
      } else if (lower.includes('email') || lower.includes('contact') && !lower.includes('person')) {
        mapping.contactEmail = col;
      } else if (lower.includes('note') || lower.includes('comment') || lower.includes('description')) {
        mapping.notes = col;
      } else if (lower.includes('response') && lower.includes('date')) {
        mapping.responseDate = col;
      }
    });

    setColumnMapping(mapping);
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      
      const result = await importSubmissions(csvData, columnMapping);
      
      toast.success(`Successfully imported ${result.imported} submissions!`);
      
      if (result.warnings.length > 0) {
        toast.warning(`${result.warnings.length} warnings during import`);
        console.log('Import warnings:', result.warnings);
      }
      
      setStep('complete');
      onImportComplete?.();
      
      // Reset form after a delay
      setTimeout(() => {
        resetForm();
      }, 3000);
      
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setCsvData([]);
    setColumnMapping({});
    setPreviewData([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const requiredFields = ['theaterName', 'scriptTitle', 'submissionDate'];
  const missingRequired = requiredFields.filter(field => !columnMapping[field as keyof ColumnMapping]);

  return (
    <div className={`bg-notion-bg border border-notion-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-notion-text">Import Submissions</h3>
          <p className="text-sm text-notion-text-light">
            Import your existing submissions from CSV files
          </p>
        </div>
        {step !== 'upload' && (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
          >
            <X size={16} />
            Start Over
          </button>
        )}
      </div>

      {/* Step Indicator */}
      {step !== 'upload' && (
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step === 'mapping' || step === 'preview' || step === 'complete' ? 'text-notion-accent' : 'text-notion-text-light'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'mapping' || step === 'preview' || step === 'complete' 
                  ? 'bg-notion-accent text-white' 
                  : 'bg-notion-hover-bg text-notion-text-light'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm">Upload</span>
            </div>
            <ArrowRight size={16} className="text-notion-text-light" />
            <div className={`flex items-center ${step === 'preview' || step === 'complete' ? 'text-notion-accent' : 'text-notion-text-light'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preview' || step === 'complete' 
                  ? 'bg-notion-accent text-white' 
                  : 'bg-notion-hover-bg text-notion-text-light'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm">Map</span>
            </div>
            <ArrowRight size={16} className="text-notion-text-light" />
            <div className={`flex items-center ${step === 'complete' ? 'text-notion-accent' : 'text-notion-text-light'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'complete' 
                  ? 'bg-notion-accent text-white' 
                  : 'bg-notion-hover-bg text-notion-text-light'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm">Import</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="text-center py-8">
          <div className="mb-4">
            <Upload size={48} className="mx-auto text-notion-text-light mb-4" />
            <h4 className="text-lg font-medium text-notion-text mb-2">Upload CSV File</h4>
            <p className="text-sm text-notion-text-light mb-6">
              Select a CSV file containing your submission data
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
          >
            <FileText size={16} />
            Choose CSV File
          </button>
          
          <div className="mt-4 text-xs text-notion-text-light">
            <p>Supported formats: CSV files with headers</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      )}

      {/* Mapping Step */}
      {step === 'mapping' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-notion-text mb-4">Map CSV Columns</h4>
            <p className="text-sm text-notion-text-light mb-4">
              Match your CSV columns to the submission fields below
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(columnMapping).length > 0 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Theater Name *
                  </label>
                  <select
                    value={columnMapping.theaterName || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, theaterName: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Script Title *
                  </label>
                  <select
                    value={columnMapping.scriptTitle || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, scriptTitle: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Submission Date *
                  </label>
                  <select
                    value={columnMapping.submissionDate || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, submissionDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Status
                  </label>
                  <select
                    value={columnMapping.status || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Fee
                  </label>
                  <select
                    value={columnMapping.fee || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, fee: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Notes
                  </label>
                  <select
                    value={columnMapping.notes || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  >
                    <option value="">Select column...</option>
                    {Object.keys(csvData[0] || {}).map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {missingRequired.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">
                Please map the required fields: {missingRequired.join(', ')}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-notion-text-light">
              {csvData.length} rows found in CSV
            </div>
            <button
              onClick={() => setStep('preview')}
              disabled={missingRequired.length > 0}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
            >
              Continue to Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview Step */}
      {step === 'preview' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-notion-text mb-4">Preview Import</h4>
            <p className="text-sm text-notion-text-light mb-4">
              Review the first few rows to ensure the mapping is correct
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-notion-border">
                  <th className="text-left py-2 px-3 font-medium text-notion-text-light">Theater</th>
                  <th className="text-left py-2 px-3 font-medium text-notion-text-light">Script</th>
                  <th className="text-left py-2 px-3 font-medium text-notion-text-light">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-notion-text-light">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-notion-text-light">Fee</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index} className="border-b border-notion-border">
                    <td className="py-2 px-3 text-notion-text">
                      {columnMapping.theaterName ? row[columnMapping.theaterName] : '-'}
                    </td>
                    <td className="py-2 px-3 text-notion-text">
                      {columnMapping.scriptTitle ? row[columnMapping.scriptTitle] : '-'}
                    </td>
                    <td className="py-2 px-3 text-notion-text">
                      {columnMapping.submissionDate ? row[columnMapping.submissionDate] : '-'}
                    </td>
                    <td className="py-2 px-3 text-notion-text">
                      {columnMapping.status ? row[columnMapping.status] : '-'}
                    </td>
                    <td className="py-2 px-3 text-notion-text">
                      {columnMapping.fee ? row[columnMapping.fee] : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
            >
              Back to Mapping
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
            >
              {isImporting ? 'Importing...' : `Import ${csvData.length} Submissions`}
            </button>
          </div>
        </div>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <div className="text-center py-8">
          <div className="mb-4">
            <CheckCircle size={48} className="mx-auto text-green-600 dark:text-green-400 mb-4" />
            <h4 className="text-lg font-medium text-notion-text mb-2">Import Complete!</h4>
            <p className="text-sm text-notion-text-light">
              Your submissions have been successfully imported.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 