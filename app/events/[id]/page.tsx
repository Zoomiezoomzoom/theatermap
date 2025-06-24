"use client";

import { useEffect, useState } from "react";
import { Show, supabase } from "@/utils/supabase";
import Image from "next/image";
import Link from "next/link";

export default function EventPage({ params }: { params: { id: string } }) {
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShow() {
      try {
        const { data, error } = await supabase
          .from('shows')
          .select(`
            *,
            theater:theaters(
              name,
              address,
              latitude,
              longitude
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setShow(data);
      } catch (err) {
        console.error('Error fetching show:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchShow();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Show not found'}
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Grid Background */}
      <div className="fixed inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 sm:p-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/events"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shows
          </Link>

          <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden">
            {show.image_url && (
              <div className="aspect-video w-full relative">
                <Image
                  src={show.image_url}
                  alt={show.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <h1 className="text-4xl font-bold mb-4">{show.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(show.start_date).toLocaleDateString()} - {new Date(show.end_date).toLocaleDateString()}
                  </span>
                </div>

                {show.price_range && (
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{show.price_range}</span>
                  </div>
                )}

                {show.theater && (
                  <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{show.theater.name}</span>
                  </div>
                )}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-8">
                <p>{show.description}</p>
              </div>

              {show.theater && (
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4">Venue Information</h2>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">{show.theater.address}</p>
                  <button
                    onClick={() => window.open(`https://maps.google.com/?q=${show.theater.latitude},${show.theater.longitude}`, '_blank')}
                    className="text-purple-600 hover:text-purple-700 inline-flex items-center"
                  >
                    View on Maps
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              )}

              {show.ticket_url && (
                <a
                  href={show.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Buy Tickets
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 