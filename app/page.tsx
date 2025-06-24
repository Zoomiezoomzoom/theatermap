"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Drama,
  Target,
  List,
  Search,
  BarChart2,
  FolderSearch,
  CalendarX,
  ClipboardList,
} from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-notion-bg text-notion-text">
      <main className="flex-grow">
        {/* Simplified Hero Section */}
        <section className="relative bg-grid-pattern pt-32 pb-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-notion-bg via-notion-bg/80 to-notion-bg" />
          <div className="container relative mx-auto px-4">
            <div className="mb-4 inline-block rounded-full bg-notion-accent/10 px-4 py-1.5 text-sm font-medium text-notion-accent">
              Built for the SF theater community
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-notion-text sm:text-6xl">
              Stop Searching, Start Submitting
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-notion-text-light">
              Ascend is the all-in-one platform to discover theater opportunities,
              track your applications, and never miss a deadline.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignUpButton mode="modal">
                <button className="rounded-md bg-notion-accent px-4 py-2.5 text-sm font-semibold text-notion-text shadow-sm hover:bg-notion-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notion-accent">
                  Get started for free
                </button>
              </SignUpButton>
              <Link
                href="#how-it-works"
                className="group flex items-center gap-x-2 text-sm font-semibold leading-6 text-notion-text"
              >
                Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Theater Image Section */}
        <section className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
          <img 
            src="https://images.unsplash.com/photo-1604933762161-67313106146c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="Theater stage with dramatic lighting" 
            className="w-full h-full object-cover"
          />
        </section>

        {/* Problem Section */}
        <section id="problem" className="py-20 bg-notion-bg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-notion-text sm:text-4xl">
                Tired of the Submission Grind?
              </h2>
              <p className="mt-4 text-lg leading-8 text-notion-text-light max-w-3xl mx-auto">
                Juggling dozens of opportunities, deadlines, and requirements can feel like a full-time job. Stop letting administrative chaos get in the way of your creative work.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {/* Problem 1 */}
              <div className="flex flex-col items-center p-6 border border-notion-border rounded-xl bg-notion-hover-bg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-notion-accent/10 text-notion-accent mb-4">
                  <FolderSearch className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Scattered Opportunities</h3>
                <p className="text-notion-text-light">
                  Endless searching across websites, newsletters, and social media to find submission calls.
                </p>
              </div>
              {/* Problem 2 */}
              <div className="flex flex-col items-center p-6 border border-notion-border rounded-xl bg-notion-hover-bg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-notion-accent/10 text-notion-accent mb-4">
                  <CalendarX className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Missed Deadlines</h3>
                <p className="text-notion-text-light">
                  Losing track of closing dates and submission windows in a messy spreadsheet or calendar.
                </p>
              </div>
              {/* Problem 3 */}
              <div className="flex flex-col items-center p-6 border border-notion-border rounded-xl bg-notion-hover-bg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-notion-accent/10 text-notion-accent mb-4">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-notion-text mb-2">Tracking Nightmares</h3>
                <p className="text-notion-text-light">
                  No easy way to see what you've submitted, where you've heard back, or when to follow up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-notion-hover-bg">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-notion-text sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg leading-8 text-notion-text-light">
                Get started in minutes, not hours.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="relative flex flex-col items-center gap-y-12 md:flex-row md:items-start md:gap-x-8">
                {/* Step 1 */}
                <div className="group flex flex-1 flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-notion-accent bg-notion-accent/10 text-notion-accent">
                    <Drama className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-notion-text">
                      Browse the Directory
                    </h3>
                    <p className="mt-2 text-notion-text-light">
                      Discover Bay Area theater opportunities in one organized
                      directory.
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="hidden md:block h-px w-full bg-notion-border absolute top-6 -z-10" />

                {/* Step 2 */}
                <div className="group flex flex-1 flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-notion-accent bg-notion-accent/10 text-notion-accent">
                    <Target className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-notion-text">
                      Track Your Submissions
                    </h3>
                    <p className="mt-2 text-notion-text-light">
                      Add submissions to your dashboard and never lose track
                      again.
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="hidden md:block h-px w-full bg-notion-border absolute top-6 -z-10" />

                {/* Step 3 */}
                <div className="group flex flex-1 flex-col items-center gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-notion-accent bg-notion-accent/10 text-notion-accent">
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-notion-text">
                      Maximize Your Chances
                    </h3>
                    <p className="mt-2 text-notion-text-light">
                      Stay on top of deadlines and follow-ups to increase your
                      success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-notion-bg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-notion-text sm:text-4xl">
                All Your Submissions in One Place
              </h2>
              <p className="mt-4 text-lg leading-8 text-notion-text-light">
                Ascend provides the tools you need to stay organized and focused.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Feature Text */}
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-notion-accent/10 text-notion-accent">
                    <List className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-notion-text">Unified Dashboard</h3>
                    <p className="mt-1 text-notion-text-light">
                      See all your submissions at a glance. Track deadlines, monitor statuses, and manage your workflow from a single, intuitive dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-notion-accent/10 text-notion-accent">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-notion-text">Comprehensive Directory</h3>
                    <p className="mt-1 text-notion-text-light">
                      Access a curated, up-to-date directory of submission opportunities. Filter by genre, fee, deadline, and more to find the perfect fit.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-notion-accent/10 text-notion-accent">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-notion-text">Analytics & Insights</h3>
                    <p className="mt-1 text-notion-text-light">
                      Understand your submission patterns. See which theaters you're applying to most and how often your work is accepted.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dashboard Mockup */}
              <div className="bg-notion-hover-bg border border-notion-border rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm font-medium text-notion-text-light">My Submissions</div>
                  <div></div>
                </div>
                <div className="space-y-3">
                  <div className="bg-notion-bg p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-notion-text">Magic Theatre</p>
                      <p className="text-sm text-notion-text-light">"Echoes of the Past"</p>
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs rounded-full">Submitted</div>
                  </div>
                  <div className="bg-notion-bg p-3 rounded-lg flex justify-between items-center">
                     <div>
                      <p className="font-semibold text-notion-text">Berkeley Rep</p>
                      <p className="text-sm text-notion-text-light">"Steel Frame"</p>
                    </div>
                    <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 text-xs rounded-full">Accepted</div>
                  </div>
                   <div className="bg-notion-bg p-3 rounded-lg flex justify-between items-center opacity-60">
                     <div>
                      <p className="font-semibold text-notion-text">Shotgun Players</p>
                      <p className="text-sm text-notion-text-light">"The West-Side"</p>
                    </div>
                    <div className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 text-xs rounded-full">Pending</div>
                  </div>
                  <div className="bg-notion-bg p-3 rounded-lg flex justify-between items-center opacity-60">
                     <div>
                      <p className="font-semibold text-notion-text">Marin Theatre Company</p>
                      <p className="text-sm text-notion-text-light">"The Last Leaf"</p>
                    </div>
                    <div className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-xs rounded-full">To Submit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-notion-text sm:text-4xl">
              Ready to elevate your submission game?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-notion-text-light">
              Spend less time organizing and more time creating.
            </p>
            <div className="mt-8">
              <SignUpButton mode="modal">
                <button className="inline-block rounded-md bg-notion-accent px-5 py-3 text-base font-semibold text-notion-text shadow-sm hover:bg-notion-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-notion-accent">
                  Start Tracking Today
                </button>
              </SignUpButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-notion-hover-bg">
        <div className="container mx-auto px-4 py-8 text-center text-notion-text-light">
          <p>&copy; {new Date().getFullYear()} Ascend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
