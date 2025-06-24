"use client";

import { useState } from 'react';
import { Theater } from '../lib/theaters';
import { X, ExternalLink, Calendar, DollarSign, Clock, Users, Lightbulb } from 'lucide-react';

interface TheaterDetailModalProps {
  theater: Theater;
  onClose: () => void;
  onTrackSubmission: (theater: Theater) => void;
}

export function TheaterDetailModal({ theater, onClose, onTrackSubmission }: TheaterDetailModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'opening-soon': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open Now';
      case 'opening-soon': return `Opens ${new Date(theater.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
      case 'closed': return 'Closed';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'rolling') return 'Rolling';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatFee = (fee: number) => {
    return fee === 0 ? 'FREE' : `$${fee}`;
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'major': return 'Major Theater';
      case 'mid-size': return 'Mid-size Theater';
      case 'small-fringe': return 'Small/Fringe Theater';
      default: return size;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-notion-bg rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-notion-bg border-b border-notion-border p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-notion-text mb-2">{theater.name}</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(theater.status)}`}>
                  {getStatusText(theater.status)}
                </span>
                <span className="text-sm text-notion-text-light">{getSizeLabel(theater.theaterSize)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-notion-text-light hover:text-notion-text p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-notion-text-light leading-relaxed">{theater.description}</p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-notion-hover-bg rounded-lg">
              <DollarSign size={20} className="text-notion-accent" />
              <div>
                <p className="text-sm text-notion-text-light">Submission Fee</p>
                <p className="font-semibold text-notion-text">{formatFee(theater.fee)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-notion-hover-bg rounded-lg">
              <Calendar size={20} className="text-notion-accent" />
              <div>
                <p className="text-sm text-notion-text-light">Deadline</p>
                <p className="font-semibold text-notion-text">{formatDate(theater.deadline)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-notion-hover-bg rounded-lg">
              <Clock size={20} className="text-notion-accent" />
              <div>
                <p className="text-sm text-notion-text-light">Response Time</p>
                <p className="font-semibold text-notion-text">{theater.responseTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-notion-hover-bg rounded-lg">
              <Users size={20} className="text-notion-accent" />
              <div>
                <p className="text-sm text-notion-text-light">Tracked by Users</p>
                <p className="font-semibold text-notion-text">{theater.userSubmissionCount} submissions</p>
              </div>
            </div>
          </div>

          {/* Submission Types */}
          <div>
            <h3 className="text-lg font-semibold text-notion-text mb-3">What They're Looking For</h3>
            <div className="flex flex-wrap gap-2">
              {theater.submissionTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-notion-accent/10 text-notion-accent rounded-full text-sm font-medium"
                >
                  {type.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          {theater.guidelines && (
            <div>
              <h3 className="text-lg font-semibold text-notion-text mb-3">Submission Guidelines</h3>
              <p className="text-notion-text-light leading-relaxed">{theater.guidelines}</p>
            </div>
          )}

          {/* Community Tips */}
          {theater.tips && theater.tips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-notion-text mb-3 flex items-center gap-2">
                <Lightbulb size={20} className="text-notion-accent" />
                Community Tips
              </h3>
              <ul className="space-y-2">
                {theater.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-notion-accent rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-notion-text-light">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {theater.contactInfo && (
            <div>
              <h3 className="text-lg font-semibold text-notion-text mb-3">Contact Information</h3>
              <p className="text-notion-text-light">{theater.contactInfo}</p>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-sm text-notion-text-light border-t border-notion-border pt-4">
            Last updated: {new Date(theater.lastUpdated).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-notion-bg border-t border-notion-border p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onTrackSubmission(theater)}
              className="flex-1 bg-notion-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-notion-accent-hover transition-colors"
            >
              Track This Submission
            </button>
            <a
              href={theater.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-notion-bg text-notion-text border border-notion-border font-semibold py-3 px-6 rounded-lg hover:bg-notion-hover-bg transition-colors"
            >
              <ExternalLink size={16} />
              Visit Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 