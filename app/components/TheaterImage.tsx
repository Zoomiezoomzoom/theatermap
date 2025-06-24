"use client";

import { useState } from "react";
import { Building2, Theater } from "lucide-react";

interface TheaterImageProps {
  theaterName: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TheaterImage({ theaterName, imageUrl, size = "md", className = "" }: TheaterImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };

  // Generate a consistent color based on theater name
  const getTheaterColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-green-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!imageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${getTheaterColor(theaterName)} rounded-lg flex items-center justify-center text-white font-semibold text-sm ${className}`}>
        {theaterName.split(' ').map(word => word[0]).join('').toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}>
      {imageLoading && (
        <div className={`absolute inset-0 ${getTheaterColor(theaterName)} flex items-center justify-center`}>
          <div className="animate-pulse">
            <Theater size={iconSizes[size]} className="text-white" />
          </div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${theaterName} theater`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
} 