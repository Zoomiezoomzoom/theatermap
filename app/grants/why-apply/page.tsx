"use client";

import Link from 'next/link';

export default function WhyApplyPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <div className="relative border-b bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-2xl px-6 py-24">
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-gray-900 mb-6">
            Why Apply for Theater Grants?
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed font-serif">
            Grants are a powerful way to finance your theatrical productions and supplement ticket sales income. Let's explore how to make the grant application process more manageable and successful.
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              10 min read
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Last updated May 2025
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Introduction */}
        <div className="prose prose-lg max-w-none">
          <div className="text-lg text-gray-600 leading-relaxed mb-12 font-serif">
            <p>
              While the grant application process might seem daunting, especially without a dedicated grants person, breaking it down into manageable steps can make it much more approachable. Here's your comprehensive guide to getting started with theater grants.
            </p>
          </div>

          {/* Key Steps Section */}
          <h2 className="text-3xl font-serif text-gray-900 mb-8 mt-16">
            Key Steps to Successful Grant Applications
          </h2>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative">
              <h3 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-blue-600 font-mono">01</span>
                Search Across All Levels
              </h3>
              <p className="text-gray-600 mb-4 font-serif">
                Funding opportunities exist at multiple levels:
              </p>
              <ul className="list-none p-0 m-0 space-y-3 font-serif">
                {[
                  'Local organizations and companies',
                  'Regional arts councils',
                  'State arts agencies',
                  'National organizations like the NEA',
                  'Private foundations and corporate grants'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <h3 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-green-600 font-mono">02</span>
                Start Early
              </h3>
              <p className="text-gray-600 mb-4 font-serif">
                Grant applications require significant preparation:
              </p>
              <ul className="list-none p-0 m-0 space-y-3 font-serif">
                {[
                  'Begin as soon as you find an opportunity',
                  'Create a calendar of grant deadlines',
                  'Track regular grant cycles',
                  'Build in buffer time before deadlines'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <h3 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-purple-600 font-mono">03</span>
                Review Requirements Carefully
              </h3>
              <p className="text-gray-600 mb-4 font-serif">
                Before diving in:
              </p>
              <ul className="list-none p-0 m-0 space-y-3 font-serif">
                {[
                  'Read all qualification requirements',
                  'Review the complete application instructions',
                  'Confirm your eligibility',
                  'Assess if the grant aligns with your project'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <h3 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-orange-600 font-mono">04</span>
                Stay Organized
              </h3>
              <p className="text-gray-600 mb-4 font-serif">
                Maintain clear organization:
              </p>
              <ul className="list-none p-0 m-0 space-y-3 font-serif">
                {[
                  'Create detailed checklists',
                  'Set milestones and reminders',
                  'Keep track of progress',
                  'Maintain a central document repository'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 5 */}
            <div className="relative">
              <h3 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-pink-600 font-mono">05</span>
                Prepare Materials Thoroughly
              </h3>
              <p className="text-gray-600 mb-4 font-serif">
                During the writing phase:
              </p>
              <ul className="list-none p-0 m-0 space-y-3 font-serif">
                {[
                  'Set realistic timelines for team members',
                  'Archive materials for future applications',
                  'Tailor each proposal specifically',
                  'Gather all supporting documents'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pro Tips Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-serif text-gray-900 mb-8">Pro Tips for Success</h2>
            <div className="space-y-6">
              {[
                'Multiple proofreaders can catch different types of errors',
                'Submit applications well before the deadline to avoid technical issues',
                'Keep a record of all submissions and their outcomes'
              ].map((tip, index) => (
                <div key={index} className="flex items-start gap-4 font-serif">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed m-0">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 py-12 border-t border-gray-100">
            <h2 className="text-3xl font-serif text-gray-900 mb-6">Ready to Start Your Grant Journey?</h2>
            <p className="text-gray-600 mb-8 font-serif">
              Take the first step towards funding your theatrical productions by exploring our comprehensive database of grant opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/grants"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Browse Available Grants
              </Link>
              <Link
                href="/grants/categories"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-medium text-blue-600 ring-1 ring-inset ring-blue-600 hover:bg-blue-50 transition-colors"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 