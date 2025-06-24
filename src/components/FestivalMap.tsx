'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Replace with your actual Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

type Venue = {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
}

const venues: Venue[] = [
  {
    id: '1',
    name: 'Main Stage Theater',
    coordinates: [-73.9857, 40.7484], // Example coordinates for NYC
    description: 'Our largest venue with 1000 seats'
  },
  {
    id: '2',
    name: 'Experimental Theater',
    coordinates: [-73.9870, 40.7480],
    description: 'Intimate space for avant-garde performances'
  },
  // Add more venues as needed
];

export default function FestivalMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.9857, 40.7484], // Default center (NYC example)
      zoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add markers for each venue
    venues.forEach((venue) => {
      const marker = new mapboxgl.Marker()
        .setLngLat(venue.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<h3 class="font-bold">${venue.name}</h3>
               <p>${venue.description}</p>`
            )
        )
        .addTo(map.current!);
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 