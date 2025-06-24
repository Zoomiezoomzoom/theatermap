"use client";

import { EventCard } from "@/components/EventCard";
import { useShows } from "@/hooks/useShows";
import { useState } from "react";
import Link from "next/link";

export default function EventsPage() {
  const { shows, loading, error } = useShows();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShows = shows.filter(show => 
    show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (show.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen">
      {/* Grid Background */}
      <div className="fixed inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 sm:p-20">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
              Upcoming <span className="text-purple-600">Shows</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300">
              Discover the latest theatrical performances in San Francisco
            </p>
            <div className="flex justify-center mt-4 gap-4">
              <Link
                href="/events/add"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Show
              </Link>
              <Link
                href="/theaters/add"
                className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Add New Theater
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-black/30 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Events Grid */}
          {error ? (
            <div className="text-center text-red-500">
              Error loading shows: {error}
            </div>
          ) : loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="text-center text-neutral-600 dark:text-neutral-400">
              No shows found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShows.map((show) => (
                <EventCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 