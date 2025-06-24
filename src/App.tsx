import FestivalMap from './components/FestivalMap';
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Grid Background */}
      <div
        className={cn(
          "fixed inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Main Content */}
      <div className="relative z-10 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-6xl">
          {/* Hero Section */}
          <div className="w-full flex flex-col lg:flex-row items-center gap-12 mb-8">
            <div className="flex-1 space-y-6">
              <h1 className="text-6xl font-bold text-center lg:text-left bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                Theater Festival 2024
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-300 text-center lg:text-left">
                Experience the magic of live theater across multiple venues in the heart of the city.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                  Book Tickets
                </button>
                <button className="px-6 py-3 border border-purple-600 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg font-semibold transition-colors">
                  View Schedule
                </button>
              </div>
              <div className="flex items-center gap-4 justify-center lg:justify-start text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>June 15-30</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>5 Venues</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                <div className="h-full w-full rounded-xl bg-neutral-900 p-4 backdrop-blur-xl">
                  <img 
                    src="/theater-hero.jpg" 
                    alt="Theater Performance" 
                    className="h-full w-full rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full backdrop-blur-sm bg-white/30 dark:bg-black/30 p-4 rounded-lg">
            <FestivalMap />
          </div>

          <div className="flex gap-4 items-center flex-col sm:flex-row">
            {/* Additional content */}
          </div>
        </main>
      </div>
    </div>
  );
}
