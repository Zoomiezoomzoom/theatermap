"use client";

import { useParams } from "next/navigation";
import { grants } from "../../lib/grants";
import Link from "next/link";

export default function GrantPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? parseInt(params.id) : Array.isArray(params.id) ? parseInt(params.id[0]) : NaN;
  const grant = grants.find((g) => g.id === id);

  if (!grant) {
    return (
      <main className="min-h-screen">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Grant Not Found</h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">The grant you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/grants"
              className="mt-8 inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
            >
              Back to Grants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const deadlineDate = new Date(grant.deadline);
  const today = new Date();
  const daysRemaining = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (daysRemaining < 30) statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (daysRemaining < 7) statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";

  return (
    <main className="min-h-screen">
      {/* Header Image */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full overflow-hidden">
        <img
          src={grant.image || "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"}
          alt={grant.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`${statusColor} px-3 py-1 rounded-full text-sm font-medium`}>
                {daysRemaining} days remaining
              </span>
              <span className="bg-white/90 dark:bg-black/90 px-3 py-1 rounded-full text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {grant.type}
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{grant.name}</h1>
            <p className="mt-2 text-lg sm:text-xl text-neutral-200">{grant.organization}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">About this Grant</h2>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">{grant.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Requirements</h2>
                <ul className="mt-4 space-y-2">
                  {grant.requirements?.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                      <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-rose-600" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Application Process</h2>
                <ol className="mt-4 space-y-4">
                  {grant.applicationProcess?.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Amount</dt>
                    <dd className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{grant.amount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Deadline</dt>
                    <dd className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {new Date(grant.deadline).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Location</dt>
                    <dd className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{grant.location}</dd>
                  </div>
                  {grant.url && (
                    <div className="pt-4">
                      <a
                        href={grant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
                      >
                        Apply Now
                      </a>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 