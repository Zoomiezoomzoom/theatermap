import { Show } from "@/utils/supabase";
import Image from "next/image";
import Link from "next/link";

type EventCardProps = {
  show: Show;
};

export function EventCard({ show }: EventCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-sm transition-all hover:shadow-xl">
      <div className="aspect-[3/2] w-full overflow-hidden">
        {show.image_url ? (
          <Image
            src={show.image_url}
            alt={show.title}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="text-4xl">🎭</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-xl mb-2">{show.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
          {show.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{new Date(show.start_date).toLocaleDateString()} - {new Date(show.end_date).toLocaleDateString()}</span>
          </div>
          
          {show.price_range && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{show.price_range}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {show.ticket_url && (
            <Link 
              href={show.ticket_url}
              target="_blank"
              className="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Buy Tickets
            </Link>
          )}
          <Link 
            href={`/events/${show.id}`}
            className="flex-1 text-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950 transition-colors text-sm"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
} 