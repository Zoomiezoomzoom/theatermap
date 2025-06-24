"use client";

import { useState, useEffect } from "react";
import { theaters, statusOptions, genreOptions, feeOptions, sizeOptions, Theater } from "../lib/theaters";
import { TheaterDetailModal } from "../components/TheaterDetailModal";
import { SubmissionForm } from "../components/SubmissionForm";
import { TheaterImage } from "../components/TheaterImage";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useSubmissions, type Submission } from "@/hooks/useSubmissions";
import { toast } from "sonner";
import { 
  ExternalLink, 
  Search, 
  Filter, 
  Plus, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users, 
  Calendar,
  Check,
  Bookmark,
  Share2,
  Info,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';

// Enhanced opportunity data structure
interface Opportunity extends Theater {
  userSubmissionCount: number;
  featured: boolean;
  lastUpdated: string;
  source: string;
  tags: string[];
  deadlineType: 'fixed' | 'rolling';
  openDate?: string;
  contactPerson?: string;
  imageUrl?: string;
  requirements?: {
    scriptLength?: string;
    previousProductions?: string;
    exclusivity?: string;
    materials?: string[];
  };
}

interface Filters {
  search: string;
  status: string;
  genre: string;
  fee: string;
  size: string;
  sort: string;
  deadline: string;
}

const defaultFilters: Filters = {
  search: "",
  status: "all",
  genre: "all",
  fee: "all",
  size: "all",
  sort: "deadline",
  deadline: "all"
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showQuickTrack, setShowQuickTrack] = useState<Opportunity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const { 
    submissions, 
    createSubmission,
    refreshSubmissions
  } = useSubmissions();

  // Convert theaters to opportunities with enhanced data
  useEffect(() => {
    const enhancedOpportunities: Opportunity[] = theaters.map(theater => ({
      ...theater,
      userSubmissionCount: Math.floor(Math.random() * 20) + 1, // Mock data
      featured: Math.random() > 0.85, // 15% chance of being featured
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      source: "theater-website",
      tags: theater.genre,
      deadlineType: theater.deadline === 'rolling' ? 'rolling' : 'fixed',
      openDate: theater.status === 'opening-soon' ? theater.deadline : undefined,
      contactPerson: theater.contactInfo || '',
      imageUrl: theater.imageUrl,
      requirements: {
        scriptLength: "Full-length (80+ pages)",
        previousProductions: "Unproduced preferred",
        exclusivity: "No simultaneous submissions",
        materials: ["script", "synopsis", "cover letter"]
      }
    }));
    setOpportunities(enhancedOpportunities);
  }, []);

  // Load user submissions
  useEffect(() => {
    if (isSignedIn && submissions) {
      setUserSubmissions(submissions);
    }
  }, [isSignedIn, submissions]);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const filterOpportunities = (opportunities: Opportunity[], filters: Filters) => {
    return opportunities.filter(opportunity => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
        opportunity.name.toLowerCase().includes(searchLower) ||
        opportunity.description.toLowerCase().includes(searchLower) ||
        opportunity.submissionTypes.some(type => type.toLowerCase().includes(searchLower)) ||
        opportunity.genre.some(g => g.toLowerCase().includes(searchLower));

      // Status filter
      const matchesStatus = filters.status === 'all' || opportunity.status === filters.status;

      // Genre filter
      const matchesGenre = filters.genre === 'all' || opportunity.genre.includes(filters.genre);

      // Fee filter
      let matchesFee = true;
      if (filters.fee !== 'all') {
        switch (filters.fee) {
          case 'free':
            matchesFee = opportunity.fee === 0;
            break;
          case 'under-25':
            matchesFee = opportunity.fee > 0 && opportunity.fee < 25;
          break;
          case 'under-50':
            matchesFee = opportunity.fee >= 25 && opportunity.fee < 50;
          break;
          case '50-plus':
            matchesFee = opportunity.fee >= 50;
          break;
      }
    }

      // Size filter
      const matchesSize = filters.size === 'all' || opportunity.theaterSize === filters.size;

    // Deadline filter
    let matchesDeadline = true;
      if (filters.deadline !== 'all') {
        if (filters.deadline === 'soon') {
          const deadline = new Date(opportunity.deadline);
          const now = new Date();
          const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          matchesDeadline = daysUntilDeadline <= 30 && daysUntilDeadline >= 0;
        }
      }

      return matchesSearch && matchesStatus && matchesGenre && matchesFee && matchesSize && matchesDeadline;
    });
  };

  const sortOpportunities = (opportunities: Opportunity[], sortBy: string) => {
    const sorted = [...opportunities];
    switch (sortBy) {
      case 'deadline':
        return sorted.sort((a, b) => {
          if (a.deadline === 'rolling' && b.deadline === 'rolling') return 0;
          if (a.deadline === 'rolling') return 1;
          if (b.deadline === 'rolling') return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        });
      case 'recently-updated':
        return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      case 'alphabetical':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'fee-low-high':
        return sorted.sort((a, b) => a.fee - b.fee);
      case 'popularity':
        return sorted.sort((a, b) => b.userSubmissionCount - a.userSubmissionCount);
      default:
        return sorted;
    }
  };

  const filteredAndSortedOpportunities = sortOpportunities(
    filterOpportunities(opportunities, filters),
    filters.sort
  );

  const openOpportunities = opportunities.filter(o => o.status === 'open').length;
  const upcomingDeadlines = opportunities.filter(o => {
    if (o.status !== 'open' || o.deadline === 'rolling') return false;
    const deadline = new Date(o.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 30 && daysUntilDeadline >= 0;
  }).length;
  const userSubmissionsCount = userSubmissions.length;

  const handleTrackOpportunity = (opportunity: Opportunity) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setShowQuickTrack(opportunity);
  };

  const handleQuickTrackConfirm = async (submissionData: any) => {
    try {
      setIsUpdating(true);
      const createdSubmission = await createSubmission(submissionData);
      await refreshSubmissions();
      setShowQuickTrack(null);
      toast.success(`Added ${submissionData.theaterName} to your tracking dashboard!`);
      return createdSubmission;
    } catch (error) {
      toast.error("Failed to track submission. Please try again.");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (opportunity: Opportunity) => {
    switch (opportunity.status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-400/20 dark:text-green-300">Open Now</span>;
      case 'opening-soon':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-400/20 dark:text-blue-300">Opens {formatDate(opportunity.deadline)}</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300">Closed</span>;
      default:
        return null;
    }
  };

  const getDaysUntilDeadline = (opportunity: Opportunity) => {
    if (!opportunity.deadline || opportunity.status !== 'open' || opportunity.deadline === 'rolling') return null;
    
    const days = Math.ceil((new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Deadline passed';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${days} days left`;
    return formatDate(opportunity.deadline);
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'rolling') return 'Rolling';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const isAlreadyTracked = (opportunity: Opportunity) => {
    return userSubmissions.some(sub => 
      sub.theaterName === opportunity.name
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-notion-bg text-notion-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-accent mx-auto mb-4"></div>
          <p className="text-notion-text-light">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-bg text-notion-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 pt-24">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-notion-text">
              Bay Area <span className="text-notion-accent">Theater Submissions</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-notion-text-light leading-relaxed">
              Find your next opportunity - all current submission calls in one place
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-notion-text-light">
            <div className="flex items-center gap-2 bg-notion-hover-bg px-4 py-2 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <strong className="text-notion-accent">{openOpportunities}</strong> currently open
            </div>
            <div className="flex items-center gap-2 bg-notion-hover-bg px-4 py-2 rounded-lg">
              <Clock size={14} className="text-orange-500" />
              <strong className="text-notion-accent">{upcomingDeadlines}</strong> closing this month
            </div>
            {isSignedIn && (
              <div className="flex items-center gap-2 bg-notion-hover-bg px-4 py-2 rounded-lg">
                <Users size={14} className="text-blue-500" />
                <strong className="text-notion-accent">{userSubmissionsCount}</strong> in your tracker
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-notion-text-light" size={20} />
            <input
              type="text"
              placeholder="Search theaters, genres, or keywords..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-base rounded-xl bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent focus:border-transparent transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => updateFilter('status', filters.status === 'open' ? 'all' : 'open')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.status === 'open' 
                  ? 'bg-notion-accent text-white shadow-lg' 
                  : 'bg-notion-hover-bg text-notion-text-light hover:text-notion-text hover:bg-notion-border'
              }`}
            >
              Open Now ({openOpportunities})
            </button>
            <button
              onClick={() => updateFilter('fee', filters.fee === 'free' ? 'all' : 'free')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.fee === 'free' 
                  ? 'bg-notion-accent text-white shadow-lg' 
                  : 'bg-notion-hover-bg text-notion-text-light hover:text-notion-text hover:bg-notion-border'
              }`}
            >
              Free Submissions
            </button>
            <button
              onClick={() => updateFilter('deadline', filters.deadline === 'soon' ? 'all' : 'soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.deadline === 'soon' 
                  ? 'bg-notion-accent text-white shadow-lg' 
                  : 'bg-notion-hover-bg text-notion-text-light hover:text-notion-text hover:bg-notion-border'
              }`}
            >
              Closing Soon
            </button>
            {isSignedIn && (
              <button
                onClick={() => setBulkSelectMode(!bulkSelectMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  bulkSelectMode 
                    ? 'bg-notion-accent text-white shadow-lg' 
                    : 'bg-notion-hover-bg text-notion-text-light hover:text-notion-text hover:bg-notion-border'
                }`}
              >
                {bulkSelectMode ? 'Cancel Selection' : 'Select Multiple'}
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
            >
              <Filter size={16} />
              Advanced Filters
              {showFilters && (
                <span className="ml-2 text-xs bg-notion-accent text-white px-2 py-0.5 rounded-full">
                  {Object.values(filters).filter(f => f !== 'all' && f !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Detailed Filters */}
          {showFilters && (
            <div className="bg-notion-hover-bg rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={filters.genre}
                  onChange={(e) => updateFilter('genre', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
                >
                  {genreOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={filters.fee}
                  onChange={(e) => updateFilter('fee', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
                >
                  {feeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
                  value={filters.size}
                  onChange={(e) => updateFilter('size', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
                >
                  {sizeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
            </select>
            <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-notion-bg border border-notion-border focus:outline-none focus:ring-2 focus:ring-notion-accent transition-all"
                >
                  <option value="deadline">Deadline (Soonest)</option>
                  <option value="recently-updated">Recently Updated</option>
                  <option value="alphabetical">Theater Name A-Z</option>
                  <option value="fee-low-high">Fee (Low to High)</option>
                  <option value="popularity">Most Tracked</option>
            </select>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-notion-accent hover:text-notion-accent-hover transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          )}
          </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-notion-text-light">
            {filteredAndSortedOpportunities.length} opportunity{filteredAndSortedOpportunities.length !== 1 ? 'ies' : 'y'} found
          </p>
          {filteredAndSortedOpportunities.length > 0 && (
            <p className="text-sm text-notion-text-light">
              Sorted by {filters.sort.replace('-', ' ')}
            </p>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {bulkSelectMode && selectedOpportunities.size > 0 && (
          <div className="bg-notion-accent/10 border border-notion-accent/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-notion-text">
                {selectedOpportunities.size} opportunity{selectedOpportunities.size !== 1 ? 'ies' : 'y'} selected
              </span>
              <button
                onClick={() => setSelectedOpportunities(new Set())}
                className="text-sm text-notion-accent hover:text-notion-accent-hover transition-colors"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={async () => {
                const selectedOpps = filteredAndSortedOpportunities.filter(opp => selectedOpportunities.has(opp.id));
                for (const opp of selectedOpps) {
                  if (!isAlreadyTracked(opp)) {
                    await handleQuickTrackConfirm({
                      theaterName: opp.name,
                      contactPerson: opp.contactPerson || '',
                      submissionDate: new Date().toISOString().split('T')[0],
                      deadline: opp.deadline === 'rolling' ? '' : opp.deadline,
                      fee: opp.fee,
                      scriptTitle: '',
                      status: 'Submitted' as const,
                      notes: `Found via theater directory. ${opp.description}`,
                    });
                  }
                }
                setSelectedOpportunities(new Set());
                setBulkSelectMode(false);
                toast.success(`Added ${selectedOpps.length} opportunities to your tracking dashboard!`);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              Track Selected ({selectedOpportunities.size})
            </button>
          </div>
        )}

        {/* Opportunities Grid */}
        {filteredAndSortedOpportunities.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="mx-auto h-16 w-16 text-notion-text-light mb-6" />
            <h3 className="text-xl font-semibold text-notion-text mb-3">No opportunities found</h3>
            <p className="text-notion-text-light mb-8 max-w-md mx-auto">
              Try adjusting your search or filters to find more opportunities
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-accent transition-all"
            >
              Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className={`group bg-notion-bg rounded-xl border border-notion-border hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden relative flex flex-col ${
                  opportunity.featured ? 'ring-2 ring-notion-accent/50 shadow-lg' : ''
                } cursor-pointer`}
                onClick={() => {
                  if (bulkSelectMode) {
                    const newSelected = new Set(selectedOpportunities);
                    if (newSelected.has(opportunity.id)) {
                      newSelected.delete(opportunity.id);
                    } else {
                      newSelected.add(opportunity.id);
                    }
                    setSelectedOpportunities(newSelected);
                  } else {
                    setSelectedTheater(opportunity);
                  }
                }}
              >
                {/* Hover overlay for quick preview */}
                {!bulkSelectMode && <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />}
                
                {/* Bulk Selection Checkbox */}
                {bulkSelectMode && (
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedOpportunities.has(opportunity.id) ? 'bg-notion-accent border-notion-accent' : 'bg-notion-bg border-notion-border'}`}>
                      {selectedOpportunities.has(opportunity.id) && <Check size={16} className="text-white" />}
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex-grow">
                  <div className="flex items-start gap-4 mb-4">
                    <TheaterImage 
                      theaterName={opportunity.name}
                      imageUrl={opportunity.imageUrl}
                      size="sm"
                      className="flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-lg font-bold text-notion-text line-clamp-2 group-hover:text-notion-accent transition-colors">
                        {opportunity.name}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                      {opportunity.featured && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-400/20 dark:text-yellow-300">
                          <Sparkles size={12} />
                          Featured
                        </span>
                      )}
                      {getStatusBadge(opportunity)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-notion-text-light/75 mt-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-notion-text-light/75" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-notion-text-light/75" />
                      <span className="capitalize">{opportunity.theaterSize.replace('-', ' ')}</span>
                    </div>
                  </div>
                  
                  {opportunity.status === 'open' && getDaysUntilDeadline(opportunity) && (
                    <div className={`flex items-center gap-2 text-sm mb-4 p-2 rounded-lg font-medium ${
                      getDaysUntilDeadline(opportunity)?.includes('Due today') || getDaysUntilDeadline(opportunity)?.includes('Due tomorrow') || getDaysUntilDeadline(opportunity)?.includes('7 days left')
                        ? 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/30'
                        : 'text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      <Clock size={14} />
                      <span>{getDaysUntilDeadline(opportunity)}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-notion-text-light line-clamp-2 mb-4 leading-relaxed">
                    {opportunity.description}
                  </p>
      
                  
                  <div className="flex flex-wrap gap-2">
                    {opportunity.submissionTypes.slice(0, 3).map((type) => (
                      <span
                        key={type}
                        className="px-2.5 py-1 bg-notion-hover-bg text-notion-text-light rounded-md text-xs font-medium"
                      >
                        {type.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <div className="border-t border-notion-border pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-notion-text-light text-xs mb-1">Fee</p>
                        <p className="font-semibold text-notion-text">
                          {opportunity.fee === 0 ? 'FREE' : `$${opportunity.fee}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-notion-text-light text-xs mb-1">Response Time</p>
                        <p className="font-semibold text-notion-text">{opportunity.responseTime}</p>
                      </div>
                        <div>
                        <p className="text-notion-text-light text-xs mb-1">Deadline</p>
                        <p className="font-semibold text-notion-text">{formatDate(opportunity.deadline)}</p>
                      </div>
                      <div>
                        <p className="text-notion-text-light text-xs mb-1">Size</p>
                        <p className="font-semibold text-notion-text capitalize">{opportunity.theaterSize.replace('-', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-notion-text-light">
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-notion-text-light" />
                        <span>{opportunity.userSubmissionCount} tracking</span>
                      </div>
                      <span>Updated {formatRelativeTime(opportunity.lastUpdated)}</span>
                    </div>

                    <div className="flex gap-3">
                      {isAlreadyTracked(opportunity) ? (
                        <button className="w-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2" disabled>
                          <Check size={16} />
                          Already Tracking
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTrackOpportunity(opportunity); }}
                          disabled={opportunity.status !== 'open'}
                          className="w-full bg-notion-accent text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-notion-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Plus size={16} />
                          Track Submission
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTheater(opportunity); }}
                        className="flex-shrink-0 bg-notion-bg text-notion-text border border-notion-border font-semibold p-2.5 rounded-lg hover:bg-notion-hover-bg transition-all text-sm"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

        {/* Community Features */}
        <div className="text-center py-12 border-t border-notion-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-notion-bg text-notion-text border border-notion-border hover:bg-notion-hover-bg transition-all">
              <Plus size={16} />
              Suggest a Theater
            </button>
            <span className="text-notion-text-light">•</span>
            <button className="text-sm text-notion-accent hover:text-notion-accent-hover transition-colors">
              Report Outdated Info
            </button>
          </div>
        </div>
      </div>

      {/* Quick Track Modal */}
      {showQuickTrack && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuickTrack(null)}
        >
          <div 
            className="bg-notion-bg rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-notion-border">
              <h2 className="text-xl font-bold text-notion-text">
                Track Submission to {showQuickTrack.name}
              </h2>
              <button
                onClick={() => setShowQuickTrack(null)}
                className="text-notion-text-light hover:text-notion-text transition-colors p-1 rounded-lg hover:bg-notion-hover-bg"
              >
                <X size={24} />
              </button>
            </div>
            
            <SubmissionForm
              submission={{
                id: '',
                theaterName: showQuickTrack.name,
                contactPerson: showQuickTrack.contactPerson || '',
                submissionDate: new Date().toISOString().split('T')[0],
                deadline: showQuickTrack.deadline === 'rolling' ? '' : showQuickTrack.deadline,
                fee: showQuickTrack.fee,
                scriptTitle: '',
                status: 'Submitted' as const,
                notes: `Found via theater directory. ${showQuickTrack.description}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }}
              onSubmit={handleQuickTrackConfirm}
              onCancel={() => setShowQuickTrack(null)}
              isUpdating={isUpdating}
            />
          </div>
        </div>
      )}

      {/* Theater Detail Modal */}
      {selectedTheater && (
        <TheaterDetailModal
          theater={selectedTheater}
          onClose={() => setSelectedTheater(null)}
          onTrackSubmission={(theater) => handleTrackOpportunity(theater as Opportunity)}
        />
      )}
    </div>
  );
} 