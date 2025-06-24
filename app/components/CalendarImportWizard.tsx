"use client";

import { useState } from "react";
import { useNylas, type NylasEvent, type ParsedSubmission } from "@/hooks/useNylas";
import { toast } from "sonner";
import { Calendar, ArrowRight, ArrowLeft, Check, AlertCircle, Clock, MapPin, User } from "lucide-react";

interface CalendarImportWizardProps {
  onClose: () => void;
  onImportComplete: () => void;
}

export function CalendarImportWizard({ onClose, onImportComplete }: CalendarImportWizardProps) {
  const [step, setStep] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
    end: new Date()
  });
  const [events, setEvents] = useState<NylasEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<NylasEvent[]>([]);
  const [parsedSubmissions, setParsedSubmissions] = useState<ParsedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { isConnected, fetchCalendarEventsForImport, importSubmissionsFromCalendar } = useNylas();

  const fetchEvents = async () => {
    if (!isConnected) {
      toast.error("Please connect your calendar first");
      return;
    }

    try {
      setIsLoading(true);
      const calendarEvents = await fetchCalendarEventsForImport(dateRange.start, dateRange.end);
      setEvents(calendarEvents);
      setStep(2);
      toast.success(`Found ${calendarEvents.length} potential submission events`);
    } catch (error) {
      toast.error(`Failed to fetch calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseSelectedEvents = () => {
    const parsed = selectedEvents.map(event => parseEventToSubmission(event));
    setParsedSubmissions(parsed);
    setStep(3);
  };

  const confirmImport = async () => {
    try {
      setIsLoading(true);
      const result = await importSubmissionsFromCalendar(parsedSubmissions);
      toast.success(`Successfully imported ${result.imported} submissions!`);
      if (result.warnings.length > 0) {
        toast.warning(result.warnings.join(', '));
      }
      onImportComplete();
      onClose();
    } catch (error) {
      toast.error(`Failed to import submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const parseEventToSubmission = (event: NylasEvent): ParsedSubmission => {
    const title = event.title || '';
    const description = event.description || '';
    
    return {
      theaterName: extractTheaterName(title, description),
      scriptTitle: extractScriptTitle(title, description),
      deadline: event.when.date || event.when.start_date,
      submissionDate: estimateSubmissionDate(event.when.date || event.when.start_date),
      status: determineStatusFromDate(event.when.date || event.when.start_date),
      contactEmail: extractContactEmail(event.participants, description),
      contactPerson: extractContactPerson(event.participants, description),
      fee: extractFee(description),
      notes: `Imported from calendar: "${title}"${description ? `\n\nOriginal description: ${description}` : ''}`,
      calendarEventId: event.id,
      originalEventTitle: title,
      confidence: calculateParsingConfidence(title, description),
      needsReview: false
    };
  };

  const extractTheaterName = (title: string, description: string): string => {
    const patterns = [
      /submit(?:ting)? to (.+?)(?:\s|$)/i,
      /(.+?) (?:deadline|response|submission)/i,
      /(.+?) (?:theater|theatre|playhouse|rep|company)/i,
      /(?:deadline|response) (?:from|for) (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        let theater = match[1].trim();
        theater = theater.replace(/\s+(deadline|response|submission)$/i, '');
        return theater;
      }
    }
    
    const descriptionMatch = description.match(/theater|theatre|playhouse/i);
    if (descriptionMatch) {
      const words = description.split(/\s+/);
      const index = words.findIndex(word => /theater|theatre|playhouse/i.test(word));
      if (index > 0) {
        return `${words[index - 1]} ${words[index]}`.trim();
      }
    }
    
    return title;
  };

  const extractScriptTitle = (title: string, description: string): string | undefined => {
    const quotedMatch = description.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];
    
    const scriptMatch = description.match(/(?:script|play):\s*([^\n]+)/i);
    if (scriptMatch) return scriptMatch[1].trim();
    
    return undefined;
  };

  const estimateSubmissionDate = (deadline: string): string | undefined => {
    if (!deadline) return undefined;
    
    const deadlineDate = new Date(deadline);
    const estimatedDate = new Date(deadlineDate);
    estimatedDate.setMonth(estimatedDate.getMonth() - 2);
    
    const now = new Date();
    return estimatedDate < now ? estimatedDate.toISOString().split('T')[0] : undefined;
  };

  const determineStatusFromDate = (deadline: string): 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected' | 'No Response' => {
    if (!deadline) return 'Submitted';
    
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    return deadlineDate < now ? 'No Response' : 'Submitted';
  };

  const extractContactEmail = (participants: any[], description: string): string | undefined => {
    if (participants?.length > 0) {
      const participant = participants.find(p => p.email);
      if (participant?.email) return participant.email;
    }
    
    const emailMatch = description.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : undefined;
  };

  const extractContactPerson = (participants: any[], description: string): string | undefined => {
    if (participants?.length > 0) {
      const participant = participants.find(p => p.name);
      if (participant?.name) return participant.name;
    }
    
    const contactMatch = description.match(/(?:contact|literary manager|director):\s*([^\n]+)/i);
    return contactMatch ? contactMatch[1].trim() : undefined;
  };

  const extractFee = (description: string): number | undefined => {
    const feeMatch = description.match(/\$(\d+(?:\.\d{2})?)/);
    if (feeMatch) return parseFloat(feeMatch[1]);
    
    if (/free|no fee|no charge/i.test(description)) return 0;
    
    return undefined;
  };

  const calculateParsingConfidence = (title: string, description: string): number => {
    let confidence = 0;
    
    if (title.includes('submission') || title.includes('submit')) confidence += 3;
    if (title.includes('deadline') || title.includes('due')) confidence += 2;
    if (description.includes('script') || description.includes('play')) confidence += 2;
    if (description.includes('theater') || description.includes('theatre')) confidence += 2;
    if (title.includes('response')) confidence += 1;
    if (description.includes('playwright')) confidence += 1;
    if (description.includes('festival') || description.includes('contest')) confidence += 1;
    
    return Math.min(confidence, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 4) return "text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400";
    if (score >= 2) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-400";
    return "text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 4) return "High";
    if (score >= 2) return "Medium";
    return "Low";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-notion-bg rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-notion-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-notion-text flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Import from Calendar
            </h2>
            <button
              onClick={onClose}
              className="text-notion-text-light hover:text-notion-text"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-notion-accent text-white' 
                    : 'bg-notion-hover-bg text-notion-text-light'
                }`}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-notion-accent' : 'bg-notion-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Date Range Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Select Date Range</h3>
                <p className="text-notion-text-light">
                  Choose the time period to search for submission-related calendar events.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-notion-text-light mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="w-full px-4 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-shadow"
                  />
                </div>
              </div>

              {!isConnected && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Calendar not connected
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        Please connect your calendar in settings before importing events.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={fetchEvents}
                  disabled={!isConnected || isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
                >
                  {isLoading ? "Searching..." : "Search Events"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Event Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Select Events to Import</h3>
                <p className="text-notion-text-light">
                  We found {events.length} potential submission-related events. Select the ones you want to import.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="border border-notion-border rounded-lg p-4 hover:bg-notion-hover-bg transition-colors">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.some(e => e.id === event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, event]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(e => e.id !== event.id));
                          }
                        }}
                        className="mt-1 w-4 h-4 text-notion-accent bg-notion-bg border-notion-border rounded focus:ring-notion-accent"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-notion-text">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-notion-text-light mt-1">{event.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor((event as any).relevanceScore)}`}>
                            {getConfidenceLabel((event as any).relevanceScore)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-notion-text-light">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(event.when.date || event.when.start_date)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.participants?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={parseSelectedEvents}
                  disabled={selectedEvents.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
                >
                  Parse {selectedEvents.length} Events
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Review Submissions</h3>
                <p className="text-notion-text-light">
                  Review the parsed submission data before importing.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {parsedSubmissions.map((submission, index) => (
                  <div key={index} className="border border-notion-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-notion-text">{submission.theaterName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(submission.confidence)}`}>
                        Confidence: {getConfidenceLabel(submission.confidence)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-notion-text-light">Script:</span>
                        <span className="ml-2 text-notion-text">
                          {submission.scriptTitle || <span className="text-red-500">Missing</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-notion-text-light">Deadline:</span>
                        <span className="ml-2 text-notion-text">
                          {formatDate(submission.deadline)}
                        </span>
                      </div>
                      <div>
                        <span className="text-notion-text-light">Status:</span>
                        <span className="ml-2 text-notion-text">{submission.status}</span>
                      </div>
                      <div>
                        <span className="text-notion-text-light">Fee:</span>
                        <span className="ml-2 text-notion-text">
                          {submission.fee !== undefined ? `$${submission.fee}` : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {submission.contactPerson && (
                      <div className="text-sm mt-2">
                        <span className="text-notion-text-light">Contact:</span>
                        <span className="ml-2 text-notion-text">{submission.contactPerson}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={confirmImport}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-colors"
                >
                  {isLoading ? "Importing..." : `Import ${parsedSubmissions.length} Submissions`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 