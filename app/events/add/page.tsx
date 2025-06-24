"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTheaters } from "@/hooks/useTheaters";

type FormData = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  price_range: string;
  ticket_url: string;
  image_url: string;
  theater_id: string;
};

export default function AddEventPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theaters, loading: loadingTheaters } = useTheaters();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          theater_id: parseInt(data.theater_id),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create show');
      }

      toast.success('Show created successfully!');
      router.push('/events');
      router.refresh();
    } catch (error) {
      toast.error('Failed to create show');
      console.error('Error creating show:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Grid Background */}
      <div className="fixed inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
      {/* Radial gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 sm:p-20">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/events"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>

          <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-8">Add New Show</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter show title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter show description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    {...register("start_date", { required: "Start date is required" })}
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    {...register("end_date", { required: "End date is required" })}
                    type="datetime-local"
                    className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <input
                  {...register("price_range")}
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="e.g. $30-$100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ticket URL</label>
                <input
                  {...register("ticket_url")}
                  type="url"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  {...register("image_url")}
                  type="url"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Theater *</label>
                <select
                  {...register("theater_id", { required: "Theater is required" })}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  disabled={loadingTheaters}
                >
                  <option value="">Select a theater</option>
                  {theaters.map((theater) => (
                    <option key={theater.id} value={theater.id}>
                      {theater.name}
                    </option>
                  ))}
                </select>
                {errors.theater_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.theater_id.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || loadingTheaters}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 