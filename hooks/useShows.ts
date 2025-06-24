import { useEffect, useState } from 'react';
import { Show } from '@prisma/client';

export type ShowWithTheater = Show & {
  theater: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
};

export function useShows(theaterId?: number) {
  const [shows, setShows] = useState<ShowWithTheater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShows() {
      try {
        const response = await fetch('/api/shows');
        if (!response.ok) {
          throw new Error('Failed to fetch shows');
        }
        const data = await response.json();
        setShows(theaterId 
          ? data.filter((show: ShowWithTheater) => show.theater_id === theaterId)
          : data
        );
        setError(null);
      } catch (err) {
        console.error('Error fetching shows:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching shows');
      } finally {
        setLoading(false);
      }
    }

    fetchShows();
  }, [theaterId]);

  return { shows, loading, error };
} 