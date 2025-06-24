import { useEffect, useState } from 'react';
import { Theater } from '@prisma/client';

export function useTheaters() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTheaters() {
      try {
        const response = await fetch('/api/theaters');
        if (!response.ok) {
          throw new Error('Failed to fetch theaters');
        }
        const data = await response.json();
        setTheaters(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching theaters:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching theaters');
      } finally {
        setLoading(false);
      }
    }

    fetchTheaters();
  }, []);

  return { theaters, loading, error };
} 