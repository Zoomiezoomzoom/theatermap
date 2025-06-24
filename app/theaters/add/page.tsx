"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

type FormData = {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  image_url: string;
  capacity: string;
};

type GeocodingResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

export default function AddTheaterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null);

  const address = watch("address");

  const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results[0]) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
        };
      }
      return null;
    } catch (error) {
      console.error("Error geocoding address:", error);
      return null;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Geocode the address if not already done
      const geoResult = geocodingResult || await geocodeAddress(data.address);
      
      if (!geoResult) {
        toast.error("Could not find location for the provided address");
        return;
      }

      const response = await fetch('/api/theaters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          latitude: geoResult.lat,
          longitude: geoResult.lng,
          address: geoResult.formattedAddress,
          capacity: data.capacity ? parseInt(data.capacity) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create theater');
      }

      toast.success('Theater created successfully!');
      router.push('/events');
      router.refresh();
    } catch (error) {
      toast.error('Failed to create theater');
      console.error('Error creating theater:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a button to verify the address
  const handleVerifyAddress = async () => {
    if (!address) {
      toast.error("Please enter an address first");
      return;
    }

    const result = await geocodeAddress(address);
    if (result) {
      setGeocodingResult(result);
      setValue("address", result.formattedAddress);
      toast.success("Address verified successfully!");
    } else {
      toast.error("Could not verify address. Please check and try again.");
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
            <h1 className="text-3xl font-bold mb-8">Add New Theater</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter theater name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="Enter theater description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address *</label>
                <div className="flex gap-2">
                  <input
                    {...register("address", { required: "Address is required" })}
                    type="text"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                    placeholder="Enter full address"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAddress}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
                {geocodingResult && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                    ✓ Address verified
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  {...register("email", {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address"
                    }
                  })}
                  type="email"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="contact@theater.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  {...register("phone")}
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="(415) 555-0123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  {...register("website")}
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
                <label className="block text-sm font-medium mb-2">Capacity</label>
                <input
                  {...register("capacity", {
                    pattern: {
                      value: /^\d*$/,
                      message: "Please enter a valid number"
                    }
                  })}
                  type="number"
                  className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-black/50 border border-neutral-200 dark:border-neutral-800"
                  placeholder="e.g. 500"
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !geocodingResult}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Theater'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 