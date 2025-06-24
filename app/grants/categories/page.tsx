"use client";

import Link from 'next/link';
import { categories, grantTypes, grants } from '@/app/lib/grants';

// Helper function to get example grants for each category
const getExampleGrants = (categoryId: string) => {
  return grants
    .filter(grant => grant.category === categoryId)
    .slice(0, 3)
    .map(grant => grant.name);
};

// Helper function to get typical funding range for a category
const getTypicalRange = (categoryId: string) => {
  const categoryGrants = grants.filter(grant => grant.category === categoryId);
  if (categoryGrants.length === 0) return "Varies";

  const amounts = categoryGrants.map(grant => {
    const numbers = grant.amount.match(/\d+/g);
    return numbers ? Math.max(...numbers.map(Number)) : 0;
  });

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);

  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

// Icons for each category
const categoryIcons: Record<string, string> = {
  federal: "🏛️",
  state: "🗽",
  municipal: "🏢",
  regional: "🌉",
  private: "🏆",
  award: "🎭",
  fellowship: "👥",
  emergency: "🚨"
};

// Images for each category
const categoryImages: Record<string, string> = {
  federal: "https://images.unsplash.com/photo-1577722422778-3fb9b280d1c0",
  state: "https://images.unsplash.com/photo-1547623542-de3ff5e36c45",
  municipal: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25",
  regional: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf",
  private: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf",
  award: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf",
  fellowship: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf",
  emergency: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144"
};

export default function GrantCategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-100 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Grant Categories
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Explore different types of theater funding opportunities available in the Bay Area
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {Object.entries(categories).map(([categoryId, description]) => {
            const exampleGrants = getExampleGrants(categoryId);
            const typicalRange = getTypicalRange(categoryId);
            const categoryGrantCount = grants.filter(grant => grant.category === categoryId).length;

            return (
              <div key={categoryId} className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                <div className="relative">
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {categoryIcons[categoryId]} {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Grants
                  </h2>
                  <p className="mt-3 text-lg text-gray-500">
                    {description}
                  </p>
                  
                  <dl className="mt-10 space-y-10">
                    {exampleGrants.length > 0 && (
                      <div>
                        <dt className="text-lg font-medium text-gray-900">Current Opportunities</dt>
                        <dd className="mt-3 text-base text-gray-500">
                          <ul className="list-disc pl-5 space-y-2">
                            {exampleGrants.map((example, index) => (
                              <li key={index}>{example}</li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    <div>
                      <dt className="text-lg font-medium text-gray-900">Typical Funding Range</dt>
                      <dd className="mt-3 text-base text-gray-500">{typicalRange}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-lg font-medium text-gray-900">Available Grants</dt>
                      <dd className="mt-3 text-base text-gray-500">
                        Currently tracking {categoryGrantCount} {categoryId} grant{categoryGrantCount !== 1 ? 's' : ''}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8">
                    <Link
                      href={`/grants?category=${categoryId}`}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                    >
                      View {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Grants →
                    </Link>
                  </div>
                </div>

                <div className="mt-10 -mx-4 relative lg:mt-0">
                  <div className="relative space-y-4">
                    <div className="aspect-[4/3] overflow-hidden rounded-xl">
                      <img
                        className="object-cover w-full h-full transform transition-transform duration-500 hover:scale-105"
                        src={categoryImages[categoryId]}
                        alt={`${categoryId} grants`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grant Types Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Types of Funding Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(grantTypes).map(([typeId, description]) => {
              const typeGrantCount = grants.filter(grant => grant.type === typeId).length;
              return (
                <div key={typeId} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {typeId.charAt(0).toUpperCase() + typeId.slice(1).replace('-', ' ')}
                  </h3>
                  <p className="text-gray-500 mb-4">{description}</p>
                  <p className="text-sm text-gray-600">
                    {typeGrantCount} grant{typeGrantCount !== 1 ? 's' : ''} available
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-rose-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            <span className="block">Ready to find your next grant?</span>
            <span className="block text-rose-600">Start exploring opportunities today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/grants"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700"
              >
                View All Grants
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 